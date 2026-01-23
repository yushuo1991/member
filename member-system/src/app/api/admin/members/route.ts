/**
 * 会员列表API（管理员专用）
 * GET /api/admin/members
 */

import { NextRequest } from 'next/server';
import { memberDatabase } from '@/lib/database';
import { verifyAdminToken } from '@/lib/auth-middleware';
import { errorResponse, successResponse } from '@/lib/utils';

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

    const offset = (page - 1) * limit;
    const db = memberDatabase.getPool();

    // 构建查询条件
    let whereClause = 'WHERE 1=1';
    const queryParams: any[] = [];

    if (membershipLevel) {
      whereClause += ' AND membership_level = ?';
      queryParams.push(membershipLevel);
    }

    if (searchQuery) {
      whereClause += ' AND (username LIKE ? OR email LIKE ?)';
      const searchPattern = `%${searchQuery}%`;
      queryParams.push(searchPattern, searchPattern);
    }

    // 查询总数
    const [countResult] = await db.execute<any[]>(
      `SELECT COUNT(*) as total FROM users ${whereClause}`,
      queryParams
    );

    const total = countResult[0].total;

    // 查询会员列表
    const [members] = await db.execute<any[]>(
      `SELECT id, username, email, membership_level, membership_expiry, created_at, updated_at
       FROM users
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset]
    );

    return successResponse(
      {
        members: members.map(member => ({
          id: member.id,
          username: member.username,
          email: member.email,
          membershipLevel: member.membership_level,
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
    console.error('[会员列表API] 查询失败:', error);
    return errorResponse('查询会员列表失败', 500);
  }
}
