# 🚀 御朔复盘会员系统 - 部署更新指南

**版本**: v2.0
**更新时间**: 2026-01-04
**重大变更**: 完整系统重构，数据库结构变更

---

## ⚠️ 重要提示

**本次更新包含数据库结构重大变更！**

- ✅ 已自动备份原数据库
- ✅ 会完全重建数据库为新结构
- ✅ 创建测试数据供验证
- ⚠️ 旧数据不会自动迁移（如需迁移请联系开发者）

---

## 🎯 本次更新内容

### ✅ 修复的核心问题

1. **登录后不显示登录状态** ✅ 已修复
   - 修正数据库查询，正确获取会员信息

2. **生成激活码后看不到** ✅ 已修复
   - 修正API字段名和返回格式

3. **激活码无法升级会员** ✅ 已修复
   - 完全重写激活逻辑
   - 支持会员延期（同等级叠加天数）
   - 支持会员升级（高等级覆盖）

4. **数据库设计与代码不匹配** ✅ 已修复
   - 重新设计简化的数据库结构
   - 匹配实际业务逻辑

### 🆕 新增功能

- ✅ 完整的事务处理（数据一致性保证）
- ✅ 终身会员特殊处理
- ✅ 批次管理（激活码批量生成）
- ✅ 完善的日志系统（登录日志、操作审计）

---

## 📋 一键部署步骤

### 🔧 在服务器上执行

连接到您的服务器后，按以下步骤操作：

```bash
# 1. 进入项目目录
cd /www/wwwroot/member-system

# 2. 拉取最新代码
git pull origin main

# 3. 赋予执行权限
chmod +x scripts/update-and-deploy.sh

# 4. 执行自动部署（一键完成所有操作）
bash scripts/update-and-deploy.sh
```

**就这么简单！** 🎉

脚本会自动完成：
- ✅ 备份现有数据库 → `/www/backups/member-system-backup-YYYYMMDD_HHMMSS.sql`
- ✅ 重建数据库为新结构
- ✅ 创建测试账号和激活码
- ✅ 安装依赖
- ✅ 构建应用
- ✅ 重启PM2进程
- ✅ 验证部署结果

---

## ✅ 部署完成后验证

### 1. 检查应用状态

```bash
pm2 status
```

应该看到 `member-system` 状态为 `online` ✅

### 2. 查看日志

```bash
pm2 logs member-system --lines 20
```

应该看到 `✓ Ready in XXXms` ✅

### 3. 测试访问

在浏览器打开：
- **主页**: http://8.153.110.212
- **会员中心**: http://8.153.110.212/member
- **后台管理**: http://8.153.110.212/admin

---

## 🔑 测试账号

### 管理员账号
- **邮箱**: `admin@example.com`
- **密码**: `Admin123456`
- **用途**: 登录后台管理，生成激活码

### 测试用户账号
- **邮箱**: `zhangsan@example.com`
- **密码**: `Test123456`
- **会员等级**: 月度会员（30天后过期）
- **用途**: 测试会员功能

### 测试激活码

数据库中已预生成4个测试激活码：

```bash
# 查看测试激活码
mysql -uroot -p'ChangeMe2026!Secure' -e "
USE member_system;
SELECT code, level, duration_days, used
FROM activation_codes
WHERE batch_id = 'test-batch-001';"
```

激活码列表：
- `MONTHLY-TEST-2026-001` - 月度会员（30天）
- `QUARTERLY-TEST-2026-001` - 季度会员（90天）
- `YEARLY-TEST-2026-001` - 年度会员（365天）
- `LIFETIME-TEST-2026-001` - 终身会员（永久）

---

## 🧪 完整测试流程

### 测试1: 注册新用户

1. 访问 http://8.153.110.212/register
2. 填写：
   - 用户名: `testuser`
   - 邮箱: `test@example.com`
   - 密码: `Test123456`
3. 点击注册
4. ✅ 应该提示"注册成功"

### 测试2: 登录

1. 访问 http://8.153.110.212/login
2. 使用刚注册的账号登录
3. ✅ 应该跳转到会员中心，显示"未激活"状态

### 测试3: 激活会员

