/**
 * 获取当前登录用户信息API
 * GET /api/auth/me
 */

import { NextRequest } from 'next/server';
import { memberDatabase } from '@/lib/database';
import { verifyUserToken } from '@/lib/auth-middleware';
import { errorResponse, successResponse } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    // 验证用户Token
    const { isValid, user, error } = verifyUserToken(request);

    if (!isValid || !user) {
      return errorResponse(error || '未登录', 401);
    }

    const db = memberDatabase.getPool();

    // 查询用户和会员信息
    const [users] = await db.execute<any[]>(
      `SELECT u.id, u.username, u.email,
              m.level as membership_level, m.expires_at as membership_expiry
       FROM users u
       LEFT JOIN memberships m ON u.id = m.user_id
       WHERE u.id = ?`,
      [user.userId]
    );

    if (users.length === 0) {
      return errorResponse('用户不存在', 404);
    }

    const currentUser = users[0];

    return successResponse({
      user: {
        id: currentUser.id,
        username: currentUser.username,
        email: currentUser.email,
        membershipLevel: currentUser.membership_level || 'none',
        membershipExpiry: currentUser.membership_expiry
      }
    });

  } catch (error) {
    console.error('[获取用户信息API] 失败:', error);
    return errorResponse('获取用户信息失败', 500);
  }
}
