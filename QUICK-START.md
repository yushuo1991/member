# 快速开始指南

## 前置要求

- Node.js >= 18.17.0
- PNPM 8.15.0
- MySQL 8.0

## 安装步骤

### 1. 安装PNPM

```bash
npm install -g pnpm@8.15.0
```

### 2. 安装依赖

```bash
# 在项目根目录执行
pnpm install
```

### 3. 配置环境变量

复制环境变量模板：

```bash
cp apps/web/.env.example apps/web/.env
```

编辑 `apps/web/.env`：

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=你的数据库密码
DB_NAME=member_system

# JWT配置
JWT_SECRET=你的JWT密钥（请修改！）
JWT_EXPIRES_IN=7d

# 安全配置
BCRYPT_ROUNDS=12
SESSION_SECRET=你的会话密钥（请修改！）

# 应用配置
NODE_ENV=development
APP_URL=http://localhost:3000
PORT=3000
```

### 4. 初始化数据库

```bash
# 创建数据库
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS member_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 导入数据库架构
mysql -u root -p member_system < apps/web/database-init-v3.sql
```

### 5. 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:3000

## 常用命令

### 开发

```bash
# 启动所有应用的开发服务器
pnpm dev

# 仅启动web应用
cd apps/web
pnpm dev
```

### 构建

```bash
# 构建所有包和应用
pnpm build

# 仅构建web应用
cd apps/web
pnpm build
```

### 代码质量

```bash
# 类型检查
pnpm type-check

# 代码检查
pnpm lint
```

### 清理

```bash
# 清理所有构建产物和node_modules
pnpm clean
```

## 项目结构

```
.
├── apps/
│   └── web/                    # 主会员系统应用
│       ├── src/
│       │   ├── app/           # Next.js App Router页面
│       │   ├── components/    # React组件
│       │   ├── lib/           # 工具函数
│       │   └── types/         # TypeScript类型
│       ├── public/            # 静态资源
│       └── package.json
├── packages/
│   ├── ui/                    # 共享UI组件库
│   ├── auth/                  # 认证共享包（JWT, bcrypt）
│   ├── database/              # 数据库共享包（MySQL连接池）
│   ├── config/                # 配置共享包
│   └── utils/                 # 工具函数库
├── turbo.json                 # Turborepo配置
├── pnpm-workspace.yaml        # PNPM工作区配置
└── package.json               # 根package.json
```

## 默认账号

系统没有预设账号，需要自己注册或通过数据库创建管理员。

### 创建管理员

运行以下脚本创建管理员账号：

```bash
cd apps/web
node create-admin.js
```

## 功能模块

- ✅ 用户注册/登录
- ✅ 会员等级系统（月度/季度/年度/终身）
- ✅ 激活码系统
- ✅ 产品访问控制
- ✅ 试用系统（免费用户可试用5次）
- ✅ 管理后台（用户管理、激活码管理）

## 下一步

1. 访问首页了解系统功能
2. 注册账号测试会员系统
3. 使用激活码升级会员
4. 登录管理后台管理用户和激活码

## 遇到问题？

1. 检查环境变量配置是否正确
2. 确认数据库连接正常
3. 查看控制台日志获取详细错误信息
4. 参考 `README-MONOREPO.md` 了解更多细节
5. 参考 `MONOREPO-MIGRATION-SUMMARY.md` 了解迁移详情

## 相关文档

- [README-MONOREPO.md](./README-MONOREPO.md) - Monorepo架构说明
- [MONOREPO-MIGRATION-SUMMARY.md](./MONOREPO-MIGRATION-SUMMARY.md) - 迁移总结
- [CLAUDE.md](./CLAUDE.md) - 开发指南
