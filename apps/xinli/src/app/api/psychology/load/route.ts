import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@repo/auth';
import { getDatabase } from '@repo/database';

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

    const userId = authResult.user.id;
    const db = getDatabase();

    // 获取最新的进行中的测评
    const [tests] = await db.execute(
      `SELECT id, progress, status, started_at, completed_at
       FROM user_psychology_tests
       WHERE user_id = ?
       ORDER BY updated_at DESC LIMIT 1`,
      [userId]
    );

    if ((tests as any[]).length === 0) {
      return NextResponse.json({
        testId: null,
        answers: [],
        progress: 0,
        status: null,
      });
    }

    const test = (tests as any[])[0];
    const testId = test.id;

    // 获取所有答案
    const [answers] = await db.execute(
      `SELECT scenario_id, operation, thought, updated_at
       FROM user_psychology_answers
       WHERE test_id = ?
       ORDER BY scenario_id ASC`,
      [testId]
    );

    return NextResponse.json({
      testId,
      answers: (answers as any[]).map(a => ({
        scenarioId: a.scenario_id,
        operation: a.operation,
        thought: a.thought,
        updatedAt: a.updated_at,
      })),
      progress: test.progress,
      status: test.status,
      startedAt: test.started_at,
      completedAt: test.completed_at,
    });
  } catch (error) {
    console.error('加载测评数据失败:', error);
    return NextResponse.json(
      { error: '加载失败，请稍后重试' },
      { status: 500 }
    );
  }
}
