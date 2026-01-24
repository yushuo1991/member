# SSH免密登录配置指南

## 服务器信息
- 主机: 8.153.110.212
- 用户: root
- 密钥: deploy_key (已存在于项目目录)

## 方案一: 自动配置（推荐）

直接运行批处理脚本：
```cmd
配置SSH免密登录.bat
```

该脚本会自动完成：
1. 上传公钥到服务器
2. 复制密钥到 ~/.ssh 目录
3. 配置 SSH config 文件
4. 测试免密登录

## 方案二: 手动配置

### 1. 上传公钥到服务器

```powershell
# 方式A: 使用 ssh-copy-id (推荐，如果有该命令)
ssh-copy-id -i deploy_key.pub root@8.153.110.212

# 方式B: 手动上传
type deploy_key.pub | ssh root@8.153.110.212 "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
```

输入服务器密码后，公钥将被添加到服务器的 `~/.ssh/authorized_keys`

### 2. 复制密钥到 .ssh 目录

```cmd
copy deploy_key %USERPROFILE%\.ssh\deploy_key
copy deploy_key.pub %USERPROFILE%\.ssh\deploy_key.pub
```

### 3. 配置 SSH config（可选但推荐）

创建或编辑 `%USERPROFILE%\.ssh\config` 文件，添加以下内容：

```
# 会员系统服务器
Host member-server
    HostName 8.153.110.212
    User root
    IdentityFile ~/.ssh/deploy_key
    StrictHostKeyChecking no
```

### 4. 测试免密登录

```cmd
# 方式1: 使用别名（需要先配置 SSH config）
ssh member-server

# 方式2: 直接使用密钥文件
ssh -i %USERPROFILE%\.ssh\deploy_key root@8.153.110.212

# 方式3: 使用项目目录下的密钥
ssh -i deploy_key root@8.153.110.212
```

## 验证配置

成功后应该能够无需密码直接登录：

```cmd
ssh member-server
```

登录后查看服务器信息：
```bash
uname -a
pm2 list
```

## 故障排查

### 问题1: 仍然提示输入密码

**解决方案：**
```bash
# 在服务器上检查权限
ssh root@8.153.110.212  # 最后一次输入密码

# 然后在服务器上执行
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys

# 检查公钥是否添加成功
cat ~/.ssh/authorized_keys
```

### 问题2: Permission denied (publickey)

**解决方案：**
```bash
# 检查本地密钥文件权限（Windows Git Bash）
chmod 600 deploy_key

# 或者重新生成密钥对
ssh-keygen -t ed25519 -f deploy_key -C "deploy-key"
```

### 问题3: 找不到密钥文件

**解决方案：**
```cmd
# 使用绝对路径
ssh -i "C:\Users\yushu\Desktop\我的会员体系\deploy_key" root@8.153.110.212
```

## 使用说明

配置成功后，所有需要 SSH 连接服务器的操作都可以免密进行：

### 1. 日常登录
```cmd
ssh member-server
```

### 2. 执行远程命令
```cmd
ssh member-server "pm2 list"
ssh member-server "cd /www/wwwroot/member-system && git pull"
```

### 3. SCP 文件传输
```cmd
scp -i %USERPROFILE%\.ssh\deploy_key localfile.txt root@8.153.110.212:/tmp/
```

### 4. GitHub Actions 部署
已经在使用 `deploy_key` 作为 `DEPLOY_SSH_KEY` secret，无需额外配置。

## 安全建议

1. **保护私钥文件**：不要将 `deploy_key` 提交到 Git
   - 已在 `.gitignore` 中排除

2. **定期轮换密钥**：建议每 3-6 个月更换一次

3. **使用不同密钥**：开发和生产环境使用不同的密钥对

4. **备份密钥**：将 `deploy_key` 保存到安全的地方

## 快速参考

```cmd
# 快速登录
ssh member-server

# 查看 PM2 状态
ssh member-server "pm2 list"

# 查看日志
ssh member-server "pm2 logs member-system --lines 50"

# 重启服务
ssh member-server "pm2 restart member-system"

# 部署更新
ssh member-server "cd /www/wwwroot/member-system && git pull && npm install && pm2 restart member-system"
```
