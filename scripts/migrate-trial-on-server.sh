#!/bin/bash
# 服务器端数据库迁移脚本
# 用途：在服务器上执行，为现有数据库添加试用功能支持
# 执行：bash migrate-trial-on-server.sh

set -e

echo "========================================="
echo "试用功能数据库迁移脚本"
echo "========================================="
echo ""

# 数据库配置（从环境变量读取）
DB_HOST="${DB_HOST:-localhost}"
DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_PASSWORD}"
DB_NAME="${DB_NAME:-member_system}"

if [ -z "$DB_PASSWORD" ]; then
  echo "❌ 错误: 未设置 DB_PASSWORD 环境变量"
  exit 1
fi

echo "📍 数据库: $DB_HOST/$DB_NAME"
echo ""

# 创建临时SQL文件
TEMP_SQL="/tmp/trial_migration_$(date +%s).sql"

cat > "$TEMP_SQL" << 'EOF'
-- 试用功能数据库迁移脚本
USE member_system;

-- 1. 为 users 表添加试用字段（如果不存在）
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'member_system' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'trial_bk');
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE users ADD COLUMN trial_bk INT DEFAULT 5 COMMENT "板块节奏系统试用次数"',
  'SELECT "trial_bk already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'member_system' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'trial_xinli');
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE users ADD COLUMN trial_xinli INT DEFAULT 5 COMMENT "心理测评系统试用次数"',
  'SELECT "trial_xinli already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'member_system' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'trial_fuplan');
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE users ADD COLUMN trial_fuplan INT DEFAULT 5 COMMENT "复盘系统试用次数"',
  'SELECT "trial_fuplan already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2. 为 products 表添加试用配置字段（如果不存在）
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'member_system' AND TABLE_NAME = 'products' AND COLUMN_NAME = 'trial_enabled');
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE products ADD COLUMN trial_enabled TINYINT DEFAULT 0 COMMENT "是否支持试用"',
  'SELECT "trial_enabled already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'member_system' AND TABLE_NAME = 'products' AND COLUMN_NAME = 'trial_count');
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE products ADD COLUMN trial_count INT DEFAULT 5 COMMENT "试用次数"',
  'SELECT "trial_count already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3. 更新产品试用配置
UPDATE products SET trial_enabled = 1, trial_count = 5 WHERE slug IN ('bk', 'xinli', 'fuplan') AND trial_enabled = 0;

-- 4. 创建 trial_logs 表（如果不存在）
CREATE TABLE IF NOT EXISTS trial_logs (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '日志ID',
  user_id INT UNSIGNED NOT NULL COMMENT '用户ID',
  product_slug VARCHAR(50) NOT NULL COMMENT '产品标识',
  used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '使用时间',
  ip_address VARCHAR(45) COMMENT 'IP地址',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_product (user_id, product_slug),
  INDEX idx_used_at (used_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='试用日志表';

-- 5. 验证结果
SELECT '✅ 迁移完成' AS status;
SELECT COLUMN_NAME, COLUMN_TYPE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'member_system' AND TABLE_NAME = 'users' AND COLUMN_NAME LIKE 'trial_%';
EOF

echo "[1/2] 执行数据库迁移..."
mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < "$TEMP_SQL"

if [ $? -eq 0 ]; then
  echo "✅ 数据库迁移成功"
else
  echo "❌ 数据库迁移失败"
  rm -f "$TEMP_SQL"
  exit 1
fi

echo ""
echo "[2/2] 清理临时文件..."
rm -f "$TEMP_SQL"

echo ""
echo "========================================="
echo "✅ 试用功能已成功启用！"
echo "========================================="
echo ""
echo "迁移内容："
echo "  ✓ users 表添加了 trial_bk, trial_xinli, trial_fuplan 字段"
echo "  ✓ products 表添加了 trial_enabled, trial_count 字段"
echo "  ✓ 创建了 trial_logs 表"
echo "  ✓ 为 bk, xinli, fuplan 启用了试用功能"
echo ""
