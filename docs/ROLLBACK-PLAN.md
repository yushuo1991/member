# 回滚方案

## 🎯 目标

提供快速、安全的回滚方案，确保在apps/web切换后出现问题时，能够迅速恢复到member-system。

---

## ⚡ 快速回滚指南（5分钟内完成）

### 应急回滚命令

**适用场景**: apps/web出现严重问题，需要立即回滚

```bash
#!/bin/bash
# emergency-rollback.sh
# 紧急回滚到member-system

set -e

echo "🚨 开始紧急回滚到member-system..."

# 1. 停止apps/web进程
echo "⏹️  停止apps/web进程..."
pm2 stop member-web-test || true
pm2 delete member-web-test || true

# 2. 启动member-system进程
echo "▶️  启动member-system进程..."
pm2 restart member-system || pm2 start /www/wwwroot/member-system/ecosystem.config.js --env production

# 3. 等待启动
echo "⏳ 等待应用启动..."
sleep 5

# 4. 验证member-system运行正常
echo "✅ 验证应用状态..."
curl -I http://localhost:3000 || echo "⚠️  应用可能未正常启动，请手动检查"

# 5. 显示PM2状态
echo ""
echo "📊 当前PM2进程状态："
pm2 list

echo ""
echo "✅ 回滚完成！member-system已恢复运行在端口3000"
echo "⚠️  请手动切换Nginx配置到端口3000并重载："
echo "    编辑: /etc/nginx/sites-available/member-system"
echo "    修改: proxy_pass http://localhost:3000;"
echo "    执行: nginx -t && systemctl reload nginx"
```

### 执行步骤

```bash
# 1. SSH登录服务器
ssh root@your-server

# 2. 执行回滚脚本
bash /www/wwwroot/emergency-rollback.sh

# 3. 切换Nginx配置
vim /etc/nginx/sites-available/member-system
# 修改 proxy_pass 端口为 3000

# 4. 重载Nginx
nginx -t && systemctl reload nginx

# 5. 验证
curl http://yourdomain.com
```

---

## 📋 回滚场景分类

### 场景1: 应用崩溃或无法启动

**症状**:
- PM2显示apps/web进程crashed
- 端口3001无响应
- 用户无法访问网站

**回滚步骤**:
```bash
# 1. 立即启动member-system
pm2 restart member-system

# 2. 切换Nginx到端口3000
# （参考快速回滚指南）

# 3. 停止有问题的apps/web
pm2 stop member-web-test
pm2 delete member-web-test

# 4. 验证
curl http://localhost:3000
```

**时间**: 2-3分钟

---

### 场景2: 功能异常但应用运行

**症状**:
- apps/web运行但某些功能失败
- 用户报告登录失败、数据错误等
- 日志显示错误但应用未崩溃

**回滚步骤**:
```bash
# 1. 评估严重程度
# - 如果影响核心功能（登录、支付等）→ 立即回滚
# - 如果只影响次要功能 → 可先尝试快速修复

# 2. 决定回滚后执行：
pm2 restart member-system
# 切换Nginx配置...

# 3. 收集apps/web日志用于分析
pm2 logs member-web-test --lines 500 > /tmp/apps-web-error.log

# 4. 停止apps/web
pm2 stop member-web-test
```

**时间**: 3-5分钟

---

### 场景3: 性能严重下降

**症状**:
- 响应时间从200ms增加到3000ms+
- 内存占用从500MB增加到2GB+
- CPU持续100%
- 用户投诉网站卡顿

**回滚步骤**:
```bash
# 1. 确认是apps/web问题
pm2 monit  # 查看资源占用

# 2. 回滚到member-system
pm2 restart member-system
# 切换Nginx...

# 3. 停止apps/web并收集信息
pm2 stop member-web-test
pm2 logs member-web-test > /tmp/performance-issue.log
```

**时间**: 3-5分钟

---

### 场景4: 数据库问题

