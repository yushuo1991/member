# 会员系统 - 完整部署指南

## 📋 服务器信息

- **服务器IP**: `8.153.110.212`
- **SSH用户**: `root`
- **GitHub仓库**: https://github.com/yushuo1991/member
- **域名**: `yushuofupan.com`（⚠️ 域名备案中，部署期间使用IP访问）

---

## 🚀 快速部署（3步完成）

### 第一步：连接服务器

```bash
# 从您的本地电脑SSH连接到服务器
ssh root@8.153.110.212
# 输入密码：7287843Wu
```

### 第二步：一键安装环境（15分钟自动完成）

```bash
# 1. 克隆项目到服务器
cd /www/wwwroot
git clone https://github.com/yushuo1991/member.git member-system
cd member-system

# 2. 执行一键安装脚本（自动安装Docker、Node.js、Nginx、PM2、MySQL）
chmod +x scripts/server-setup.sh
./scripts/server-setup.sh

# 等待10-15分钟，脚本会自动完成：
# ✓ 安装 Docker 和 Docker Compose
# ✓ 安装 Node.js 18+
# ✓ 安装 PM2
# ✓ 安装 Nginx
# ✓ 配置防火墙
# ✓ 启动 MySQL 8.0 容器
```

**安装脚本会自动做什么？**
- ✅ 安装 Docker（用于运行MySQL）
- ✅ 安装 Node.js 18+（运行Next.js）
- ✅ 安装 PM2（进程守护）
- ✅ 安装 Nginx（反向代理）
- ✅ 启动 MySQL 容器（端口3306）
- ✅ 配置防火墙规则（开放22, 80, 443, 3000端口）
- ✅ 创建项目目录结构

### 第三步：初始化数据库并启动应用

```bash
# 1. 初始化数据库（导入表结构和初始数据）
docker exec -i mysql-member-system mysql -uroot -pChangeMe2026!Secure < scripts/init-database.sql

# 2. 验证数据库
docker exec -it mysql-member-system mysql -uroot -pChangeMe2026!Secure -e "USE member_system; SHOW TABLES;"

# 应该看到7张表：
# - users（用户表）
# - admins（管理员表）
# - activation_codes（激活码表）
# - products（产品表）
# - login_logs（登录日志表）
# - rate_limits（限流表）

# 3. 安装Node.js依赖
npm install

# 4. 配置环境变量
cp .env.example .env
nano .env

# 修改以下内容：
# DB_HOST=localhost
# DB_PORT=3306
# DB_USER=root
# DB_PASSWORD=ChangeMe2026!Secure    # ⚠️ 请修改为您的强密码
# DB_NAME=member_system
# JWT_SECRET=your-super-secret-jwt-key   # ⚠️ 请修改为随机字符串（至少32位）

# 5. 构建应用
npm run build

# 6. 使用PM2启动应用
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup

# 7. 查看运行状态
pm2 status
pm2 logs member-system
```

**完成！** 🎉 应用现在运行在 `http://8.153.110.212:3000`

---

## 📊 访问地址

### 备案前（当前）

由于域名 `yushuofupan.com` 正在备案中，目前通过IP访问：

- **首页**: http://8.153.110.212:3000
- **会员中心**: http://8.153.110.212:3000/member
- **后台管理**: http://8.153.110.212:3000/admin
- **登录**: http://8.153.110.212:3000/login

### 备案后（配置Nginx + SSL）

域名备案通过后，执行以下步骤：

```bash
# 1. 申请SSL证书（Let's Encrypt）
sudo apt install certbot python3-certbot-nginx
sudo certbot certonly --standalone -d yushuofupan.com -d www.yushuofupan.com

# 2. 复制Nginx配置
sudo cp nginx.conf /etc/nginx/sites-available/member-system
sudo ln -s /etc/nginx/sites-available/member-system /etc/nginx/sites-enabled/

# 3. 测试并重载Nginx
sudo nginx -t
sudo systemctl reload nginx
```

域名配置完成后访问：

- **主站**: https://yushuofupan.com
- **后台**: https://yushuofupan.com/admin

---

## 🔐 默认账户

### 管理员账户

```
用户名: admin@example.com
密码: Admin123456
```

**⚠️ 重要安全提示**：
部署完成后，**请立即修改**管理员密码！

登录后台后，在数据库中更新密码：

