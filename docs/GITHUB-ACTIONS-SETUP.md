# GitHub Actions 自动部署配置指南

本指南将帮助你配置GitHub Actions，实现代码推送后自动部署到阿里云服务器。

## 📋 配置步骤

### 步骤1️⃣：在服务器上生成SSH密钥对

SSH连接到你的服务器并执行以下命令：

```bash
# 连接到服务器
ssh root@8.153.110.212

# 生成专门用于GitHub Actions的SSH密钥（不设置密码，直接回车）
ssh-keygen -t rsa -b 4096 -C "github-actions-deploy" -f ~/.ssh/github_actions_deploy_key

# 显示密钥内容（后面会用到）
echo "========================================="
echo "公钥内容（添加到authorized_keys）:"
echo "========================================="
cat ~/.ssh/github_actions_deploy_key.pub

echo ""
echo "========================================="
echo "私钥内容（添加到GitHub Secrets）:"
echo "========================================="
cat ~/.ssh/github_actions_deploy_key

# 将公钥添加到authorized_keys
cat ~/.ssh/github_actions_deploy_key.pub >> ~/.ssh/authorized_keys

# 设置正确的权限
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh

echo ""
echo "✅ SSH密钥生成完成！"
```

**重要：复制并保存上面显示的私钥内容**（从 `-----BEGIN OPENSSH PRIVATE KEY-----` 到 `-----END OPENSSH PRIVATE KEY-----`，包括这两行）

### 步骤2️⃣：在GitHub添加Secrets

1. **打开GitHub仓库设置**
   - 访问: https://github.com/yushuo1991/member
   - 点击顶部的 `Settings` 标签
   - 在左侧菜单找到 `Secrets and variables` → `Actions`

2. **添加以下3个Secrets**

   点击 `New repository secret` 按钮，依次添加：

   **Secret 1: SERVER_HOST**
   ```
   Name: SERVER_HOST
   Value: 8.153.110.212
   ```

   **Secret 2: SERVER_USER**
   ```
   Name: SERVER_USER
   Value: root
   ```

   **Secret 3: SERVER_SSH_KEY**
   ```
   Name: SERVER_SSH_KEY
   Value: [粘贴步骤1中复制的完整私钥内容]
   ```

   **注意**：私钥内容应该是这样的格式：
   ```
   -----BEGIN OPENSSH PRIVATE KEY-----
   b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAACFwAAAAdzc2gtcn
   NhAAAAAwEAAQAAAgEA...（中间很多行）...
   -----END OPENSSH PRIVATE KEY-----
   ```

3. **验证Secrets已添加**

   确认你在 `Actions secrets` 页面看到这3个secret：
   - ✅ SERVER_HOST
   - ✅ SERVER_USER
   - ✅ SERVER_SSH_KEY

### 步骤3️⃣：推送GitHub Actions配置到仓库

在本地执行以下命令：

```bash
cd C:\Users\yushu\Desktop\member-system

# 查看workflow文件
cat .github/workflows/deploy.yml

# 添加并提交
git add .github/workflows/deploy.yml
git commit -m "添加GitHub Actions自动部署配置"
git push origin main
```

### 步骤4️⃣：验证自动部署

1. **查看Actions运行状态**
   - 访问: https://github.com/yushuo1991/member/actions
   - 你应该会看到一个正在运行的workflow "自动部署到阿里云服务器"
   - 点击进去查看实时日志

2. **首次运行可能需要**
   - 如果失败，检查SSH密钥是否正确配置
   - 确认服务器上项目路径是 `/root/member-system`
   - 确认PM2服务名称是 `member-system`

3. **测试自动部署**

   修改任意文件并推送，例如：
   ```bash
   echo "# 测试自动部署" >> README.md
   git add README.md
   git commit -m "测试自动部署"
   git push origin main
   ```

   然后观察GitHub Actions是否自动运行并成功部署。

## 🚀 使用说明

配置完成后，每次你推送代码到 `main` 分支，GitHub Actions会自动：

1. ✅ 连接到你的服务器
2. ✅ 拉取最新代码 (`git pull`)
3. ✅ 安装依赖 (`npm install`)
4. ✅ 构建项目 (`npm run build`)
5. ✅ 重启服务 (`pm2 restart`)

**完全自动化，无需手动操作！**

## 📊 监控部署

- **查看部署日志**: https://github.com/yushuo1991/member/actions
- **部署失败通知**: GitHub会发邮件通知
- **服务器日志**: `pm2 logs member-system`

## 🔧 故障排查

### 问题1: Actions执行失败 "Permission denied"

**解决方案**：
```bash
# 在服务器上检查SSH配置
ssh root@8.153.110.212
cat ~/.ssh/authorized_keys | grep github-actions
chmod 600 ~/.ssh/authorized_keys
```

### 问题2: "npm run build" 失败

**解决方案**：
```bash
# 在服务器上手动测试构建
cd /root/member-system
npm run build
```

### 问题3: PM2重启失败

**解决方案**：
```bash
# 检查PM2状态
pm2 list
pm2 logs member-system --err --lines 50
```

## 📝 配置文件说明

**`.github/workflows/deploy.yml`** - GitHub Actions配置文件
- `on.push.branches: main` - 监听main分支推送
- `appleboy/ssh-action` - SSH连接服务器
- 使用 Secrets 保护敏感信息（服务器IP、密钥等）

## 🎯 下一步

配置完成后，你的开发流程将是：

1. 本地修改代码
2. `git add .`
3. `git commit -m "描述"`
4. `git push origin main`
5. ☕ 等待30秒-1分钟，自动部署完成！

**无需再手动SSH到服务器执行命令！**

---

**配置时间**: 约5分钟
**部署时间**: 每次约30-60秒
**收益**: 永久自动化 🎉