**症状**:
- 数据库连接错误
- 数据查询失败
- 数据不一致

**回滚步骤**:
```bash
# 1. 立即回滚应用
pm2 restart member-system
# 切换Nginx...

# 2. 评估数据库影响
mysql -u root -p
USE member_system;
# 检查数据完整性...

# 3. 如果数据被破坏，恢复备份
mysql -u root -p member_system < /backup/before-migration.sql

# 4. 停止apps/web
pm2 stop member-web-test
```

**时间**: 5-10分钟（不含数据库恢复）

---

### 场景5: 部署失败

**症状**:
- GitHub Actions部署失败
- apps/web构建失败
- 文件传输错误

**回滚步骤**:
```bash
# 1. 确认member-system仍在运行
pm2 list | grep member-system

# 2. 如果member-system正常，无需回滚
# 3. 如果member-system也受影响：
pm2 restart member-system

# 4. 修复部署问题后重新部署apps/web
```

**时间**: 1-2分钟

---

## 🔧 详细回滚流程

### 完整回滚步骤（所有场景通用）

#### 阶段1: 评估和决策（1分钟）

**步骤1.1: 识别问题**
```bash
# 检查应用状态
pm2 list

# 检查日志
pm2 logs member-web-test --lines 50

# 检查访问
curl http://localhost:3001
```

**步骤1.2: 确定严重程度**
- 🔴 严重: 影响所有用户或核心功能 → 立即回滚
- 🟡 中等: 影响部分用户或次要功能 → 快速修复或回滚
- 🟢 轻微: 不影响用户 → 记录问题，稍后修复

**步骤1.3: 做出决策**
```
是否回滚？
├─ 是 → 执行阶段2
└─ 否 → 尝试快速修复 → 15分钟内无法解决 → 执行阶段2
```

#### 阶段2: 执行回滚（2-3分钟）

**步骤2.1: 备份当前状态**
```bash
# 创建备份目录
mkdir -p /backup/rollback-$(date +%Y%m%d-%H%M%S)

# 备份apps/web日志
pm2 logs member-web-test --lines 1000 > /backup/rollback-$(date +%Y%m%d-%H%M%S)/apps-web.log

# 备份PM2进程列表
pm2 list > /backup/rollback-$(date +%Y%m%d-%H%M%S)/pm2-list.txt
```

**步骤2.2: 停止apps/web**
```bash
# 停止进程
pm2 stop member-web-test

# 可选：删除进程（如果需要）
pm2 delete member-web-test

# 验证已停止
pm2 list | grep member-web-test
```

**步骤2.3: 启动member-system**
```bash
# 启动或重启member-system
pm2 restart member-system || pm2 start /www/wwwroot/member-system/ecosystem.config.js --env production

# 等待启动
sleep 3

# 验证运行
pm2 list | grep member-system
curl -I http://localhost:3000
```

**步骤2.4: 切换Nginx配置**

**方式A: 修改配置文件（推荐）**
```bash
# 编辑配置
vim /etc/nginx/sites-available/member-system

# 修改以下行：
# proxy_pass http://localhost:3001;  # apps/web
# 改为：
# proxy_pass http://localhost:3000;  # member-system

# 测试配置
nginx -t

# 重载Nginx
systemctl reload nginx
```

**方式B: 使用备份配置**
```bash
# 恢复备份的配置文件
cp /backup/nginx-member-system.conf /etc/nginx/sites-available/member-system

# 测试并重载
nginx -t && systemctl reload nginx
```

**步骤2.5: 验证回滚成功**
```bash
# 检查PM2进程
pm2 list

# 检查Nginx状态
systemctl status nginx

# 检查应用访问
curl http://localhost:3000
curl http://yourdomain.com

# 检查日志
pm2 logs member-system --lines 20
```

#### 阶段3: 验证和监控（10-30分钟）

**步骤3.1: 功能测试**
```bash
# 测试登录
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'

# 测试其他核心功能...
```

