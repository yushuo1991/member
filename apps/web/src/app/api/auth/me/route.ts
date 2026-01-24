/**
 * 获取当前登录用户信息 API
 * GET /api/auth/me
 *
 * 说明：
 * - 该接口用于前端“登录态探测/刷新”。
 * - 未登录时返回 200（而不是 401），避免浏览器控制台出现资源加载报错。
 */

import { NextRequest } from 'next/server';
import { memberDatabase } from '@repo/database';
import { verifyUserToken } from '@repo/auth';
import { errorResponse, successResponse } from '@repo/auth';
import { errorResponse, successResponse, generateActivationCode, isValidEmail, isValidUsername, isValidPassword, formatDateTime } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { isValid, user, error } = verifyUserToken(request);

    if (!isValid || !user) {
      return Response.json(
        {
          success: false,
          data: { user: null },
          message: error || '未登录',
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    }

    const db = memberDatabase.getPool();

    const [users] = await db.execute<any[]>(
      `SELECT u.id, u.username, u.email, u.trial_bk, u.trial_xinli, u.trial_fuplan,
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

    const [purchases] = await db.execute<any[]>(
      `SELECT product_slug, purchase_type, expires_at, created_at
       FROM user_product_purchases
       WHERE user_id = ?
       AND (expires_at IS NULL OR expires_at > NOW())
       ORDER BY created_at DESC`,
      [user.userId]
    );

    return successResponse({
      user: {
        id: currentUser.id,
        username: currentUser.username,
        email: currentUser.email,
        membershipLevel: currentUser.membership_level || 'none',
        membershipExpiry: currentUser.membership_expiry,
        trialCounts: {
          bk: currentUser.trial_bk ?? 5,
          xinli: currentUser.trial_xinli ?? 5,
          fuplan: currentUser.trial_fuplan ?? 5,
        },
      },
      purchases: purchases.map((p: any) => ({
        productSlug: p.product_slug,
        purchaseType: p.purchase_type,
        expiresAt: p.expires_at,
        purchasedAt: p.created_at,
      })),
    });
  } catch (error) {
    console.error('[GET /api/auth/me] failed:', error);
    return errorResponse('获取用户信息失败', 500);
  }
}

