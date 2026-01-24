#!/bin/bash

# 远程服务器数据库诊断和修复脚本
# 服务器: 8.153.110.212

echo "========================================"
echo "服务器数据库诊断和自动修复"
echo "时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================"
echo ""

# 1. 检查MySQL服务状态
echo "[1] 检查MySQL服务状态"
echo "----------------------------------------"
systemctl status mysql --no-pager | head -15
echo ""

if ! systemctl is-active --quiet mysql; then
    echo "⚠️  MySQL服务未运行，尝试启动..."
    sudo systemctl start mysql
    sleep 2
    if systemctl is-active --quiet mysql; then
        echo "✓ MySQL服务已启动"
    else
        echo "✗ MySQL服务启动失败"
        systemctl status mysql --no-pager
    fi
fi
echo ""

# 2. 检查.env文件
echo "[2] 检查.env文件配置"
echo "----------------------------------------"
cd /www/wwwroot/member-system

if [ -f .env ]; then
    echo "✓ .env文件存在"
    echo ""
    echo "数据库配置（隐藏密码）:"
    grep "^DB_" .env | sed 's/\(DB_PASSWORD=\).*/\1***HIDDEN***/'
    echo ""

    # 读取数据库配置
    export $(grep "^DB_" .env | xargs)

else
    echo "✗ .env文件不存在！"
    echo ""
    echo "创建默认.env文件..."

    cat > .env << 'ENVEOF'
# 应用配置
NODE_ENV=production
APP_URL=http://yushuofupan.com
PORT=3000

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=ChangeMe2026!Secure
DB_NAME=member_system

# JWT配置
JWT_SECRET=yushuo-member-system-jwt-secret-2026-production
JWT_EXPIRES_IN=7d

# 会话配置
SESSION_SECRET=yushuo-member-system-session-secret-2026

# 安全配置
BCRYPT_ROUNDS=12

# 日志配置
LOG_LEVEL=info
ENVEOF

    echo "✓ .env文件已创建"
    export DB_HOST=localhost
    export DB_PORT=3306
    export DB_USER=root
    export DB_PASSWORD="ChangeMe2026!Secure"
    export DB_NAME=member_system
fi
echo ""

# 3. 测试MySQL连接
echo "[3] 测试MySQL数据库连接"
echo "----------------------------------------"

# 确保变量已设置
DB_HOST=${DB_HOST:-localhost}
DB_USER=${DB_USER:-root}
DB_PASSWORD=${DB_PASSWORD:-ChangeMe2026!Secure}
DB_NAME=${DB_NAME:-member_system}

echo "测试连接到MySQL..."
if mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1 as test;" 2>/dev/null; then
    echo "✓ MySQL连接成功"
else
    echo "✗ MySQL连接失败"
    echo ""
    echo "尝试的连接参数:"
    echo "  Host: $DB_HOST"
    echo "  User: $DB_USER"
    echo "  Password: (${#DB_PASSWORD} characters)"
    echo ""
    echo "MySQL错误信息:"
    mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1;" 2>&1 | tail -5
    exit 1
fi
echo ""

# 4. 检查数据库是否存在
echo "[4] 检查member_system数据库"
echo "----------------------------------------"