**步骤3.2: 持续监控**
```bash
# 监控PM2进程
pm2 monit

# 监控日志
pm2 logs member-system

# 监控Nginx日志
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

**步骤3.3: 收集用户反馈**
- 通知用户问题已解决
- 收集用户反馈
- 确认无新问题

#### 阶段4: 问题分析（事后）

**步骤4.1: 收集信息**
```bash
# 查看apps/web日志
cat /backup/rollback-*/apps-web.log

# 查看系统日志
journalctl -u nginx -n 500
journalctl -u mysql -n 500

# 查看PM2日志
pm2 logs member-web-test --lines 500
```

**步骤4.2: 分析根本原因**
- 应用代码问题
- 配置问题
- 依赖问题
- 数据库问题
- 资源问题

**步骤4.3: 制定修复方案**
- 修复代码
- 更新配置
- 升级依赖
- 优化性能

---

## 💾 数据库回滚

### 备份策略

#### 备份时机
```bash
# 切换前备份（必须）
mysqldump -u root -p --single-transaction \
  --routines --triggers \
  member_system > /backup/before-switch-$(date +%Y%m%d-%H%M%S).sql

# 验证备份
mysql -u root -p -e "SELECT COUNT(*) FROM member_system.users"
# 记录用户数，用于验证恢复
```

#### 备份验证
```bash
# 测试恢复到临时数据库
mysql -u root -p -e "CREATE DATABASE member_system_test_restore"
mysql -u root -p member_system_test_restore < /backup/before-switch-*.sql

# 验证数据完整性
mysql -u root -p -e "SELECT COUNT(*) FROM member_system_test_restore.users"

# 验证通过后删除测试库
mysql -u root -p -e "DROP DATABASE member_system_test_restore"
```

### 数据恢复流程

#### 场景A: 数据未被修改（只回滚应用）
```bash
# 只需回滚应用，不需要恢复数据库
# member-system和apps/web共享同一数据库
# 数据库本身没问题
```

#### 场景B: 数据被apps/web修改（需要恢复）
```bash
# 1. 停止所有应用
pm2 stop member-system
pm2 stop member-web-test

# 2. 备份当前数据库（以防万一）
mysqldump -u root -p member_system > /backup/before-restore-$(date +%Y%m%d-%H%M%S).sql

# 3. 恢复备份
mysql -u root -p member_system < /backup/before-switch-*.sql

# 4. 验证数据
mysql -u root -p -e "SELECT COUNT(*) FROM member_system.users"
# 对比之前记录的用户数

# 5. 启动member-system
pm2 restart member-system

# 6. 测试功能
curl http://localhost:3000/api/auth/me
```

#### 场景C: 数据库结构被修改（需要重建）
```bash
# 1. 停止所有应用
pm2 stop member-system
pm2 stop member-web-test

# 2. 删除数据库
mysql -u root -p -e "DROP DATABASE member_system"

# 3. 重新创建数据库
mysql -u root -p -e "CREATE DATABASE member_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"

# 4. 恢复备份
mysql -u root -p member_system < /backup/before-switch-*.sql

# 5. 验证数据库结构
mysql -u root -p member_system -e "SHOW TABLES"

# 6. 启动member-system
pm2 restart member-system
```

---

## 📁 配置文件回滚

### Nginx配置回滚

#### 备份Nginx配置（切换前）
```bash
# 备份当前配置
cp /etc/nginx/sites-available/member-system \
   /backup/nginx-member-system-$(date +%Y%m%d-%H%M%S).conf

# 备份整个Nginx配置
tar -czf /backup/nginx-config-$(date +%Y%m%d-%H%M%S).tar.gz \
  /etc/nginx/
```

#### 恢复Nginx配置
```bash
# 恢复配置文件
cp /backup/nginx-member-system-*.conf \
   /etc/nginx/sites-available/member-system

