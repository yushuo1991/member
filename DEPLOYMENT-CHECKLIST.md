# 宇硕会员体系 - 部署检查清单

**最后更新**: 2026-02-07
**版本**: 1.0.0

本文档提供了部署宇硕会员体系到生产环境的完整检查清单。

## 目录

1. [部署前检查](#部署前检查)
2. [环境变量配置](#环境变量配置)
3. [数据库迁移](#数据库迁移)
4. [Sentry 配置](#sentry-配置)
5. [性能优化验证](#性能优化验证)
6. [安全检查](#安全检查)
7. [部署步骤](#部署步骤)
8. [部署后验证](#部署后验证)
9. [回滚计划](#回滚计划)
10. [监控和告警](#监控和告警)

---

## 部署前检查

### 代码质量检查

- [ ] 所有测试通过
  ```bash
  pnpm test
  ```

- [ ] 类型检查通过
  ```bash
  pnpm type-check
  ```

- [ ] Lint 检查通过
  ```bash
  pnpm lint
  ```

- [ ] 没有 console.log 调试代码（除了日志记录）

- [ ] 没有 TODO 或 FIXME 注释（或已记录在 issue 中）

- [ ] 代码审查已完成

- [ ] 所有依赖已更新到最新安全版本
  ```bash
  pnpm audit
  ```

### 功能验证

- [ ] 所有新功能已在测试环境验证

- [ ] 回归测试已完成

- [ ] 用户流程已测试（登录、注册、激活、购买等）

- [ ] 管理员功能已测试

- [ ] 错误处理已测试

- [ ] 边界情况已测试

### 文档检查

- [ ] API 文档已更新

- [ ] 数据库 schema 变更已记录

- [ ] 部署说明已更新

- [ ] 已知问题已记录

---

## 环境变量配置

### 必需的环境变量

#### 数据库配置

```bash
# 生产数据库
DB_HOST=prod-db.example.com
DB_PORT=3306
DB_USER=prod_user
DB_PASSWORD=strong_password_here
DB_NAME=member_system

# 确保密码满足以下要求：
# - 至少 16 个字符
# - 包含大小写字母、数字和特殊字符
# - 不包含数据库用户名
```

检查清单：
- [ ] 数据库主机可访问
- [ ] 数据库用户有正确的权限
- [ ] 数据库连接池配置正确
- [ ] 备份已配置

#### JWT 配置

```bash
# JWT 密钥（必须至少 32 个字符）
JWT_SECRET=your_very_long_secret_key_at_least_32_characters_long

# JWT 过期时间
JWT_EXPIRES_IN=7d
```

检查清单：
- [ ] JWT_SECRET 长度至少 32 个字符
- [ ] JWT_SECRET 已安全存储（不在代码中）
- [ ] JWT_SECRET 已备份
- [ ] JWT_EXPIRES_IN 设置合理

#### Sentry 配置

```bash
# Sentry DSN（服务端）
SENTRY_DSN=https://your-sentry-dsn@sentry.io/your-project-id

# Sentry DSN（客户端）
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/your-project-id

# Sentry 组织和项目
SENTRY_ORG=your-organization-slug
SENTRY_PROJECT=web  # 或 bk, fuplan, xinli

# Sentry 认证令牌（用于上传源码映射）
SENTRY_AUTH_TOKEN=your-auth-token-here

# Release 版本
SENTRY_RELEASE=web@1.0.0
NEXT_PUBLIC_SENTRY_RELEASE=web@1.0.0
```

检查清单：
- [ ] Sentry 项目已创建
- [ ] DSN 已验证
- [ ] Auth Token 已生成并有正确权限
- [ ] Release 版本号已设置

#### 应用配置

```bash
# 环境
NODE_ENV=production

# 应用端口
PORT=3000

# 应用 URL
APP_URL=https://member.example.com

# 日志级别
LOG_LEVEL=info
```

检查清单：
- [ ] NODE_ENV 设置为 production
- [ ] APP_URL 使用 HTTPS
- [ ] 所有应用的 PORT 不冲突

### 环境变量验证

```bash
# 验证所有应用的环境变量
pnpm validate-env:web
pnpm validate-env:bk
pnpm validate-env:fuplan
pnpm validate-env:xinli
```

检查清单：
- [ ] 所有必需的环境变量已设置
- [ ] 没有多余的环境变量
- [ ] 所有值的格式正确
- [ ] 敏感信息已安全存储

---

## 数据库迁移

### 备份

```bash
# 备份所有数据库
mysqldump -u root -p --all-databases > backup_$(date +%Y%m%d_%H%M%S).sql

# 备份特定数据库
mysqldump -u root -p member_system > member_system_backup_$(date +%Y%m%d_%H%M%S).sql
mysqldump -u root -p bk_system > bk_system_backup_$(date +%Y%m%d_%H%M%S).sql
mysqldump -u root -p fuplan_system > fuplan_system_backup_$(date +%Y%m%d_%H%M%S).sql
mysqldump -u root -p xinli_system > xinli_system_backup_$(date +%Y%m%d_%H%M%S).sql
```

检查清单：
- [ ] 备份文件已创建
- [ ] 备份文件大小合理
- [ ] 备份文件已验证（可以恢复）
- [ ] 备份文件已存储在安全位置

### 数据库初始化

```bash
# 初始化数据库 schema
mysql -u root -p < database-init-v2.1-FIXED.sql

# 创建产品内容表
mysql -u root -p < scripts/create-product-contents-table.sql
```

检查清单：
- [ ] 所有表已创建
- [ ] 所有列的类型正确
- [ ] 所有约束已应用
- [ ] 初始数据已插入

### 数据库索引优化

```bash
# 应用索引优化
mysql -u root -p member_system < database-indexes.sql

# 分析表
mysql -u root -p member_system -e "ANALYZE TABLE users, memberships, activation_codes, trial_logs, login_logs, user_product_purchases, products, rate_limits, admin_audit_logs;"
```

检查清单：
- [ ] 所有索引已创建
- [ ] 索引名称没有冲突
- [ ] 表已分析
- [ ] 查询性能已验证

### 数据迁移

如果从旧系统迁移：

```bash
# 导入用户数据
mysql -u root -p member_system < migration/users.sql

# 导入会员数据
mysql -u root -p member_system < migration/memberships.sql

# 导入激活码数据
mysql -u root -p member_system < migration/activation_codes.sql
```

检查清单：
- [ ] 数据迁移脚本已测试
- [ ] 数据完整性已验证
- [ ] 没有数据丢失
- [ ] 数据格式正确

---

## Sentry 配置

### Sentry 项目设置

- [ ] 为每个应用创建独立的 Sentry 项目
  - [ ] web - 会员管理系统
  - [ ] bk - 板块节奏系统
  - [ ] fuplan - 复盘系统
  - [ ] xinli - 心理测评系统

- [ ] 获取每个项目的 DSN

- [ ] 创建 Auth Token（权限：project:read, project:releases, org:read）

### Sentry 告警配置

- [ ] 配置错误率告警
  - [ ] 错误率突增 > 10%
  - [ ] 新错误出现

- [ ] 配置性能告警
  - [ ] 响应时间 > 1000ms
  - [ ] 数据库查询 > 500ms

- [ ] 配置通知渠道
  - [ ] Email 通知
  - [ ] Slack 集成（可选）
  - [ ] 钉钉集成（可选）

### Sentry 数据清理

- [ ] 配置数据保留期（建议 90 天）

- [ ] 配置敏感数据过滤规则
  - [ ] 过滤密码
  - [ ] 过滤 JWT token
  - [ ] 过滤 API key
  - [ ] 过滤个人信息

- [ ] 测试数据清理规则

检查清单：
- [ ] 所有 Sentry 配置已验证
- [ ] 告警规则已测试
- [ ] 通知渠道已测试
- [ ] 数据清理规则已应用

---

## 性能优化验证

### 数据库性能

```bash
# 检查慢查询日志
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;

# 查看表统计信息
SHOW TABLE STATUS LIKE 'users';
SHOW TABLE STATUS LIKE 'memberships';

# 检查索引使用情况
SELECT * FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = 'member_system';
```

检查清单：
- [ ] 没有慢查询（> 2 秒）
- [ ] 所有索引都被使用
- [ ] 表大小合理
- [ ] 查询执行计划优化

### 应用性能

```bash
# 检查内存使用
node --max-old-space-size=4096 app.js

# 检查 CPU 使用
top -p $(pgrep -f "node.*app.js")

# 检查响应时间
curl -w "@curl-format.txt" -o /dev/null -s https://member.example.com/api/health
```

检查清单：
- [ ] 内存使用 < 500MB
- [ ] CPU 使用 < 50%
- [ ] 响应时间 < 200ms
- [ ] 没有内存泄漏

### 缓存配置

- [ ] Redis 缓存已配置（如果使用）
- [ ] 缓存键命名规范已定义
- [ ] 缓存过期时间已设置
- [ ] 缓存预热脚本已准备

检查清单：
- [ ] 缓存命中率 > 80%
- [ ] 缓存大小 < 1GB
- [ ] 缓存一致性已验证

---

## 安全检查

### 密码和密钥

- [ ] 所有密钥长度 >= 32 个字符
- [ ] 没有硬编码的密钥
- [ ] 密钥已安全存储（环境变量或密钥管理系统）
- [ ] 密钥已定期轮换计划

### 数据库安全

- [ ] 数据库用户权限最小化
- [ ] 数据库连接使用 SSL/TLS
- [ ] 数据库备份已加密
- [ ] 数据库访问已记录

```bash
# 检查数据库用户权限
SELECT user, host, authentication_string FROM mysql.user;

# 检查数据库权限
SHOW GRANTS FOR 'prod_user'@'localhost';
```

### API 安全

- [ ] HTTPS 已启用
- [ ] CORS 已正确配置
- [ ] 速率限制已启用
- [ ] 输入验证已实施（Zod schemas）
- [ ] SQL 注入防护已实施（参数化查询）
- [ ] XSS 防护已实施

### 认证和授权

- [ ] JWT 签名算法安全（HS256 或更强）
- [ ] JWT 过期时间合理（7 天）
- [ ] 刷新令牌机制已实施
- [ ] 管理员权限检查已实施
- [ ] 会话超时已配置

### 日志和监控

- [ ] 敏感数据不在日志中
- [ ] 日志级别设置为 info（生产环境）
- [ ] 日志已持久化
- [ ] 日志轮换已配置
- [ ] 日志访问已限制

检查清单：
- [ ] 安全审计已完成
- [ ] 没有已知的安全漏洞
- [ ] 依赖项已检查漏洞
- [ ] 安全补丁已应用

---

## 部署步骤

### 1. 构建应用

```bash
# 清理旧构建
pnpm clean

# 安装依赖
pnpm install

# 构建所有应用
pnpm build

# 验证构建
ls -la apps/web/.next
ls -la apps/bk/.next
ls -la apps/fuplan/.next
ls -la apps/xinli/.next
```

检查清单：
- [ ] 构建成功完成
- [ ] 没有构建错误
- [ ] 没有构建警告
- [ ] 构建产物大小合理

### 2. 部署到服务器

```bash
# 使用 PM2 部署
pm2 start ecosystem.config.monorepo.js --env production

# 验证进程
pm2 list
pm2 describe member-web
pm2 describe member-bk
pm2 describe member-fuplan
pm2 describe member-xinli

# 查看日志
pm2 logs member-web --lines 50
```

检查清单：
- [ ] 所有进程已启动
- [ ] 没有进程崩溃
- [ ] 日志没有错误
- [ ] 应用可访问

### 3. 验证部署

```bash
# 检查应用健康状态
curl https://member.example.com/api/health
curl https://bk.example.com/api/health
curl https://fuplan.example.com/api/health
curl https://xinli.example.com/api/health

# 检查数据库连接
curl https://member.example.com/api/admin/dashboard/stats

# 检查 Sentry 连接
# 在 Sentry 仪表板中验证事件接收
```

检查清单：
- [ ] 所有应用返回 200 OK
- [ ] 数据库连接正常
- [ ] Sentry 接收事件
- [ ] 没有错误日志

---

## 部署后验证

### 功能验证

- [ ] 用户登录功能正常
- [ ] 用户注册功能正常
- [ ] 激活码激活功能正常
- [ ] 会员权限检查正常
- [ ] 产品购买功能正常
- [ ] 试用功能正常
- [ ] 管理员功能正常

### 性能验证

```bash
# 检查响应时间
ab -n 1000 -c 10 https://member.example.com/

# 检查数据库查询时间
# 查看 Sentry 性能监控

# 检查内存使用
pm2 monit
```

检查清单：
- [ ] 平均响应时间 < 200ms
- [ ] P95 响应时间 < 500ms
- [ ] 没有超时错误
- [ ] 内存使用稳定

### 安全验证

```bash
# 检查 HTTPS
curl -I https://member.example.com

# 检查安全头
curl -I https://member.example.com | grep -i "strict-transport-security"
curl -I https://member.example.com | grep -i "x-content-type-options"
curl -I https://member.example.com | grep -i "x-frame-options"

# 检查 CORS
curl -H "Origin: https://example.com" -I https://member.example.com
```

检查清单：
- [ ] HTTPS 已启用
- [ ] 安全头已设置
- [ ] CORS 配置正确
- [ ] 没有安全警告

### 监控验证

- [ ] Sentry 接收错误事件
- [ ] 日志系统正常工作
- [ ] 告警规则已触发（测试）
- [ ] 监控仪表板可访问

检查清单：
- [ ] 所有监控系统正常
- [ ] 告警通知已接收
- [ ] 没有监控盲点

---

## 回滚计划

### 快速回滚

如果部署后发现严重问题，执行以下步骤：

```bash
# 1. 停止当前应用
pm2 stop member-web member-bk member-fuplan member-xinli

# 2. 恢复上一个版本
git checkout HEAD~1

# 3. 重新构建
pnpm install
pnpm build

# 4. 重新启动
pm2 start ecosystem.config.monorepo.js --env production

# 5. 验证
pm2 list
curl https://member.example.com/api/health
```

### 数据库回滚

如果数据库迁移失败：

```bash
# 1. 停止应用
pm2 stop all

# 2. 恢复数据库备份
mysql -u root -p < backup_YYYYMMDD_HHMMSS.sql

# 3. 验证数据
mysql -u root -p member_system -e "SELECT COUNT(*) FROM users;"

# 4. 重新启动应用
pm2 start ecosystem.config.monorepo.js --env production
```

检查清单：
- [ ] 回滚计划已测试
- [ ] 备份可以恢复
- [ ] 回滚时间 < 5 分钟
- [ ] 回滚后数据完整

---

## 监控和告警

### 关键指标

监控以下关键指标：

| 指标 | 阈值 | 告警级别 |
|------|------|--------|
| 错误率 | > 1% | 严重 |
| 响应时间 P95 | > 1000ms | 警告 |
| 数据库连接数 | > 80% | 警告 |
| 内存使用 | > 80% | 警告 |
| CPU 使用 | > 80% | 警告 |
| 磁盘使用 | > 80% | 警告 |

### 监控工具

- [ ] PM2 监控已启用
  ```bash
  pm2 monit
  ```

- [ ] Sentry 监控已配置
  - [ ] 错误告警
  - [ ] 性能告警
  - [ ] 发布追踪

- [ ] 日志监控已配置
  - [ ] 错误日志告警
  - [ ] 性能日志告警

- [ ] 系统监控已配置
  - [ ] CPU 使用告警
  - [ ] 内存使用告警
  - [ ] 磁盘使用告警

### 告警通知

- [ ] Email 告警已配置
- [ ] Slack 告警已配置（可选）
- [ ] 钉钉告警已配置（可选）
- [ ] 告警接收人已配置

检查清单：
- [ ] 所有监控系统正常
- [ ] 告警规则已测试
- [ ] 告警通知已验证
- [ ] 告警响应流程已定义

---

## 部署完成检查表

部署完成后，确认以下所有项目：

- [ ] 所有应用已启动
- [ ] 所有功能已验证
- [ ] 性能指标正常
- [ ] 安全检查通过
- [ ] 监控系统正常
- [ ] 告警系统正常
- [ ] 日志系统正常
- [ ] 备份已验证
- [ ] 回滚计划已准备
- [ ] 团队已通知
- [ ] 文档已更新
- [ ] 部署记录已保存

---

## 常见问题

### Q: 部署失败，如何快速恢复？

A: 执行快速回滚步骤（见回滚计划部分）。确保备份可用且可恢复。

### Q: 如何验证数据库迁移成功？

A:
```bash
# 检查表数量
mysql -u root -p member_system -e "SHOW TABLES;"

# 检查行数
mysql -u root -p member_system -e "SELECT COUNT(*) FROM users;"

# 检查索引
mysql -u root -p member_system -e "SHOW INDEXES FROM users;"
```

### Q: 如何处理部署期间的用户请求？

A: 使用蓝绿部署或金丝雀部署策略，逐步切换流量。

### Q: 如何监控部署后的性能？

A: 使用 Sentry 性能监控、PM2 监控和日志系统。

---

## 支持和联系

如有部署问题，请：

1. 查看本文档的故障排除部分
2. 查看应用日志：`pm2 logs`
3. 查看 Sentry 错误报告
4. 联系技术团队

---

**部署检查清单版本**: 1.0.0
**最后更新**: 2026-02-07
