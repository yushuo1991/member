# 宇硕会员体系 Monorepo

这是宇硕会员体系的Monorepo架构项目，使用Turborepo和pnpm workspaces管理多个应用和共享包。

## 项目结构

```
yushuo-member-system-monorepo/
├── apps/                           # 应用目录
│   ├── web/                        # 主会员管理系统 (Next.js 14)
│   ├── bk/                         # 板块节奏系统 (Next.js 14)
│   ├── fuplan/                     # 复盘系统 (Next.js 14)
│   └── xinli/                      # 心理测评系统 (Next.js 14)
│
├── packages/                       # 共享包目录
│   ├── ui/                         # UI组件库
│   │   └── src/
│   │       ├── components/         # Button, Card, Modal, Input等
│   │       └── index.ts
│   ├── auth/                       # 认证模块
│   │   └── src/
│   │       ├── jwt.ts              # JWT工具函数
│   │       ├── password.ts         # 密码哈希工具
│   │       ├── middleware.ts       # 认证中间件
│   │       └── index.ts
│   ├── database/                   # 数据库连接池
│   │   └── src/
│   │       ├── connection.ts       # MySQL连接池类
│   │       └── index.ts
│   ├── config/                     # 共享配置
│   │   ├── tailwind.config.js     # Tailwind配置
│   │   ├── tsconfig.json          # TypeScript配置
│   │   └── eslint.config.js       # ESLint配置
│   └── utils/                      # 工具函数库
│       └── src/
│           ├── date.ts             # 日期工具
│           ├── validation.ts       # 验证工具
│           ├── format.ts           # 格式化工具
│           └── index.ts
│
├── package.json                    # 根package.json (workspaces配置)
├── pnpm-workspace.yaml             # pnpm workspace配置
├── turbo.json                      # Turborepo配置
├── .gitignore                      # 统一的gitignore
└── MONOREPO-README.md              # 本文档
```

## 技术栈

- **构建工具**: Turborepo 2.3+
- **包管理器**: pnpm 8.15+
- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript 5.6+
- **数据库**: MySQL 8.0
- **认证**: JWT + bcryptjs
- **样式**: Tailwind CSS

## 快速开始

### 1. 安装依赖

```bash
# 安装pnpm (如果未安装)
npm install -g pnpm@8.15.0

# 安装所有依赖
pnpm install
```

### 2. 开发模式

```bash
# 启动所有应用
pnpm dev

# 启动特定应用
pnpm --filter @yushuo/web dev
pnpm --filter @yushuo/bk dev
pnpm --filter @yushuo/fuplan dev
pnpm --filter @yushuo/xinli dev
```

### 3. 构建

```bash
# 构建所有应用
pnpm build

# 构建特定应用
pnpm deploy:web
pnpm deploy:bk
pnpm deploy:fuplan
pnpm deploy:xinli
```

### 4. 代码检查

```bash
# 运行ESLint
pnpm lint

# TypeScript类型检查
pnpm type-check
```

## 共享包使用指南

### @yushuo/ui - UI组件库

```typescript
import { Button, Card, Modal, Input } from '@yushuo/ui';

export default function Page() {
  return (
    <Card title="示例卡片">
      <Input label="用户名" placeholder="请输入用户名" />
      <Button variant="primary" size="md">
        提交
      </Button>
    </Card>
  );
}
```

### @yushuo/auth - 认证模块

```typescript
import { signToken, verifyToken, hashPassword, verifyPassword } from '@yushuo/auth';

// 生成JWT Token
const token = signToken({
  userId: 1,
  username: 'test',
  email: 'test@example.com',
  membershipLevel: 'monthly'
});

// 验证JWT Token
const payload = verifyToken(token);

// 哈希密码
const hash = await hashPassword('password123');

// 验证密码
const isValid = await verifyPassword('password123', hash);
```

**认证中间件使用:**

```typescript
// src/middleware.ts
export { authMiddleware as middleware } from '@yushuo/auth';

export const config = {
  matcher: ['/member/:path*', '/admin/:path*']
};
```

### @yushuo/database - 数据库连接池

