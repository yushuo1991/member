# 宇硕短线会员系统 Monorepo

这是一个基于 Turborepo 的 monorepo 架构，包含会员管理系统及其相关产品。

## 项目结构

```
.
├── apps/
│   └── web/              # 主会员系统应用（Next.js 14）
├── packages/
│   ├── ui/               # 共享UI组件库
│   ├── auth/             # 认证共享包（JWT, bcrypt）
│   └── database/         # 数据库共享包（MySQL连接池）
├── turbo.json            # Turborepo配置
├── pnpm-workspace.yaml   # PNPM工作区配置
└── package.json          # 根package.json
```

## 技术栈

- **构建工具**: Turborepo + PNPM
- **主应用**: Next.js 14 (App Router)
- **数据库**: MySQL 8.0
- **认证**: JWT + bcrypt
- **样式**: Tailwind CSS

## 快速开始

### 1. 安装依赖

```bash
# 安装pnpm（如果未安装）
npm install -g pnpm@8.15.0

# 安装所有依赖
pnpm install
```

### 2. 配置环境变量

复制 `apps/web/.env.example` 到 `apps/web/.env` 并配置数据库连接：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=member_system
JWT_SECRET=your_secret_key_here
```

### 3. 初始化数据库

```bash
mysql -u root -p member_system < apps/web/database-init-v3.sql
```

### 4. 启动开发服务器

```bash
# 启动所有应用的开发服务器
pnpm dev

# 或仅启动web应用
cd apps/web
pnpm dev
```

访问 http://localhost:3000

## 开发命令

```bash
# 开发模式（所有应用）
pnpm dev

# 构建（所有应用）
pnpm build

# 类型检查
pnpm type-check

# 代码检查
pnpm lint

# 清理所有构建产物和node_modules
pnpm clean
```

## 包说明

### @repo/ui

共享UI组件库，包含：
- Button - 按钮组件
- 更多组件待添加...

使用方式：
```tsx
import { Button } from '@repo/ui';

<Button variant="primary" size="md">点击我</Button>
```

### @repo/auth

认证共享包，提供：
- JWT token生成和验证
- 密码哈希（bcrypt）
- 认证中间件

使用方式：
```typescript
import { verifyAuth, generateToken } from '@repo/auth';
```

### @repo/database

数据库共享包，提供：
- MySQL连接池管理（单例模式）
- 数据库初始化
- 查询封装

使用方式：
```typescript
import { memberDatabase } from '@repo/database';

const db = memberDatabase.getPool();
const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [userId]);
```

## 部署

详见 `DEPLOYMENT.md` 和 `.github/workflows/deploy-optimized.yml`

### 生产构建

```bash
# 构建所有应用
pnpm build

# 仅构建web应用
cd apps/web
pnpm build
```

### PM2部署

```bash
cd apps/web
pm2 startOrReload ecosystem.config.js --env production
```

## 添加新应用

1. 在 `apps/` 目录下创建新应用
2. 配置 `package.json` 中的 `name` 和 `dependencies`
3. 在根目录运行 `pnpm install` 自动链接工作区依赖

## 添加新包

1. 在 `packages/` 目录下创建新包
2. 设置 `package.json` 的 `name` 为 `@repo/包名`
3. 导出需要共享的代码
4. 在需要使用的应用中添加依赖：`"@repo/包名": "workspace:*"`

## License

Private - All Rights Reserved