# 测试配置
nginx -t

# 重载Nginx
systemctl reload nginx

# 验证
systemctl status nginx
curl http://localhost
```

### 环境变量回滚

#### 备份.env文件（切换前）
```bash
# 备份member-system的.env
cp /www/wwwroot/member-system/.env \
   /backup/.env.member-system-$(date +%Y%m%d-%H%M%S)

# 备份apps/web的.env（如果存在）
cp /www/wwwroot/member-system-test/.env \
   /backup/.env.apps-web-$(date +%Y%m%d-%H%M%S)
```

#### 恢复.env文件
```bash
# 恢复member-system的.env
cp /backup/.env.member-system-* \
   /www/wwwroot/member-system/.env

# 重启应用使配置生效
pm2 restart member-system
```

### PM2配置回滚

#### 备份ecosystem.config.js
```bash
# 备份member-system的PM2配置
cp /www/wwwroot/member-system/ecosystem.config.js \
   /backup/ecosystem.member-system-$(date +%Y%m%d-%H%M%S).js
```

#### 恢复PM2配置
```bash
# 恢复配置
cp /backup/ecosystem.member-system-*.js \
   /www/wwwroot/member-system/ecosystem.config.js

# 重新加载PM2配置
pm2 delete member-system
pm2 start /www/wwwroot/member-system/ecosystem.config.js --env production
pm2 save
```

---

## 🔍 回滚验证清单

### 应用层验证

```markdown
- [ ] PM2进程状态为online
- [ ] 应用端口3000可访问
- [ ] 首页正常加载
- [ ] 无JavaScript错误
- [ ] 用户登录功能正常
- [ ] 管理员登录功能正常
- [ ] 核心API响应正常
```

### 数据层验证

```markdown
- [ ] 数据库连接正常
- [ ] 用户表记录数正确
- [ ] 激活码表记录数正确
- [ ] 产品表记录数正确
- [ ] 数据一致性检查通过
```

### 服务层验证

```markdown
- [ ] Nginx运行正常
- [ ] MySQL运行正常
- [ ] PM2运行正常
- [ ] 磁盘空间充足
- [ ] 内存占用正常
```

### 用户体验验证

```markdown
- [ ] 网站访问速度正常
- [ ] 用户可以正常登录
- [ ] 用户可以正常操作
- [ ] 无用户投诉
```

---

## 📊 回滚后监控

### 关键指标监控（持续24小时）

#### 应用指标
```bash
# 每5分钟检查一次PM2状态
watch -n 300 "pm2 list"

# 每10分钟检查一次日志
watch -n 600 "pm2 logs member-system --lines 20 --nostream"
```

#### 性能指标
```bash
# 监控内存占用
free -h

# 监控CPU使用率
top -b -n 1 | head -20

# 监控磁盘空间
df -h
```

#### 用户指标
```bash
# 监控Nginx访问日志
tail -f /var/log/nginx/access.log | grep -E "200|404|500"

# 统计错误率
grep "$(date +%Y/%m/%d)" /var/log/nginx/error.log | wc -l
```

---

## 🚨 紧急情况处理

### 回滚失败怎么办？

#### 情况1: member-system也无法启动

```bash
# 1. 检查member-system代码
cd /www/wwwroot/member-system
git status
git log -1

# 2. 尝试重新构建
npm run build

# 3. 如果还是失败，恢复到上一个稳定版本
git log --oneline -10
git checkout <last-stable-commit>
npm install
npm run build

