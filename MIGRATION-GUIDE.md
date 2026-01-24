# Monorepo迁移快速指南

**目标：** 将4个独立仓库整合为统一的Monorepo架构

**预计时间：** 8-14天

---

## 准备工作检查清单

在开始迁移前,请确认：

- [ ] 所有仓库已备份（创建backup分支）
- [ ] 已安装Node.js 18+和pnpm 8+
- [ ] 已获取服务器访问权限
- [ ] 已通知用户计划维护时间
- [ ] 已准备好数据库备份

---

## 每日任务清单

### Day 1: 基础架构搭建

**上午（4小时）**
```bash
# 1. 创建Monorepo目录
mkdir member-system-monorepo
cd member-system-monorepo
git init

# 2. 创建目录结构
mkdir -p apps/{web,bk,fuplan,xinli}
mkdir -p packages/{ui,auth,database,config,utils}

# 3. 配置根package.json
cat > package.json <<'EOF'
{
  "name": "yushuo-member-system-monorepo",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build"
  },
  "devDependencies": {
    "turbo": "^2.3.0"
  }
}
EOF

# 4. 安装依赖
pnpm install
```

**下午（4小时）**
- [ ] 创建packages/ui基础组件（Button, Card, Modal）
- [ ] 创建packages/auth认证模块（JWT, middleware）
- [ ] 创建packages/database数据库连接池
- [ ] 配置packages/config共享配置（Tailwind, TypeScript）

### Day 2: 迁移主系统和心理测评

**上午：会员系统迁移**
```bash
# 复制代码到apps/web
cd apps/web
cp -r ../../../member-system/* .

# 更新package.json依赖
# 将本地模块替换为workspace依赖
# "@yushuo/ui": "workspace:*"
```

**下午：心理测评系统迁移**
- [ ] 将HTML/JS转换为React组件
- [ ] 集成LocalStorage到Next.js
- [ ] 添加认证中间件
- [ ] 测试问卷填写和保存功能

### Day 3-4: 迁移复盘系统

**关键任务：**
- [ ] Vite项目转换为Next.js
- [ ] Supabase数据导出
- [ ] MySQL数据表创建
- [ ] 数据迁移脚本编写
- [ ] API路由重写（Supabase client → MySQL query）

**数据迁移脚本示例：**
```javascript
// migrate-fuplan-data.js
const { createClient } = require('@supabase/supabase-js');
const mysql = require('mysql2/promise');

async function migrate() {
  // 1. 从Supabase导出
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const { data: reviews } = await supabase.from('review_records').select('*');

  // 2. 导入到MySQL
  const db = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'member_system'
  });

  for (const review of reviews) {
    await db.execute(
      'INSERT INTO review_records (user_id, review_date, notes) VALUES (?, ?, ?)',
      [review.user_id, review.review_date, review.notes]
    );
  }
}
```

### Day 5: 迁移板块节奏系统

**关键任务：**
- [ ] Pages Router → App Router重构
- [ ] 股票数据库整合
- [ ] Recharts图表组件迁移
- [ ] 交易日历服务保留

**Pages Router迁移步骤：**
```bash
# 1. 创建app目录
mkdir -p src/app

# 2. 迁移文件
mv src/pages/index.tsx src/app/page.tsx
mv src/pages/_app.tsx src/app/layout.tsx
mv src/pages/api src/app/api

# 3. 更新组件导入
# 'use client' 添加到客户端组件
# Server Component作为默认
```

### Day 6: CI/CD和部署配置

**上午：GitHub Actions**
```yaml
# .github/workflows/deploy-monorepo.yml
name: Deploy Monorepo
on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install --frozen-lockfile
      - run: pnpm turbo run build
      - name: Deploy to server
        run: |
          # SCP部署包到服务器
          # SSH执行部署脚本
```

**下午：服务器配置**
- [ ] 配置PM2 ecosystem.config.js（4个进程）
- [ ] 配置Nginx反向代理
- [ ] 测试所有端口正常访问
- [ ] 配置SSL证书（可选）

### Day 7: 测试和优化

**测试清单：**
- [ ] 本地开发环境（`pnpm dev`）
- [ ] 生产构建（`pnpm build`）
- [ ] 认证流程（登录/注册/跨应用）
- [ ] 数据完整性（数据库查询验证）
- [ ] 性能测试（Lighthouse评分 > 90）
- [ ] 浏览器兼容性（Chrome, Safari, Firefox）

**优化项：**
- [ ] 图片优化（Next.js Image组件）
- [ ] 代码分割（动态导入）
- [ ] API缓存策略
- [ ] 数据库索引检查

---

## 关键命令速查

### 本地开发

```bash
# 启动所有应用（并行）
pnpm dev

# 单独启动某个应用
pnpm --filter @yushuo/web dev
pnpm --filter @yushuo/bk dev

# 构建所有应用
pnpm build

# 类型检查
pnpm type-check

# 清理所有node_modules和构建产物
pnpm clean
```

### 包管理

