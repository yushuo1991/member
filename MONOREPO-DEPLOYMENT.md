# Monorepo部署完整指南

## 目录

1. [概述](#概述)
2. [GitHub仓库配置](#github仓库配置)
3. [部署流程](#部署流程)
4. [环境变量配置](#环境变量配置)
5. [回滚方案](#回滚方案)
6. [监控和日志](#监控和日志)
7. [故障排查](#故障排查)

---

## 概述

### 架构设计

```
member-system-monorepo/
├── apps/
│   ├── web/         # 会员系统 (Port 3000)
│   ├── bk/          # 板块节奏系统 (Port 3001)
│   ├── fuplan/      # 复盘系统 (Port 3002)
│   └── xinli/       # 心理测评系统 (Port 3003)
├── packages/
│   ├── ui/          # 共享UI组件
│   ├── auth/        # 认证模块
│   ├── database/    # 数据库连接
│   ├── config/      # 共享配置
│   └── utils/       # 工具函数
└── turbo.json       # Turborepo配置
```

### 部署策略

- **变更检测**: 只部署有变更的应用
- **并行构建**: Turborepo并行构建4个应用
- **智能缓存**: GitHub Actions缓存node_modules和Turbo缓存
- **蓝绿部署**: 零停机部署(实际停机时间 < 3秒)
- **自动回滚**: 部署失败自动恢复到上一版本

---

## GitHub仓库配置

### 1. 决策: 新仓库 vs 现有仓库

**推荐: 使用现有仓库** (https://github.com/yushuo1991/member)

优点:
- 保留完整Git历史
- GitHub Actions配置已就绪
- Secrets已配置
- 无需更新DNS/文档

迁移步骤:
```bash
cd "C:\Users\yushu\Desktop\我的会员体系"

# 1. 创建备份分支
git checkout -b backup/pre-monorepo-$(date +%Y%m%d)
git push origin backup/pre-monorepo-$(date +%Y%m%d)

# 2. 回到main分支
git checkout main

# 3. 提交Monorepo配置
git add turbo.json
git add .github/workflows/deploy-monorepo.yml
git add ecosystem.config.monorepo.js
git add nginx-monorepo.conf
git add MONOREPO-DEPLOYMENT.md
git commit -m "feat: 配置Monorepo自动化部署系统"

# 4. 推送到远程
git push origin main
```

### 2. 保护main分支

在GitHub网页操作:

1. 进入仓库Settings → Branches
2. 添加Branch protection rule:
   - Branch name pattern: `main`
   - 勾选:
     - ✅ Require a pull request before merging
     - ✅ Require status checks to pass before merging
     - ✅ Require branches to be up to date before merging
     - ✅ Include administrators
   - Required status checks:
     - `build-and-deploy` (来自deploy-monorepo.yml)
     - `health-check` (可选)

### 3. 配置GitHub Secrets

需要配置的Secrets (Settings → Secrets and variables → Actions):

| Secret名称 | 值 | 说明 |
|-----------|-----|------|
| `DEPLOY_HOST` | `8.153.110.212` | 服务器IP地址 |
| `DEPLOY_SSH_KEY` | (SSH私钥内容) | root用户的SSH私钥 |

验证Secrets:
```bash
# 在本地测试SSH连接
ssh -i ~/.ssh/deploy_key root@8.153.110.212 "pm2 list"
```

### 4. 启用GitHub Actions

1. 进入仓库Settings → Actions → General
2. Actions permissions选择: "Allow all actions and reusable workflows"
3. Workflow permissions选择: "Read and write permissions"
4. 勾选: "Allow GitHub Actions to create and approve pull requests"

---

## 部署流程

### 自动化部署 (推荐)

#### 触发条件

1. **自动触发**: 推送到main分支且修改了以下文件:
   ```
   apps/**
   packages/**
   turbo.json
   pnpm-lock.yaml
   .github/workflows/deploy-monorepo.yml
   ```

2. **手动触发**: GitHub网页 → Actions → Deploy Monorepo → Run workflow

#### 部署流程图

```
[ Push to main ]
       ↓
[ Detect Changes ] → 检测哪些应用需要部署
       ↓
[ Build with Turbo ] → 并行构建所有变更的应用
       ↓
[ Upload Artifacts ] → 上传构建产物到GitHub
       ↓
┌──────┴──────┬──────────┬───────────┐
│             │          │           │
[ Deploy Web ] [ Deploy BK ] [ Deploy Fuplan ] [ Deploy Xinli ]
│             │          │           │
└──────┬──────┴──────────┴───────────┘
       ↓
[ Health Check ] → 验证所有应用是否正常运行
       ↓
[ ✅ Success / ❌ Failed ]
```

#### 部署时长

- **检测变更**: ~10秒
- **安装依赖**: ~2分钟 (有缓存时 ~30秒)
- **并行构建**: ~3-5分钟 (Turborepo缓存可减少到 ~1分钟)
- **上传部署**: ~1分钟
- **服务器重启**: ~30秒 × 4 = 2分钟
- **健康检查**: ~10秒

**总计**: 首次部署 ~10分钟, 后续部署 ~5分钟

### 手动部署 (备用方案)

#### 方案1: 使用脚本部署单个应用

```bash
# 在服务器上执行
ssh root@8.153.110.212

# 部署Web应用
cd /www/wwwroot/member-system
git pull origin main
npm install --production
npm run build
pm2 restart member-web

# 部署BK应用
cd /www/wwwroot/bk-system
git pull origin main
npm install --production
npm run build
pm2 restart member-bk
```

#### 方案2: 本地构建 + SCP上传

```bash
# 本地构建
cd "C:\Users\yushu\Desktop\我的会员体系"
pnpm install
pnpm turbo run build --filter=@yushuo/web

# 打包
cd apps/web
tar -czf web-build.tar.gz .next public package.json next.config.js

# 上传到服务器
scp web-build.tar.gz root@8.153.110.212:/tmp/

# SSH到服务器解压
ssh root@8.153.110.212
cd /www/wwwroot/member-system
tar -xzf /tmp/web-build.tar.gz
npm install --production
pm2 restart member-web
```

---

## 环境变量配置

### 1. 服务器环境变量

每个应用需要独立的`.env`文件:

#### Web应用 (`/www/wwwroot/member-system/.env`)

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_db_password
DB_NAME=member_system

# JWT配置
JWT_SECRET=your_jwt_secret_min_32_chars
JWT_EXPIRES_IN=7d

# 应用配置
NODE_ENV=production
APP_URL=http://member.example.com
PORT=3000

# 安全配置
BCRYPT_ROUNDS=12
SESSION_SECRET=your_session_secret
```

#### BK应用 (`/www/wwwroot/bk-system/.env`)

```env
# 数据库配置 (共用主数据库)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_db_password
DB_NAME=member_system

# JWT配置 (必须与Web应用相同,实现SSO)
JWT_SECRET=your_jwt_secret_min_32_chars
JWT_EXPIRES_IN=7d

# 应用配置
NODE_ENV=production
APP_URL=http://bk.member.example.com
PORT=3001

# 股票数据API (如需要)
STOCK_API_KEY=your_stock_api_key
```

#### Fuplan应用 (`/www/wwwroot/fuplan-system/.env`)

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_db_password
DB_NAME=member_system

# JWT配置
JWT_SECRET=your_jwt_secret_min_32_chars
JWT_EXPIRES_IN=7d

# 应用配置
NODE_ENV=production
APP_URL=http://fuplan.member.example.com
PORT=3002
```

#### Xinli应用 (`/www/wwwroot/xinli-system/.env`)

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_db_password
DB_NAME=member_system

# JWT配置
JWT_SECRET=your_jwt_secret_min_32_chars
JWT_EXPIRES_IN=7d

# 应用配置
NODE_ENV=production
APP_URL=http://xinli.member.example.com
PORT=3003
```

### 2. 初始化服务器环境变量

```bash
ssh root@8.153.110.212

# 创建所有部署目录
mkdir -p /www/wwwroot/{member-system,bk-system,fuplan-system,xinli-system}/logs

# 创建.env文件 (使用上面的模板)
# Web应用
cat > /www/wwwroot/member-system/.env << 'EOF'
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=YOUR_PASSWORD_HERE
DB_NAME=member_system
JWT_SECRET=YOUR_SECRET_HERE_MIN_32_CHARS
JWT_EXPIRES_IN=7d
NODE_ENV=production
APP_URL=http://8.153.110.212:3000
PORT=3000
BCRYPT_ROUNDS=12
SESSION_SECRET=YOUR_SESSION_SECRET
EOF

# BK应用
cat > /www/wwwroot/bk-system/.env << 'EOF'
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=YOUR_PASSWORD_HERE
DB_NAME=member_system
JWT_SECRET=YOUR_SECRET_HERE_MIN_32_CHARS
JWT_EXPIRES_IN=7d
NODE_ENV=production
APP_URL=http://8.153.110.212:3001
PORT=3001
EOF

# Fuplan应用
cat > /www/wwwroot/fuplan-system/.env << 'EOF'
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=YOUR_PASSWORD_HERE
DB_NAME=member_system
JWT_SECRET=YOUR_SECRET_HERE_MIN_32_CHARS
JWT_EXPIRES_IN=7d
NODE_ENV=production
APP_URL=http://8.153.110.212:3002
PORT=3002
EOF

# Xinli应用
cat > /www/wwwroot/xinli-system/.env << 'EOF'
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=YOUR_PASSWORD_HERE
DB_NAME=member_system
JWT_SECRET=YOUR_SECRET_HERE_MIN_32_CHARS
JWT_EXPIRES_IN=7d
NODE_ENV=production
APP_URL=http://8.153.110.212:3003
PORT=3003
EOF

# 设置权限
chmod 600 /www/wwwroot/*/。env
```

### 3. 验证环境变量

```bash
# 检查所有.env文件
for dir in member-system bk-system fuplan-system xinli-system; do
  echo "=== $dir ==="
  cat /www/wwwroot/$dir/.env | grep -v PASSWORD
  echo ""
done
```

---

## 回滚方案

### 方案1: GitHub Actions回滚 (最快)

```bash
# 1. 找到上一次成功的部署commit
git log --oneline | head -10

# 2. 回滚到指定commit
git revert HEAD --no-commit
git commit -m "revert: 回滚到上一版本"
git push origin main

# GitHub Actions会自动重新部署旧版本
```

### 方案2: 服务器端回滚 (紧急)

```bash
ssh root@8.153.110.212

# 停止所有应用
pm2 stop all

# 恢复备份 (假设备份在 /backup/ 目录)
for app in member-system bk-system fuplan-system xinli-system; do
  echo "回滚 $app..."

  # 备份当前版本
  mv /www/wwwroot/$app /www/wwwroot/${app}.failed

  # 恢复旧版本
  cp -r /backup/${app}-$(date +%Y%m%d) /www/wwwroot/$app

  # 恢复.env
  cp /www/wwwroot/${app}.failed/.env /www/wwwroot/$app/
done

# 重启所有应用
pm2 start ecosystem.config.monorepo.js --env production
pm2 save

# 验证
pm2 list
curl -I http://127.0.0.1:3000
```

### 方案3: 单个应用回滚

```bash
# 只回滚Web应用
ssh root@8.153.110.212

APP_NAME="member-system"
BACKUP_DATE="20260124"

# 停止应用
pm2 stop member-web

# 回滚
mv /www/wwwroot/$APP_NAME /www/wwwroot/${APP_NAME}.failed
cp -r /backup/${APP_NAME}-${BACKUP_DATE} /www/wwwroot/$APP_NAME

# 恢复.env和重启
cp /www/wwwroot/${APP_NAME}.failed/.env /www/wwwroot/$APP_NAME/
cd /www/wwwroot/$APP_NAME
npm install --production
pm2 start member-web

# 验证
pm2 logs member-web --lines 50
curl -I http://127.0.0.1:3000
```

### 自动备份脚本

在服务器上创建定时备份:

```bash
# 创建备份脚本
cat > /root/backup-apps.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backup"
DATE=$(date +%Y%m%d-%H%M)

mkdir -p $BACKUP_DIR

for app in member-system bk-system fuplan-system xinli-system; do
  if [ -d "/www/wwwroot/$app" ]; then
    echo "备份 $app..."
    tar -czf $BACKUP_DIR/${app}-${DATE}.tar.gz -C /www/wwwroot $app
  fi
done

# 删除7天前的备份
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "备份完成: $(ls -lh $BACKUP_DIR | tail -5)"
EOF

chmod +x /root/backup-apps.sh

# 添加到crontab (每天凌晨2点执行)
(crontab -l 2>/dev/null; echo "0 2 * * * /root/backup-apps.sh >> /var/log/backup.log 2>&1") | crontab -

# 手动执行一次
/root/backup-apps.sh
```

---

## 监控和日志

### PM2监控

```bash
# 实时监控所有应用
pm2 monit

# 查看应用列表
pm2 list

# 查看特定应用日志
pm2 logs member-web --lines 100
pm2 logs member-bk --lines 100
pm2 logs member-fuplan --lines 100
pm2 logs member-xinli --lines 100

# 查看错误日志
pm2 logs member-web --err --lines 50

# 清空日志
pm2 flush

# 查看应用详情
pm2 info member-web
```

### Nginx日志

```bash
# 实时查看访问日志
tail -f /var/log/nginx/member-web.access.log
tail -f /var/log/nginx/member-bk.access.log

# 查看错误日志
tail -f /var/log/nginx/member-web.error.log

# 分析访问量
cat /var/log/nginx/member-web.access.log | wc -l

# 查看最近的500错误
grep " 500 " /var/log/nginx/member-web.error.log | tail -20
```

### 应用日志

```bash
# Web应用日志
tail -f /www/wwwroot/member-system/logs/error.log
tail -f /www/wwwroot/member-system/logs/out.log

# BK应用日志
tail -f /www/wwwroot/bk-system/logs/error.log

# 搜索特定错误
grep -i "database" /www/wwwroot/member-system/logs/error.log | tail -20
```

### 系统监控

```bash
# CPU和内存使用
top -p $(pgrep -d',' node)

# 磁盘使用
df -h /www/wwwroot

# 端口占用
netstat -tulpn | grep -E "3000|3001|3002|3003"

# MySQL连接数
mysql -u root -p -e "SHOW PROCESSLIST;"
```

### GitHub Actions监控

在GitHub网页查看:

1. 进入仓库 → Actions
2. 查看最近的工作流运行
3. 点击特定运行查看详细日志
4. 失败时会收到邮件通知

---

## 故障排查

### 问题1: 部署后应用无法访问

**症状**: `curl http://127.0.0.1:3000` 返回 Connection refused

**排查步骤**:

```bash
# 1. 检查PM2状态
pm2 list
# 如果状态是errored或stopped,查看日志
pm2 logs member-web --err --lines 50

# 2. 检查端口占用
lsof -i :3000
# 如果端口被占用,杀死进程
kill -9 <PID>

# 3. 检查.env文件
cat /www/wwwroot/member-system/.env
# 确认DB_PASSWORD, JWT_SECRET等配置正确

# 4. 手动启动测试
cd /www/wwwroot/member-system
NODE_ENV=production npm start
# 查看启动错误信息

# 5. 检查数据库连接
mysql -u root -p member_system -e "SELECT COUNT(*) FROM users;"
```

### 问题2: GitHub Actions部署失败

**症状**: Actions页面显示红色X

**排查步骤**:

```bash
# 1. 查看详细日志
# GitHub网页 → Actions → 点击失败的workflow → 查看红色步骤

# 2. 常见错误和解决方案:

# 错误: "Permission denied (publickey)"
# 解决: 检查DEPLOY_SSH_KEY是否正确配置
gh secret list
# 重新设置SSH key
gh secret set DEPLOY_SSH_KEY < ~/.ssh/deploy_key

# 错误: "npm ERR! 404 Not Found"
# 解决: 清除npm缓存
rm -rf ~/.npm
npm cache clean --force

# 错误: "Turborepo cache error"
# 解决: 清除Turbo缓存
rm -rf .turbo
pnpm turbo run build --force

# 3. 本地复现错误
cd "C:\Users\yushu\Desktop\我的会员体系"
pnpm install
pnpm turbo run build
# 查看是否有相同错误
```

### 问题3: 应用频繁重启

**症状**: PM2显示restart次数不断增加

**排查步骤**:

```bash
# 1. 查看重启原因
pm2 logs member-web --lines 200 | grep -i "error"

# 2. 检查内存使用
pm2 info member-web | grep "memory"
# 如果接近max_memory_restart,增加限制
pm2 delete member-web
pm2 start ecosystem.config.monorepo.js --update-env

# 3. 检查数据库连接池
mysql -u root -p -e "SHOW STATUS LIKE 'Threads_connected';"
# 如果连接数过高,检查代码是否正确关闭连接

# 4. 临时禁用自动重启调试
pm2 delete member-web
pm2 start npm --name member-web --no-autorestart -- start
# 查看崩溃时的完整错误信息
```

### 问题4: 数据库连接失败

**症状**: 日志显示 "ER_ACCESS_DENIED_ERROR"

**排查步骤**:

```bash
# 1. 测试数据库连接
mysql -h localhost -u root -p member_system
# 如果无法连接,重置密码
ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
FLUSH PRIVILEGES;

# 2. 检查.env配置
cat /www/wwwroot/member-system/.env | grep DB_
# 确认DB_PASSWORD与数据库密码一致

# 3. 检查数据库是否存在
mysql -u root -p -e "SHOW DATABASES LIKE 'member_system';"
# 如果不存在,创建数据库
mysql -u root -p < /www/wwwroot/member-system/database-init-v3.sql

# 4. 测试Node.js连接
cd /www/wwwroot/member-system
node -e "
const mysql = require('mysql2/promise');
const db = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'your_password',
  database: 'member_system'
});
console.log('Connected!');
await db.end();
"
```

### 问题5: Nginx 502 Bad Gateway

**症状**: 浏览器显示502错误

**排查步骤**:

```bash
# 1. 检查上游服务器是否运行
curl http://127.0.0.1:3000
# 如果失败,重启PM2应用
pm2 restart member-web

# 2. 检查Nginx配置
nginx -t
# 如果有错误,修复后重载
nginx -s reload

# 3. 查看Nginx错误日志
tail -f /var/log/nginx/member-web.error.log
# 常见错误:
# - "connect() failed (111: Connection refused)" → 应用未启动
# - "no live upstreams" → upstream配置错误

# 4. 检查防火墙
iptables -L -n | grep -E "3000|3001|3002|3003"
# 如果端口被blocked,添加规则
iptables -I INPUT -p tcp --dport 3000 -j ACCEPT
```

### 调试模式

开启详细日志进行调试:

```bash
# 1. 修改PM2配置启用debug模式
pm2 delete member-web
NODE_ENV=production DEBUG=* pm2 start npm --name member-web -- start

# 2. 查看详细日志
pm2 logs member-web --raw

# 3. 调试完成后恢复正常模式
pm2 delete member-web
pm2 start ecosystem.config.monorepo.js --env production
```

---

## 快速参考命令

### 部署相关

```bash
# 查看部署状态
gh run list --limit 5

# 手动触发部署
gh workflow run deploy-monorepo.yml

# 查看最新部署日志
gh run view --log

# 取消正在进行的部署
gh run cancel <run-id>
```

### PM2常用命令

```bash
# 启动所有应用
pm2 start ecosystem.config.monorepo.js --env production

# 重启所有应用
pm2 restart all

# 停止所有应用
pm2 stop all

# 删除所有应用
pm2 delete all

# 保存PM2配置
pm2 save

# 重载PM2配置
pm2 reload ecosystem.config.monorepo.js

# 查看实时日志
pm2 logs --lines 200
```

### Nginx常用命令

```bash
# 测试配置
nginx -t

# 重载配置
nginx -s reload

# 重启Nginx
systemctl restart nginx

# 查看状态
systemctl status nginx
```

---

## 联系支持

如遇到无法解决的问题:

1. 查看GitHub Issues: https://github.com/yushuo1991/member/issues
2. 创建新Issue并附上:
   - 错误日志
   - PM2状态 (`pm2 list`)
   - 系统信息 (`uname -a`, `node -v`, `npm -v`)
   - 复现步骤

---

**最后更新**: 2026-01-24
**维护者**: Claude Code Assistant
