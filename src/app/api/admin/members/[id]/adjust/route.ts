/**
 * 调整会员等级API（管理员专用）
 * PUT /api/admin/members/[id]/adjust
 */

import { NextRequest } from 'next/server';
import { verifyAdminToken } from '@/lib/auth-middleware';
import { errorResponse, successResponse } from '@/lib/utils';
import { calculateExpiry } from '@/lib/membership-levels';
import { adjustMembershipSchema, validate } from '@/lib/validation';
import { MembershipLevel } from '@/types/membership';
import { getUserWithMembership, updateUserMembership } from '@/lib/queries';

const debug = process.env.NODE_ENV === 'development';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 验证管理员Token
    const { isValid, admin, error } = verifyAdminToken(request);

    if (!isValid || !admin) {
      return errorResponse(error || '未授权访问', 401);
    }

    const userId = parseInt(params.id);

    if (isNaN(userId)) {
      return errorResponse('无效的用户ID', 400);
    }

    // 解析和验证请求体（使用Zod）
    const body = await request.json();
    const validation = validate(adjustMembershipSchema, body);

    if (!validation.success) {
      return errorResponse(validation.errors.join(', '), 400);
    }

    const { membershipLevel, customExpiry } = validation.data;

    // 查询用户是否存在
    const user = await getUserWithMembership(userId);

    if (!user) {
      return errorResponse('用户不存在', 404);
    }

    // 记录旧值
    const previousLevel = user.membership_level || 'none';
    const previousExpiry = user.membership_expiry;

    // 计算新的过期时间
    let newExpiry: Date | null;

    if (customExpiry) {
      // 使用自定义过期时间
      newExpiry = new Date(customExpiry);
    } else {
      // 根据会员等级计算过期时间
      newExpiry = calculateExpiry(membershipLevel as MembershipLevel);
    }

    // 更新会员等级（使用共享函数）
    await updateUserMembership(
      userId,
      admin.userId,
      membershipLevel as MembershipLevel,
      newExpiry
    );

    return successResponse(
      {
        userId,
        username: user.username,
        previousLevel,
        previousExpiry,
        newLevel: membershipLevel,
        newExpiry: newExpiry?.toISOString() || null,
        adjustedBy: admin.username
      },
      '会员等级调整成功'
    );

  } catch (error) {
    if (debug) console.error('[调整会员等级API] 调整失败:', error);
    return errorResponse('调整会员等级失败', 500);
  }
}
