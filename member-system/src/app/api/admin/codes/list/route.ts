import { NextRequest } from 'next/server';
import { memberDatabase } from '@/lib/database';
import { verifyAdminToken } from '@/lib/auth-middleware';
import { errorResponse, successResponse } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { isValid, admin, error } = verifyAdminToken(request);

    if (!isValid || !admin) {
      return errorResponse(error || '未授权访问', 401);
    }

    const db = memberDatabase.getPool();

    const [codes] = await db.execute<any[]>(
      `SELECT
        ac.id, ac.code, ac.level, ac.duration_days,
        ac.used, ac.used_by, ac.used_at, ac.created_at,
        ac.expires_at, ac.batch_id,
        u.email as used_by_email
      FROM activation_codes ac
      LEFT JOIN users u ON ac.used_by = u.id
      ORDER BY ac.created_at DESC
      LIMIT 100`
    );

    return successResponse({ codes });

  } catch (error) {
    console.error('[获取激活码列表] 失败:', error);
    return errorResponse('获取激活码列表失败', 500);
  }
}
