/**
 * 冻结/解冻会员API（管理员专用）
 * PATCH /api/admin/members/[id]/status
 */

import { NextRequest } from 'next/server';
import { memberDatabase } from '@/lib/database';
import { verifyAdminToken } from '@/lib/auth-middleware';
import { errorResponse, successResponse } from '@/lib/utils';

export async function PATCH(
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
    const { isFrozen } = body;

    if (typeof isFrozen !== 'boolean') {
      return errorResponse('无效的冻结状态', 400);
    }

    const db = memberDatabase.getPool();

    // 查询用户是否存在
    const [users] = await db.execute<any[]>(
      'SELECT id, username, status FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return errorResponse('用户不存在', 404);
    }

    const user = users[0];

    // 更新冻结状态（status: 1=正常，0=禁用/冻结）
    const newStatus = isFrozen ? 0 : 1;
    await db.execute(
      'UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newStatus, userId]
    );

    // 记录审计日志
    await db.execute(
      `INSERT INTO admin_audit_logs
        (admin_id, action, target_type, target_id, old_value, new_value, description, ip_address)
       VALUES (?, ?, 'user', ?, ?, ?, ?, ?)`,
      [
        admin.userId,
        isFrozen ? 'freeze_user' : 'unfreeze_user',
        userId,
        JSON.stringify({ status: user.status }),
        JSON.stringify({ status: newStatus }),
        `${isFrozen ? '冻结' : '解冻'}用户: ${user.username}`,
        request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      ]
    );

    return successResponse(
      {
        userId,
        username: user.username,
        previousStatus: user.status === 0 ? '已冻结' : '正常',
        newStatus: isFrozen ? '已冻结' : '正常',
        updatedBy: admin.username
      },
      isFrozen ? '会员已冻结' : '会员已解冻'
    );

  } catch (error) {
    console.error('[冻结/解冻会员API] 操作失败:', error);
    return errorResponse('更新会员状态失败', 500);
  }
}
