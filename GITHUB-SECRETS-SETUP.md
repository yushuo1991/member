# GitHub Secrets 配置指南

## 📋 什么是GitHub Secrets？

GitHub Secrets是安全存储敏感信息（如密码、API密钥）的方式。配置后，GitHub Actions可以通过SSH自动部署到您的服务器。

---

## 🔐 需要配置的Secrets

在GitHub仓库设置中添加以下6个Secrets：

| Secret名称 | 值 | 说明 |
|-----------|-----|------|
| `SERVER_HOST` | `8.153.110.212` | 服务器IP地址 |
| `SERVER_USER` | `root` | SSH登录用户名 |
| `SERVER_PASSWORD` | `7287843Wu` | SSH登录密码 ⚠️ 部署后请修改 |
| `DATABASE_URL` | `mysql://root:ChangeMe2026!Secure@localhost:3306/member_system` | 数据库连接字符串 |
| `JWT_SECRET` | `your-super-secret-jwt-key-2026` | JWT签名密钥（至少32位随机字符串） |
| `NEXT_PUBLIC_APP_URL` | `http://8.153.110.212:3000` | 应用访问URL |

---

## 📝 配置步骤（3分钟完成）

### 第一步：进入仓库设置

1. 打开GitHub仓库：https://github.com/yushuo1991/member
2. 点击顶部菜单栏的 **Settings**（设置）

### 第二步：进入Secrets页面

1. 在左侧菜单找到 **Secrets and variables**
2. 点击 **Actions**
3. 点击右上角绿色按钮 **New repository secret**

### 第三步：逐个添加Secrets

#### Secret 1: SERVER_HOST
- **Name**: `SERVER_HOST`
- **Value**: `8.153.110.212`
- 点击 **Add secret**

#### Secret 2: SERVER_USER
- **Name**: `SERVER_USER`
- **Value**: `root`
- 点击 **Add secret**

#### Secret 3: SERVER_PASSWORD
- **Name**: `SERVER_PASSWORD`
- **Value**: `7287843Wu`
- 点击 **Add secret**
- ⚠️ **重要提示**：部署成功后，请立即修改服务器root密码，并同步更新此Secret

#### Secret 4: DATABASE_URL
- **Name**: `DATABASE_URL`
- **Value**: `mysql://root:ChangeMe2026!Secure@localhost:3306/member_system`
- 点击 **Add secret**

#### Secret 5: JWT_SECRET
- **Name**: `JWT_SECRET`
- **Value**: 生成一个强随机密钥（至少32位）

**生成随机密钥方法：**
```bash
# 方法1：在线生成
访问：https://www.random.org/strings/
设置：长度32，数量1，包含字母+数字

# 方法2：使用OpenSSL（如果有）
openssl rand -base64 32

# 方法3：使用示例密钥（不推荐生产环境）
your-super-secret-jwt-key-2026-please-change-this
```

- 点击 **Add secret**

#### Secret 6: NEXT_PUBLIC_APP_URL
- **Name**: `NEXT_PUBLIC_APP_URL`
- **Value**: `http://8.153.110.212:3000`
- 点击 **Add secret**
- 📝 **备注**：域名备案通过后，修改为 `https://yushuofupan.com`

---

## ✅ 验证配置

配置完成后，在 **Secrets and variables > Actions** 页面应该看到6个Secrets：

```
✓ SERVER_HOST
✓ SERVER_USER
✓ SERVER_PASSWORD
✓ DATABASE_URL
✓ JWT_SECRET
✓ NEXT_PUBLIC_APP_URL
```

⚠️ **安全提示**：Secrets的值一旦保存后无法查看，只能更新或删除。

---

## 🚀 触发自动部署

### 方法1：推送代码触发（推荐）

配置完Secrets后，任何推送到`main`分支的commit都会自动触发部署：

```bash
# 在本地项目目录
cd C:\Users\yushu\Desktop\member-system

# 推送到GitHub（已经推送过了，所以创建一个空commit触发）
git commit --allow-empty -m "触发首次自动部署"
git push origin main
```

### 方法2：手动触发

1. 进入GitHub仓库：https://github.com/yushuo1991/member
2. 点击顶部菜单栏的 **Actions**
3. 在左侧选择 **Deploy to Production Server**
4. 点击右侧的 **Run workflow** 按钮
5. 选择分支 `main`
6. 点击绿色的 **Run workflow**

