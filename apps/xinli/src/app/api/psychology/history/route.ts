import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@repo/auth';
import { memberDatabase } from '@repo/database';

export async function GET(request: NextRequest) {
  try {
    // 验证身份
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    const userId = authResult.user.userId;

    // 获取所有测评历史
    const [tests] = await memberDatabase.query(
      `SELECT id, test_name, status, progress, started_at, completed_at, updated_at
       FROM user_psychology_tests
       WHERE user_id = ?
       ORDER BY started_at DESC
       LIMIT 20`,
      [userId]
    );

    return NextResponse.json({
      tests: (tests as any[]).map(t => ({
        id: t.id,
        name: t.test_name,
        status: t.status,
        progress: t.progress,
        startedAt: t.started_at,
        completedAt: t.completed_at,
        updatedAt: t.updated_at,
      })),
    });
  } catch (error) {
    console.error('获取测评历史失败:', error);
    return NextResponse.json(
      { error: '获取失败，请稍后重试' },
      { status: 500 }
    );
  }
}
