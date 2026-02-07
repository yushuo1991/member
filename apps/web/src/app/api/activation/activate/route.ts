/**
 * 激活码激活API
 * POST /api/activation/activate
 * 支持会员激活码和产品激活码
 */

import { NextRequest } from 'next/server';
import { memberDatabase } from '@repo/database';
import { verifyUserToken, errorResponse, successResponse } from '@repo/auth';
import { checkRateLimit, recordAttempt, getClientIP } from '@/lib/rate-limiter';
import { MEMBERSHIP_LEVELS, getProductBySlug, calculateProductExpiry } from '@/lib/membership-levels';
import { MembershipLevel, CodeType, PurchaseType } from '@/types/membership';
import { ActivationCodeSchema, validateRequest, createLogger } from '@repo/utils';

const logger = createLogger('API:Activation');

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const clientIP = getClientIP(request);

  try {
    // 记录请求
    logger.logRequest({
      method: 'POST',
      url: '/api/activation/activate',
      ip: clientIP,
    });

    // 验证用户Token
    const { isValid, user, error } = verifyUserToken(request);

    if (!isValid || !user) {
      logger.warn('激活请求未授权', { clientIP, error });
      return errorResponse(error || '未授权访问', 401);
    }

    logger.debug('用户身份验证成功', { userId: user.userId, clientIP });

    // 限流检查
    const rateLimitCheck = await checkRateLimit(clientIP, 'activate');
    if (!rateLimitCheck.isAllowed) {
      logger.warn('激活请求被限流', {
        userId: user.userId,
        clientIP,
        remainingAttempts: rateLimitCheck.remainingAttempts
      });
      return errorResponse(
        `激活请求过于频繁，请在${rateLimitCheck.blockedUntil?.toLocaleTimeString('zh-CN')}后重试`,
        429
      );
    }

    // 解析请求体
    const body = await request.json();

    // Zod 验证
    const validation = validateRequest(ActivationCodeSchema, body);
    if (!validation.success) {
      await recordAttempt(clientIP, 'activate', false);
      logger.warn('激活码验证失败', { userId: user.userId, error: validation.error, clientIP });
      return errorResponse(validation.error, 400);
    }

    const { code } = validation.data;

    logger.info('处理激活码请求', { userId: user.userId, code, clientIP });

    const db = memberDatabase.getPool();

    // 查询激活码（code已经在Zod验证中转换为大写）
    const [codes] = await db.execute<any[]>(
      `SELECT * FROM activation_codes WHERE code = ?`,
      [code]
    );

    if (codes.length === 0) {
      await recordAttempt(clientIP, 'activate', false);
      logger.warn('激活码不存在', { userId: user.userId, code, clientIP });
      return errorResponse('激活码不存在', 404);
    }

    const activationCode = codes[0];

    // 检查激活码是否已使用
    if (activationCode.used === 1) {
      await recordAttempt(clientIP, 'activate', false);
      logger.warn('激活码已被使用', {
        userId: user.userId,
        code,
        usedBy: activationCode.used_by,
        usedAt: activationCode.used_at,
        clientIP
      });
      return errorResponse('激活码已被使用', 400);
    }

    // 检查激活码是否过期
    if (activationCode.expires_at && new Date(activationCode.expires_at) < new Date()) {
      await recordAttempt(clientIP, 'activate', false);
      logger.warn('激活码已过期', {
        userId: user.userId,
        code,
        expiresAt: activationCode.expires_at,
        clientIP
      });
      return errorResponse('激活码已过期', 400);
    }

    const codeType: CodeType = activationCode.code_type || 'membership';

    logger.debug('激活码验证通过', {
      userId: user.userId,
      code,
      codeType,
      level: activationCode.level,
      productSlug: activationCode.product_slug
    });

    // 根据激活码类型处理
    if (codeType === 'membership') {
      return await handleMembershipActivation(db, user.userId, activationCode, clientIP, startTime);
    } else if (codeType === 'product') {
      return await handleProductActivation(db, user.userId, activationCode, clientIP, startTime);
    } else {
      logger.error('未知的激活码类型', { userId: user.userId, code, codeType, clientIP });
      return errorResponse('未知的激活码类型', 400);
    }

  } catch (error) {
    logger.error('激活处理失败', error as Error, { clientIP });
    await recordAttempt(clientIP, 'activate', false);

    logger.logResponse({
      method: 'POST',
      url: '/api/activation/activate',
      statusCode: 500,
      duration: Date.now() - startTime,
    });

    return errorResponse('激活失败，请稍后重试', 500);
  }
}

