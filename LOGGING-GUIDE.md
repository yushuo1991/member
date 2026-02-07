# Winston 日志系统使用指南

本文档介绍宇硕会员体系中 Winston 日志系统的使用方法和最佳实践。

## 目录

- [概述](#概述)
- [快速开始](#快速开始)
- [日志级别](#日志级别)
- [基本用法](#基本用法)
- [高级功能](#高级功能)
- [API 路由中使用](#api-路由中使用)
- [配置选项](#配置选项)
- [日志文件管理](#日志文件管理)
- [最佳实践](#最佳实践)
- [故障排查](#故障排查)

---

## 概述

Winston 日志系统提供了统一的日志记录功能，支持：

- ✅ 多种日志级别（error, warn, info, http, debug 等）
- ✅ 环境区分（开发环境彩色控制台，生产环境文件输出）
- ✅ 自动日志轮转（按文件大小和数量）
- ✅ 结构化日志（JSON 格式）
- ✅ 上下文日志（为不同模块创建独立 logger）
- ✅ 性能监控
- ✅ 请求/响应日志
- ✅ 错误堆栈跟踪

### 架构

```
packages/utils/src/logger.ts  ← 核心日志工具
├── Logger 类                  ← 主要日志记录器
├── PerformanceLogger         ← 性能监控
├── requestLogger             ← HTTP 请求中间件
└── 辅助函数                   ← logError, createLogger 等
```

---

## 快速开始

### 1. 导入日志工具

```typescript
import { logger, createLogger } from '@repo/utils';
```

### 2. 基本日志记录

```typescript
// 使用默认 logger
logger.info('应用启动成功');
logger.warn('配置文件缺少某些可选项');
logger.error('数据库连接失败');
logger.debug('调试信息：变量值为 123');
```

### 3. 带元数据的日志

```typescript
logger.info('用户登录', {
  userId: 'user123',
  ip: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
});
```

---

## 日志级别

Winston 支持以下日志级别（从高到低）：

| 级别 | 用途 | 示例场景 |
|------|------|----------|
| **error** | 错误信息 | 数据库连接失败、API 调用失败 |
| **warn** | 警告信息 | 配置缺失、性能降级、限流触发 |
| **info** | 一般信息 | 用户登录、业务事件、系统状态 |
| **http** | HTTP 请求 | API 请求/响应日志 |
| **verbose** | 详细信息 | 详细的业务流程 |
| **debug** | 调试信息 | 变量值、函数调用、SQL 查询 |
| **silly** | 最详细 | 极其详细的调试信息 |

### 环境配置

- **开发环境**：默认 `debug` 级别，输出到彩色控制台
- **生产环境**：默认 `info` 级别，输出到文件和控制台

可通过环境变量 `LOG_LEVEL` 自定义：

```bash
# .env
LOG_LEVEL=debug  # 或 info, warn, error
```

---

## 基本用法

### 创建带上下文的 Logger

为不同模块创建独立的 logger，便于追踪日志来源：

```typescript
import { createLogger } from '@repo/utils';

const authLogger = createLogger('AuthService');
const dbLogger = createLogger('Database');
const apiLogger = createLogger('API');

authLogger.info('用户认证成功', { userId: 'user123' });
// 输出: [AuthService] 用户认证成功 {"userId":"user123"}

dbLogger.error('查询超时', { query: 'SELECT * FROM users', timeout: 5000 });
// 输出: [Database] 查询超时 {"query":"SELECT * FROM users","timeout":5000}
```

### 错误日志

```typescript
const logger = createLogger('ErrorExample');

try {
  // 业务逻辑
  throw new Error('数据库连接失败');
} catch (error) {
  // 方法 1: 使用 logger.error
  logger.error('操作失败', error as Error, {
    operation: 'database_connect',
    retryCount: 3,
  });

  // 方法 2: 使用 logError 助手函数
  import { logError } from '@repo/utils';
  logError(error as Error, 'ErrorExample', {
    operation: 'database_connect',
    retryCount: 3,
  });
}
```

错误日志会自动包含：
- 错误名称
- 错误消息
- 完整堆栈跟踪

---

## 高级功能

### 1. API 请求/响应日志

```typescript
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
```

### 2. 数据库查询日志

```typescript
const logger = createLogger('Database');

// 成功的查询
logger.logQuery('SELECT * FROM users WHERE id = ?', 23);

// 失败的查询
try {
  // 执行查询
} catch (error) {
  logger.logQuery('SELECT * FROM invalid_table', 15, error as Error);
}
```

### 3. 认证事件日志

```typescript
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
```

### 4. 业务事件日志

```typescript
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
```

### 5. 性能监控

#### 方法 1: 使用 PerformanceLogger 类

```typescript
import { PerformanceLogger } from '@repo/utils';

async function fetchUserData(userId: string) {
  const perf = new PerformanceLogger('获取用户数据', 'UserService');

  try {
    // 执行耗时操作
    const data = await db.query('SELECT * FROM users WHERE id = ?', [userId]);

    perf.end({ rowsAffected: data.length });
    return data;
  } catch (error) {
    perf.error(error as Error, { userId });
    throw error;
  }
}
```

#### 方法 2: 使用装饰器（类方法）

```typescript
import { LogPerformance } from '@repo/utils';

class UserService {
  @LogPerformance('UserService')
  async getUserById(userId: string) {
    // 方法执行时间会自动记录
    const user = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    return user;
  }

  @LogPerformance('UserService')
  async createUser(userData: any) {
    // 自动记录性能
    const result = await db.insert('users', userData);
    return result;
  }
}
```

### 6. 结构化日志

记录复杂的业务对象：

```typescript
const logger = createLogger('Order');

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
```

---

## API 路由中使用

### Next.js API 路由完整示例

```typescript
import { NextRequest } from 'next/server';
import { createLogger } from '@repo/utils';
import { errorResponse, successResponse } from '@/lib/utils';

const logger = createLogger('API:Login');

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const clientIP = request.headers.get('x-forwarded-for') ||
                   request.socket.remoteAddress;

  try {
    // 1. 记录请求
    logger.logRequest({
      method: 'POST',
      url: '/api/auth/login',
      ip: clientIP,
    });

    // 2. 解析请求体
    const body = await request.json();
    const { username, password } = body;

    logger.debug('处理登录请求', { username, clientIP });

    // 3. 业务逻辑
    const user = await authenticateUser(username, password);

    if (!user) {
      logger.warn('登录失败：凭证无效', { username, clientIP });

      logger.logResponse({
        method: 'POST',
        url: '/api/auth/login',
        statusCode: 401,
        duration: Date.now() - startTime,
      });

      return errorResponse('凭证无效', 401);
    }

    // 4. 记录认证事件
    logger.logAuth('login', user.id, {
      username: user.username,
      ip: clientIP,
    });

    // 5. 记录成功响应
    logger.logResponse({
      method: 'POST',
      url: '/api/auth/login',
      statusCode: 200,
      duration: Date.now() - startTime,
      userId: user.id,
    });

    return successResponse({ user }, '登录成功');

  } catch (error) {
    // 6. 记录错误
    logger.error('登录处理失败', error as Error, { clientIP });

    logger.logResponse({
      method: 'POST',
      url: '/api/auth/login',
      statusCode: 500,
      duration: Date.now() - startTime,
    });

    return errorResponse('内部服务器错误', 500);
  }
}
```

### 实际应用示例

查看以下文件了解实际使用：

- **登录 API**: `C:\Users\yushu\Desktop\我的会员体系\apps\web\src\app\api\auth\login\route.ts`
- **激活 API**: `C:\Users\yushu\Desktop\我的会员体系\apps\web\src\app\api\activation\activate\route.ts`

---

## 配置选项

### 环境变量

在 `.env` 文件中配置：

```bash
# 日志级别 (error, warn, info, http, verbose, debug, silly)
LOG_LEVEL=info

# 日志目录（默认: ./logs）
LOG_DIR=./logs

# 环境（development 或 production）
NODE_ENV=production
```

### 日志输出

#### 开发环境 (NODE_ENV=development)

- **输出位置**: 彩色控制台
- **格式**: 易读的文本格式
- **级别**: debug（显示所有日志）

```
2024-01-15 10:30:45 info: [API:Login] 用户登录
{
  "userId": "user123",
  "ip": "192.168.1.1"
}
```

#### 生产环境 (NODE_ENV=production)

- **输出位置**: 文件 + 控制台
- **格式**: JSON（便于日志分析工具处理）
- **级别**: info（只显示重要日志）

**日志文件**:
- `logs/error.log` - 只记录 error 级别
- `logs/combined.log` - 记录所有级别
- `logs/exceptions.log` - 未捕获的异常
- `logs/rejections.log` - 未处理的 Promise 拒绝

---

## 日志文件管理

### 日志轮转

日志文件会自动轮转，避免单个文件过大：

- **error.log**: 最大 10MB，保留最近 10 个文件
- **combined.log**: 最大 10MB，保留最近 30 个文件

轮转后的文件命名：
```
error.log
error.log.1
error.log.2
...
error.log.10
```

### 日志清理

定期清理旧日志文件：

```bash
# 删除 30 天前的日志
find ./logs -name "*.log.*" -mtime +30 -delete

# 或使用 logrotate（Linux）
# 创建 /etc/logrotate.d/member-system
/www/wwwroot/member-system/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    notifempty
    missingok
}
```

### 日志分析

使用工具分析 JSON 格式的日志：

```bash
# 查看错误日志
cat logs/error.log | jq '.'

# 统计错误类型
cat logs/error.log | jq -r '.message' | sort | uniq -c

# 查找特定用户的日志
cat logs/combined.log | jq 'select(.userId == "user123")'

# 查看最近 1 小时的错误
cat logs/error.log | jq 'select(.timestamp > "'$(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S)'")'
```

---

## 最佳实践

### 1. 为每个模块创建独立 Logger

```typescript
// ✅ 好的做法
const logger = createLogger('UserService');
logger.info('用户创建成功', { userId: 'user123' });

// ❌ 不好的做法
import { logger } from '@repo/utils';
logger.info('用户创建成功'); // 无法知道来自哪个模块
```

### 2. 始终包含上下文信息

```typescript
// ✅ 好的做法
logger.error('数据库查询失败', error, {
  query: 'SELECT * FROM users',
  userId: 'user123',
  duration: 5000,
});

// ❌ 不好的做法
logger.error('数据库查询失败'); // 缺少上下文
```

### 3. 使用合适的日志级别

```typescript
// ✅ 好的做法
logger.error('数据库连接失败', error);        // 严重错误
logger.warn('API 响应时间超过 1 秒');          // 警告
logger.info('用户登录成功', { userId });       // 重要信息
logger.debug('查询参数', { params });          // 调试信息

// ❌ 不好的做法
logger.info('数据库连接失败');  // 应该用 error
logger.error('用户登录成功');   // 应该用 info
```

### 4. 记录性能关键操作

```typescript
// ✅ 好的做法
const perf = new PerformanceLogger('数据库查询', 'Database');
const result = await db.query('SELECT * FROM users');
perf.end({ rowCount: result.length });

// ❌ 不好的做法
const result = await db.query('SELECT * FROM users');
// 没有性能监控
```

### 5. 不要记录敏感信息

```typescript
// ❌ 危险！不要记录敏感信息
logger.info('用户登录', {
  username: 'user123',
  password: 'secret123',      // ❌ 密码
  creditCard: '1234-5678',    // ❌ 信用卡
  token: 'jwt-token-here',    // ❌ Token
});

// ✅ 好的做法
logger.info('用户登录', {
  username: 'user123',
  ip: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
});
```

### 6. 在 API 路由中记录请求和响应

```typescript
// ✅ 好的做法
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  logger.logRequest({ method: 'POST', url: '/api/login', ip: clientIP });

  try {
    // 业务逻辑
    const result = await processRequest();

    logger.logResponse({
      method: 'POST',
      url: '/api/login',
      statusCode: 200,
      duration: Date.now() - startTime,
    });

    return successResponse(result);
  } catch (error) {
    logger.error('请求处理失败', error);

    logger.logResponse({
      method: 'POST',
      url: '/api/login',
      statusCode: 500,
      duration: Date.now() - startTime,
    });

    return errorResponse('内部错误', 500);
  }
}
```

### 7. 使用结构化日志

```typescript
// ✅ 好的做法 - 结构化
logger.info('订单创建', {
  orderId: 'order123',
  userId: 'user123',
  amount: 299.00,
  items: ['item1', 'item2'],
});

// ❌ 不好的做法 - 字符串拼接
logger.info(`订单 order123 创建，用户 user123，金额 299.00`);
```

---

## 故障排查

### 问题 1: 日志文件未创建

**症状**: 生产环境没有生成日志文件

**解决方案**:
1. 检查 `LOG_DIR` 环境变量
2. 确保日志目录有写入权限
3. 检查 `NODE_ENV` 是否设置为 `production`

```bash
# 检查权限
ls -la logs/

# 创建日志目录
mkdir -p logs
chmod 755 logs
```

### 问题 2: 日志级别不正确

**症状**: 看不到 debug 日志

**解决方案**:
1. 检查 `LOG_LEVEL` 环境变量
2. 确保设置为 `debug`

```bash
# .env
LOG_LEVEL=debug
```

### 问题 3: 日志文件过大

**症状**: 日志文件占用大量磁盘空间

**解决方案**:
1. 配置日志轮转（已自动配置）
2. 定期清理旧日志
3. 调整日志级别（生产环境使用 `info` 而非 `debug`）

```bash
# 清理 30 天前的日志
find ./logs -name "*.log.*" -mtime +30 -delete
```

### 问题 4: 性能影响

**症状**: 日志记录影响应用性能

**解决方案**:
1. 生产环境使用 `info` 级别（避免 `debug`）
2. 避免在循环中记录大量日志
3. 使用异步日志（Winston 默认异步）

```typescript
// ❌ 不好的做法
for (let i = 0; i < 10000; i++) {
  logger.debug('处理项目', { index: i }); // 性能问题
}

// ✅ 好的做法
logger.info('开始批量处理', { total: 10000 });
for (let i = 0; i < 10000; i++) {
  // 处理逻辑
}
logger.info('批量处理完成', { total: 10000 });
```

### 问题 5: 导入错误

**症状**: `Cannot find module '@repo/utils'`

**解决方案**:
1. 确保在 monorepo 根目录运行 `pnpm install`
2. 检查 `package.json` 中的依赖

```bash
# 重新安装依赖
pnpm clean:all
pnpm install
pnpm build
```

---

## 示例代码

完整的示例代码请查看：

- **日志工具**: `C:\Users\yushu\Desktop\我的会员体系\packages\utils\src\logger.ts`
- **使用示例**: `C:\Users\yushu\Desktop\我的会员体系\packages\utils\src\logger-examples.ts`
- **登录 API**: `C:\Users\yushu\Desktop\我的会员体系\apps\web\src\app\api\auth\login\route.ts`
- **激活 API**: `C:\Users\yushu\Desktop\我的会员体系\apps\web\src\app\api\activation\activate\route.ts`

---

## 总结

Winston 日志系统为宇硕会员体系提供了强大的日志记录能力：

- ✅ **统一接口**: 所有应用使用相同的日志 API
- ✅ **环境适配**: 开发和生产环境自动切换输出方式
- ✅ **结构化**: JSON 格式便于分析和监控
- ✅ **性能监控**: 内置性能追踪功能
- ✅ **易于维护**: 自动日志轮转和清理

遵循本指南的最佳实践，可以帮助您：
- 快速定位和解决问题
- 监控应用性能
- 审计用户行为
- 分析业务趋势

---

## 相关文档

- [Winston 官方文档](https://github.com/winstonjs/winston)
- [CLAUDE.md - 项目开发指南](./CLAUDE.md)
- [Sentry 错误监控](./SENTRY-SETUP.md)

---

**最后更新**: 2024-01-15
**维护者**: 宇硕会员体系开发团队
