/**
 * Winston 日志系统使用示例
 * 展示各种日志记录场景和最佳实践
 */

import {
  logger,
  createLogger,
  Logger,
  PerformanceLogger,
  LogPerformance,
  logError,
} from './logger';

// ============================================
// 示例 1: 基本日志记录
// ============================================

export function basicLoggingExample() {
  // 使用默认 logger
  logger.info('应用启动成功');
  logger.warn('配置文件缺少某些可选项');
  logger.error('数据库连接失败');
  logger.debug('调试信息：变量值为 123');

  // 带元数据的日志
  logger.info('用户登录', {
    userId: 'user123',
    ip: '192.168.1.1',
    userAgent: 'Mozilla/5.0...',
  });
}

// ============================================
// 示例 2: 创建带上下文的 Logger
// ============================================

export function contextLoggerExample() {
  // 为特定模块创建 logger
  const authLogger = createLogger('AuthService');
  const dbLogger = createLogger('Database');
  const apiLogger = createLogger('API');

  authLogger.info('用户认证成功', { userId: 'user123' });
  dbLogger.error('查询超时', { query: 'SELECT * FROM users', timeout: 5000 });
  apiLogger.http('收到 API 请求', { method: 'POST', url: '/api/login' });
}

// ============================================
// 示例 3: 错误日志记录
// ============================================

export function errorLoggingExample() {
  const logger = createLogger('ErrorExample');

  try {
    // 模拟错误
    throw new Error('数据库连接失败');
  } catch (error) {
    // 方法 1: 使用 logger.error
    logger.error('操作失败', error as Error, {
      operation: 'database_connect',
      retryCount: 3,
    });

    // 方法 2: 使用 logError 助手函数
    logError(error as Error, 'ErrorExample', {
      operation: 'database_connect',
      retryCount: 3,
    });
  }
}

// ============================================
// 示例 4: API 请求/响应日志
// ============================================

export function apiLoggingExample() {
  const logger = createLogger('API');

  // 记录请求
  logger.logRequest({
    method: 'POST',
    url: '/api/auth/login',
    ip: '192.168.1.1',
    userId: 'user123',
  });

  // 记录响应
  logger.logResponse({
    method: 'POST',
    url: '/api/auth/login',
    statusCode: 200,
    duration: 145, // 毫秒
    userId: 'user123',
  });

  // 记录错误响应
  logger.logResponse({
    method: 'POST',
    url: '/api/auth/login',
    statusCode: 401,
    duration: 50,
  });
}

// ============================================
// 示例 5: 数据库查询日志
// ============================================

export function databaseLoggingExample() {
  const logger = createLogger('Database');

  // 成功的查询
  logger.logQuery('SELECT * FROM users WHERE id = ?', 23);

  // 失败的查询
  try {
    throw new Error('表不存在');
  } catch (error) {
    logger.logQuery('SELECT * FROM invalid_table', 15, error as Error);
  }
}

// ============================================
// 示例 6: 认证事件日志
// ============================================

export function authLoggingExample() {
  const logger = createLogger('Auth');

  // 登录事件
  logger.logAuth('login', 'user123', {
    ip: '192.168.1.1',
    userAgent: 'Mozilla/5.0...',
  });

  // 登出事件
  logger.logAuth('logout', 'user123', {
    sessionDuration: 3600000, // 1小时
  });

  // 注册事件
  logger.logAuth('register', 'user456', {
    email: 'user@example.com',
    referrer: 'google',
  });

  // Token 刷新
  logger.logAuth('token_refresh', 'user123', {
    oldTokenExpiry: '2024-01-01',
    newTokenExpiry: '2024-01-08',
  });
}

// ============================================
// 示例 7: 业务事件日志
// ============================================

export function businessEventExample() {
  const logger = createLogger('Business');

  // 会员激活
  logger.logEvent('membership_activated', {
    userId: 'user123',
    membershipType: 'yearly',
    activationCode: 'YS-Y-XXXX',
    expiryDate: '2025-01-01',
  });

  // 订单创建
  logger.logEvent('order_created', {
    orderId: 'order123',
    userId: 'user123',
    amount: 299.00,
    products: ['product1', 'product2'],
  });

  // 支付成功
  logger.logEvent('payment_success', {
    orderId: 'order123',
    paymentMethod: 'alipay',
    amount: 299.00,
  });
}

// ============================================
// 示例 8: 性能监控
// ============================================

export async function performanceLoggingExample() {
  const logger = createLogger('Performance');

  // 方法 1: 使用 PerformanceLogger 类
  const perf = new PerformanceLogger('数据库查询', 'Database');

  try {
    // 模拟耗时操作
    await new Promise(resolve => setTimeout(resolve, 100));

    perf.end({ rowsAffected: 10 });
  } catch (error) {
    perf.error(error as Error, { query: 'SELECT * FROM users' });
  }

  // 方法 2: 手动记录
  const startTime = Date.now();
  await new Promise(resolve => setTimeout(resolve, 50));
  const duration = Date.now() - startTime;

  logger.debug('操作完成', { operation: 'cache_update', duration });
}

// ============================================
// 示例 9: 使用装饰器记录性能（类方法）
// ============================================

export class UserService {
  private logger = createLogger('UserService');