1. 在会员中心输入激活码：`MONTHLY-TEST-2026-001`
2. 点击激活
3. ✅ 应该提示"会员激活成功！您现在是月度会员"
4. ✅ 页面刷新后显示会员等级和到期时间

### 测试4: 访问产品

1. 点击"板块节奏系统"的"立即访问"
2. ✅ 应该成功跳转到 https://bk.yushuo.click

### 测试5: 后台管理

1. 访问 http://8.153.110.212/admin
2. 使用管理员账号登录（`admin@example.com`）
3. 进入"激活码管理"
4. 生成5个月度会员激活码
5. ✅ 应该看到5个新生成的激活码

### 测试6: 会员管理

1. 在后台进入"会员管理"
2. ✅ 应该看到所有用户列表
3. 点击调整某个用户的会员等级
4. ✅ 应该能成功修改

---

## 🗄️ 数据库结构说明

### 核心表

#### users（用户表）
```sql
- id: 用户ID
- username: 用户名（唯一）
- email: 邮箱（唯一）
- password_hash: 密码哈希
- created_at: 创建时间
```

#### memberships（会员表）
```sql
- id: 会员ID
- user_id: 用户ID（唯一，一对一）
- level: 会员等级（none/monthly/quarterly/yearly/lifetime）
- expires_at: 到期时间（lifetime为NULL）
- activated_at: 最后激活时间
```

#### activation_codes（激活码表）
```sql
- id: 激活码ID
- code: 激活码（唯一）
- level: 会员等级
- duration_days: 有效天数
- used: 是否已使用（0/1）
- used_by: 使用者ID
- used_at: 使用时间
- admin_id: 生成管理员ID
- batch_id: 批次ID
```

#### products（产品表）
```sql
- slug: 产品标识（bk/xinli/fuplan）
- name: 产品名称
- url: 产品URL
- required_level: 所需会员等级
```

#### admins（管理员表）
```sql
- username: 管理员用户名
- email: 邮箱
- password_hash: 密码哈希
- role: 角色（admin/super_admin）
```

---

## 🔧 常见问题排查

### 问题1: 部署脚本执行失败

**症状**: 脚本中途报错

**解决方案**:
```bash
# 检查MySQL是否运行
systemctl status mysql

# 检查MySQL密码是否正确
mysql -uroot -p'ChangeMe2026!Secure' -e "SELECT 1;"

# 手动执行数据库初始化
mysql -uroot -p'ChangeMe2026!Secure' < scripts/init-database-v2.sql
```

### 问题2: 应用启动失败

**症状**: PM2显示状态为 `errored` 或 `stopped`

**解决方案**:
```bash
# 查看详细错误日志
pm2 logs member-system --lines 100

# 检查端口是否被占用
netstat -tlnp | grep 3000

# 手动启动测试
cd /www/wwwroot/member-system
npm run build
npm run start
```

### 问题3: 登录失败

**症状**: 提示"邮箱或密码错误"但密码确认正确

**解决方案**:
```bash
# 检查users表是否有数据
mysql -uroot -p'ChangeMe2026!Secure' -e "
USE member_system;
SELECT id, username, email FROM users;
"

# 检查memberships表
mysql -uroot -p'ChangeMe2026!Secure' -e "
USE member_system;
SELECT u.username, m.level, m.expires_at
FROM users u
LEFT JOIN memberships m ON u.id = m.user_id;
"
```

### 问题4: 激活码无法使用

**症状**: 提示"激活码不存在"或"激活码已使用"

**解决方案**:
```bash
# 查看激活码状态
mysql -uroot -p'ChangeMe2026!Secure' -e "
USE member_system;
SELECT code, level, used, used_by, expires_at
FROM activation_codes
WHERE code = 'YOUR-CODE-HERE';
"

# 如果激活码被误标记为已使用，重置状态
mysql -uroot -p'ChangeMe2026!Secure' -e "
USE member_system;
UPDATE activation_codes
SET used = 0, used_by = NULL, used_at = NULL
WHERE code = 'YOUR-CODE-HERE';
"
```

### 问题5: 无法访问80端口

**症状**: http://8.153.110.212 无法访问，但 http://8.153.110.212:3000 可以