# 4. 重启PM2
pm2 restart member-system
```

#### 情况2: 数据库无法恢复

```bash
# 1. 检查备份文件完整性
ls -lh /backup/*.sql

# 2. 尝试恢复到最近的备份
ls -lt /backup/*.sql | head -5

# 3. 使用最新的完整备份
mysql -u root -p member_system < /backup/latest-backup.sql

# 4. 如果所有备份都失败，启用MySQL binlog恢复
mysqlbinlog /var/lib/mysql/mysql-bin.000001 > /tmp/binlog-recovery.sql
mysql -u root -p member_system < /tmp/binlog-recovery.sql
```

#### 情况3: Nginx配置损坏

```bash
# 1. 恢复默认配置
cp /backup/nginx-config-*.tar.gz /tmp/
cd /tmp && tar -xzf nginx-config-*.tar.gz

# 2. 复制配置文件
cp /tmp/etc/nginx/nginx.conf /etc/nginx/nginx.conf
cp /tmp/etc/nginx/sites-available/* /etc/nginx/sites-available/

# 3. 测试并重载
nginx -t && systemctl reload nginx
```

---

## 📝 回滚报告模板

### 回滚事件报告

```markdown
# 回滚事件报告

## 基本信息
- **回滚时间**: YYYY-MM-DD HH:MM:SS
- **执行人**: [姓名]
- **回滚原因**: [简述]
- **严重程度**: 🔴高 / 🟡中 / 🟢低

## 问题描述
[详细描述发生的问题]

## 回滚过程
1. 发现问题时间：HH:MM
2. 决定回滚时间：HH:MM
3. 开始回滚时间：HH:MM
4. 完成回滚时间：HH:MM
5. 验证通过时间：HH:MM

**总耗时**: XX分钟

## 影响范围
- 受影响用户数：XXX
- 停机时间：XX分钟
- 数据丢失：无/有（描述）

## 回滚步骤
1. [步骤1]
2. [步骤2]
3. ...

## 验证结果
- [ ] 应用正常运行
- [ ] 功能测试通过
- [ ] 数据完整性验证通过
- [ ] 用户反馈正常

## 根本原因分析
[分析问题的根本原因]

## 改进措施
1. [措施1]
2. [措施2]
3. ...

## 后续计划
[描述如何修复问题并重新尝试迁移]

## 附件
- 日志文件：/backup/rollback-*/apps-web.log
- 数据库备份：/backup/before-restore-*.sql
- 其他：...
```

---

## 🎓 经验教训

### 避免常见错误

1. **不要在没有备份的情况下切换**
   - 始终先备份数据库
   - 始终先备份配置文件
   - 始终先备份代码

2. **不要在高峰期回滚**
   - 选择低峰期执行回滚
   - 避免影响更多用户

3. **不要急于删除member-system**
   - 至少保留3个月
   - 确认apps/web完全稳定后再删除

4. **不要忽略监控**
   - 回滚后持续监控24小时
   - 收集用户反馈

### 成功回滚的关键

1. **提前准备**
   - 完整的备份
   - 测试过的回滚脚本
   - 清晰的回滚流程

2. **快速决策**
   - 识别问题严重程度
   - 不要犹豫，果断回滚

3. **彻底验证**
   - 功能测试
   - 数据验证
   - 性能监控

4. **总结改进**
   - 分析问题原因
   - 制定改进措施
   - 更新文档和流程

---

## 📞 应急联系方式

### 回滚过程中需要帮助时

1. **查看文档**
   - 本回滚方案
   - 双轨运行指南
   - 切换时机建议

2. **检查日志**
   - PM2日志：`pm2 logs`
   - Nginx日志：`/var/log/nginx/`
   - MySQL日志：`/var/log/mysql/`

3. **在线资源**
   - PM2文档：https://pm2.keymetrics.io/
   - Next.js文档：https://nextjs.org/docs
   - Nginx文档：https://nginx.org/en/docs/

---

## 📚 相关文档

- [渐进式迁移计划](./PROGRESSIVE-MIGRATION-PLAN.md)
- [双轨运行指南](./DUAL-TRACK-GUIDE.md)
- [切换时机建议](./SWITCH-TIMING.md)

---

**最后更新**: 2026-01-24
**文档版本**: v1.0
**紧急程度**: 🔴 高优先级，务必熟悉