  @LogPerformance('UserService')
  async getUserById(userId: string) {
    // 模拟数据库查询
    await new Promise(resolve => setTimeout(resolve, 50));

    this.logger.info('获取用户信息', { userId });

    return { id: userId, name: 'Test User' };
  }

  @LogPerformance('UserService')
  async createUser(userData: any) {
    // 模拟创建用户
    await new Promise(resolve => setTimeout(resolve, 100));

    this.logger.info('创建用户成功', { userId: userData.id });

    return userData;
  }
}

// ============================================
// 示例 10: 结构化日志（复杂对象）
// ============================================

export function structuredLoggingExample() {
  const logger = createLogger('Structured');

  // 记录复杂的业务对象
  logger.info('订单处理完成', {
    order: {
      id: 'order123',
      status: 'completed',
      items: [
        { productId: 'prod1', quantity: 2, price: 99.00 },
        { productId: 'prod2', quantity: 1, price: 149.00 },
      ],
      total: 347.00,
      customer: {
        id: 'user123',
        email: 'user@example.com',
      },
      payment: {
        method: 'alipay',
        transactionId: 'txn123',
        timestamp: new Date().toISOString(),
      },
    },
    processingTime: 1234,
    warehouse: 'warehouse_01',
  });
}

// ============================================
// 示例 11: Next.js API 路由中使用
// ============================================

export async function nextjsApiExample(req: any, res: any) {
  const logger = createLogger('API:Login');
  const startTime = Date.now();

  try {
    // 记录请求
    logger.logRequest({
      method: req.method,
      url: req.url,
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
    });

    // 业务逻辑
    const { username, password } = req.body;
    logger.debug('处理登录请求', { username });

    // 模拟认证
    if (username === 'admin' && password === 'password') {
      logger.logAuth('login', username, {
        ip: req.headers['x-forwarded-for'],
      });

      // 记录响应
      logger.logResponse({
        method: req.method,
        url: req.url,
        statusCode: 200,
        duration: Date.now() - startTime,
      });

      return res.status(200).json({ success: true });
    } else {
      logger.warn('登录失败：凭证无效', { username });

      logger.logResponse({
        method: req.method,
        url: req.url,
        statusCode: 401,
        duration: Date.now() - startTime,
      });

      return res.status(401).json({ error: '凭证无效' });
    }
  } catch (error) {
    logger.error('API 错误', error as Error, {
      method: req.method,
      url: req.url,
    });

    logger.logResponse({
      method: req.method,
      url: req.url,
      statusCode: 500,
      duration: Date.now() - startTime,
    });

    return res.status(500).json({ error: '内部服务器错误' });
  }
}

// ============================================
// 示例 12: 条件日志（根据环境）
// ============================================

export function conditionalLoggingExample() {
  const logger = createLogger('Conditional');
  const isDevelopment = process.env.NODE_ENV === 'development';

  // 开发环境才记录的详细信息
  if (isDevelopment) {
    logger.debug('详细的调试信息', {
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
    });
  }

  // 生产环境记录关键信息
  logger.info('应用启动', {
    environment: process.env.NODE_ENV,
    version: '1.0.0',
  });
}

// ============================================
// 示例 13: 批量操作日志
// ============================================

export async function batchOperationExample() {
  const logger = createLogger('Batch');
  const perf = new PerformanceLogger('批量导入用户', 'Batch');

  const users = ['user1', 'user2', 'user3', 'user4', 'user5'];
  let successCount = 0;
  let failureCount = 0;

  for (const user of users) {
    try {
      // 模拟处理
      await new Promise(resolve => setTimeout(resolve, 10));
      successCount++;
      logger.debug('用户导入成功', { user });
    } catch (error) {
      failureCount++;
      logger.error('用户导入失败', error as Error, { user });
    }
  }

  perf.end({
    total: users.length,
    success: successCount,
    failure: failureCount,
  });

  logger.info('批量操作完成', {
    operation: 'user_import',
    total: users.length,
    success: successCount,
    failure: failureCount,
  });
}

// ============================================
// 运行所有示例
// ============================================

export async function runAllExamples() {
  console.log('=== 运行日志系统示例 ===\n');

  console.log('1. 基本日志记录');
  basicLoggingExample();

  console.log('\n2. 带上下文的 Logger');
  contextLoggerExample();

  console.log('\n3. 错误日志记录');
  errorLoggingExample();

  console.log('\n4. API 请求/响应日志');
  apiLoggingExample();

  console.log('\n5. 数据库查询日志');
  databaseLoggingExample();

  console.log('\n6. 认证事件日志');
  authLoggingExample();

  console.log('\n7. 业务事件日志');
  businessEventExample();

  console.log('\n8. 性能监控');
  await performanceLoggingExample();

  console.log('\n9. 装饰器示例');
  const userService = new UserService();
  await userService.getUserById('user123');
  await userService.createUser({ id: 'user456', name: 'New User' });

  console.log('\n10. 结构化日志');
  structuredLoggingExample();

  console.log('\n11. 条件日志');
  conditionalLoggingExample();

  console.log('\n12. 批量操作日志');
  await batchOperationExample();

  console.log('\n=== 示例运行完成 ===');
}

// 如果直接运行此文件
if (require.main === module) {
  runAllExamples().catch(console.error);
}
