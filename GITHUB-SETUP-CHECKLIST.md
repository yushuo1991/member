# GitHub仓库配置检查清单

## 配置前准备

- [ ] 已安装GitHub CLI (`gh --version`)
- [ ] 已登录GitHub账号 (`gh auth status`)
- [ ] 拥有仓库管理员权限
- [ ] 已生成SSH密钥对

---

## 1. 仓库基础配置

### 1.1 验证仓库信息

```bash
# 检查当前仓库
cd "C:\Users\yushu\Desktop\我的会员体系"
git remote -v

# 预期输出:
# origin  https://github.com/yushuo1991/member.git (fetch)
# origin  https://github.com/yushuo1991/member.git (push)
```

**检查项**:
- [ ] 远程仓库URL正确
- [ ] 可以正常push代码

### 1.2 创建备份分支

```bash
# 创建备份分支(重要!)
git checkout -b backup/pre-monorepo-$(date +%Y%m%d)
git push origin backup/pre-monorepo-$(date +%Y%m%d)

# 返回main分支
git checkout main
```

**检查项**:
- [ ] 备份分支已创建
- [ ] 备份分支已推送到远程

---

## 2. Secrets配置

### 2.1 设置部署密钥

```bash
# 检查SSH密钥是否存在
ls -la C:\Users\yushu\.ssh\

# 如果没有id_rsa,生成新密钥
ssh-keygen -t rsa -b 4096 -C "deploy@member-system" -f C:\Users\yushu\.ssh\deploy_key

# 设置Secrets
gh secret set DEPLOY_HOST -b "8.153.110.212"
gh secret set DEPLOY_SSH_KEY < C:\Users\yushu\.ssh\deploy_key

# 验证
gh secret list
```

**检查项**:
- [ ] `DEPLOY_HOST` 已设置
- [ ] `DEPLOY_SSH_KEY` 已设置
- [ ] SSH密钥可以连接服务器: `ssh -i C:\Users\yushu\.ssh\deploy_key root@8.153.110.212 "echo OK"`

### 2.2 测试SSH连接

```bash
# 测试连接
ssh -i C:\Users\yushu\.ssh\deploy_key root@8.153.110.212 "pm2 list"

# 预期输出: PM2进程列表(或错误信息但能连接)
```

**检查项**:
- [ ] SSH连接成功
- [ ] 可以执行远程命令

---

## 3. 分支保护规则

### 3.1 配置main分支保护

访问: https://github.com/yushuo1991/member/settings/branches

1. 点击 "Add branch protection rule"
2. Branch name pattern: `main`
3. 配置以下选项:

**必须勾选**:
- [ ] ✅ Require a pull request before merging
  - [ ] Require approvals: 1
  - [ ] Dismiss stale pull request approvals when new commits are pushed
- [ ] ✅ Require status checks to pass before merging
  - [ ] Require branches to be up to date before merging
  - 添加required checks:
    - `build` (来自deploy-monorepo.yml)
    - `deploy-web` (可选)
- [ ] ✅ Require conversation resolution before merging
- [ ] ✅ Include administrators (推荐)

**可选配置**:
- [ ] Require signed commits
- [ ] Require linear history
- [ ] Lock branch (只允许通过PR修改)

### 3.2 验证保护规则

```bash
# 尝试直接推送到main (应该失败或需要PR)
git checkout -b test/branch-protection
echo "test" > test.txt
git add test.txt
git commit -m "test: 测试分支保护"
git push origin test/branch-protection

# 创建PR测试
gh pr create --title "Test PR" --body "测试分支保护规则"
```

**检查项**:
- [ ] 无法直接推送到main分支
- [ ] PR创建成功
- [ ] PR需要status checks通过才能merge

---

## 4. GitHub Actions配置

### 4.1 启用Actions

访问: https://github.com/yushuo1991/member/settings/actions

**配置**:
- [ ] Actions permissions: "Allow all actions and reusable workflows"
- [ ] Workflow permissions: "Read and write permissions"
- [ ] ✅ Allow GitHub Actions to create and approve pull requests

### 4.2 验证Workflow文件

```bash
# 检查workflow文件是否存在
ls -la .github/workflows/

# 预期输出:
# deploy-monorepo.yml
# deploy-optimized.yml
```

**检查项**:
- [ ] deploy-monorepo.yml 存在
- [ ] deploy-optimized.yml 存在
- [ ] YAML语法正确 (GitHub Actions页面无错误)

### 4.3 测试Workflow

```bash
# 手动触发workflow
gh workflow run deploy-monorepo.yml

# 查看运行状态
gh run list --limit 1

# 查看详细日志
gh run watch
```

**检查项**:
- [ ] Workflow成功触发
- [ ] 所有步骤成功执行
- [ ] 没有错误或警告

---

## 5. 环境配置

### 5.1 检查服务器环境

