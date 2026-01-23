/**
 * 生成激活码API（管理员专用）
 * POST /api/activation/generate
 */

import { NextRequest } from 'next/server';
import { memberDatabase } from '@/lib/database';
import { verifyAdminToken } from '@/lib/auth-middleware';
import { generateActivationCode, errorResponse, successResponse } from '@/lib/utils';
import { MEMBERSHIP_LEVELS } from '@/lib/membership-levels';
import { generateCodesSchema, validate } from '@/lib/validation';

const debug = process.env.NODE_ENV === 'development';

export async function POST(request: NextRequest) {
  try {
    // 验证管理员Token
    const { isValid, admin, error } = verifyAdminToken(request);

    if (!isValid || !admin) {
      return errorResponse(error || '未授权访问', 401);
    }

    // 解析和验证请求体（使用Zod）
    const body = await request.json();
    const validation = validate(generateCodesSchema, body);

    if (!validation.success) {
      return errorResponse(validation.errors.join(', '), 400);
    }

    const { membershipLevel, quantity, expiresInDays } = validation.data;

    const db = memberDatabase.getPool();
    const codes: string[] = [];
    const config = MEMBERSHIP_LEVELS[membershipLevel];
    const batchId = `BATCH-${Date.now()}-${admin.userId}`;

    // 计算激活码过期时间
    let expiresAt: Date | null = null;
    if (expiresInDays && expiresInDays > 0) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);
    }

    // 批量生成唯一激活码（优化性能）
    const maxAttempts = quantity * 3; // 防止无限循环
    let attempts = 0;

    while (codes.length < quantity && attempts < maxAttempts) {
      const code = generateActivationCode();

      // 检查是否已在当前批次中
      if (!codes.includes(code)) {
        codes.push(code);
      }
      attempts++;
    }

    if (codes.length < quantity) {
      return errorResponse('生成唯一激活码失败，请重试', 500);
    }

    // 检查数据库中是否存在重复（批量检查）
    const [existing] = await db.execute<any[]>(
      `SELECT code FROM activation_codes WHERE code IN (${codes.map(() => '?').join(',')})`,
      codes
    );

    if (existing.length > 0) {
      const existingCodes = existing.map((row: any) => row.code);
      return errorResponse(`以下激活码已存在: ${existingCodes.join(', ')}`, 400);
    }

    // 批量插入激活码（单次查询）
    const values = codes.map(code =>
      `(${db.escape(code)}, ${db.escape(membershipLevel)}, ${config.duration || 36500}, ${admin.userId}, ${db.escape(batchId)}, ${expiresAt ? db.escape(expiresAt) : 'NULL'}, 0)`
    ).join(',');

    await db.execute(
      `INSERT INTO activation_codes (code, level, duration_days, admin_id, batch_id, expires_at, used)
       VALUES ${values}`
    );

    return successResponse(
      {
        codes,
        membershipLevel,
        durationDays: config.duration || 36500,
        quantity: codes.length,
        expiresAt: expiresAt?.toISOString() || null,
        generatedBy: admin.username,
        batchId
      },
      `成功生成${codes.length}个${config.name}激活码`
    );

  } catch (error) {
    if (debug) console.error('[生成激活码API] 生成失败:', error);
    return errorResponse('生成激活码失败', 500);
  }
}