DB_EXISTS=$(mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" -e "SHOW DATABASES LIKE '$DB_NAME';" 2>/dev/null | grep -c "$DB_NAME")

if [ "$DB_EXISTS" -eq 0 ]; then
    echo "⚠️  数据库 $DB_NAME 不存在，创建中..."
    mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" -e "CREATE DATABASE $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>&1
    echo "✓ 数据库已创建"
else
    echo "✓ 数据库 $DB_NAME 已存在"
fi
echo ""

# 5. 检查数据库表
echo "[5] 检查数据库表结构"
echo "----------------------------------------"

TABLES=$(mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "SHOW TABLES;" 2>/dev/null | tail -n +2 | wc -l)

echo "数据库中现有表数量: $TABLES"

if [ "$TABLES" -eq 0 ]; then
    echo "⚠️  数据库为空，需要初始化"
    echo ""

    # 检查是否有初始化脚本
    if [ -f database-init-v3.sql ]; then
        echo "发现初始化脚本 database-init-v3.sql"
        echo "执行数据库初始化..."
        mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < database-init-v3.sql 2>&1
        echo "✓ 数据库初始化完成"
    else
        echo "⚠️  未找到 database-init-v3.sql"
        echo "数据库将在应用首次启动时自动初始化"
    fi
else
    echo "✓ 数据库已有表结构"
    echo ""
    echo "现有表:"
    mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "SHOW TABLES;" 2>/dev/null | tail -n +2
fi
echo ""

# 6. 检查关键表
echo "[6] 检查关键表完整性"
echo "----------------------------------------"

check_table() {
    local table=$1
    local count=$(mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "SHOW TABLES LIKE '$table';" 2>/dev/null | tail -n +2 | wc -l)
    if [ "$count" -gt 0 ]; then
        local rows=$(mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "SELECT COUNT(*) FROM $table;" 2>/dev/null | tail -n 1)
        echo "✓ $table 表存在 ($rows 条记录)"
        return 0
    else
        echo "✗ $table 表不存在"
        return 1
    fi
}

check_table "users"
check_table "memberships"
check_table "admins"
check_table "activation_codes"
check_table "user_product_purchases"
check_table "products"
echo ""

# 7. 创建默认管理员账户（如果不存在）
echo "[7] 检查管理员账户"
echo "----------------------------------------"

ADMIN_EXISTS=$(mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "SELECT COUNT(*) FROM admins WHERE username='admin';" 2>/dev/null | tail -n 1)

if [ "$ADMIN_EXISTS" = "0" ]; then
    echo "⚠️  默认管理员不存在，创建中..."

    # 使用bcrypt hash for 'admin123' (12 rounds)
    # 这是预生成的hash，密码为admin123
    ADMIN_HASH='$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMeshwVL1g9Ml9FgQR5bkPq7FK'

    mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" << EOF
INSERT INTO admins (username, email, password_hash, role, is_super, created_at)
VALUES ('admin', 'admin@member-system.local', '$ADMIN_HASH', 'super_admin', 1, NOW());
EOF

    if [ $? -eq 0 ]; then
        echo "✓ 默认管理员创建成功"
        echo "  用户名: admin"
        echo "  密码: admin123"
        echo "  角色: super_admin"
    else
        echo "✗ 管理员创建失败"
    fi
else
    echo "✓ 管理员账户已存在"
fi
echo ""

# 8. 重启PM2服务
echo "[8] 重启PM2服务"
echo "----------------------------------------"

cd /www/wwwroot/member-system

echo "重启member-system服务..."
pm2 restart member-system 2>&1

sleep 3

echo ""
echo "PM2状态:"
pm2 list | grep member-system
echo ""

# 9. 检查日志
echo "[9] 检查最新日志"
echo "----------------------------------------"
echo "PM2错误日志（最近20行）:"
pm2 logs member-system --err --lines 20 --nostream 2>&1 || echo "无错误日志"
echo ""

# 10. 测试API
echo "[10] 测试API端点"
echo "----------------------------------------"

sleep 2

echo "测试 http://localhost:3000/api/auth/me"
API_RESPONSE=$(curl -s http://localhost:3000/api/auth/me)
echo "$API_RESPONSE"
echo ""

if echo "$API_RESPONSE" | grep -q '"timestamp"'; then
    echo "✓ API正常响应"
else
    echo "✗ API响应异常"
fi

echo ""
echo "========================================"
echo "诊断和修复完成"
echo "========================================"
echo ""

# 输出总结
echo "总结:"
echo "1. MySQL服务: $(systemctl is-active mysql)"
echo "2. .env文件: $([ -f .env ] && echo '存在' || echo '不存在')"
echo "3. 数据库: $(mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" -e "SHOW DATABASES LIKE '$DB_NAME';" 2>/dev/null | grep -c "$DB_NAME") 个匹配"
echo "4. PM2状态: $(pm2 jlist | grep -c member-system) 个进程"
echo ""
echo "如果问题仍然存在，请检查:"
echo "1. PM2日志: pm2 logs member-system"
echo "2. MySQL日志: sudo tail -f /var/log/mysql/error.log"
echo "3. 系统日志: journalctl -xe"
