# @yushuo/database

宇硕会员体系 - MySQL数据库连接池

## 安装

```bash
npm install @yushuo/database
```

## 功能

- MySQL连接池管理（基于mysql2）
- 单例模式确保全局唯一连接池
- 自动表结构初始化（v3架构）
- 查询封装和错误处理
- 连接池健康检查
- TypeScript类型支持

## 使用示例

### 基本用法

```typescript
import { MemberDatabase } from '@yushuo/database';

// 获取数据库实例（单例）
const db = MemberDatabase.getInstance();

// 或使用自定义配置
const db = MemberDatabase.getInstance({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'password',
  database: 'member_system'
});

// 初始化表结构
await db.initializeTables();

// 执行查询
const users = await db.query('SELECT * FROM users WHERE status = ?', [1]);

// 测试连接
const isConnected = await db.testConnection();

// 获取原生连接池
const pool = db.getPool();
const [rows] = await pool.execute('SELECT * FROM users');

// 关闭连接池（应用退出时）
await db.close();
```

### 在Next.js API路由中使用

```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { MemberDatabase } from '@yushuo/database';

export async function GET(request: NextRequest) {
  const db = MemberDatabase.getInstance();

  try {
    const users = await db.query(
      'SELECT id, username, email FROM users WHERE status = ? LIMIT 10',
      [1]
    );

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Query failed:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
```

### 带类型的查询

```typescript
interface User {
  id: number;
  username: string;
  email: string;
  created_at: Date;
}

const db = MemberDatabase.getInstance();

// 指定返回类型
const users = await db.query<User[]>(
  'SELECT id, username, email, created_at FROM users WHERE status = ?',
  [1]
);

// TypeScript会自动推断users的类型为User[]
users.forEach(user => {
  console.log(user.username);
});
```

### 初始化应用时设置数据库

```typescript
// app/lib/init-database.ts
import { MemberDatabase } from '@yushuo/database';

export async function initDatabase() {
  const db = MemberDatabase.getInstance({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'member_system'
  });

  // 测试连接
  const connected = await db.testConnection();
  if (!connected) {
    throw new Error('Database connection failed');
  }

  // 初始化表结构
  await db.initializeTables();

  console.log('Database initialized successfully');
}
```

```typescript
// app/layout.tsx (Server Component)
import { initDatabase } from '@/lib/init-database';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // 在服务器端初始化数据库
  await initDatabase();

  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
```

## API参考

### MemberDatabase类

#### 静态方法

**getInstance(config?: DatabaseConfig): MemberDatabase**
- 获取数据库单例实例
- `config` (可选): 数据库配置对象

```typescript
interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  charset?: string;        // 默认: 'utf8mb4'
  timezone?: string;       // 默认: '+08:00'
  connectionLimit?: number; // 默认: 20
  connectTimeout?: number;  // 默认: 60000 (60秒)
}
```

#### 实例方法

**initializeTables(): Promise<void>**
- 初始化数据库表结构（v3架构）
- 自动创建所有必需的表
- 自动迁移旧架构到新架构

**getPool(): mysql.Pool**
- 获取原生mysql2连接池实例
- 用于执行原生操作

**query<T>(sql: string, params?: any[]): Promise<T>**
- 执行SQL查询并返回结果
- 自动处理参数化查询
- 封装错误处理
- 支持TypeScript类型

**testConnection(): Promise<boolean>**
- 测试数据库连接是否正常
- 返回 true/false

**cleanExpiredRateLimits(): Promise<void>**
- 清理过期的限流记录
- 建议定期调用（如每小时）

**close(): Promise<void>**
- 关闭连接池
- 应用退出时调用

## 数据库架构

该包会自动创建以下表（v3架构）:

1. `users` - 用户表
2. `memberships` - 会员表
3. `admins` - 管理员表
4. `activation_codes` - 激活码表
5. `products` - 产品表
6. `user_product_purchases` - 用户产品购买记录
7. `trial_logs` - 试用日志
8. `product_access_logs` - 产品访问日志
9. `login_logs` - 登录日志
10. `rate_limits` - 限流表
11. `admin_audit_logs` - 管理员操作审计日志

详细表结构见源代码中的 `initializeTables()` 方法。

## 环境变量

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=member_system
```

## 连接池配置

默认连接池配置:
- 最大连接数: 20
- 连接超时: 60秒
- 字符集: utf8mb4
- 时区: +08:00 (北京时间)
- 启用Keep-Alive

## 最佳实践

1. **单例模式**: 始终使用 `getInstance()` 获取实例,不要直接new
2. **参数化查询**: 使用参数化查询防止SQL注入
   ```typescript
   // ✅ 正确
   db.query('SELECT * FROM users WHERE id = ?', [userId]);

   // ❌ 错误 - SQL注入风险
   db.query(`SELECT * FROM users WHERE id = ${userId}`);
   ```
3. **错误处理**: 始终捕获查询错误
   ```typescript
   try {
     const result = await db.query('SELECT * FROM users');
   } catch (error) {
     console.error('Database error:', error);
     // 处理错误
   }
   ```
4. **类型安全**: 使用TypeScript类型定义
5. **连接池管理**: 应用退出时调用 `close()` 关闭连接池

## License

MIT
