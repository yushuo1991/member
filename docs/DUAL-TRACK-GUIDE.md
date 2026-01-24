# 双轨运行操作指南

## 📖 概述

本指南详细说明如何在member-system（生产）和apps/web（测试）之间进行双轨并行开发和部署。

---

## 🎯 双轨运行的核心思想

### 什么是双轨运行？
- **主轨（member-system）**: 生产环境，服务真实用户，稳定优先
- **副轨（apps/web）**: 测试环境，验证新架构，创新实验

### 为什么要双轨运行？
1. **零风险**: 新架构问题不影响生产
2. **渐进式**: 逐步熟悉和完善新系统
3. **可回退**: 随时可以放弃新架构
4. **经验积累**: 充分测试后再正式切换

---

## 🏗️ 环境配置

### 开发环境配置

#### member-system（保持原样）
```bash
cd member-system/

# .env配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=member_system
JWT_SECRET=production_secret_here
PORT=3000

# 启动
npm run dev        # 端口3000
```

#### apps/web（新环境）
```bash
cd apps/web/

# .env配置（独立配置文件）
DB_HOST=localhost
DB_PORT=3306
DB_NAME=member_system_test    # 或共享member_system
JWT_SECRET=test_secret_here   # 建议与生产保持一致
PORT=3001                     # 不同端口避免冲突

# 启动
pnpm dev          # 端口3001
```

### 生产环境配置

#### 目录结构
```
/www/wwwroot/
├── member-system/           # 生产环境
│   ├── .env                 # 生产配置
│   ├── ecosystem.config.js
│   └── ...
└── member-system-test/      # 测试环境
    ├── .env                 # 测试配置
    ├── ecosystem.config.js
    └── ...
```

#### PM2配置

