/**
 * 产品访问控制API
 * GET /api/products/access/[slug] - 检查用户对产品的访问权限
 * 支持：会员权限、单独购买、试用
 */

import { NextRequest } from 'next/server';
import { memberDatabase } from '@/lib/database';
import { verifyUserToken } from '@/lib/auth-middleware';
import {
  canAccessProductByMembership,
  getProductBySlug,
  MEMBERSHIP_LEVELS
} from '@/lib/membership-levels';
import {
  isTrialSupported,
  getTrialFieldName,
  getProductRedirectUrl
} from '@/lib/trial-service';
import { errorResponse, successResponse } from '@/lib/utils';
import type { AccessType, MembershipLevel } from '@/types/membership';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // 获取产品配置
    const productConfig = getProductBySlug(slug);
    if (!productConfig) {
      return errorResponse('产品不存在', 404);
    }

    // 验证用户Token
    const { isValid, user } = verifyUserToken(request);

    if (!isValid || !user) {
      return errorResponse('未授权访问，请先登录', 401);
    }

    const db = memberDatabase.getPool();

    // 获取用户信息和会员等级
    const [users] = await db.execute<any[]>(
      `SELECT u.*, m.level as membership_level, m.expires_at as membership_expiry
       FROM users u
       LEFT JOIN memberships m ON u.id = m.user_id
       WHERE u.id = ?`,
      [user.userId]
    );

    if (users.length === 0) {
      return errorResponse('用户不存在', 404);
    }

    const userInfo = users[0];
    const userLevel: MembershipLevel = userInfo.membership_level || 'none';
    const membershipExpiry = userInfo.membership_expiry;

    // 1. 检查会员权限
    if (productConfig.priceType === 'membership' || productConfig.priceType === 'both') {
      const hasMembershipAccess = canAccessProductByMembership(
        userLevel,
        slug,
        membershipExpiry
      );

      if (hasMembershipAccess) {
        return successResponse({
          hasAccess: true,
          accessType: 'membership' as AccessType,
          product: {
            slug: productConfig.slug,
            name: productConfig.name,
            description: productConfig.description,
            url: productConfig.url
          },
          currentLevel: userLevel,
          expiresAt: membershipExpiry ? membershipExpiry.toISOString() : null,
          redirectUrl: getProductRedirectUrl(slug)
        }, '会员权限访问');
      }
    }

    // 2. 检查单独购买
    if (productConfig.priceType === 'standalone' || productConfig.priceType === 'both') {
      const [purchases] = await db.execute<any[]>(
        `SELECT * FROM user_product_purchases
         WHERE user_id = ? AND product_slug = ?
         AND (expires_at IS NULL OR expires_at > NOW())
         ORDER BY created_at DESC LIMIT 1`,
        [user.userId, slug]
      );

      if (purchases.length > 0) {
        const purchase = purchases[0];
        return successResponse({
          hasAccess: true,
          accessType: 'purchased' as AccessType,
          product: {
            slug: productConfig.slug,
            name: productConfig.name,
            description: productConfig.description,
            url: productConfig.url
          },
          expiresAt: purchase.expires_at ? purchase.expires_at.toISOString() : null,
          redirectUrl: getProductRedirectUrl(slug)
        }, '已购买访问');
      }
    }

    // 3. 检查试用权限
    if (productConfig.trialEnabled && isTrialSupported(slug)) {
      const trialField = getTrialFieldName(slug);
      if (trialField) {
        const trialRemaining = userInfo[trialField] || 0;

        if (trialRemaining > 0) {
          return successResponse({
            hasAccess: true,
            accessType: 'trial' as AccessType,
            product: {
              slug: productConfig.slug,
              name: productConfig.name,
              description: productConfig.description,
              url: productConfig.url
            },
            trialRemaining,
            message: `剩余${trialRemaining}次试用`,
            redirectUrl: getProductRedirectUrl(slug)
          }, '试用访问');
        }
      }
    }

    // 4. 没有访问权限
    const requiredLevelConfig = MEMBERSHIP_LEVELS[productConfig.requiredLevel];

    return successResponse({
      hasAccess: false,
      accessType: 'none' as AccessType,
      product: {
        slug: productConfig.slug,
        name: productConfig.name,
        description: productConfig.description
      },
      currentLevel: userLevel,
      requiredLevel: productConfig.requiredLevel,
      trialRemaining: productConfig.trialEnabled ? (userInfo[getTrialFieldName(slug) || ''] || 0) : undefined,
      message: productConfig.priceType === 'membership'
        ? `需要${requiredLevelConfig?.name || productConfig.requiredLevel}会员等级`
        : productConfig.priceType === 'standalone'
        ? '需要购买此产品'
        : `需要${requiredLevelConfig?.name || '会员'}等级或单独购买`
    }, '权限不足');

  } catch (error) {
    console.error('[产品访问API] 访问检查失败:', error);
    return errorResponse('访问检查失败', 500);
  }
}
