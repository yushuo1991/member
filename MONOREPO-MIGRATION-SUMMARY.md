# Monorepo迁移总结

## 完成时间
2026-01-24

## 迁移概述

成功将单体应用 `member-system` 迁移到 Turborepo + PNPM monorepo 架构。

## 目录结构

```
我的会员体系/
├── apps/
│   └── web/                    # 主会员系统应用（从member-system迁移）
│       ├── src/
│       ├── public/
│       ├── package.json
│       ├── next.config.js
│       ├── tsconfig.json
│       └── tailwind.config.js
├── packages/
│   ├── ui/                     # UI组件库
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   └── Button.tsx
│   │   │   └── index.tsx
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── auth/                   # 认证共享包
│   │   ├── src/
│   │   │   ├── auth-middleware.ts
│   │   │   ├── password.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── database/               # 数据库共享包
│   │   ├── src/
│   │   │   ├── database.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── config/                 # 配置共享包
│   └── utils/                  # 工具函数库
├── turbo.json                  # Turborepo配置
├── pnpm-workspace.yaml         # PNPM工作区配置
├── package.json                # 根package.json
├── .gitignore
└── README-MONOREPO.md

## 关键变更

### 1. 包管理
- **之前**: npm
- **现在**: pnpm workspace

### 2. 构建系统
- **之前**: 直接使用 Next.js
- **现在**: Turborepo 管理多包构建

### 3. 共享代码

#### @repo/database
- 从 `src/lib/database.ts` 提取
- 提供 MySQL 连接池管理
- 单例模式数据库实例

#### @repo/auth
- 从 `src/lib/auth-middleware.ts` 提取
- JWT token 生成和验证
- 密码哈希（bcrypt）
- 认证中间件

#### @repo/ui
- 新建共享组件库
- 初始包含 Button 组件
- 可扩展添加更多组件

### 4. 导入路径更新

**数据库**:
```typescript
// 之前
import { memberDatabase } from '@/lib/database';

// 现在
import { memberDatabase } from '@repo/database';
```

**认证**:
```typescript
// 之前
import { verifyAuth } from '@/lib/auth-middleware';
import { hashPassword } from '@/lib/utils';

// 现在
import { verifyAuth } from '@repo/auth';
import { hashPassword } from '@repo/auth';
```

### 5. TypeScript 配置

apps/web/tsconfig.json 新增路径映射:
```json
{
  "paths": {
    "@/*": ["./src/*"],
    "@repo/ui": ["../../packages/ui/src"],
    "@repo/auth": ["../../packages/auth/src"],
    "@repo/database": ["../../packages/database/src"]
  }
}
```

### 6. Package.json 更新

apps/web/package.json:
```json
{
  "name": "web",
  "dependencies": {
    "@repo/ui": "workspace:*",
    "@repo/auth": "workspace:*",
    "@repo/database": "workspace:*"
  }
}
```

## 开发工作流

### 安装依赖
```bash
pnpm install
```

### 开发
```bash
# 启动所有应用
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

### 类型检查
```bash
pnpm type-check
```

### 代码检查
```bash
pnpm lint
```

## 部署注意事项

### 1. 环境变量
- 保持原有 `.env` 配置不变
- 位置：`apps/web/.env`

### 2. 数据库
- 使用原有数据库架构（v3）
- 位置：`apps/web/database-init-v3.sql`

### 3. PM2
- ecosystem.config.js 保留在 `apps/web/`
- 启动命令：`pm2 startOrReload apps/web/ecosystem.config.js --env production`

### 4. GitHub Actions
- 需要更新部署工作流
- 构建命令改为 `cd apps/web && pnpm build`
- 部署路径保持 `/www/wwwroot/member-system`

## 迁移前后对比

### 优势
✅ 代码复用：共享包可在多个应用间复用
✅ 类型安全：跨包导入有完整类型支持
✅ 构建优化：Turborepo 缓存加速构建
✅ 依赖管理：PNPM workspace 节省磁盘空间
✅ 可扩展性：易于添加新应用和包

### 保持不变
✅ 所有业务逻辑
✅ 数据库架构
✅ API 端点
✅ 前端页面
✅ 认证流程
✅ 会员系统逻辑

## 测试清单

- [ ] `pnpm install` 成功
- [ ] `pnpm dev` 启动成功
- [ ] 访问 http://localhost:3000 正常
- [ ] 用户登录功能正常
- [ ] 管理员登录功能正常
- [ ] 会员升级功能正常
- [ ] 激活码系统正常
- [ ] `pnpm build` 构建成功
- [ ] 类型检查通过
- [ ] 代码检查通过

## 下一步

1. 测试所有功能
2. 更新 GitHub Actions 工作流
3. 添加更多共享组件到 @repo/ui
4. 考虑将更多工具函数提取到共享包
5. 文档更新

## 回滚方案

如需回滚到原始架构：
1. 使用原有 `member-system/` 目录
2. 删除 `apps/` 和 `packages/` 目录
3. 恢复原有部署流程

## 相关文档

- [Turborepo文档](https://turbo.build/repo/docs)
- [PNPM Workspace](https://pnpm.io/workspaces)
- [README-MONOREPO.md](./README-MONOREPO.md)
