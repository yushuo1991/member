/**
 * Next.js Instrumentation
 * 用于在服务器启动时初始化优雅关闭机制
 * 文档: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

import { initGracefulShutdown } from '@repo/utils';
import { memberDatabase } from '@repo/database';

export async function register() {
  // 只在 Node.js 运行时执行（不在 Edge Runtime）
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('[Web App] 初始化优雅关闭机制...');

    // 初始化优雅关闭，注册数据库连接池清理
    initGracefulShutdown({
      databases: [
        {
          instance: memberDatabase,
          name: 'Member Database (Web App)',
        },
      ],
    });

    console.log('[Web App] 优雅关闭机制已启用');
  }
}
