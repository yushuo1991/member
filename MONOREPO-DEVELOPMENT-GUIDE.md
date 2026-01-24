# Monorepo开发指南

## 项目概览

宇硕会员体系Monorepo - 4个Next.js应用的统一管理平台

### 技术栈
- **构建工具**: Turborepo
- **包管理**: pnpm workspace
- **框架**: Next.js 14 (App Router)
- **部署**: PM2 + Nginx
- **CI/CD**: GitHub Actions

---

## 应用架构

### 应用列表

| 应用名称 | 端口 | 描述 | 路径 |
|---------|------|------|------|
| **web** | 3000 | 会员管理系统 | `apps/web` |
| **bk** | 3001 | 板块节奏系统 | `apps/bk` |
| **fuplan** | 3002 | 复盘系统 | `apps/fuplan` |
| **xinli** | 3003 | 心理测评系统 | `apps/xinli` |

### 共享包（Packages）

| 包名称 | 描述 | 路径 |
|--------|------|------|
| **@repo/ui** | 共享UI组件 | `packages/ui` |
| **@repo/auth** | 认证逻辑 | `packages/auth` |
| **@repo/database** | 数据库连接 | `packages/database` |
| **@repo/utils** | 工具函数 | `packages/utils` |
| **@repo/config** | 配置管理 | `packages/config` |

---

## 开发命令

### 安装依赖

```bash
# 安装所有依赖
pnpm install

# 单独安装某个应用的依赖
pnpm install --filter web
```

### 启动开发服务器

```bash
# 启动所有应用（并行）
pnpm dev:all

# 单独启动某个应用
pnpm dev:web      # 会员系统 - http://localhost:3000
pnpm dev:bk       # 板块节奏 - http://localhost:3001
pnpm dev:fuplan   # 复盘系统 - http://localhost:3002
pnpm dev:xinli    # 心理测评 - http://localhost:3003

# 使用Turbo启动（支持缓存）
pnpm dev
```

### 构建应用

```bash
# 构建所有应用
pnpm build

# 构建单个应用
pnpm build:web
pnpm build:bk
pnpm build:fuplan
pnpm build:xinli

# Turbo过滤构建
pnpm turbo run build --filter=web
```

### 代码检查

```bash
# 运行ESLint检查
pnpm lint

# TypeScript类型检查
pnpm type-check

# 单独检查某个应用
pnpm turbo run lint --filter=web
pnpm turbo run type-check --filter=bk
```

### 清理缓存

```bash
# 清理构建缓存（保留node_modules）
pnpm clean

# 完全清理（包括所有node_modules）
pnpm clean:all
```

---

## 项目结构

```
yushuo-membership-monorepo/
├── apps/                          # 应用目录
│   ├── web/                       # 会员管理系统
│   │   ├── src/
│   │   │   ├── app/              # Next.js App Router
│   │   │   ├── lib/              # 业务逻辑
│   │   │   └── components/       # 组件
│   │   ├── package.json
│   │   └── next.config.js
│   ├── bk/                        # 板块节奏系统
│   ├── fuplan/                    # 复盘系统
│   └── xinli/                     # 心理测评系统
│
├── packages/                      # 共享包
│   ├── ui/                        # UI组件库
│   ├── auth/                      # 认证模块
│   ├── database/                  # 数据库连接
│   ├── utils/                     # 工具函数
│   └── config/                    # 配置管理
│
├── .github/
│   └── workflows/
│       └── deploy-monorepo.yml    # CI/CD配置
│
├── turbo.json                     # Turborepo配置
├── pnpm-workspace.yaml            # pnpm workspace配置
├── package.json                   # 根package.json
├── ecosystem.config.monorepo.js   # PM2配置
└── nginx-monorepo.conf            # Nginx配置
```

---

## 环境配置

### 环境变量

每个应用需要独立的 `.env` 文件：

**apps/web/.env**
```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=member_system

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d

# App
NODE_ENV=development
APP_URL=http://localhost:3000
PORT=3000
```

**apps/bk/.env**
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=bk_system

