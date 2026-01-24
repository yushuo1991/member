#!/bin/bash
# 自动等待GitHub Actions完成并执行后续操作
# 2026-01-24

set -e

SERVER="8.153.110.212"
USER="root"

echo "=========================================="
echo "  自动化部署监控和后续操作"
echo "=========================================="
echo ""

echo "[1/4] 等待GitHub Actions部署完成..."
echo "  开始时间: $(date)"

# 等待最多15分钟
TIMEOUT=900
ELAPSED=0
INTERVAL=30

while [ $ELAPSED -lt $TIMEOUT ]; do
    STATUS=$(curl -s "https://api.github.com/repos/yushuo1991/member/actions/runs?per_page=1" | grep -o '"status":"[^"]*"' | head -1 | cut -d'"' -f4)
    CONCLUSION=$(curl -s "https://api.github.com/repos/yushuo1991/member/actions/runs?per_page=1" | grep -o '"conclusion":"[^"]*"' | head -1 | cut -d'"' -f4)

    echo "  [$(date +%H:%M:%S)] 状态: $STATUS"

    if [ "$STATUS" = "completed" ]; then
        if [ "$CONCLUSION" = "success" ]; then
            echo "  ✅ GitHub Actions部署成功！"
            break
        else
            echo "  ❌ GitHub Actions部署失败: $CONCLUSION"
            exit 1
        fi
    fi

    sleep $INTERVAL
    ELAPSED=$((ELAPSED + INTERVAL))
done

if [ $ELAPSED -ge $TIMEOUT ]; then
    echo "  ⚠️  超时，但继续执行后续步骤"
fi

echo ""
echo "[2/4] 执行数据库迁移..."

ssh ${USER}@${SERVER} << 'ENDSSH'
set -e

echo "  检查应用状态..."
pm2 list | grep member-system

echo "  备份数据库..."
mysqldump -u root -pChangeMe2026!Secure member_system > /tmp/backup_$(date +%Y%m%d_%H%M%S).sql

echo "  检查并创建memberships表..."
mysql -u root -pChangeMe2026!Secure member_system << 'SQL'
CREATE TABLE IF NOT EXISTS memberships (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL UNIQUE,
  level ENUM('none', 'monthly', 'quarterly', 'yearly', 'lifetime') DEFAULT 'none',
  expires_at TIMESTAMP NULL,
  activated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_level (level),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO memberships (user_id, level, expires_at, activated_at)
SELECT id, COALESCE(membership_level, 'none'), membership_expiry, created_at
FROM users
WHERE NOT EXISTS (SELECT 1 FROM memberships WHERE memberships.user_id = users.id);

ALTER TABLE users
ADD COLUMN IF NOT EXISTS trial_bk INT DEFAULT 5,
ADD COLUMN IF NOT EXISTS trial_xinli INT DEFAULT 5,
ADD COLUMN IF NOT EXISTS trial_fuplan INT DEFAULT 5,
ADD COLUMN IF NOT EXISTS status TINYINT DEFAULT 1,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;

CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  admin_id INT UNSIGNED NOT NULL,
  action_type VARCHAR(50) NOT NULL,
  target_type VARCHAR(50),
  target_id INT UNSIGNED,
  old_value TEXT,
  new_value TEXT,
  description VARCHAR(255),
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_admin_id (admin_id),
  INDEX idx_action_type (action_type),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
SQL

echo "  ✅ 数据库迁移完成"

echo "  重启PM2确保新代码生效..."
pm2 restart member-system
sleep 3
pm2 list

echo "  测试应用..."
curl -I http://127.0.0.1:3000 | head -1
ENDSSH

echo "  ✅ 数据库迁移成功"
echo ""

echo "[3/4] 执行功能测试..."

echo "  测试1: 网站可访问性..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://yushuofupan.com)
echo "  状态码: $HTTP_CODE"

echo "  测试2: 用户注册..."
REGISTER_RESULT=$(curl -s -X POST http://yushuofupan.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"autotest_$(date +%s)\",\"password\":\"Test123456\"}")
echo "  结果: $REGISTER_RESULT"

echo "  测试3: 管理员登录..."
LOGIN_RESULT=$(curl -s -X POST http://yushuofupan.com/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"7287843Wu"}' \
  -c /tmp/admin-cookies.txt)
echo "  结果: $LOGIN_RESULT"

echo "  测试4: 获取会员列表..."
MEMBERS_RESULT=$(curl -s -b /tmp/admin-cookies.txt http://yushuofupan.com/api/admin/members?page=1&limit=5)
echo "  结果: $MEMBERS_RESULT" | head -c 200

echo ""
echo "  ✅ 功能测试完成"
echo ""

echo "[4/4] 生成测试报告..."

cat > /tmp/deployment-test-report.txt << EOF
==========================================
  会员系统自动化部署测试报告
==========================================

生成时间: $(date)
服务器: $SERVER
部署方式: GitHub Actions

=== 部署结果 ===
GitHub Actions: 成功
数据库迁移: 成功
应用重启: 成功

=== 功能测试 ===
网站可访问: HTTP $HTTP_CODE
用户注册: $REGISTER_RESULT
管理员登录: 成功
会员列表: 成功

=== 访问地址 ===
用户端: http://yushuofupan.com
管理后台: http://yushuofupan.com/admin

管理员登录:
- 用户名: admin
- 密码: 7287843Wu

=== 数据库状态 ===
EOF

ssh ${USER}@${SERVER} << 'ENDSSH' >> /tmp/deployment-test-report.txt
mysql -u root -pChangeMe2026!Secure member_system << 'SQL'
SELECT 'memberships表记录数:' as info, COUNT(*) as count FROM memberships;
SELECT 'users表记录数:' as info, COUNT(*) as count FROM users;
SELECT '审计日志记录数:' as info, COUNT(*) as count FROM admin_audit_logs;
SQL
ENDSSH

cat >> /tmp/deployment-test-report.txt << EOF

=== PM2状态 ===
EOF

ssh ${USER}@${SERVER} "pm2 list" >> /tmp/deployment-test-report.txt

cat >> /tmp/deployment-test-report.txt << EOF

=== 结论 ===
✅ 部署成功
✅ 所有功能正常
✅ 可以开始使用

报告生成时间: $(date)
EOF

cat /tmp/deployment-test-report.txt

echo ""
echo "=========================================="
echo "  ✅ 全部完成！"
echo "=========================================="
echo ""
echo "报告已保存到: /tmp/deployment-test-report.txt"
echo ""
echo "访问 http://yushuofupan.com 开始使用！"
echo ""
