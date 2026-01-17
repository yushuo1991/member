/**
 * 产品访问控制API
 * GET /api/products/access/[slug]
 */

import { NextRequest } from 'next/server';
import { memberDatabase } from '@/lib/database';
import { verifyUserToken } from '@/lib/auth-middleware';
import { hasAccess } from '@/lib/membership-levels';
import { errorResponse, successResponse } from '@/lib/utils';

const debug = process.env.NODE_ENV === 'development';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // 验证用户Token
    const { isValid, user } = verifyUserToken(request);

    if (!isValid || !user) {
      return errorResponse('未授权访问，请先登录', 401);
    }

    const db = memberDatabase.getPool();

    // 一次查询获取产品和用户信息（优化N+1查询）
    const [results] = await db.execute<any[]>(
      `SELECT
        p.*,
        u.membership_level,
        u.membership_expiry
       FROM products p
       CROSS JOIN users u
       WHERE p.slug = ? AND u.id = ?`,
      [slug, user.userId]
    );

    if (results.length === 0) {
      // 检查是产品不存在还是用户不存在
      const [productCheck] = await db.execute<any[]>(
        'SELECT id FROM products WHERE slug = ?',
        [slug]
      );
      if (productCheck.length === 0) {
        return errorResponse('产品不存在', 404);
      }
      return errorResponse('用户不存在', 404);
    }

    const result = results[0];
    const product = {
      id: result.id,
      slug: result.slug,
      name: result.name,
      description: result.description,
      required_level: result.required_level,
      content: result.content,
      created_at: result.created_at,
      updated_at: result.updated_at
    };
    const userInfo = {
      membership_level: result.membership_level,
      membership_expiry: result.membership_expiry
    };

    // 检查访问权限
    const hasAccessPermission = hasAccess(
      userInfo.membership_level,
      product.required_level,
      userInfo.membership_expiry
    );

    if (!hasAccessPermission) {
      return successResponse(
        {
          hasAccess: false,
          product: {
            id: product.id,
            slug: product.slug,
            name: product.name,
            description: product.description,
            requiredLevel: product.required_level
          },
          currentLevel: userInfo.membership_level,
          requiredLevel: product.required_level,
          message: `需要${product.required_level}会员等级才能访问此产品`
        },
        '权限不足'
      );
    }

    // 有权限，返回完整产品信息（包含内容）
    return successResponse(
      {
        hasAccess: true,
        product: {
          id: product.id,
          slug: product.slug,
          name: product.name,
          description: product.description,
          requiredLevel: product.required_level,
          content: product.content,
          createdAt: product.created_at,
          updatedAt: product.updated_at
        },
        currentLevel: userInfo.membership_level
      },
      '访问授权成功'
    );

  } catch (error) {
    if (debug) console.error('[产品访问API] 访问检查失败:', error);
    return errorResponse('访问检查失败', 500);
  }
}
