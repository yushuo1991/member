# 配置GitHub Actions自动部署

## 第一步：配置GitHub Secrets

访问：https://github.com/yushuo1991/member/settings/secrets/actions

点击 "New repository secret" 添加以下两个secrets：

### 1. DEPLOY_HOST
- Name: `DEPLOY_HOST`
- Value: `8.153.110.212`

### 2. DEPLOY_SSH_KEY
- Name: `DEPLOY_SSH_KEY`
- Value: 你的SSH私钥内容

**获取SSH私钥的方法：**

#### 方法A：使用现有的deploy_key（如果有）
```bash
# 在本地查看
cat deploy_key
```

然后复制整个内容（包括 `-----BEGIN OPENSSH PRIVATE KEY-----` 和 `-----END OPENSSH PRIVATE KEY-----`）

#### 方法B：生成新的SSH密钥
```bash
# 1. 在本地生成新密钥对
ssh-keygen -t rsa -b 4096 -f github-deploy-key -N ""

# 2. 查看私钥（用于GitHub Secret）
cat github-deploy-key

# 3. 查看公钥（需要添加到服务器）
cat github-deploy-key.pub

# 4. 在服务器上添加公钥
ssh root@8.153.110.212
mkdir -p ~/.ssh
echo "公钥内容" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
exit
```

## 第二步：触发部署

配置好Secrets后，有两种方式触发部署：

### 方式1：推送代码（自动触发）
```bash
cd "C:\Users\yushu\Desktop\我的会员体系"
git add .
git commit -m "描述你的修改"
git push origin main
```

只要`member-system/`目录有变化，就会自动触发部署。

### 方式2：手动触发
访问：https://github.com/yushuo1991/member/actions/workflows/deploy-optimized.yml

点击 "Run workflow" → "Run workflow"

## 第三步：查看部署状态

访问：https://github.com/yushuo1991/member/actions

查看最新的workflow运行状态：
- 🟡 黄色 = 正在运行
- ✅ 绿色 = 成功
- ❌ 红色 = 失败

点击进入可以看到详细日志。

## 当前状态

✅ 代码已推送到GitHub (commit: e195510)
⏳ 等待配置Secrets后自动部署

## 快速测试

配置好后，可以通过一个小改动测试：

```bash
cd member-system
echo "# Test deploy" >> README.md
git add README.md
git commit -m "test: 测试GitHub Actions部署"
git push origin main
```

然后访问 https://github.com/yushuo1991/member/actions 查看部署进度。

## 预计时间

- 配置Secrets: 2-3分钟
- 首次部署: 5-8分钟
- 后续部署: 3-5分钟

## 如果遇到问题

### 问题1: "Host key verification failed"
**解决**：在服务器上运行 `ssh-keyscan 8.153.110.212 >> ~/.ssh/known_hosts`

### 问题2: "Permission denied"
**解决**：确保公钥已正确添加到服务器的 `~/.ssh/authorized_keys`

### 问题3: workflow不触发
**解决**：确保修改的文件在 `member-system/` 目录下

---

**配置完成后，你只需要 `git push`，GitHub Actions会自动完成构建和部署！**