NODE_ENV=development
APP_URL=http://localhost:3001
PORT=3001
```

**apps/fuplan/.env** 和 **apps/xinli/.env** 类似配置。

---

## 部署流程

### 自动部署（GitHub Actions）

推送到 `main` 分支会自动触发部署：

```bash
git add .
git commit -m "feat: add new feature"
git push origin main
```

#### 智能部署

GitHub Actions会自动检测变更的应用，只部署被修改的应用：

- 修改 `apps/web/**` → 只部署web应用
- 修改 `packages/**` → 部署所有应用（共享包影响所有应用）
- 修改 `turbo.json` → 部署所有应用

#### 手动部署

```bash
# 手动触发GitHub Actions
# 在GitHub仓库页面: Actions → Deploy Monorepo → Run workflow
# 输入apps参数: all | web,bk | fuplan | 等
```

### 服务器部署

#### PM2进程管理

```bash
# 启动所有应用
pm2 start ecosystem.config.monorepo.js --env production

# 重启所有应用
pm2 reload ecosystem.config.monorepo.js

# 单独操作某个应用
pm2 restart member-web
pm2 restart member-bk
pm2 restart member-fuplan
pm2 restart member-xinli

# 查看日志
pm2 logs member-web
pm2 logs member-bk --lines 100

# 查看状态
pm2 list
pm2 monit
```

#### 服务器目录结构

```
/www/wwwroot/
├── member-system/         # Web应用 (Port 3000)
├── bk-system/             # BK应用 (Port 3001)
├── fuplan-system/         # Fuplan应用 (Port 3002)
└── xinli-system/          # Xinli应用 (Port 3003)
```

---

## Nginx配置

### 域名映射

| 域名 | 应用 | 端口 |
|------|------|------|
| member.example.com | Web | 3000 |
| bk.member.example.com | BK | 3001 |
| fuplan.member.example.com | Fuplan | 3002 |
| xinli.member.example.com | Xinli | 3003 |

### 安装Nginx配置

```bash
# 复制配置文件
sudo cp nginx-monorepo.conf /etc/nginx/sites-available/member-system-monorepo

# 创建软链接
sudo ln -s /etc/nginx/sites-available/member-system-monorepo /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重载Nginx
sudo systemctl reload nginx
```

### SSL配置（可选）

```bash
# 使用Let's Encrypt申请SSL证书
sudo certbot --nginx -d member.example.com
sudo certbot --nginx -d bk.member.example.com
sudo certbot --nginx -d fuplan.member.example.com
sudo certbot --nginx -d xinli.member.example.com

# 自动续期
sudo certbot renew --dry-run
```

---

## Turborepo优化

### 缓存策略

Turborepo会缓存以下任务的输出：
- `build` - 构建产物缓存
- `lint` - ESLint结果缓存
- `type-check` - TypeScript检查缓存

### 清理缓存

```bash
# 清理Turbo缓存
pnpm turbo run build --force

# 或删除缓存目录
rm -rf .turbo
rm -rf apps/*/.turbo
```

### 依赖关系

Turborepo自动处理包之间的依赖关系：
- 应用依赖共享包时，会先构建共享包
- 使用 `dependsOn: ["^build"]` 确保依赖先构建

---

## 开发最佳实践

### 1. 使用Turbo过滤器

```bash
# 只运行某个应用及其依赖
pnpm turbo run dev --filter=web...

# 运行多个应用
pnpm turbo run build --filter=web --filter=bk
```

### 2. 共享代码规范

- 共享组件放在 `packages/ui`
- 共享工具函数放在 `packages/utils`
- 业务逻辑特定的代码放在各自的 `apps/*`

### 3. 类型安全

```bash
# 运行类型检查
pnpm type-check

# 使用严格的TypeScript配置
# 见各应用的 tsconfig.json
```

### 4. 提交规范

使用Conventional Commits：

```bash
git commit -m "feat(web): add user login feature"
git commit -m "fix(bk): correct stock data parsing"
git commit -m "chore(packages): update dependencies"
git commit -m "docs: update development guide"
```

---

## 故障排查

### 端口冲突

```bash
# 查看端口占用
lsof -i :3000
lsof -i :3001

# 杀死进程
kill -9 <PID>
```

### 依赖问题

```bash
# 重新安装依赖
pnpm clean:all
pnpm install

# 验证workspace链接
pnpm list --depth 0
```

### 构建失败

```bash
# 清理缓存并重新构建
pnpm clean
pnpm build --force

# 检查TypeScript错误
pnpm type-check
```

### PM2问题

```bash
# 查看详细日志
pm2 logs member-web --err --lines 200

# 重置PM2
pm2 kill
pm2 start ecosystem.config.monorepo.js --env production

# 查看进程状态
pm2 describe member-web
```

---

## 性能优化建议

### 1. 构建优化

- 使用Turborepo缓存加速重复构建
- Next.js standalone输出减小部署体积
- 配置 `next.config.js` 的 `output: 'standalone'`

### 2. 开发体验

- 使用 `pnpm dev:all` 并行启动所有应用
- 利用Next.js Fast Refresh快速刷新
- 配置VSCode workspace多项目支持

### 3. 生产环境

- 启用Nginx gzip压缩
- 配置Next.js图片优化
- 使用PM2 cluster模式（web应用）

---

## 常见问题

### Q: 如何添加新应用？

```bash
# 1. 创建应用目录
mkdir apps/new-app
cd apps/new-app

# 2. 初始化Next.js
npx create-next-app@latest . --typescript --tailwind --app

# 3. 修改package.json添加workspace依赖
# 4. 更新turbo.json和pnpm-workspace.yaml
# 5. 更新ecosystem.config.monorepo.js添加PM2配置
# 6. 更新nginx-monorepo.conf添加反向代理
```

### Q: 如何添加共享包？

```bash
# 1. 创建包目录
mkdir packages/new-package

# 2. 创建package.json
{
  "name": "@repo/new-package",
  "version": "0.0.0",
  "main": "./index.ts",
  "types": "./index.ts"
}

# 3. 在应用中引用
# apps/web/package.json
{
  "dependencies": {
    "@repo/new-package": "workspace:*"
  }
}
```

### Q: 如何调试某个应用？

```bash
# 1. 单独启动应用
cd apps/web
pnpm dev

# 2. 使用VSCode调试
# 添加 .vscode/launch.json 配置

# 3. 查看日志
pm2 logs member-web --lines 100 --raw
```

---

## 相关资源

- [Turborepo文档](https://turbo.build/repo/docs)
- [pnpm Workspace文档](https://pnpm.io/workspaces)
- [Next.js文档](https://nextjs.org/docs)
- [PM2文档](https://pm2.keymetrics.io/docs/usage/quick-start/)

---

**最后更新**: 2026-01-24
**维护者**: 宇硕短线技术团队
