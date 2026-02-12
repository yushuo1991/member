/**
 * 调整会员等级API（管理员专用）
 * PUT /api/admin/members/[id]/adjust
 */

import { NextRequest } from 'next/server';
import { memberDatabase } from '@repo/database';
import { verifyAdminToken, errorResponse, successResponse } from '@repo/auth';
import { calculateExpiry } from '@/lib/membership-levels';
import { MembershipLevel } from '@/types/membership';
import { MemberAdjustSchema, validateRequest } from '@repo/utils';

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

    // Zod 验证
    const validation = validateRequest(MemberAdjustSchema, body);
    if (!validation.success) {
      return errorResponse(validation.error, 400);
    }

    const { membershipLevel, customExpiry, trialBk, trialXinli, trialFuplan } = validation.data;

    const db = memberDatabase.getPool();

    // 查询用户是否存在
    const [users] = await db.execute<any[]>(
      `SELECT u.id, u.username, u.trial_bk, u.trial_xinli, u.trial_fuplan,
              m.level as membership_level, m.expires_at as membership_expiry
       FROM users u
       LEFT JOIN memberships m ON u.id = m.user_id
       WHERE u.id = ?`,
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

    // 更新或插入会员记录
    await db.execute(
      `INSERT INTO memberships (user_id, level, expires_at, activated_at, updated_at)
       VALUES (?, ?, ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE
       level = VALUES(level),
       expires_at = VALUES(expires_at),
       activated_at = NOW(),
       updated_at = NOW()`,
      [userId, membershipLevel, newExpiry]
    );

    // 更新试用次数（如果提供了）
    if (trialBk !== undefined || trialXinli !== undefined || trialFuplan !== undefined) {
      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (trialBk !== undefined) {
        updateFields.push('trial_bk = ?');
        updateValues.push(trialBk);
      }
      if (trialXinli !== undefined) {
        updateFields.push('trial_xinli = ?');
        updateValues.push(trialXinli);
      }
      if (trialFuplan !== undefined) {
        updateFields.push('trial_fuplan = ?');
        updateValues.push(trialFuplan);
      }

      if (updateFields.length > 0) {
        updateValues.push(userId);
        await db.execute(
          `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
          updateValues
        );
      }
    }

    // 记录审计日志（失败不影响主操作）
    try {
      await db.execute(
        `INSERT INTO admin_audit_logs
          (admin_id, action, target_type, target_id, old_value, new_value, description, ip_address)
         VALUES (?, 'adjust_membership', 'user', ?, ?, ?, ?, ?)`,
        [
          admin.userId,
          userId,
          JSON.stringify({ level: user.membership_level, expiry: user.membership_expiry }),
          JSON.stringify({ level: membershipLevel, expiry: newExpiry?.toISOString() || null }),
          `调整会员等级: ${user.username} (${user.membership_level} → ${membershipLevel})`,
          request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
        ]
      );
    } catch (auditError) {
      console.warn('[调整会员等级API] 审计日志记录失败:', auditError);
      // 继续执行，不影响主操作
    }

    return successResponse(
      {
        userId,
        username: user.username,
        previousLevel: user.membership_level,
        previousExpiry: user.membership_expiry,
        newLevel: membershipLevel,
        newExpiry: newExpiry?.toISOString() || null,
        trialCounts: {
          bk: trialBk ?? user.trial_bk ?? 5,
          xinli: trialXinli ?? user.trial_xinli ?? 5,
          fuplan: trialFuplan ?? user.trial_fuplan ?? 5
        },
        adjustedBy: admin.username
      },
      '会员信息调整成功'
    );

  } catch (error) {
    console.error('[调整会员等级API] 调整失败:', error);
    return errorResponse('调整会员等级失败', 500);
  }
}
