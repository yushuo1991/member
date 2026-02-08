/**
 * 重置所有会员试用次数API（管理员专用）
 * POST /api/admin/trials/reset - 重置所有用户的试用次数为5
 */

import { NextRequest } from 'next/server';
import { memberDatabase } from '@repo/database';
import { verifyAdminToken, errorResponse, successResponse } from '@repo/auth';

// 确保试用字段存在
async function ensureTrialFieldsExist(db: any) {
  const fields = [
    { name: 'trial_bk', comment: '板块节奏系统试用次数' },
    { name: 'trial_xinli', comment: '心理测评系统试用次数' },
    { name: 'trial_fuplan', comment: '复盘系统试用次数' }
  ];
  for (const field of fields) {
    try {
      await db.execute(`ALTER TABLE users ADD COLUMN ${field.name} INT DEFAULT 5 COMMENT '${field.comment}'`);
      console.log(`[重置API] 自动添加字段: ${field.name}`);
    } catch (e: any) {
      if (e.code !== 'ER_DUP_FIELDNAME') {
        console.error(`[重置API] 添加字段 ${field.name} 失败:`, e.message);
      }
    }
  }
}

/**
 * POST - 重置所有用户的试用次数
 */
export async function POST(request: NextRequest) {
  try {
    // 验证管理员Token
    const { isValid, admin, error } = verifyAdminToken(request);

    if (!isValid || !admin) {
      return errorResponse(error || '未授权访问，需要管理员权限', 401);
    }

    const db = memberDatabase.getPool();

    // 确保字段存在
    await ensureTrialFieldsExist(db);

    // 查询重置前的统计信息
    let beforeStats;
    try {
      [beforeStats] = await db.execute<any[]>(
        `SELECT
          COUNT(*) as total_users,
          SUM(CASE WHEN trial_bk != 5 THEN 1 ELSE 0 END) as bk_need_reset,
          SUM(CASE WHEN trial_xinli != 5 THEN 1 ELSE 0 END) as xinli_need_reset,
          SUM(CASE WHEN trial_fuplan != 5 THEN 1 ELSE 0 END) as fuplan_need_reset,
          AVG(trial_bk) as avg_bk,
          AVG(trial_xinli) as avg_xinli,
          AVG(trial_fuplan) as avg_fuplan
         FROM users
         WHERE deleted_at IS NULL`
      );
    } catch (e: any) {
      if (e.code === 'ER_BAD_FIELD_ERROR') {
        await ensureTrialFieldsExist(db);
        [beforeStats] = await db.execute<any[]>(
          `SELECT COUNT(*) as total_users FROM users WHERE deleted_at IS NULL`
        );
      } else {
        throw e;
      }
    }

    const beforeData = beforeStats[0];

    // 执行重置操作
    const [result] = await db.execute<any>(
      `UPDATE users
       SET trial_bk = 5,
           trial_xinli = 5,
           trial_fuplan = 5
       WHERE deleted_at IS NULL`
    );

    // 查询重置后的验证信息
    const [afterStats] = await db.execute<any[]>(
      `SELECT
        COUNT(*) as total_users,
        SUM(CASE WHEN trial_bk = 5 THEN 1 ELSE 0 END) as bk_success,
        SUM(CASE WHEN trial_xinli = 5 THEN 1 ELSE 0 END) as xinli_success,
        SUM(CASE WHEN trial_fuplan = 5 THEN 1 ELSE 0 END) as fuplan_success
       FROM users
       WHERE deleted_at IS NULL`
    );

    const afterData = afterStats[0];

    // 记录管理员操作日志
    try {
      await db.execute(
        `INSERT INTO admin_audit_logs (admin_id, action, description, ip_address)
         VALUES (?, ?, ?, ?)`,
        [
          admin.userId,
          'reset_trial_counts',
          `重置所有用户试用次数，影响 ${result.affectedRows} 个用户`,
          request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
          request.headers.get('x-real-ip') ||
          'unknown'
        ]
      );
    } catch (logError) {
      console.error('[重置API] 记录日志失败:', logError);
    }

    return successResponse(
      {
        affectedRows: result.affectedRows,
        before: {
          totalUsers: beforeData.total_users,
          needReset: {
            bk: beforeData.bk_need_reset || 0,
            xinli: beforeData.xinli_need_reset || 0,
            fuplan: beforeData.fuplan_need_reset || 0
          },
          average: {
            bk: parseFloat(beforeData.avg_bk || 5).toFixed(2),
            xinli: parseFloat(beforeData.avg_xinli || 5).toFixed(2),
            fuplan: parseFloat(beforeData.avg_fuplan || 5).toFixed(2)
          }
        },
        after: {
          totalUsers: afterData.total_users,
          success: {
            bk: afterData.bk_success,
            xinli: afterData.xinli_success,
            fuplan: afterData.fuplan_success
          }
        }
      },
      '试用次数重置成功'
    );

  } catch (error) {
    console.error('[管理员API] 重置试用次数失败:', error);
    return errorResponse('重置试用次数失败', 500);
  }
}
