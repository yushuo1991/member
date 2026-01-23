/**
 * 调整会员等级API（管理员专用）
 * PUT /api/admin/members/[id]/adjust
 */

import { NextRequest } from 'next/server';
import { memberDatabase } from '@/lib/database';
import { verifyAdminToken } from '@/lib/auth-middleware';
import { errorResponse, successResponse } from '@/lib/utils';
import { MEMBERSHIP_LEVELS, calculateExpiry } from '@/lib/membership-levels';
import { MembershipLevel } from '@/types/membership';

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

    // 解析请求体
    const body = await request.json();
    const { membershipLevel, customExpiry } = body;

    // 输入验证
    if (!membershipLevel) {
      return errorResponse('会员等级不能为空', 400);
    }

    if (!MEMBERSHIP_LEVELS[membershipLevel as MembershipLevel]) {
      return errorResponse('无效的会员等级', 400);
    }

    const db = memberDatabase.getPool();

    // 查询用户是否存在
    const [users] = await db.execute<any[]>(
      'SELECT id, username, membership_level, membership_expiry FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return errorResponse('用户不存在', 404);
    }

    const user = users[0];

    // 计算新的过期时间
    let newExpiry: Date | null;

    if (customExpiry) {
      // 使用自定义过期时间
      newExpiry = new Date(customExpiry);
    } else {
      // 根据会员等级计算过期时间
      newExpiry = calculateExpiry(membershipLevel as MembershipLevel);
    }

    // 更新会员等级
    await db.execute(
      `UPDATE users
       SET membership_level = ?, membership_expiry = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [membershipLevel, newExpiry, userId]
    );

    return successResponse(
      {
        userId,
        username: user.username,
        previousLevel: user.membership_level,
        previousExpiry: user.membership_expiry,
        newLevel: membershipLevel,
        newExpiry: newExpiry?.toISOString() || null,
        adjustedBy: admin.username
      },
      '会员等级调整成功'
    );

  } catch (error) {
    console.error('[调整会员等级API] 调整失败:', error);
    return errorResponse('调整会员等级失败', 500);
  }
}