**member-system/ecosystem.config.js** (生产)
```javascript
module.exports = {
  apps: [{
    name: 'member-system',
    script: 'node_modules/next/dist/bin/next',
    args: 'start -p 3000',
    instances: 1,
    autorestart: true,
    max_memory_restart: '1G',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

**apps/web/ecosystem.config.js** (测试)
```javascript
module.exports = {
  apps: [{
    name: 'member-web-test',
    script: 'node_modules/next/dist/bin/next',
    args: 'start -p 3001',
    instances: 1,
    autorestart: true,
    max_memory_restart: '1G',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
};
```

#### Nginx配置

**/etc/nginx/sites-available/member-system** (生产)
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**/etc/nginx/sites-available/member-system-test** (测试)
```nginx
server {
    listen 80;
    server_name test.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🔄 日常开发流程

### 场景1: 新功能开发

#### 优先在member-system开发（推荐）
```bash
# 1. 在member-system开发
cd member-system/
git checkout -b feature/new-feature

# 2. 开发和测试
npm run dev
# 开发新功能...

# 3. 提交到Git
git add .
git commit -m "feat: 新功能"
git push origin feature/new-feature

# 4. 合并到main，自动部署
# （通过GitHub PR）

# 5. 功能稳定后，同步到apps/web
cd ../apps/web/
# 手动复制相关文件
# 或使用git cherry-pick
```

#### 在apps/web实验性开发
```bash
# 1. 在apps/web开发实验性功能
cd apps/web/
git checkout -b experiment/new-arch

# 2. 开发和测试
pnpm dev
# 测试新架构特性...

# 3. 如果成功，反向同步到member-system
# 如果失败，直接放弃分支

# 4. 手动部署到测试环境验证
```

### 场景2: Bug修复

#### 紧急Bug（生产问题）
```bash
# 1. 只修复member-system
cd member-system/
git checkout -b hotfix/urgent-bug

# 2. 快速修复
# 修改代码...
npm run dev  # 测试

# 3. 立即部署
git add .
git commit -m "fix: 紧急修复XXX问题"
git push origin hotfix/urgent-bug
# 合并到main，自动部署

# 4. 稍后同步到apps/web（非紧急）
```

#### 非紧急Bug（同步修复）
```bash
# 1. 在member-system修复
cd member-system/
git checkout -b fix/minor-bug
# 修复...

# 2. 在apps/web同步修复
cd ../apps/web/
git checkout -b fix/minor-bug
# 应用相同修复...

# 3. 分别测试和提交
```

### 场景3: 代码重构

#### 在member-system重构（谨慎）
```bash
# 小范围重构可以直接在member-system
cd member-system/
# 重构代码，保持功能不变
# 充分测试后提交
```

#### 在apps/web重构（推荐）
```bash
# 大范围重构在apps/web实验
cd apps/web/
# 重构代码
# 测试新架构
# 如果成功，逐步应用到member-system
```

---

## 🚀 部署流程

### member-system部署（自动）

#### GitHub Actions自动部署
```yaml
# 触发条件：推送到main分支且member-system/有变更
on:
  push:
    branches: [main]
    paths:
      - "member-system/**"
```

#### 部署步骤
```bash
# 本地提交
git add member-system/
git commit -m "feat: 新功能"
git push origin main

# GitHub Actions自动执行：
# 1. 检出代码
# 2. 安装依赖
# 3. 构建应用
# 4. SCP到服务器
# 5. PM2重启
```

#### 手动部署（紧急情况）
```bash
# SSH登录服务器
ssh root@your-server

# 进入目录
cd /www/wwwroot/member-system

# 拉取最新代码
git pull origin main

# 安装依赖（如有变更）
npm install --production

# 构建
npm run build

# 重启PM2
pm2 restart member-system

# 查看日志
pm2 logs member-system --lines 50
```

### apps/web部署（手动）

#### 手动GitHub Actions触发
```bash
# 1. 在GitHub仓库页面
# 2. 点击 Actions 标签
# 3. 选择 "Deploy Monorepo"
# 4. 点击 "Run workflow"
# 5. 选择分支，运行
```

#### SSH手动部署
```bash
# 1. SSH登录服务器
ssh root@your-server

# 2. 进入测试目录
cd /www/wwwroot/member-system-test

# 3. 拉取最新代码
git pull origin main

# 4. 安装依赖（使用pnpm）
pnpm install

# 5. 构建
pnpm build

# 6. 重启PM2
pm2 restart member-web-test

# 7. 查看状态
pm2 list
pm2 logs member-web-test --lines 50
```

---

## 🧪 测试策略

### 功能测试对比

#### 测试清单模板
```markdown
功能：用户登录

测试环境A：member-system
- [ ] 访问 http://localhost:3000/login
- [ ] 输入正确账号密码
- [ ] 点击登录
- [ ] 结果：✅ 成功跳转到/member

测试环境B：apps/web
- [ ] 访问 http://localhost:3001/login
- [ ] 输入正确账号密码
- [ ] 点击登录
- [ ] 结果：✅ 成功跳转到/member

对比：✅ 功能一致
```

#### 自动化测试脚本
```bash
#!/bin/bash
# test-both-systems.sh

echo "🧪 测试member-system (端口3000)..."
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}' \
  | jq .

echo ""
echo "🧪 测试apps/web (端口3001)..."
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}' \
  | jq .
```

### 性能对比测试

#### 启动时间对比
```bash
# member-system
cd member-system/
time npm run start

# apps/web
cd apps/web/
time pnpm start
```

#### 内存占用对比
```bash
pm2 list

# 输出示例：
# member-system    | online | 250MB
# member-web-test  | online | 260MB
```

#### API响应时间对比
```bash
# 使用ab (Apache Bench)
ab -n 100 -c 10 http://localhost:3000/api/auth/me
ab -n 100 -c 10 http://localhost:3001/api/auth/me
```

---

## 📊 监控和日志

### PM2监控

#### 实时监控
```bash
# 监控所有进程
pm2 monit

# 查看特定进程
pm2 show member-system
pm2 show member-web-test
```

#### 日志查看
```bash
# 实时日志
pm2 logs member-system
pm2 logs member-web-test

# 查看历史日志
pm2 logs member-system --lines 100
pm2 logs member-web-test --lines 100

# 清空日志
pm2 flush
```

### Nginx日志

#### 访问日志
```bash
# 生产环境
tail -f /var/log/nginx/access.log | grep "yourdomain.com"

# 测试环境
tail -f /var/log/nginx/access.log | grep "test.yourdomain.com"
```

#### 错误日志
```bash
tail -f /var/log/nginx/error.log
```

### 应用日志

#### 自定义日志记录
```typescript
// apps/web/src/lib/logger.ts
export function log(message: string, level: 'info' | 'error' = 'info') {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level}] ${message}`);
}
```

---

## 🔄 代码同步策略

### 从member-system同步到apps/web

#### 方式1: 手动复制文件
```bash
# 复制特定文件
cp member-system/src/app/api/auth/login/route.ts \
   apps/web/src/app/api/auth/login/route.ts

# 复制整个目录
cp -r member-system/src/app/member/ \
      apps/web/src/app/member/
```

#### 方式2: Git cherry-pick
```bash
# 假设在member-system分支有一个commit
git log --oneline member-system/  # 找到commit hash

# 在apps/web应用这个commit
cd apps/web/
git cherry-pick <commit-hash>
```

#### 方式3: 创建共享脚本
```bash
#!/bin/bash
# sync-to-monorepo.sh

MEMBER_SRC="member-system/src"
WEB_SRC="apps/web/src"

# 同步API路由
rsync -av --exclude='node_modules' \
  "$MEMBER_SRC/app/api/" "$WEB_SRC/app/api/"

# 同步lib文件
rsync -av --exclude='node_modules' \
  "$MEMBER_SRC/lib/" "$WEB_SRC/lib/"

echo "✅ 同步完成"
```

### 从apps/web反向同步到member-system

#### 谨慎操作（仅在充分测试后）
```bash
# 假设apps/web有一个经过验证的优化
# 手动复制到member-system
cp apps/web/src/lib/optimized-function.ts \
   member-system/src/lib/optimized-function.ts

# 在member-system测试
cd member-system/
npm run dev
npm run type-check
npm run lint

# 测试通过后提交
git add .
git commit -m "feat: 应用来自apps/web的优化"
```

---

## 🛠️ 常用命令速查

### 开发环境

```bash
# member-system
cd member-system/
npm install          # 安装依赖
npm run dev          # 启动开发服务器（端口3000）
npm run build        # 构建生产版本
npm run start        # 运行生产版本
npm run type-check   # TypeScript检查
npm run lint         # ESLint检查

# apps/web
cd apps/web/
pnpm install         # 安装依赖
pnpm dev             # 启动开发服务器（端口3001）
pnpm build           # 构建生产版本
pnpm start           # 运行生产版本
pnpm type-check      # TypeScript检查
pnpm lint            # ESLint检查
```

### 生产环境

```bash
# PM2管理
pm2 list                      # 查看所有进程
pm2 restart member-system     # 重启生产
pm2 restart member-web-test   # 重启测试
pm2 stop member-web-test      # 停止测试
pm2 start member-web-test     # 启动测试
pm2 logs member-system        # 查看生产日志
pm2 logs member-web-test      # 查看测试日志
pm2 monit                     # 监控面板

# Nginx管理
nginx -t                      # 测试配置
systemctl reload nginx        # 重载配置
systemctl restart nginx       # 重启Nginx
systemctl status nginx        # 查看状态

# Git操作
git status                    # 查看状态
git pull origin main          # 拉取最新代码
git log --oneline -10         # 查看最近10条提交
```

---

## ⚠️ 注意事项和最佳实践

### 开发注意事项

1. **端口冲突**
   - member-system固定使用3000
   - apps/web固定使用3001
   - 避免同时启动两个开发服务器使用相同端口

2. **数据库隔离**
   - 推荐apps/web使用独立测试数据库
   - 避免测试数据污染生产数据

3. **环境变量**
   - 两个系统的.env文件独立管理
   - JWT_SECRET建议保持一致（方便测试）

4. **Git分支管理**
   - member-system相关的feature分支命名：`feature/ms-*`
   - apps/web相关的feature分支命名：`feature/web-*`

### 部署注意事项

1. **部署顺序**
   - 优先部署member-system（生产）
   - apps/web作为备份，可延后部署

2. **部署时间**
   - member-system：自动部署，推送即触发
   - apps/web：手动部署，选择低峰期

3. **回滚准备**
   - 每次部署前备份.env文件
   - 记录当前Git commit hash
   - 确保可以快速回滚

4. **监控检查**
   - 部署后检查PM2进程状态
   - 查看应用日志前50行
   - 访问首页确认正常

---

## 📋 检查清单

### 每日开发检查
- [ ] member-system开发环境正常启动
- [ ] apps/web开发环境正常启动（如需要）
- [ ] Git仓库状态正常
- [ ] 无未处理的冲突

### 每周检查
- [ ] 同步apps/web到最新功能
- [ ] 运行完整功能测试
- [ ] 检查两个系统的性能数据
- [ ] 更新测试数据库（如使用独立数据库）

### 部署前检查
- [ ] 本地测试通过
- [ ] TypeScript检查通过
- [ ] ESLint检查通过
- [ ] Git提交信息清晰
- [ ] 备份.env文件
- [ ] 记录当前commit hash

### 部署后检查
- [ ] PM2进程状态正常
- [ ] 应用日志无错误
- [ ] 首页访问正常
- [ ] 核心功能测试通过
- [ ] 性能指标正常

---

## 🆘 常见问题排查

### 问题1: apps/web启动失败

```bash
# 检查端口占用
lsof -i :3001
# 如果被占用，杀掉进程或换端口

# 检查依赖
cd apps/web/
rm -rf node_modules pnpm-lock.yaml
pnpm install

# 检查.env文件
cat .env  # 确保配置正确

# 查看详细错误
pnpm dev
```

### 问题2: 数据库连接失败

```bash
# 检查数据库是否运行
sudo systemctl status mysql

# 检查数据库用户权限
mysql -u root -p
SHOW GRANTS FOR 'your_user'@'localhost';

# 测试连接
mysql -h localhost -u your_user -p your_database
```

### 问题3: PM2进程崩溃

```bash
# 查看错误日志
pm2 logs member-web-test --err --lines 100

# 删除并重新启动
pm2 delete member-web-test
cd /www/wwwroot/member-system-test
pm2 start ecosystem.config.js

# 保存配置
pm2 save
```

### 问题4: 两个系统功能不一致

```bash
# 对比源代码
diff member-system/src/app/api/auth/login/route.ts \
     apps/web/src/app/api/auth/login/route.ts

# 手动同步
cp member-system/src/app/api/auth/login/route.ts \
   apps/web/src/app/api/auth/login/route.ts

# 重新测试
cd apps/web/ && pnpm dev
```

---

## 📚 相关文档

- [渐进式迁移计划](./PROGRESSIVE-MIGRATION-PLAN.md)
- [切换时机建议](./SWITCH-TIMING.md)
- [回滚方案](./ROLLBACK-PLAN.md)
- [主README](../README.md)
- [Monorepo指南](../README-MONOREPO.md)

---

**最后更新**: 2026-01-24
**文档版本**: v1.0
**维护者**: 开发团队
