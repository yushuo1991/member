/**
 * 激活会员等级API
 * POST /api/activation/activate
 */

import { NextRequest } from 'next/server';
import { memberDatabase } from '@/lib/database';
import { verifyUserToken } from '@/lib/auth-middleware';
import { errorResponse, successResponse } from '@/lib/utils';
import { checkRateLimit, recordAttempt, getClientIP } from '@/lib/rate-limiter';
import { MEMBERSHIP_LEVELS } from '@/lib/membership-levels';
import { ActivationRequest, MembershipLevel } from '@/types/membership';

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);

  try {
    // 验证用户Token
    const { isValid, user, error } = verifyUserToken(request);

    if (!isValid || !user) {
      return errorResponse(error || '未授权访问', 401);
    }

    // 限流检查
    const rateLimitCheck = await checkRateLimit(clientIP, 'activate');
    if (!rateLimitCheck.isAllowed) {
      return errorResponse(
        `激活请求过于频繁，请在${rateLimitCheck.blockedUntil?.toLocaleTimeString('zh-CN')}后重试`,
        429
      );
    }

    // 解析请求体
    const body: ActivationRequest = await request.json();
    const { code } = body;

    // 输入验证
    if (!code) {
      await recordAttempt(clientIP, 'activate', false);
      return errorResponse('激活码不能为空', 400);
    }

    const db = memberDatabase.getPool();

    // 查询激活码
    const [codes] = await db.execute<any[]>(
      `SELECT * FROM activation_codes WHERE code = ?`,
      [code.trim().toUpperCase()]
    );

    if (codes.length === 0) {
      await recordAttempt(clientIP, 'activate', false);
      return errorResponse('激活码不存在', 404);
    }

    const activationCode = codes[0];

    // 检查激活码是否已使用
    if (activationCode.used === 1) {
      await recordAttempt(clientIP, 'activate', false);
      return errorResponse('激活码已被使用', 400);
    }

    // 检查激活码是否过期
    if (activationCode.expires_at && new Date(activationCode.expires_at) < new Date()) {
      await recordAttempt(clientIP, 'activate', false);
      return errorResponse('激活码已过期', 400);
    }

    // 获取用户当前会员信息
    const [memberships] = await db.execute<any[]>(
      'SELECT level, expires_at FROM memberships WHERE user_id = ?',
      [user.userId]
    );

    if (memberships.length === 0) {
      await recordAttempt(clientIP, 'activate', false);
      return errorResponse('用户会员记录不存在', 404);
    }

    const currentMembership = memberships[0];
    const newLevel = activationCode.level as MembershipLevel;
    const durationDays = activationCode.duration_days;

    // 计算新的会员过期时间
    let newExpiresAt: Date | null = null;

    if (newLevel === 'lifetime') {
      // 终身会员没有过期时间
      newExpiresAt = null;
    } else {
      // 如果当前会员未过期且等级相同或更低，在现有时间基础上延长
      // 如果当前会员已过期或新等级更高，从现在开始计算
      const now = new Date();
      const currentExpiry = currentMembership.expires_at ? new Date(currentMembership.expires_at) : null;

      if (currentExpiry && currentExpiry > now && currentMembership.level === newLevel) {
        // 延长现有会员
        newExpiresAt = new Date(currentExpiry);
        newExpiresAt.setDate(newExpiresAt.getDate() + durationDays);
      } else {
        // 新激活或升级
        newExpiresAt = new Date();
        newExpiresAt.setDate(newExpiresAt.getDate() + durationDays);
      }
    }

    // 开启事务
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // 更新会员信息
      await connection.execute(
        `UPDATE memberships
         SET level = ?, expires_at = ?, activated_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = ?`,
        [newLevel, newExpiresAt, user.userId]
      );

      // 标记激活码为已使用
      await connection.execute(
        `UPDATE activation_codes
         SET used = 1, used_by = ?, used_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [user.userId, activationCode.id]
      );

      await connection.commit();

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    // 记录成功尝试
    await recordAttempt(clientIP, 'activate', true);

    const levelConfig = MEMBERSHIP_LEVELS[newLevel];

    return successResponse(
      {
        membershipLevel: newLevel,
        membershipName: levelConfig?.name || newLevel,
        membershipExpiry: newExpiresAt?.toISOString() || null,
        daysAdded: durationDays,
        previousLevel: currentMembership.level,
        previousExpiry: currentMembership.expires_at
      },
      `会员激活成功！您现在是${levelConfig?.name || newLevel}`
    );

  } catch (error) {
    console.error('[激活API] 激活失败:', error);
    await recordAttempt(clientIP, 'activate', false);
    return errorResponse('激活失败，请稍后重试', 500);
  }
}
