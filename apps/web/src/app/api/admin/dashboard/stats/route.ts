/**
 * 管理员仪表板统计API
 * GET /api/admin/dashboard/stats
 */

import { NextRequest } from 'next/server';
import { memberDatabase } from '@repo/database';
import { verifyAdminToken, errorResponse, successResponse } from '@repo/auth';

export async function GET(request: NextRequest) {
  try {
    // 验证管理员Token
    const { isValid, admin, error } = verifyAdminToken(request);

    if (!isValid || !admin) {
      return errorResponse(error || '未授权访问', 401);
    }

    const db = memberDatabase.getPool();

    // 统计总用户数
    const [totalUsersResult] = await db.execute<any[]>(
      'SELECT COUNT(*) as count FROM users'
    );
    const totalUsers = totalUsersResult[0].count;

    // 统计各等级会员数
    const [membershipStats] = await db.execute<any[]>(
      `SELECT level, COUNT(*) as count
       FROM memberships
       GROUP BY level`
    );

    // 统计今日新增用户
    const [todayNewUsers] = await db.execute<any[]>(
      `SELECT COUNT(*) as count
       FROM users
       WHERE DATE(created_at) = CURDATE()`
    );

    // 统计激活码使用情况
    const [activationStats] = await db.execute<any[]>(
      `SELECT
         COUNT(*) as total,
         SUM(CASE WHEN used = 1 THEN 1 ELSE 0 END) as used,
         SUM(CASE WHEN used = 0 AND (expires_at IS NULL OR expires_at > NOW()) THEN 1 ELSE 0 END) as available
       FROM activation_codes`
    );

    // 统计最近7天登录活跃用户
    const [activeUsers] = await db.execute<any[]>(
      `SELECT COUNT(DISTINCT user_id) as count
       FROM login_logs
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       AND success = TRUE`
    );

    // 统计各等级会员收入（假设价格）
    const membershipRevenue: Record<string, number> = {
      monthly: 99,
      quarterly: 249,
      yearly: 899,
      lifetime: 2999
    };

    let totalRevenue = 0;
    const revenueByLevel: any = {};

    membershipStats.forEach((stat: any) => {
      if (stat.level !== 'none') {
        const revenue = (membershipRevenue[stat.level] || 0) * stat.count;
        totalRevenue += revenue;
        revenueByLevel[stat.level] = revenue;
      }
    });

    // 统计最近30天注册趋势
    const [registrationTrend] = await db.execute<any[]>(
      `SELECT DATE(created_at) as date, COUNT(*) as count
       FROM users
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY DATE(created_at)
       ORDER BY date ASC`
    );

    return successResponse(
      {
        overview: {
          totalUsers,
          todayNewUsers: todayNewUsers[0].count,
          activeUsers7Days: activeUsers[0].count,
          totalRevenue
        },
        membershipStats: membershipStats.map((stat: any) => ({
          level: stat.level,
          count: stat.count
        })),
        activationCodes: {
          total: activationStats[0].total,
          used: activationStats[0].used,
          available: activationStats[0].available
        },
        revenueByLevel,
        registrationTrend: registrationTrend.map((item: any) => ({
          date: item.date,
          count: item.count
        }))
      },
      '获取统计数据成功'
    );

  } catch (error) {
    console.error('[统计API] 查询失败:', error);
    return errorResponse('获取统计数据失败', 500);
  }
}