// 处理会员激活码
async function handleMembershipActivation(
  db: any,
  userId: number,
  activationCode: any,
  clientIP: string,
  startTime: number
) {
  logger.debug('开始处理会员激活', { userId, code: activationCode.code });

  // 获取用户当前会员信息
  const [memberships] = await db.execute(
    'SELECT level, expires_at FROM memberships WHERE user_id = ?',
    [userId]
  ) as [any[], any];

  if (memberships.length === 0) {
    await recordAttempt(clientIP, 'activate', false);
    logger.error('用户会员记录不存在', { userId, clientIP });
    return errorResponse('用户会员记录不存在', 404);
  }

  const currentMembership = memberships[0];
  const currentLevel = currentMembership.level as MembershipLevel;
  const newLevel = activationCode.level as MembershipLevel;
  const durationDays = activationCode.duration_days;
  const now = new Date();
  const currentExpiry = currentMembership.expires_at ? new Date(currentMembership.expires_at) : null;

  logger.debug('会员信息', {
    userId,
    currentLevel,
    newLevel,
    durationDays,
    currentExpiry: currentExpiry?.toISOString()
  });

  // 定义会员等级权重（用于比较等级高低）
  const LEVEL_WEIGHTS: Record<MembershipLevel, number> = {
    none: 0,
    monthly: 1,
    quarterly: 2,
    yearly: 3,
    lifetime: 4
  };

  const currentWeight = LEVEL_WEIGHTS[currentLevel];
  const newWeight = LEVEL_WEIGHTS[newLevel];
  const currentLevelConfig = MEMBERSHIP_LEVELS[currentLevel];
  const newLevelConfig = MEMBERSHIP_LEVELS[newLevel];

  // 检查当前会员是否已过期
  const isCurrentExpired = currentLevel !== 'none' &&
                          currentLevel !== 'lifetime' &&
                          currentExpiry &&
                          currentExpiry < now;

  // 情况1: 新等级低于当前等级，且当前会员未过期
  if (newWeight < currentWeight && !isCurrentExpired) {
    await recordAttempt(clientIP, 'activate', false);
    logger.warn('激活失败：等级降级', {
      userId,
      currentLevel,
      newLevel,
      currentExpiry: currentExpiry?.toISOString()
    });
    return errorResponse(
      `激活失败：您当前是${currentLevelConfig.name}（${currentExpiry?.toLocaleDateString('zh-CN')}到期），无法使用低等级的${newLevelConfig.name}激活码。建议使用相同或更高等级的激活码。`,
      400
    );
  }

  // 情况2: 新等级高于当前等级（升级）
  let newExpiresAt: Date | null = null;
  let upgradeMessage = '';

  if (newWeight > currentWeight) {
    // 升级逻辑
    if (newLevel === 'lifetime') {
      // 升级到终身会员
      newExpiresAt = null;
      upgradeMessage = `恭喜升级！从${currentLevelConfig.name}升级到${newLevelConfig.name}`;
      logger.info('会员升级到终身', { userId, fromLevel: currentLevel, toLevel: newLevel });
    } else {
      // 升级到其他等级
      if (!isCurrentExpired && currentExpiry) {
        // 当前会员未过期，计算剩余天数并转换为新等级时长
        const remainingDays = Math.ceil((currentExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const conversionRatio = 0.8; // 80%的转换率，可根据业务需求调整
        const convertedDays = Math.floor(remainingDays * conversionRatio);
        const totalDays = durationDays + convertedDays;

        newExpiresAt = new Date();
        newExpiresAt.setDate(newExpiresAt.getDate() + totalDays);

        upgradeMessage = `恭喜升级！从${currentLevelConfig.name}升级到${newLevelConfig.name}，剩余${remainingDays}天已按80%转换为${convertedDays}天，总计获得${totalDays}天会员时长`;
        logger.info('会员升级（含时长转换）', {
          userId,
          fromLevel: currentLevel,
          toLevel: newLevel,
          remainingDays,
          convertedDays,
          totalDays
        });
      } else {
        // 当前会员已过期或是免费用户
        newExpiresAt = new Date();
        newExpiresAt.setDate(newExpiresAt.getDate() + durationDays);
        upgradeMessage = `恭喜升级！从${currentLevelConfig.name}升级到${newLevelConfig.name}，获得${durationDays}天会员时长`;
        logger.info('会员升级', {
          userId,
          fromLevel: currentLevel,
          toLevel: newLevel,
          durationDays
        });
      }
    }
  }
  // 情况3: 等级相同（续费）
  else if (newWeight === currentWeight) {
    if (newLevel === 'lifetime') {
      // 终身会员续费（实际上不需要续费）
      newExpiresAt = null;
      upgradeMessage = `您已经是${newLevelConfig.name}，无需续费`;
      logger.info('终身会员无需续费', { userId });
    } else {
      // 普通会员续费
      if (currentExpiry && currentExpiry > now) {
        // 在当前到期时间基础上延长
        newExpiresAt = new Date(currentExpiry);
        newExpiresAt.setDate(newExpiresAt.getDate() + durationDays);
        upgradeMessage = `续费成功！${newLevelConfig.name}时长延长${durationDays}天，新到期时间：${newExpiresAt.toLocaleDateString('zh-CN')}`;
        logger.info('会员续费', {
          userId,
          level: newLevel,
          durationDays,
          newExpiresAt: newExpiresAt.toISOString()
        });
      } else {
        // 已过期，从现在开始计算
        newExpiresAt = new Date();
        newExpiresAt.setDate(newExpiresAt.getDate() + durationDays);
        upgradeMessage = `续费成功！${newLevelConfig.name}已激活${durationDays}天`;
        logger.info('会员续费（已过期）', {
          userId,
          level: newLevel,
          durationDays,
          newExpiresAt: newExpiresAt.toISOString()
        });
      }
    }
  }
  // 情况4: 新等级低于当前等级，但当前会员已过期（允许激活）
  else {
    if (newLevel === 'lifetime') {
      newExpiresAt = null;
    } else {
      newExpiresAt = new Date();
      newExpiresAt.setDate(newExpiresAt.getDate() + durationDays);
    }
    upgradeMessage = `激活成功！您的会员等级已更新为${newLevelConfig.name}`;
    logger.info('会员激活（过期后降级）', {
      userId,
      fromLevel: currentLevel,
      toLevel: newLevel,
      durationDays
    });
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

    logger.logEvent('membership_activated', {
      userId,
      code: activationCode.code,
      fromLevel: currentLevel,
      toLevel: newLevel,
      expiresAt: newExpiresAt?.toISOString(),
      durationDays
    });

  } catch (error) {
    await connection.rollback();
    logger.error('会员激活事务失败', error as Error, { userId, code: activationCode.code });
    throw error;
  } finally {
    connection.release();
  }

  await recordAttempt(clientIP, 'activate', true);

  logger.logResponse({
    method: 'POST',
    url: '/api/activation/activate',
    statusCode: 200,
    duration: Date.now() - startTime,
    userId,
  });

  return successResponse(
    {
      codeType: 'membership',
      membershipLevel: newLevel,
      membershipName: newLevelConfig.name,
      membershipExpiresAt: newExpiresAt?.toISOString() || null,
      daysAdded: durationDays,
      previousLevel: currentLevel,
      previousLevelName: currentLevelConfig.name,
      isUpgrade: newWeight > currentWeight,
      isRenewal: newWeight === currentWeight
    },
    upgradeMessage
  );
}

// 处理产品激活码
async function handleProductActivation(
  db: any,
  userId: number,
  activationCode: any,
  clientIP: string,
  startTime: number
) {
  const productSlug = activationCode.product_slug;
  const productDuration: PurchaseType = activationCode.product_duration || 'lifetime';

  logger.debug('开始处理产品激活', { userId, productSlug, productDuration });

  // 验证产品存在
  const productConfig = getProductBySlug(productSlug);
  if (!productConfig) {
    await recordAttempt(clientIP, 'activate', false);
    logger.error('产品不存在', { userId, productSlug, clientIP });
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

  logger.debug('产品激活信息', {
    userId,
    productSlug,
    productName: productConfig.name,
    productDuration,
    price,
    expiresAt: expiresAt?.toISOString()
  });

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

    logger.logEvent('product_activated', {
      userId,
      code: activationCode.code,
      productSlug,
      productName: productConfig.name,
      purchaseType: productDuration,
      price,
      expiresAt: expiresAt?.toISOString()
    });

  } catch (error) {
    await connection.rollback();
    logger.error('产品激活事务失败', error as Error, {
      userId,
      code: activationCode.code,
      productSlug
    });
    throw error;
  } finally {
    connection.release();
  }

  await recordAttempt(clientIP, 'activate', true);

  logger.logResponse({
    method: 'POST',
    url: '/api/activation/activate',
    statusCode: 200,
    duration: Date.now() - startTime,
    userId,
  });

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