```bash
ssh root@8.153.110.212 << 'EOF'
  echo "=== Node.js版本 ==="
  node -v
  npm -v

  echo -e "\n=== PM2状态 ==="
  which pm2
  pm2 -v

  echo -e "\n=== MySQL状态 ==="
  systemctl status mysql --no-pager -l | head -5

  echo -e "\n=== Nginx状态 ==="
  nginx -v
  systemctl status nginx --no-pager -l | head -5

  echo -e "\n=== 磁盘空间 ==="
  df -h /www

  echo -e "\n=== 部署目录 ==="
  ls -la /www/wwwroot/ | head -10
EOF
```

**预期输出**:
```
=== Node.js版本 ===
v18.19.0 (或更高)
9.x.x (npm)

=== PM2状态 ===
/usr/local/bin/pm2
5.x.x

=== MySQL状态 ===
Active: active (running)

=== Nginx状态 ===
nginx version: nginx/1.x.x
Active: active (running)

=== 磁盘空间 ===
/dev/vda1  40G  15G  23G  40% /www

=== 部署目录 ===
drwxr-xr-x member-system
drwxr-xr-x bk-system
...
```

**检查项**:
- [ ] Node.js >= 18.17.0
- [ ] PM2已安装
- [ ] MySQL运行中
- [ ] Nginx运行中
- [ ] 磁盘空间充足 (> 10GB)
- [ ] 部署目录存在

### 5.2 创建.env文件

```bash
ssh root@8.153.110.212 << 'EOF'
# 检查.env文件是否存在
for app in member-system bk-system fuplan-system xinli-system; do
  if [ -f "/www/wwwroot/$app/.env" ]; then
    echo "✅ $app/.env 存在"
  else
    echo "❌ $app/.env 不存在,需要创建"
  fi
done
EOF
```

**检查项**:
- [ ] member-system/.env 存在
- [ ] bk-system/.env 存在
- [ ] fuplan-system/.env 存在
- [ ] xinli-system/.env 存在

如果不存在,参考 `QUICK-START.md` 第2步创建。

---

## 6. 部署前最终检查

### 6.1 本地构建测试

```bash
cd "C:\Users\yushu\Desktop\我的会员体系"

# 如果是Monorepo结构
pnpm install
pnpm turbo run build

# 如果是单仓库结构
cd member-system
npm install
npm run build
```

**检查项**:
- [ ] 依赖安装成功
- [ ] 构建无错误
- [ ] 构建时间 < 5分钟

### 6.2 代码检查

```bash
# TypeScript类型检查
npm run type-check

# ESLint检查
npm run lint
```

**检查项**:
- [ ] 无TypeScript错误
- [ ] 无ESLint错误
- [ ] 代码格式正确

### 6.3 Git状态检查

```bash
# 检查未提交的文件
git status

# 检查最近的commits
git log --oneline -5

# 检查与远程的差异
git fetch origin
git diff origin/main
```

**检查项**:
- [ ] 无未提交的重要更改
- [ ] commits message清晰
- [ ] 与远程同步

---

## 7. 首次部署

### 7.1 推送代码触发部署

```bash
# 提交所有配置文件
git add turbo.json
git add .github/workflows/deploy-monorepo.yml
git add ecosystem.config.monorepo.js
git add nginx-monorepo.conf
git add MONOREPO-DEPLOYMENT.md
git add QUICK-START.md
git add GITHUB-SETUP-CHECKLIST.md

git commit -m "feat: 配置Monorepo自动化部署系统

- 添加Turborepo配置
- 创建GitHub Actions workflow
- 配置PM2多应用管理
- 添加Nginx配置
- 编写部署文档

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

git push origin main
```

### 7.2 监控部署进度

```bash
# 实时查看workflow运行
gh run watch

# 或访问网页
# https://github.com/yushuo1991/member/actions
```

**预期流程**:
1. ✅ Checkout code
2. ✅ Detect changes
3. ✅ Build with Turbo (~3-5分钟)
4. ✅ Upload artifacts
5. ✅ Deploy apps (Web, BK, Fuplan, Xinli)
6. ✅ Health check

### 7.3 验证部署结果

```bash
# 检查PM2状态
ssh root@8.153.110.212 "pm2 list"

# 测试应用访问
ssh root@8.153.110.212 << 'EOF'
  echo "=== Web应用 (Port 3000) ==="
  curl -I http://127.0.0.1:3000 2>&1 | head -5

  echo -e "\n=== BK应用 (Port 3001) ==="
  curl -I http://127.0.0.1:3001 2>&1 | head -5

  echo -e "\n=== Fuplan应用 (Port 3002) ==="
  curl -I http://127.0.0.1:3002 2>&1 | head -5

  echo -e "\n=== Xinli应用 (Port 3003) ==="
  curl -I http://127.0.0.1:3003 2>&1 | head -5
EOF
```

**预期输出**:
```
=== Web应用 (Port 3000) ===
HTTP/1.1 200 OK
X-Powered-By: Next.js

=== BK应用 (Port 3001) ===
HTTP/1.1 200 OK
...
```

