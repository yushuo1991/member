/**
 * 会员列表API（管理员专用）
 * GET /api/admin/members
 */

import { NextRequest } from 'next/server';
import { verifyAdminToken } from '@/lib/auth-middleware';
import { errorResponse, successResponse } from '@/lib/utils';
import { getMembersList } from '@/lib/queries';

const debug = process.env.NODE_ENV === 'development';

export async function GET(request: NextRequest) {
  try {
    // 验证管理员Token
    const { isValid, admin, error } = verifyAdminToken(request);

    if (!isValid || !admin) {
      return errorResponse(error || '未授权访问', 401);
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const membershipLevel = searchParams.get('level') || '';
    const searchQuery = searchParams.get('search') || '';

    // 使用共享查询函数
    const { members, total } = await getMembersList({
      page,
      limit,
      membershipLevel,
      searchQuery
    });

    return successResponse(
      {
        members: members.map(member => ({
          id: member.id,
          username: member.username,
          email: member.email,
          membershipLevel: member.membership_level || 'none',
          membershipExpiry: member.membership_expiry,
          createdAt: member.created_at,
          updatedAt: member.updated_at
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      },
      '获取会员列表成功'
    );

  } catch (error) {
    if (debug) console.error('[会员列表API] 查询失败:', error);
    return errorResponse('查询会员列表失败', 500);
  }
}