```typescript
import { Database } from '@yushuo/database';

// 查询多行
const users = await Database.query('SELECT * FROM users WHERE membership_level = ?', ['monthly']);

// 查询单行
const user = await Database.queryOne('SELECT * FROM users WHERE id = ?', [1]);

// 插入数据
const userId = await Database.insert('INSERT INTO users (username, email) VALUES (?, ?)', ['test', 'test@example.com']);

// 执行事务
await Database.transaction(async (conn) => {
  await conn.execute('UPDATE users SET balance = balance - 100 WHERE id = ?', [1]);
  await conn.execute('UPDATE users SET balance = balance + 100 WHERE id = ?', [2]);
});
```

### @yushuo/utils - 工具函数库

```typescript
import { 
  formatDate, 
  isValidEmail, 
  formatPrice, 
  maskPhone 
} from '@yushuo/utils';

// 格式化日期
const dateStr = formatDate(new Date(), 'YYYY-MM-DD');

// 验证邮箱
const isValid = isValidEmail('test@example.com');

// 格式化价格
const price = formatPrice(99.99); // ¥99.99

// 脱敏手机号
const masked = maskPhone('13800138000'); // 138****8000
```

### @yushuo/config - 共享配置

**Tailwind配置:**

```javascript
// tailwind.config.js
const baseConfig = require('@yushuo/config/tailwind.config');

module.exports = {
  ...baseConfig,
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
};
```

**TypeScript配置:**

```json
// tsconfig.json
{
  "extends": "@yushuo/config/tsconfig.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## 应用端口分配

- **web**: http://localhost:3000
- **bk**: http://localhost:3001
- **fuplan**: http://localhost:3002
- **xinli**: http://localhost:3003

## 环境变量

每个应用需要创建各自的`.env`文件：

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=member_system

# JWT配置
JWT_SECRET=your_secret_key_here_change_in_production
JWT_EXPIRES_IN=7d

# 安全配置
BCRYPT_ROUNDS=12

# 应用配置
NODE_ENV=development
APP_URL=http://localhost:3000
PORT=3000
```

## 添加新应用

1. 在`apps/`目录创建新应用
2. 创建`package.json`，设置`name`为`@yushuo/[app-name]`
3. 在`package.json`的`dependencies`中添加共享包
4. 运行`pnpm install`

示例`package.json`:

```json
{
  "name": "@yushuo/new-app",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3004",
    "build": "next build",
    "start": "next start -p 3004"
  },
  "dependencies": {
    "next": "^14.2.15",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@yushuo/ui": "workspace:*",
    "@yushuo/auth": "workspace:*",
    "@yushuo/database": "workspace:*",
    "@yushuo/utils": "workspace:*"
  },
  "devDependencies": {
    "@yushuo/config": "workspace:*",
    "typescript": "^5.6.3"
  }
}
```

## 部署

### 开发环境

```bash
pnpm dev
```

### 生产环境

```bash
# 构建所有应用
pnpm build

# 使用PM2启动
pm2 start ecosystem.config.js --env production
```

## 常见问题

### 1. 为什么使用pnpm而不是npm/yarn？

- 更快的安装速度
- 更小的磁盘占用 (硬链接机制)
- 更好的Monorepo支持
- 更严格的依赖管理

### 2. workspace:*是什么意思？

这是pnpm workspace协议，表示引用本地workspace中的包，而不是从npm下载。

### 3. 如何调试共享包的代码？

共享包使用TypeScript源文件直接导入，修改后会自动热重载，无需重新构建。

### 4. 如何在应用中覆盖共享配置？

直接在应用的配置文件中扩展或覆盖共享配置即可，参考上面的Tailwind配置示例。

## 贡献指南

1. 所有共享代码放在`packages/`目录
2. 应用特定代码放在`apps/[app-name]/`目录
3. 使用TypeScript编写所有代码
4. 遵循ESLint规则
5. 提交前运行`pnpm type-check`和`pnpm lint`

## 相关文档

- [ARCHITECTURE-ANALYSIS.md](./ARCHITECTURE-ANALYSIS.md) - 架构分析文档
- [CLAUDE.md](./CLAUDE.md) - 项目开发指南
- [Turborepo官方文档](https://turbo.build/repo/docs)
- [pnpm Workspaces](https://pnpm.io/workspaces)

## 许可证

私有项目 - 宇硕短线会员体系

## 联系方式

- GitHub Issues: https://github.com/yushuo1991/member/issues
- Email: support@yushuo.click
