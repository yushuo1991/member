import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@repo/auth';
import { memberDatabase } from '@repo/database';
import { scenarios } from '@/lib/scenarios';

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
    const { searchParams } = new URL(request.url);
    const testId = searchParams.get('testId');

    if (!testId) {
      return NextResponse.json(
        { error: '缺少测评ID' },
        { status: 400 }
      );
    }

    // 验证测评是否属于当前用户
    const tests = await memberDatabase.query(
      `SELECT id, status, progress, started_at, completed_at
       FROM user_psychology_tests
       WHERE id = ? AND user_id = ?`,
      [testId, userId]
    );

    if ((tests as any[]).length === 0) {
      return NextResponse.json(
        { error: '测评不存在' },
        { status: 404 }
      );
    }

    // 获取所有答案
    const answers = await memberDatabase.query(
      `SELECT scenario_id, operation, thought
       FROM user_psychology_answers
       WHERE test_id = ?
       ORDER BY scenario_id ASC`,
      [testId]
    );

    // 生成Markdown格式
    let markdown = `# 交易心理问卷 - 导出数据\n\n`;
    markdown += `**导出时间:** ${new Date().toLocaleString('zh-CN')}\n`;
    markdown += `**完成进度:** ${(tests as any[])[0].progress}/80\n\n`;
    markdown += `---\n\n`;

    const answersMap = new Map(
      (answers as any[]).map(a => [a.scenario_id, a])
    );

    scenarios.forEach((scenario) => {
      markdown += `## 场景${scenario.id}: ${scenario.title}\n\n`;
      markdown += `**分类:** ${scenario.category}\n\n`;

      const answer = answersMap.get(scenario.id);

      if (answer) {
        markdown += `**操作:**\n${answer.operation || '未填写'}\n\n`;
        markdown += `**想法:**\n${answer.thought || '未填写'}\n\n`;
      } else {
        markdown += `**操作:** 未填写\n\n`;
        markdown += `**想法:** 未填写\n\n`;
      }

      markdown += `---\n\n`;
    });

    // 返回Markdown内容
    return new NextResponse(markdown, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': `attachment; filename="psychology-test-${testId}.md"`,
      },
    });
  } catch (error) {
    console.error('导出测评数据失败:', error);
    return NextResponse.json(
      { error: '导出失败，请稍后重试' },
      { status: 500 }
    );
  }
}
