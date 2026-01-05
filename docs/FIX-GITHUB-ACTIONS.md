# GitHub Actions 部署失败修复指南

## 🔴 问题现状
所有GitHub Actions workflow都失败了（红色❌）

## ✅ 完整修复步骤

### 第1步：获取正确的SSH私钥

**在服务器上执行**（你可以SSH连接后复制粘贴）：

```bash
# SSH连接到服务器
ssh root@8.153.110.212
# 密码: 7287483Wu

# 显示SSH私钥
cat ~/.ssh/github_actions_deploy_key
```

**复制完整输出**（从 `-----BEGIN` 到 `-----END`，包括这两行）

示例格式：
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmU...
（中间很多行）
...xxxxxxxxxxxxxx
-----END OPENSSH PRIVATE KEY-----
```

### 第2步：更新GitHub Secrets

1. **访问**: https://github.com/yushuo1991/member/settings/secrets/actions

2. **删除旧的 SERVER_SSH_KEY**（如果存在）
   - 找到 `SERVER_SSH_KEY`
   - 点击右边的 "Remove" 按钮

3. **重新添加 SERVER_SSH_KEY**
   - 点击 "New repository secret"
   - Name: `SERVER_SSH_KEY`
   - Secret: **粘贴第1步复制的完整私钥内容**
   - 点击 "Add secret"

4. **确认其他两个Secret存在**
   - `SERVER_HOST` = `8.153.110.212`
   - `SERVER_USER` = `root`

### 第3步：推送代码触发新的部署

**在你的Windows电脑命令行执行**：

```bash
cd C:\Users\yushu\Desktop\member-system

# 拉取最新代码
git pull origin main

# 推送触发部署
git push origin main
```

如果本地网络不通，可以在服务器上推送：

```bash
# 在服务器上
cd /root/member-system
git pull origin main
echo "# 测试自动部署修复 $(date)" >> test.txt
git add test.txt
git commit -m "测试GitHub Actions修复"
git push origin main
```

### 第4步：验证部署

1. **立即访问**: https://github.com/yushuo1991/member/actions

2. **查看最新workflow**
   - 应该看到新的运行记录
   - 黄色🟡 = 正在运行
   - 绿色✅ = 成功（目标！）
   - 红色❌ = 失败（需要进一步诊断）

3. **如果仍然失败**
   - 点击失败的workflow
   - 点击 "deploy" job
   - 展开 "通过SSH部署到服务器"
   - 复制错误信息给我

## 🔧 常见问题

### Q1: 私钥格式不对？
**确保**：
- 包括 `-----BEGIN OPENSSH PRIVATE KEY-----`
- 包括 `-----END OPENSSH PRIVATE KEY-----`
- 中间的所有行
- 没有多余的空格或空行

### Q2: 如何确认私钥正确？
执行：
```bash
ssh root@8.153.110.212 "wc -l ~/.ssh/github_actions_deploy_key"
```
应该显示约51行

### Q3: Secrets配置在哪里？
https://github.com/yushuo1991/member/settings/secrets/actions

### Q4: 如何测试SSH连接？
在服务器上执行：
```bash
ssh -i ~/.ssh/github_actions_deploy_key root@8.153.110.212 "echo 'SSH连接成功'"
```

## 📝 快速命令

**获取私钥（在服务器上）**：
```bash
ssh root@8.153.110.212
cat ~/.ssh/github_actions_deploy_key
```

**触发部署（本地）**：
```bash
cd C:\Users\yushu\Desktop\member-system
git push origin main
```

**查看Actions**: https://github.com/yushuo1991/member/actions

---

## 🎯 下一步

1. 执行第1步，获取SSH私钥
2. 更新GitHub Secrets中的 SERVER_SSH_KEY
3. 推送代码测试
4. 查看GitHub Actions是否变成绿色✅

**告诉我你执行到哪一步了，遇到什么问题！**