---

## 📊 查看部署进度

1. 进入 **Actions** 页面
2. 点击正在运行的workflow
3. 查看实时日志输出

**预计部署时间**：
- 首次部署（安装环境）：15-20分钟
- 后续部署（仅更新代码）：2-3分钟

---

## 🎯 部署成功标志

当看到以下输出时，表示部署成功：

```
🎉 部署成功！
========================================
访问地址:
  主页:     http://8.153.110.212:3000
  会员中心: http://8.153.110.212:3000/member
  后台管理: http://8.153.110.212:3000/admin

默认管理员账户:
  邮箱: admin@example.com
  密码: Admin123456
  ⚠️  请登录后立即修改密码！
========================================
```

---

## 🔧 自动部署做了什么？

### 首次部署（服务器环境为空时）

1. ✅ 克隆GitHub仓库到 `/www/wwwroot/member-system`
2. ✅ 安装Docker和Docker Compose
3. ✅ 安装Node.js 18+
4. ✅ 安装PM2进程管理器
5. ✅ 安装Nginx反向代理
6. ✅ 启动MySQL 8.0容器
7. ✅ 初始化数据库（创建7张表和初始数据）
8. ✅ 安装Node.js依赖
9. ✅ 构建Next.js应用
10. ✅ 使用PM2启动应用
11. ✅ 配置开机自启

### 后续部署（环境已安装时）

1. ✅ 拉取最新代码
2. ✅ 安装新依赖（如果有）
3. ✅ 重新构建应用
4. ✅ 重启PM2进程（零停机）
5. ✅ 健康检查

---

## ❓ 常见问题

### Q1: 配置Secrets后如何修改？

A: 进入 **Settings > Secrets and variables > Actions**，点击Secret名称旁边的 **Update** 按钮。

### Q2: 如果部署失败怎么办？

A:
1. 进入 **Actions** 页面查看失败日志
2. 常见原因：
   - SSH连接失败 → 检查 `SERVER_HOST`、`SERVER_USER`、`SERVER_PASSWORD`
   - 权限不足 → 确保使用 `root` 用户或有sudo权限的用户
   - 端口被占用 → 检查服务器3000端口是否被占用

### Q3: 如何查看部署后的应用状态？

A: SSH登录服务器后执行：
```bash
ssh root@8.153.110.212
pm2 status
pm2 logs member-system
```

### Q4: 如何回滚到之前的版本？

A:
```bash
# 方法1：在GitHub恢复之前的commit
git revert <commit-hash>
git push origin main

# 方法2：SSH到服务器手动回滚
cd /www/wwwroot/member-system
git reset --hard <previous-commit-hash>
pm2 restart member-system
```

### Q5: 域名备案通过后如何配置HTTPS？

A:
1. 更新 `NEXT_PUBLIC_APP_URL` Secret 为 `https://yushuofupan.com`
2. SSH登录服务器
3. 申请SSL证书：
```bash
certbot certonly --standalone -d yushuofupan.com -d www.yushuofupan.com
```
4. 配置Nginx（参考 `nginx.conf` 文件中的HTTPS配置）

---

## 🔒 安全最佳实践

1. ✅ **定期更新Secrets**：
   - 每3-6个月更新一次 `SERVER_PASSWORD`
   - 每年更新一次 `JWT_SECRET`

2. ✅ **最小权限原则**：
   - 考虑创建专用部署用户，而非使用root

3. ✅ **审计日志**：
   - 定期检查 **Actions** 页面的部署历史
   - 查看谁在何时触发了部署

4. ✅ **备份策略**：
   - 数据库自动每天备份（已配置）
   - 定期下载备份到本地

5. ✅ **监控告警**：
   - 配置GitHub Actions失败通知（邮件）
   - 使用PM2 Plus监控应用状态（可选）

---

## 📞 需要帮助？

如果遇到问题，请检查：
1. **GitHub Actions日志**：详细的部署过程输出
2. **服务器PM2日志**：`pm2 logs member-system`
3. **服务器系统日志**：`journalctl -xe`
4. **Nginx日志**：`tail -f /var/log/nginx/member_error.log`

---

**配置完成后，立即触发部署，让系统自动完成所有工作！** 🚀
