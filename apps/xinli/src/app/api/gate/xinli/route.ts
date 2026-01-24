import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@repo/auth';
import { memberDatabase } from '@repo/database';

/**
 * 心理测评系统访问权限检查
 * 要求：yearly会员或以上
 * 试用：免费用户可试用5次
 */
export async function GET(request: NextRequest) {
  try {
    // 验证身份
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({
        hasAccess: false,
        reason: '请先登录',
        requireLogin: true,
      });
    }

    const user = authResult.user;

    // 会员等级权重
    const levelWeights: Record<string, number> = {
      none: 0,
      monthly: 1,
      quarterly: 2,
      yearly: 3,
      lifetime: 4,
    };

    const userWeight = levelWeights[user.membership_level || 'none'] || 0;
    const requiredWeight = levelWeights['yearly']; // 需要年度会员

    // 检查会员等级
    if (userWeight >= requiredWeight) {
      // 检查会员是否过期
      if (user.membership_expiry && new Date(user.membership_expiry) < new Date()) {
        return NextResponse.json({
          hasAccess: false,
          reason: '您的会员已过期，请续费',
          membershipLevel: user.membership_level,
          expiry: user.membership_expiry,
        });
      }

      // 有权限访问
      return NextResponse.json({
        hasAccess: true,
        reason: '年度会员权限',
        membershipLevel: user.membership_level,
      });
    }

    // 检查试用次数
    const [trials] = await memberDatabase.query(
      `SELECT trial_count FROM user_product_trials
       WHERE user_id = ? AND product_slug = 'xinli'`,
      [user.userId]
    );

    const trialCount = (trials as any[]).length > 0 ? (trials as any[])[0].trial_count : 0;
    const maxTrials = 5;
    const trialRemaining = Math.max(0, maxTrials - trialCount);

    if (trialRemaining > 0) {
      // 可以试用
      return NextResponse.json({
        hasAccess: true,
        reason: '试用权限',
        isTrial: true,
        trialRemaining,
        maxTrials,
      });
    }

    // 无权限
    return NextResponse.json({
      hasAccess: false,
      reason: '需要年度会员权限',
      requiredLevel: 'yearly',
      currentLevel: user.membership_level,
      trialUsed: maxTrials,
    });
  } catch (error) {
    console.error('权限检查失败:', error);
    return NextResponse.json(
      {
        hasAccess: false,
        reason: '系统错误，请稍后重试',
      },
      { status: 500 }
    );
  }
}

/**
 * 使用试用次数
 */
export async function POST(request: NextRequest) {
  try {
    // 验证身份
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    const user = authResult.user;

    // 增加试用次数
    await memberDatabase.query(
      `INSERT INTO user_product_trials (user_id, product_slug, trial_count)
       VALUES (?, 'xinli', 1)
       ON DUPLICATE KEY UPDATE trial_count = trial_count + 1`,
      [user.userId]
    );

    // 获取最新试用次数
    const [trials] = await memberDatabase.query(
      `SELECT trial_count FROM user_product_trials
       WHERE user_id = ? AND product_slug = 'xinli'`,
      [user.userId]
    );

    const trialCount = (trials as any[])[0].trial_count;
    const maxTrials = 5;
    const trialRemaining = Math.max(0, maxTrials - trialCount);

    return NextResponse.json({
      success: true,
      trialCount,
      trialRemaining,
      maxTrials,
    });
  } catch (error) {
    console.error('记录试用次数失败:', error);
    return NextResponse.json(
      { error: '操作失败，请稍后重试' },
      { status: 500 }
    );
  }
}
