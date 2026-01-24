/**
 * 会员详情和删除API（管理员专用）
 * GET /api/admin/members/[id] - 获取单个用户详情
 * DELETE /api/admin/members/[id] - 软删除用户
 */

import { NextRequest } from 'next/server';
import { memberDatabase } from '@/lib/database';
import { verifyAdminToken } from '@/lib/auth-middleware';
import { errorResponse, successResponse } from '@/lib/utils';

/**
 * GET - 获取单个用户详情
 */
export async function GET(
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

    const db = memberDatabase.getPool();

    // 查询用户详情，JOIN memberships表获取会员信息
    const [users] = await db.execute<any[]>(
      `SELECT
        u.id,
        u.username,
        u.email,
        u.phone,
        u.real_name,
        u.avatar_url,
        u.status,
        u.trial_bk,
        u.trial_xinli,
        u.trial_fuplan,
        u.last_login_at,
        u.created_at,
        u.updated_at,
        u.deleted_at,
        m.level AS membership_level,
        m.expires_at AS membership_expiry,
        m.activated_at AS membership_activated_at
      FROM users u
      LEFT JOIN memberships m ON u.id = m.user_id
      WHERE u.id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return errorResponse('用户不存在', 404);
    }

    const user = users[0];

    // 查询用户的产品购买记录
    const [purchases] = await db.execute<any[]>(
      `SELECT
        product_slug,
        purchase_type,
        price,
        expires_at,
        activation_code,
        created_at
      FROM user_product_purchases
      WHERE user_id = ?
      ORDER BY created_at DESC`,
      [userId]
    );

    // 查询登录日志（最近10条）
    const [loginLogs] = await db.execute<any[]>(
      `SELECT
        ip_address,
        user_agent,
        success,
        failure_reason,
        created_at
      FROM login_logs
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 10`,
      [userId]
    );

    return successResponse({
      user,
      purchases,
      loginLogs
    }, '获取用户详情成功');

  } catch (error) {
    console.error('[获取用户详情API] 查询失败:', error);
    return errorResponse('获取用户详情失败', 500);
  }
}

/**
 * DELETE - 软删除用户
 */
export async function DELETE(
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

    const db = memberDatabase.getPool();

    // 查询用户是否存在
    const [users] = await db.execute<any[]>(
      'SELECT id, username, email, deleted_at FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return errorResponse('用户不存在', 404);
    }

    const user = users[0];

    // 检查是否已经被删除
    if (user.deleted_at) {
      return errorResponse('用户已被删除', 400);
    }

    // 软删除用户（设置deleted_at字段）
    await db.execute(
      `UPDATE users
       SET deleted_at = CURRENT_TIMESTAMP,
           status = 0,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [userId]
    );

    // 记录审计日志（失败不影响主操作）
    try {
      await db.execute(
        `INSERT INTO admin_audit_logs
          (admin_id, action, target_type, target_id, description, ip_address)
         VALUES (?, 'delete_user', 'user', ?, ?, ?)`,
        [
          admin.userId,
          userId,
          `删除用户: ${user.username} (${user.email})`,
          request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
        ]
      );
    } catch (auditError) {
      console.warn('[删除用户API] 审计日志记录失败:', auditError);
      // 继续执行，不影响主操作
    }

    return successResponse(
      {
        userId,
        username: user.username,
        email: user.email,
        deletedBy: admin.username,
        deletedAt: new Date().toISOString()
      },
      '用户删除成功'
    );

  } catch (error) {
    console.error('[删除用户API] 删除失败:', error);
    return errorResponse('删除用户失败', 500);
  }
}
