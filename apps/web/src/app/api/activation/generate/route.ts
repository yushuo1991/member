/**
 * 生成激活码API（管理员专用）
 * POST /api/activation/generate
 */

import { NextRequest } from 'next/server';
import { memberDatabase } from '@repo/database';
import { verifyAdminToken, errorResponse, successResponse } from '@repo/auth';
import { generateActivationCode } from '@/lib/utils';
import { MEMBERSHIP_LEVELS } from '@/lib/membership-levels';
import { GenerateCodeRequest } from '@/types/membership';

export async function POST(request: NextRequest) {
  try {
    // 验证管理员Token
    const { isValid, admin, error } = verifyAdminToken(request);

    if (!isValid || !admin) {
      return errorResponse(error || '未授权访问', 401);
    }

    // 解析请求体
    const body: GenerateCodeRequest = await request.json();
    const { membershipLevel, quantity, expiresInDays } = body;

    // 输入验证
    if (!membershipLevel || !quantity) {
      return errorResponse('会员等级和数量不能为空', 400);
    }

    if (quantity < 1 || quantity > 100) {
      return errorResponse('数量必须在1-100之间', 400);
    }

    if (!MEMBERSHIP_LEVELS[membershipLevel]) {
      return errorResponse('无效的会员等级', 400);
    }

    // 不允许生成 'none' 等级的激活码
    if (membershipLevel === 'none') {
      return errorResponse('不能生成免费会员激活码', 400);
    }

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

    // 批量生成激活码
    for (let i = 0; i < quantity; i++) {
      let code: string;
      let isUnique = false;

      // 确保激活码唯一
      while (!isUnique) {
        code = generateActivationCode();

        const [existing] = await db.execute<any[]>(
          'SELECT id FROM activation_codes WHERE code = ?',
          [code]
        );

        if (existing.length === 0) {
          isUnique = true;
          codes.push(code);

          // 插入激活码
          await db.execute(
            `INSERT INTO activation_codes (code, level, duration_days, admin_id, batch_id, expires_at, used)
             VALUES (?, ?, ?, ?, ?, ?, 0)`,
            [code, membershipLevel, config.duration || 36500, admin.userId, batchId, expiresAt]
          );
        }
      }
    }

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
    console.error('[生成激活码API] 生成失败:', error);
    return errorResponse('生成激活码失败', 500);
  }
}
