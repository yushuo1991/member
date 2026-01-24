import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@repo/auth';
import { memberDatabase } from '@repo/database';

export async function POST(request: NextRequest) {
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
    const body = await request.json();
    const { answers, status } = body;

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: '无效的数据格式' },
        { status: 400 }
      );
    }

    // 查找或创建测评记录
    const [existingTests] = await memberDatabase.query(
      `SELECT id, progress FROM user_psychology_tests
       WHERE user_id = ? AND status = 'in_progress'
       ORDER BY started_at DESC LIMIT 1`,
      [userId]
    );

    let testId: number;

    if ((existingTests as any[]).length > 0) {
      // 更新现有测评
      testId = (existingTests as any[])[0].id;
    } else {
      // 创建新测评
      const [result] = await memberDatabase.query(
        `INSERT INTO user_psychology_tests (user_id, progress, status)
         VALUES (?, 0, 'in_progress')`,
        [userId]
      );
      testId = (result as any).insertId;
    }

    // 保存答案（使用 REPLACE INTO 来处理更新）
    for (const answer of answers) {
      const { scenarioId, operation, thought } = answer;

      if (!scenarioId) continue;

      await memberDatabase.query(
        `INSERT INTO user_psychology_answers
         (test_id, scenario_id, operation, thought)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         operation = VALUES(operation),
         thought = VALUES(thought),
         updated_at = CURRENT_TIMESTAMP`,
        [testId, scenarioId, operation || '', thought || '']
      );
    }

    // 更新进度
    const progress = answers.filter(a => a.operation || a.thought).length;
    const newStatus = status === 'completed' ? 'completed' : 'in_progress';
    const completedAt = status === 'completed' ? new Date() : null;

    await memberDatabase.query(
      `UPDATE user_psychology_tests
       SET progress = ?, status = ?, completed_at = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [progress, newStatus, completedAt, testId]
    );

    return NextResponse.json({
      success: true,
      testId,
      progress,
      message: '保存成功',
    });
  } catch (error) {
    console.error('保存测评答案失败:', error);
    return NextResponse.json(
      { error: '保存失败，请稍后重试' },
      { status: 500 }
    );
  }
}
