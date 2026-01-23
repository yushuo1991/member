# GitHub Actions 自动部署配置指南

## 已完成的步骤 ✅

1. ✅ 初始化 Git 仓库
2. ✅ 创建 .gitignore 文件
3. ✅ 生成 SSH 密钥对 (deploy_key 和 deploy_key.pub)
4. ✅ 将公钥添加到服务器 (8.153.110.212)
5. ✅ GitHub Actions 工作流已存在 (.github/workflows/deploy-member-system.yml)

## 接下来需要您完成的步骤

### 步骤1: 创建 GitHub 仓库

1. 访问 https://github.com/new
2. 填写仓库信息:
   - **Repository name:** `member-system` (或您喜欢的名字)
   - **Description:** 宇硕会员管理系统
   - **Visibility:** Private (推荐,因为包含业务代码)
   - **不要** 勾选 "Initialize this repository with a README"
3. 点击 "Create repository"

### 步骤2: 配置 GitHub Secrets

在您的 GitHub 仓库页面:

1. 点击 **Settings** → **Secrets and variables** → **Actions**
2. 点击 **New repository secret**,添加以下 secrets:

#### Secret 1: DEPLOY_HOST
```
Name: DEPLOY_HOST
Secret: 8.153.110.212
```

#### Secret 2: DEPLOY_USER
```
Name: DEPLOY_USER
Secret: root
```

#### Secret 3: DEPLOY_PATH
```
Name: DEPLOY_PATH
Secret: /www/wwwroot/member-system
```

#### Secret 4: DEPLOY_SSH_KEY (私钥)
```
Name: DEPLOY_SSH_KEY
Secret: (复制下面的完整私钥内容,包括 BEGIN 和 END 行)
```

**私钥内容:**
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACDhQBsHHjeXte+HbXQp6Mkp+0K6muac+1HDk6a4dKWUbAAAAJhIVswmSFbM
JgAAAAtzc2gtZWQyNTUxOQAAACDhQBsHHjeXte+HbXQp6Mkp+0K6muac+1HDk6a4dKWUbA
AAAECbdZh8gCAn1029GaMKU9KmXBWtmmYd9CjIXXFmS9nxwuFAGwceN5e174dtdCnoySn7
Qrqa5pz7UcOTprh0pZRsAAAAFWdpdGh1Yi1hY3Rpb25zLWRlcGxveQ==
-----END OPENSSH PRIVATE KEY-----
```

**注意:** 确保复制时包含首尾的 `-----BEGIN` 和 `-----END` 行

### 步骤3: 推送代码到 GitHub

在本地命令行执行:

```bash
# 切换到项目目录
cd "C:\Users\yushu\Desktop\我的会员体系"

# 添加所有文件
git add .

# 提交
git commit -m "feat: initial commit - 宇硕会员管理系统"

# 添加远程仓库 (替换成您的仓库地址)
git remote add origin https://github.com/YOUR_USERNAME/member-system.git

# 设置默认分支为 main
git branch -M main

# 推送代码
git push -u origin main
```

**注意:** 将 `YOUR_USERNAME` 替换为您的 GitHub 用户名

### 步骤4: 验证自动部署

1. 推送代码后,访问您的 GitHub 仓库
2. 点击 **Actions** 标签
3. 您应该能看到 "Deploy member-system" 工作流正在运行
4. 等待部署完成 (大约 3-5 分钟)
5. 访问 http://8.153.110.212:3000/admin/login 测试

## 自动部署触发条件

以后只要您执行以下操作,就会自动触发部署:

```bash
# 修改代码后
git add .
git commit -m "feat: 您的修改说明"
git push
```

**触发条件:**
- 推送到 `main` 或 `master` 分支
- 修改了 `member-system/` 目录下的文件
- 或修改了 `.github/workflows/deploy-member-system.yml` 文件

## 手动触发部署

如果需要手动触发部署:

1. 访问 GitHub 仓库的 **Actions** 页面
2. 点击左侧的 "Deploy member-system"
3. 点击右上角的 "Run workflow" 按钮
4. 选择分支 (通常是 main)
5. 点击 "Run workflow"

## 部署过程说明

GitHub Actions 会自动执行以下步骤:

1. ✅ 检出代码
2. ✅ 使用 SSH 密钥连接服务器
3. ✅ 同步文件到服务器 (排除 .env, node_modules, .next)
4. ✅ 在服务器上执行:
   - `npm ci` (安装依赖)
   - `npm run build` (构建项目)
   - `pm2 startOrReload ecosystem.config.js` (启动/重启应用)
   - `pm2 save` (保存 PM2 配置)

## 查看部署日志

### 在 GitHub 上查看
1. 访问 **Actions** 页面
2. 点击具体的工作流运行记录
3. 展开各个步骤查看详细日志

### 在服务器上查看
```bash
# SSH 登录服务器
ssh root@8.153.110.212

# 查看 PM2 日志
pm2 logs member-system

# 查看最近的日志
pm2 logs member-system --lines 50
```

## 安全提示

⚠️ **重要:**
- `deploy_key` (私钥) 和 `deploy_key.pub` (公钥) 已添加到 .gitignore
- 这两个文件**永远不会**被提交到 Git 仓库
- 请妥善保管私钥文件,不要分享给他人
- 服务器密码 (`ChangeMe2026!Secure`) 已通过 SSH 密钥认证替代,更加安全

## 故障排查

### 部署失败
1. 检查 GitHub Actions 日志,查看具体错误信息
2. 确认所有 Secrets 配置正确
3. 确认服务器的 SSH 公钥已正确添加

### 应用无法访问
```bash
# SSH 登录服务器
ssh root@8.153.110.212

# 检查 PM2 状态
pm2 status

# 重启应用
pm2 restart member-system

# 查看日志
pm2 logs member-system --lines 100
```

### 数据库连接问题
确认服务器上的 `.env` 文件存在且配置正确:
```bash
cat /www/wwwroot/member-system/.env
```

## 下次部署只需要

```bash
# 修改代码后
git add .
git commit -m "描述您的修改"
git push

# 就完成了!GitHub Actions 会自动部署 🎉
```

---

**创建时间:** 2026-01-23
**服务器:** 8.153.110.212
**部署路径:** /www/wwwroot/member-system
