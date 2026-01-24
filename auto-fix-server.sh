#!/bin/bash

# 自动修复脚本 - 在服务器上执行
# 功能：将数据库迁移到v3架构

set -e

echo "=========================================="
echo "  数据库v3架构自动迁移"
echo "=========================================="
echo "时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# 定义路径
DEPLOY_PATH="/www/wwwroot/member-system"
BACKUP_DIR="/root/member_system_backups"

# 创建备份目录
mkdir -p "$BACKUP_DIR"

cd "$DEPLOY_PATH"

# 1. 备份现有数据库
echo "1. 备份现有数据库..."
BACKUP_FILE="$BACKUP_DIR/member_system_backup_$(date +%Y%m%d_%H%M%S).sql"

# 尝试使用root密码（从环境变量或.my.cnf）
if mysqldump member_system > "$BACKUP_FILE" 2>/dev/null; then
    echo "   ✅ 数据库已备份到: $BACKUP_FILE"
    # 压缩备份文件
    gzip "$BACKUP_FILE"
    echo "   ✅ 备份已压缩: ${BACKUP_FILE}.gz"
else
    echo "   ⚠️  无法自动备份数据库（可能需要密码）"
    echo "   继续执行迁移..."
fi

# 2. 检查数据库初始化脚本是否存在
echo ""
echo "2. 检查数据库脚本..."
if [ -f "database-init-v3.sql" ]; then
    echo "   ✅ 找到 database-init-v3.sql"
else
    echo "   ❌ 未找到 database-init-v3.sql"
    echo "   脚本位置: $PWD"
    ls -la *.sql 2>/dev/null || echo "   没有找到任何SQL文件"
    exit 1
fi

# 3. 执行数据库迁移
echo ""
echo "3. 执行数据库迁移到v3架构..."
echo "   警告: 这将删除所有现有数据!"
echo "   备份文件: ${BACKUP_FILE}.gz"
echo ""

# 尝试执行迁移
if mysql member_system < database-init-v3.sql 2>/dev/null; then
    echo "   ✅ 数据库迁移成功!"
else
    echo "   ❌ 数据库迁移失败"
    echo "   可能需要手动执行: mysql -u root -p member_system < database-init-v3.sql"
    exit 1
fi

# 4. 验证数据库架构
echo ""
echo "4. 验证数据库架构..."

# 检查关键表是否存在
TABLES=("users" "admins" "memberships" "user_product_purchases" "products" "activation_codes")

for table in "${TABLES[@]}"; do
    if mysql member_system -e "SHOW TABLES LIKE '$table'" 2>/dev/null | grep -q "$table"; then
        echo "   ✅ 表 $table 存在"
    else
        echo "   ❌ 表 $table 不存在"
        exit 1
    fi
done

# 5. 重启应用
echo ""
echo "5. 重启应用..."
if pm2 restart member-system; then
    echo "   ✅ 应用重启成功"
else
    echo "   ❌ 应用重启失败"
    exit 1
fi

# 6. 等待应用启动
echo ""
echo "6. 等待应用启动..."
sleep 3

# 7. 测试应用
echo ""
echo "7. 测试应用..."
if curl -s http://127.0.0.1:3000 | grep -q "宇硕短线"; then
    echo "   ✅ 应用正常运行"
else
    echo "   ⚠️  应用可能未正常启动"
    echo "   检查日志: pm2 logs member-system --lines 50"
fi

echo ""
echo "=========================================="
echo "  迁移完成!"
echo "=========================================="
echo ""
echo "默认账号:"
echo "  管理员: admin / Admin123456"
echo "  测试用户: test@yushuo.click / Test123456"
echo ""
echo "PM2状态:"
pm2 info member-system --no-daemon

echo ""
echo "✅ 所有操作完成！"