```sql
-- 修改管理员密码（使用bcrypt加密）
-- 请使用bcrypt在线工具生成密码哈希后替换
UPDATE admins SET password_hash = '$2a$10$新的bcrypt哈希' WHERE email = 'admin@example.com';
```

---

## 🧪 功能测试清单

### 1. 用户注册流程

```bash
# 访问注册页面
http://8.153.110.212:3000/register

# 测试注册：
- 邮箱：test@example.com
- 用户名：testuser
- 密码：Test@123456

# 验证：在数据库中检查
docker exec -it mysql-member-system mysql -uroot -pChangeMe2026!Secure
> USE member_system;
> SELECT * FROM users WHERE email = 'test@example.com';
```

### 2. 用户登录流程

```bash
http://8.153.110.212:3000/login

# 使用刚注册的账户登录
- 邮箱：test@example.com
- 密码：Test@123456

# 登录成功后应跳转到会员中心
```

### 3. 管理员生成激活码

```bash
# 1. 登录后台
http://8.153.110.212:3000/admin

# 2. 使用默认管理员账户
- 邮箱：admin@example.com
- 密码：Admin123456

# 3. 在控制台或激活码管理页面生成激活码
- 会员等级：monthly（月度会员）
- 数量：10

# 4. 在数据库验证
> SELECT * FROM activation_codes ORDER BY created_at DESC LIMIT 10;
```

### 4. 激活会员等级

```bash
# 1. 登录普通用户账户（test@example.com）
# 2. 进入会员中心
# 3. 在激活表单中输入激活码
# 4. 验证：
> SELECT * FROM users WHERE email = 'test@example.com';
# 检查 membership_level 和 membership_expiry 是否已更新
```

### 5. 产品访问控制

```bash
# 测试访问产品API
curl -X GET http://8.153.110.212:3000/api/products/access/premium-content \
  -H "Cookie: auth_token=YOUR_TOKEN_HERE"

# 如果会员等级不足，应返回：
{
  "hasAccess": false,
  "requiredLevel": "monthly",
  "message": "需要monthly会员等级才能访问此产品"
}
```

---

## 📈 数据库备份

### 设置自动备份（每天凌晨3点）

```bash
# 1. 测试备份脚本
chmod +x scripts/backup-database.sh
./scripts/backup-database.sh

# 2. 查看备份文件
./scripts/backup-database.sh --list

# 3. 设置定时任务
crontab -e

# 添加以下行（每天凌晨3点自动备份）
0 3 * * * /www/wwwroot/member-system/scripts/backup-database.sh >> /var/log/member-backup.log 2>&1
```

### 手动备份

```bash
# 执行备份
./scripts/backup-database.sh

# 查看备份列表
./scripts/backup-database.sh --list

# 恢复备份
./scripts/backup-database.sh --restore /www/backups/member_system_20240104_150000.sql.gz

# 生成备份报告
./scripts/backup-database.sh --report
```

---

## 🔧 常用运维命令

### PM2 进程管理

```bash
# 查看应用状态
pm2 status

# 查看实时日志
pm2 logs member-system

# 重启应用
pm2 restart member-system

# 停止应用
pm2 stop member-system

# 删除应用
pm2 delete member-system

# 保存当前配置
pm2 save

# 查看监控面板
pm2 monit
```

### Docker 容器管理

```bash
# 查看MySQL容器状态
docker ps -a

# 查看MySQL日志
docker logs mysql-member-system

# 进入MySQL容器
docker exec -it mysql-member-system /bin/bash

# 重启MySQL容器
docker restart mysql-member-system

# 停止MySQL容器
docker stop mysql-member-system

# 启动MySQL容器
docker start mysql-member-system
```

### Nginx 管理

```bash
# 测试配置
sudo nginx -t

# 重载配置
sudo systemctl reload nginx

# 重启Nginx
sudo systemctl restart nginx

# 查看状态
sudo systemctl status nginx

# 查看日志
sudo tail -f /var/log/nginx/member_access.log
sudo tail -f /var/log/nginx/member_error.log
```

### 数据库操作

```bash
# 连接MySQL
docker exec -it mysql-member-system mysql -uroot -pChangeMe2026!Secure

# 常用SQL命令
USE member_system;
SHOW TABLES;
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM activation_codes WHERE is_used = FALSE;
```

---

## 🔄 自动部署（GitHub Actions）

