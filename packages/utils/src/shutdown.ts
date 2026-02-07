/**
 * 优雅关闭处理工具
 * 用于处理进程信号并清理资源（如数据库连接池）
 */

type CleanupHandler = () => Promise<void> | void;

class ShutdownManager {
  private cleanupHandlers: CleanupHandler[] = [];
  private isShuttingDown = false;
  private signalsRegistered = false;

  /**
   * 注册清理处理函数
   * @param handler 清理函数
   */
  registerCleanup(handler: CleanupHandler): void {
    this.cleanupHandlers.push(handler);
  }

  /**
   * 注册进程信号监听器
   */
  registerSignals(): void {
    if (this.signalsRegistered) {
      return;
    }

    // 监听 SIGTERM 信号（PM2 restart, Docker stop 等）
    process.on('SIGTERM', () => {
      console.log('[Shutdown] 收到 SIGTERM 信号，开始优雅关闭...');
      this.shutdown('SIGTERM');
    });

    // 监听 SIGINT 信号（Ctrl+C）
    process.on('SIGINT', () => {
      console.log('[Shutdown] 收到 SIGINT 信号，开始优雅关闭...');
      this.shutdown('SIGINT');
    });

    // 监听未捕获的异常
    process.on('uncaughtException', (error) => {
      console.error('[Shutdown] 未捕获的异常:', error);
      this.shutdown('uncaughtException');
    });

    // 监听未处理的 Promise 拒绝
    process.on('unhandledRejection', (reason, promise) => {
      console.error('[Shutdown] 未处理的 Promise 拒绝:', reason);
      this.shutdown('unhandledRejection');
    });

    this.signalsRegistered = true;
    console.log('[Shutdown] 进程信号监听器已注册');
  }

  /**
   * 执行优雅关闭
   * @param signal 触发关闭的信号
   */
  private async shutdown(signal: string): Promise<void> {
    if (this.isShuttingDown) {
      console.log('[Shutdown] 已在关闭中，忽略重复信号');
      return;
    }

    this.isShuttingDown = true;
    console.log(`[Shutdown] 开始执行清理操作（触发信号: ${signal}）...`);

    try {
      // 执行所有清理处理函数
      await Promise.all(
        this.cleanupHandlers.map(async (handler, index) => {
          try {
            console.log(`[Shutdown] 执行清理处理函数 #${index + 1}...`);
            await handler();
            console.log(`[Shutdown] 清理处理函数 #${index + 1} 完成`);
          } catch (error) {
            console.error(`[Shutdown] 清理处理函数 #${index + 1} 失败:`, error);
          }
        })
      );

      console.log('[Shutdown] 所有清理操作完成，进程即将退出');
      process.exit(0);
    } catch (error) {
      console.error('[Shutdown] 清理过程中发生错误:', error);
      process.exit(1);
    }
  }

  /**
   * 手动触发关闭（用于测试）
   */
  async triggerShutdown(): Promise<void> {
    await this.shutdown('manual');
  }
}

// 导出单例实例
export const shutdownManager = new ShutdownManager();

/**
 * 便捷函数：注册数据库清理处理
 * @param database 数据库实例（需要有 close() 方法）
 * @param name 数据库名称（用于日志）
 */
export function registerDatabaseCleanup(
  database: { close: () => Promise<void> },
  name: string = 'Database'
): void {
  shutdownManager.registerCleanup(async () => {
    console.log(`[Shutdown] 正在关闭 ${name} 连接池...`);
    await database.close();
    console.log(`[Shutdown] ${name} 连接池已关闭`);
  });
}

/**
 * 初始化优雅关闭机制
 * @param options 配置选项
 */
export function initGracefulShutdown(options?: {
  databases?: Array<{ instance: { close: () => Promise<void> }; name: string }>;
  customHandlers?: CleanupHandler[];
}): void {
  // 注册信号监听器
  shutdownManager.registerSignals();

  // 注册数据库清理
  if (options?.databases) {
    options.databases.forEach(({ instance, name }) => {
      registerDatabaseCleanup(instance, name);
    });
  }

  // 注册自定义清理处理
  if (options?.customHandlers) {
    options.customHandlers.forEach((handler) => {
      shutdownManager.registerCleanup(handler);
    });
  }

  console.log('[Shutdown] 优雅关闭机制已初始化');
}
