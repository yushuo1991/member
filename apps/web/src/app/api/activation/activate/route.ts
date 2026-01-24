/**
 * 激活码激活API
 * POST /api/activation/activate
 * 支持会员激活码和产品激活码
 */

import { NextRequest } from 'next/server';
import { memberDatabase } from '@repo/database';
import { verifyUserToken } from '@repo/auth';
import { errorResponse, successResponse } from '@repo/auth';
import { errorResponse, successResponse, generateActivationCode, isValidEmail, isValidUsername, isValidPassword, formatDateTime } from '@/lib/utils';
import { checkRateLimit, recordAttempt, getClientIP } from '@/lib/rate-limiter';
import { MEMBERSHIP_LEVELS, getProductBySlug, calculateProductExpiry } from '@/lib/membership-levels';
import { ActivationRequest, MembershipLevel, CodeType, PurchaseType } from '@/types/membership';

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

    const codeType: CodeType = activationCode.code_type || 'membership';

    // 根据激活码类型处理
    if (codeType === 'membership') {
      return await handleMembershipActivation(db, user.userId, activationCode, clientIP);
    } else if (codeType === 'product') {
      return await handleProductActivation(db, user.userId, activationCode, clientIP);
    } else {
      return errorResponse('未知的激活码类型', 400);
    }

  } catch (error) {
    console.error('[激活API] 激活失败:', error);
    await recordAttempt(clientIP, 'activate', false);
    return errorResponse('激活失败，请稍后重试', 500);
  }
}

// 处理会员激活码
async function handleMembershipActivation(
  db: any,
  userId: number,
  activationCode: any,
  clientIP: string
) {
  // 获取用户当前会员信息
  const [memberships] = await db.execute(
    'SELECT level, expires_at FROM memberships WHERE user_id = ?',
    [userId]
  ) as [any[], any];

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
    newExpiresAt = null;
  } else {
    const now = new Date();
    const currentExpiry = currentMembership.expires_at ? new Date(currentMembership.expires_at) : null;

    if (currentExpiry && currentExpiry > now && currentMembership.level === newLevel) {
      newExpiresAt = new Date(currentExpiry);
      newExpiresAt.setDate(newExpiresAt.getDate() + durationDays);
    } else {
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
      [newLevel, newExpiresAt, userId]
    );

    // 标记激活码为已使用
    await connection.execute(
      `UPDATE activation_codes
       SET used = 1, used_by = ?, used_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [userId, activationCode.id]
    );

    await connection.commit();

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  await recordAttempt(clientIP, 'activate', true);

  const levelConfig = MEMBERSHIP_LEVELS[newLevel];

  return successResponse(
    {
      codeType: 'membership',
      membershipLevel: newLevel,
      membershipName: levelConfig?.name || newLevel,
      membershipExpiresAt: newExpiresAt?.toISOString() || null,
      daysAdded: durationDays
    },
    `会员激活成功！您现在是${levelConfig?.name || newLevel}`
  );
}

// 处理产品激活码
async function handleProductActivation(
  db: any,
  userId: number,
  activationCode: any,
  clientIP: string
) {
  const productSlug = activationCode.product_slug;
  const productDuration: PurchaseType = activationCode.product_duration || 'lifetime';

  // 验证产品存在
  const productConfig = getProductBySlug(productSlug);
  if (!productConfig) {
    await recordAttempt(clientIP, 'activate', false);
    return errorResponse('激活码对应的产品不存在', 400);
  }

  // 计算到期时间
  const expiresAt = calculateProductExpiry(productDuration);

  // 获取价格（如果有）
  let price = 0;
  if (productConfig.standalonePrices) {
    if (productDuration === 'monthly') {
      price = productConfig.standalonePrices.monthly || 0;
    } else if (productDuration === 'yearly') {
      price = productConfig.standalonePrices.yearly || 0;
    } else if (productDuration === 'lifetime') {
      price = productConfig.standalonePrices.lifetime || 0;
    }
  }

  // 开启事务
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    // 添加产品购买记录
    await connection.execute(
      `INSERT INTO user_product_purchases
       (user_id, product_slug, purchase_type, price, expires_at, activation_code)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, productSlug, productDuration, price, expiresAt, activationCode.code]
    );

    // 标记激活码为已使用
    await connection.execute(
      `UPDATE activation_codes
       SET used = 1, used_by = ?, used_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [userId, activationCode.id]
    );

    await connection.commit();

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  await recordAttempt(clientIP, 'activate', true);

  return successResponse(
    {
      codeType: 'product',
      productSlug,
      productName: productConfig.name,
      purchaseType: productDuration,
      productExpiresAt: expiresAt?.toISOString() || null
    },
    `产品激活成功！您已获得${productConfig.name}使用权`
  );
}