**检查项**:
- [ ] PM2显示4个应用都在运行
- [ ] 所有端口返回200 OK
- [ ] 无ERROR级别日志

---

## 8. 部署后配置

### 8.1 配置Nginx (可选)

```bash
ssh root@8.153.110.212

# 复制Nginx配置
# (假设配置文件已上传到服务器)
cp /www/wwwroot/member-system/nginx-monorepo.conf /etc/nginx/sites-available/member-monorepo

# 创建软链接
ln -s /etc/nginx/sites-available/member-monorepo /etc/nginx/sites-enabled/

# 测试配置
nginx -t

# 重载Nginx
nginx -s reload
```

**检查项**:
- [ ] Nginx配置无错误
- [ ] Nginx成功重载
- [ ] 可以通过域名访问应用

### 8.2 配置自动备份

```bash
ssh root@8.153.110.212

# 创建备份脚本
cat > /root/backup-apps.sh << 'SCRIPT'
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

echo "备份完成"
SCRIPT

chmod +x /root/backup-apps.sh

# 添加到crontab (每天凌晨2点)
(crontab -l 2>/dev/null; echo "0 2 * * * /root/backup-apps.sh >> /var/log/backup.log 2>&1") | crontab -

# 测试备份
/root/backup-apps.sh
ls -lh /backup/
```

**检查项**:
- [ ] 备份脚本创建成功
- [ ] crontab配置正确
- [ ] 手动执行备份成功

### 8.3 配置PM2开机自启

```bash
ssh root@8.153.110.212

# 生成启动脚本
pm2 startup

# 执行输出的命令 (类似下面的格式)
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u root --hp /root

# 保存当前PM2进程列表
pm2 save

# 验证
systemctl status pm2-root
```

**检查项**:
- [ ] PM2 startup命令执行成功
- [ ] pm2-root服务运行中
- [ ] 重启服务器后应用自动启动

---

## 9. 监控配置

### 9.1 配置PM2邮件通知 (可选)

```bash
ssh root@8.153.110.212

# 安装pm2-email模块
pm2 install pm2-email

# 配置邮件
pm2 set pm2-email:smtpHost smtp.gmail.com
pm2 set pm2-email:smtpPort 587
pm2 set pm2-email:smtpUser your-email@gmail.com
pm2 set pm2-email:smtpPassword your-app-password
pm2 set pm2-email:recipient your-email@gmail.com
```

### 9.2 配置UptimeRobot (可选)

访问: https://uptimerobot.com

1. 添加4个监控:
   - Web应用: http://8.153.110.212:3000
   - BK应用: http://8.153.110.212:3001
   - Fuplan应用: http://8.153.110.212:3002
   - Xinli应用: http://8.153.110.212:3003

2. 配置告警:
   - 监控间隔: 5分钟
   - 告警方式: Email
   - 连续失败3次后告警

---

## 10. 完成检查清单

### 部署成功标准

- [ ] GitHub Actions workflow运行成功
- [ ] PM2显示4个应用都在运行
- [ ] 所有端口返回200 OK
- [ ] 日志无ERROR级别错误
- [ ] 可以正常登录和使用功能

### 性能检查

- [ ] 首屏加载时间 < 2秒
- [ ] API响应时间 < 500ms
- [ ] PM2 Memory < 500MB per app
- [ ] PM2 CPU < 10% (闲时)

### 安全检查

- [ ] .env文件权限为600
- [ ] Secrets配置正确
- [ ] SSH密钥安全存储
- [ ] 数据库密码强度足够

### 文档检查

- [ ] MONOREPO-DEPLOYMENT.md 已阅读
- [ ] QUICK-START.md 已完成
- [ ] 团队成员了解部署流程
- [ ] 回滚方案已测试

---

## 下一步行动

完成所有检查后:

1. **配置域名和SSL证书**
   - 添加DNS记录
   - 使用certbot申请证书
   - 更新Nginx配置

2. **优化性能**
   - 启用CDN
   - 配置Redis缓存
   - 优化数据库索引

3. **监控和告警**
   - 集成Sentry错误追踪
   - 配置日志分析
   - 设置性能监控

4. **文档和培训**
   - 编写API文档
   - 培训团队成员
   - 准备用户手册

---

## 常见问题

### Q: GitHub Actions失败怎么办?

```bash
# 查看详细错误
gh run view --log-failed

# 常见错误:
# - Secrets未配置: 检查 gh secret list
# - SSH连接失败: 测试 ssh root@8.153.110.212
# - 构建错误: 本地运行 npm run build 复现
```

### Q: PM2应用启动失败?

```bash
# 查看详细错误日志
pm2 logs member-web --err --lines 100

# 常见原因:
# - .env文件缺失或错误
# - 数据库连接失败
# - 端口被占用
# - 依赖未安装
```

### Q: 如何回滚到上一版本?

参考 `MONOREPO-DEPLOYMENT.md` 回滚方案章节。

---

**配置完成!** 🎉

保存此检查清单作为参考,每次部署前快速检查。