项目已配置GitHub Actions自动部署，推送到main分支后自动部署到服务器。

### 配置GitHub Secrets

在GitHub仓库设置中添加以下Secrets：

1. `SERVER_HOST` = `8.153.110.212`
2. `SERVER_USER` = `root`
3. `SERVER_PASSWORD` = `您的SSH密码`
4. `DATABASE_URL` = `mysql://root:ChangeMe2026!Secure@localhost:3306/member_system`
5. `JWT_SECRET` = `您的JWT密钥`
6. `NEXT_PUBLIC_APP_URL` = `http://8.153.110.212:3000`

### 触发自动部署

```bash
# 在本地修改代码后
git add .
git commit -m "更新功能"
git push origin main

# GitHub Actions 会自动：
# 1. 拉取最新代码
# 2. 安装依赖
# 3. 构建应用
# 4. 部署到服务器
# 5. 重启PM2进程
```

---

## ⚠️ 重要安全配置

### 1. 修改默认密码

```bash
# MySQL密码（推荐修改）
# 进入容器后执行：
ALTER USER 'root'@'localhost' IDENTIFIED BY 'YOUR_NEW_STRONG_PASSWORD';
ALTER USER 'root'@'%' IDENTIFIED BY 'YOUR_NEW_STRONG_PASSWORD';
FLUSH PRIVILEGES;

# 同时修改 .env 文件中的 DB_PASSWORD
```

### 2. JWT密钥（必须修改）

```bash
# 生成强随机密钥（至少32位）
openssl rand -base64 32

# 修改 .env 文件
JWT_SECRET=生成的随机字符串
```

### 3. 防火墙规则（已自动配置）

```bash
# 查看防火墙状态
sudo ufw status

# 应该看到：
# 22/tcp   ALLOW（SSH）
# 80/tcp   ALLOW（HTTP）
# 443/tcp  ALLOW（HTTPS）
# 3000/tcp ALLOW（Next.js）
```

### 4. 定期更新

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 更新Node.js依赖（检查安全漏洞）
npm audit
npm audit fix

# 更新Docker镜像
docker pull mysql:8.0
docker restart mysql-member-system
```

---

## 🐛 常见问题排查

### 问题1: PM2启动失败

```bash
# 检查Node.js版本（需要18+）
node -v

# 检查构建是否成功
ls -la .next/standalone

# 查看详细错误日志
pm2 logs member-system --lines 100
```

### 问题2: 数据库连接失败

```bash
# 检查MySQL容器是否运行
docker ps -a

# 测试数据库连接
docker exec -it mysql-member-system mysql -uroot -pChangeMe2026!Secure -e "SELECT 1"

# 检查环境变量
cat .env | grep DB_
```

### 问题3: Nginx 502 Bad Gateway

```bash
# 检查PM2应用是否运行
pm2 status

# 检查端口占用
netstat -tuln | grep 3000

# 查看Nginx错误日志
sudo tail -f /var/log/nginx/error.log
```

### 问题4: 激活码无法使用

```bash
# 检查激活码表
docker exec -it mysql-member-system mysql -uroot -pChangeMe2026!Secure

> USE member_system;
> SELECT * FROM activation_codes WHERE code = 'YOUR_CODE_HERE';

# 检查是否已使用、是否过期
```

---

## 📞 技术支持

如遇到问题，请检查：

1. **PM2日志**: `pm2 logs member-system`
2. **Nginx日志**: `/var/log/nginx/member_error.log`
3. **MySQL日志**: `docker logs mysql-member-system`
4. **系统日志**: `/var/log/syslog`

---

## 🎯 下一步优化建议

部署成功后，建议进行以下优化：

1. ✅ 配置CDN（加速静态资源）
2. ✅ 启用Redis缓存（提升性能）
3. ✅ 配置监控告警（PM2 Plus或自建）
4. ✅ 设置日志轮转（避免日志文件过大）
5. ✅ 配置HTTPS证书（域名备案后）
6. ✅ 添加邮件通知功能
7. ✅ 实现数据库主从复制（高可用）

---

## 📚 相关文档

- [README.md](./README.md) - 项目说明
- [API文档](./docs/API-DOCS.md) - API接口文档
- [管理员手册](./docs/ADMIN-GUIDE.md) - 管理员使用手册

---

**部署完成！享受您的会员管理系统！** 🚀