**解决方案**:
```bash
# 检查Nginx状态
systemctl status nginx

# 检查Nginx配置
nginx -t

# 重启Nginx
systemctl restart nginx

# 检查阿里云安全组是否开放80端口
# 需要在阿里云控制台手动配置
```

---

## 📊 性能优化建议

### 1. 添加数据库索引（已自动完成）

所有关键字段已添加索引，无需手动操作。

### 2. 启用Redis缓存（可选）

```bash
# 安装Redis
apt install redis-server

# 配置环境变量
echo "REDIS_URL=redis://localhost:6379" >> .env.production

# 重启应用
pm2 restart member-system
```

### 3. 定期清理日志

```bash
# 添加到crontab（每周清理一次）
crontab -e

# 添加以下行
0 0 * * 0 mysql -uroot -p'ChangeMe2026!Secure' -e "USE member_system; DELETE FROM login_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);"
```

---

## 🔒 安全建议

### 1. 修改默认管理员密码（重要！）

```bash
# 方法1: 通过后台界面修改（推荐）
# 登录后台 → 个人设置 → 修改密码

# 方法2: 通过数据库修改
mysql -uroot -p'ChangeMe2026!Secure'

USE member_system;
UPDATE admins
SET password_hash = '新的bcrypt哈希'
WHERE email = 'admin@example.com';
```

### 2. 修改MySQL密码

```bash
# 修改MySQL密码
mysql -uroot -p'ChangeMe2026!Secure' -e "
ALTER USER 'root'@'localhost' IDENTIFIED BY '新的超强密码';
"

# 更新.env.production
nano /www/wwwroot/member-system/.env.production
# 修改 DB_PASSWORD=新的超强密码

# 重启应用
pm2 restart member-system
```

### 3. 配置HTTPS（域名备案后）

```bash
# 安装certbot
apt install certbot python3-certbot-nginx

# 获取SSL证书
certbot --nginx -d yushuofupan.com -d www.yushuofupan.com

# 自动续期
certbot renew --dry-run
```

---

## 📞 技术支持

### 查看系统状态

```bash
# 应用状态
pm2 status
pm2 monit

# 系统资源
htop

# 磁盘空间
df -h

# 数据库大小
mysql -uroot -p'ChangeMe2026!Secure' -e "
SELECT
  table_schema AS 'Database',
  ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.tables
WHERE table_schema = 'member_system'
GROUP BY table_schema;
"
```

### 导出数据备份

```bash
# 导出完整数据库
mysqldump -uroot -p'ChangeMe2026!Secure' member_system > backup-$(date +%Y%m%d).sql

# 仅导出用户和会员数据
mysqldump -uroot -p'ChangeMe2026!Secure' member_system users memberships > users-backup.sql

# 仅导出激活码数据
mysqldump -uroot -p'ChangeMe2026!Secure' member_system activation_codes > codes-backup.sql
```

### 恢复数据

```bash
# 从备份恢复
mysql -uroot -p'ChangeMe2026!Secure' member_system < backup-20260104.sql
```

---

## 🎓 下一步优化计划

查看完整的优化方案：`docs/OPTIMIZATION-PLAN.md`

**Phase 1** (本周):
- ✅ 核心功能修复（已完成）
- 🔄 添加产品访问日志
- 🔄 实现Token刷新机制
- 🔄 添加登录失败限制

**Phase 2** (下周):
- 📊 数据统计优化
- 📦 批量操作功能
- 📁 数据导出功能

**Phase 3** (月内):
- ⏰ 会员到期提醒
- 🔄 会员续费功能
- 🎫 优惠券系统

---

## 💤 晚安提示

恭喜！系统已完全修复并优化。您现在可以：

1. ✅ 正常注册登录
2. ✅ 生成和使用激活码
3. ✅ 管理会员等级
4. ✅ 访问所有产品

**明天起来记得**：
- 🔒 修改默认管理员密码
- 🔍 测试所有功能
- 🌐 配置阿里云安全组开放80端口（如还未配置）

**晚安！** 🌙✨

---

**文档版本**: v2.0
**最后更新**: 2026-01-04
**维护者**: Claude Code

如有问题，请查看 `docs/OPTIMIZATION-PLAN.md` 或检查日志文件。
