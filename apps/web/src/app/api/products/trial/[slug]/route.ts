/**
 * 产品试用API
 * POST /api/products/trial/[slug] - 使用一次试用机会
 */

import { NextRequest } from 'next/server';
import { memberDatabase } from '@repo/database';
import { verifyUserToken } from '@repo/auth';
import { getProductBySlug } from '@/lib/membership-levels';
import {
  isTrialSupported,
  getTrialFieldName,
  getProductRedirectUrl,
  createTrialResult
} from '@/lib/trial-service';
import { errorResponse, successResponse } from '@repo/auth';
import { errorResponse, successResponse, generateActivationCode, isValidEmail, isValidUsername, isValidPassword, formatDateTime } from '@/lib/utils';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // 验证用户Token
    const { isValid, user } = verifyUserToken(request);

    if (!isValid || !user) {
      return errorResponse('未授权访问，请先登录', 401);
    }

    // 获取产品配置
    const productConfig = getProductBySlug(slug);
    if (!productConfig) {
      return errorResponse('产品不存在', 404);
    }

    // 检查产品是否支持试用
    if (!productConfig.trialEnabled || !isTrialSupported(slug)) {
      return errorResponse('该产品不支持试用', 400);
    }

    const trialField = getTrialFieldName(slug);
    if (!trialField) {
      return errorResponse('试用配置错误', 500);
    }

    const db = memberDatabase.getPool();

    // 获取用户当前试用次数
    const [users] = await db.execute<any[]>(
      `SELECT ${trialField} as trial_count FROM users WHERE id = ?`,
      [user.userId]
    );

    if (users.length === 0) {
      return errorResponse('用户不存在', 404);
    }

    const currentTrialCount = users[0].trial_count || 0;

    if (currentTrialCount <= 0) {
      return errorResponse('试用次数已用完', 400);
    }

    // 扣减试用次数
    await db.execute(
      `UPDATE users SET ${trialField} = ${trialField} - 1 WHERE id = ? AND ${trialField} > 0`,
      [user.userId]
    );

    // 记录试用日志
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                      request.headers.get('x-real-ip') ||
                      'unknown';

    await db.execute(
      `INSERT INTO trial_logs (user_id, product_slug, ip_address)
       VALUES (?, ?, ?)`,
      [user.userId, slug, ipAddress]
    );

    const newTrialCount = currentTrialCount - 1;
    const redirectUrl = getProductRedirectUrl(slug);

    return successResponse(
      createTrialResult(
        true,
        newTrialCount,
        `试用成功，剩余${newTrialCount}次`,
        redirectUrl
      ),
      '试用成功'
    );

  } catch (error) {
    console.error('[试用API] 试用失败:', error);
    return errorResponse('试用操作失败', 500);
  }
}

// GET - 获取试用状态
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // 验证用户Token
    const { isValid, user } = verifyUserToken(request);

    if (!isValid || !user) {
      return errorResponse('未授权访问，请先登录', 401);
    }

    // 获取产品配置
    const productConfig = getProductBySlug(slug);
    if (!productConfig) {
      return errorResponse('产品不存在', 404);
    }

    // 检查产品是否支持试用
    if (!productConfig.trialEnabled || !isTrialSupported(slug)) {
      return successResponse({
        productSlug: slug,
        productName: productConfig.name,
        trialEnabled: false,
        trialRemaining: 0,
        canUseTrial: false
      }, '该产品不支持试用');
    }

    const trialField = getTrialFieldName(slug);
    if (!trialField) {
      return errorResponse('试用配置错误', 500);
    }

    const db = memberDatabase.getPool();

    // 获取用户当前试用次数
    const [users] = await db.execute<any[]>(
      `SELECT ${trialField} as trial_count FROM users WHERE id = ?`,
      [user.userId]
    );

    if (users.length === 0) {
      return errorResponse('用户不存在', 404);
    }

    const trialRemaining = users[0].trial_count || 0;

    return successResponse({
      productSlug: slug,
      productName: productConfig.name,
      trialEnabled: true,
      trialRemaining,
      canUseTrial: trialRemaining > 0
    }, '试用状态获取成功');

  } catch (error) {
    console.error('[试用API] 获取状态失败:', error);
    return errorResponse('获取试用状态失败', 500);
  }
}