```bash
# 添加依赖到特定应用
pnpm --filter @yushuo/web add react-icons

# 添加依赖到共享包
pnpm --filter @yushuo/ui add -D @types/react

# 添加根依赖（开发工具）
pnpm add -Dw turbo

# 查看依赖树
pnpm list --depth=0
```

### Git操作

```bash
# 提交变更
git add .
git commit -m "feat: migrate to monorepo"

# 推送到远程
git push origin main

# 查看构建状态
gh run list --limit 5
```

### 部署

```bash
# 手动触发GitHub Actions
gh workflow run deploy-monorepo.yml

# SSH登录服务器
ssh root@your-server-ip

# 查看PM2状态
pm2 status

# 查看日志
pm2 logs member-web --lines 50
pm2 logs member-bk --lines 50

# 重启服务
pm2 restart all
```

---

## 故障排查

### 问题1：pnpm install失败

**症状：** peer dependency错误

**解决：**
```bash
# 删除所有node_modules
find . -name "node_modules" -type d -exec rm -rf {} +

# 删除pnpm-lock.yaml
rm pnpm-lock.yaml

# 重新安装
pnpm install
```

### 问题2：Turborepo缓存问题

**症状：** 修改代码后构建没有更新

**解决：**
```bash
# 清除Turborepo缓存
rm -rf .turbo

# 强制重新构建
pnpm turbo run build --force
```

### 问题3：TypeScript类型错误

**症状：** 找不到@yushuo/*模块的类型定义

**解决：**
```typescript
// 在根目录创建 global.d.ts
declare module '@yushuo/ui';
declare module '@yushuo/auth';
declare module '@yushuo/database';
```

### 问题4：端口被占用

**症状：** Error: listen EADDRINUSE: address already in use :::3000

**解决：**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3000
kill -9 <PID>

# 或修改端口
# package.json中: "dev": "next dev -p 3010"
```

### 问题5：数据库连接失败

**症状：** ER_ACCESS_DENIED_ERROR

**解决：**
```bash
# 检查.env文件
cat .env | grep DB_

# 测试连接
mysql -h localhost -u root -p member_system

# 重置密码（如需要）
ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
```

---

## 回滚方案

如果迁移遇到严重问题，请执行以下步骤立即回滚：

### 1. 服务器回滚（5分钟）

```bash
# SSH登录
ssh root@server

# 停止新服务
pm2 stop all

# 恢复旧版本
mv /www/wwwroot/member-system /www/wwwroot/member-system-new
mv /www/wwwroot/member-system.backup /www/wwwroot/member-system

# 重启旧服务
cd /www/wwwroot/member-system
pm2 start ecosystem.config.js
```

### 2. 数据库回滚

```bash
# 恢复备份
mysql -u root -p member_system < /backup/member_system_20260124.sql
```

### 3. 代码仓库回滚

```bash
# 本地回滚到备份分支
git checkout backup/pre-monorepo-migration

# 强制推送（谨慎）
git push -f origin main
```

---

## 成功指标

迁移完成后，应达到以下标准：

**功能层面：**
- [ ] 所有页面正常访问
- [ ] 用户登录/注册功能正常
- [ ] 会员权限验证正确
- [ ] 激活码系统正常
- [ ] 所有API端点返回正确数据

**性能层面：**
- [ ] 首屏加载 < 2秒
- [ ] API响应 < 500ms
- [ ] Lighthouse性能评分 > 90
- [ ] 无明显内存泄漏

**开发层面：**
- [ ] `pnpm dev` 正常启动
- [ ] `pnpm build` 无错误
- [ ] TypeScript无类型错误
- [ ] ESLint无警告

**部署层面：**
- [ ] GitHub Actions成功执行
- [ ] PM2所有进程运行中
- [ ] Nginx正确代理所有子域名
- [ ] 日志无ERROR级别错误

---

## 下一步行动

迁移完成后，建议进行以下优化：

**Week 1-2：稳定性监控**
- 部署监控系统（如Sentry）
- 设置告警通知
- 收集用户反馈

**Week 3-4：性能优化**
- 分析慢查询并优化
- 实施CDN加速
- 数据库索引优化

**Month 2-3：功能增强**
- 开发共享组件库Storybook
- 编写E2E测试
- 完善开发文档

---

## 常见问题FAQ

### Q1: 为什么选择Monorepo而不是独立仓库？

A: Monorepo可以实现代码复用、统一认证、更好的用户体验，长期维护成本更低。虽然初期投入较大（1-2周），但3-6个月后就能收回成本。

### Q2: 数据会丢失吗？

A: 不会。迁移前会完整备份所有数据，迁移过程中会验证数据完整性，且保留Supabase备份至少3个月。

### Q3: 是否需要停机？

A: 采用蓝绿部署策略，实际停机时间 < 5分钟。建议选择凌晨2-4点低峰期部署。

### Q4: 如果迁移失败怎么办？

A: 可以在5分钟内回滚到旧版本（见"回滚方案"章节），零风险。

### Q5: 用户需要重新登录吗？

A: 不需要。JWT token兼容，现有用户session自动迁移。

---

**祝迁移顺利！** 🚀

如有问题，请参考 `ARCHITECTURE-ANALYSIS.md` 详细文档或提交GitHub Issue。
