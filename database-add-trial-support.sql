-- ============================================================================
-- Trial Functionality Database Migration
-- 为现有 member_system 数据库添加试用功能支持
-- ============================================================================

USE member_system;

-- ============================================================================
-- 1. 为 users 表添加试用字段
-- ============================================================================
ALTER TABLE users
ADD COLUMN trial_bk INT DEFAULT 5 COMMENT '板块节奏系统剩余试用次数',
ADD COLUMN trial_xinli INT DEFAULT 5 COMMENT '心理测评系统剩余试用次数',
ADD COLUMN trial_fuplan INT DEFAULT 5 COMMENT '复盘系统剩余试用次数';

-- 为试用字段添加索引以提升查询性能
ALTER TABLE users
ADD INDEX idx_trial_bk (trial_bk),
ADD INDEX idx_trial_xinli (trial_xinli),
ADD INDEX idx_trial_fuplan (trial_fuplan);

SELECT '✓ 已为 users 表添加试用字段和索引' AS status;

-- ============================================================================
-- 2. 为 products 表添加试用配置字段
-- ============================================================================
ALTER TABLE products
ADD COLUMN trial_enabled TINYINT DEFAULT 0 COMMENT '是否支持试用：1=支持，0=不支持',
ADD COLUMN trial_count INT DEFAULT 0 COMMENT '默认试用次数';

-- 更新现有产品的试用配置
UPDATE products SET trial_enabled = 1, trial_count = 5 WHERE slug = 'bk';
UPDATE products SET trial_enabled = 1, trial_count = 5 WHERE slug = 'xinli';
UPDATE products SET trial_enabled = 1, trial_count = 5 WHERE slug = 'fuplan';

-- 为 trial_enabled 添加索引
ALTER TABLE products
ADD INDEX idx_trial_enabled (trial_enabled);

SELECT '✓ 已为 products 表添加试用配置字段' AS status;

-- ============================================================================
-- 3. 创建 trial_logs 表（试用日志表）
-- ============================================================================
CREATE TABLE IF NOT EXISTS trial_logs (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '试用日志ID',
    user_id INT UNSIGNED NOT NULL COMMENT '用户ID',
    product_slug VARCHAR(50) NOT NULL COMMENT '产品标识（bk/xinli/fuplan）',
    ip_address VARCHAR(45) COMMENT 'IP地址',
    user_agent TEXT COMMENT '用户代理字符串',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '试用时间',
    INDEX idx_user_product (user_id, product_slug),
    INDEX idx_product_slug (product_slug),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='试用日志表';

SELECT '✓ 已创建 trial_logs 表' AS status;

-- ============================================================================
-- 4. 验证迁移结果
-- ============================================================================
SELECT '========================================' AS '';
SELECT '数据库迁移完成！' AS '';
SELECT '========================================' AS '';

-- 显示 users 表结构（试用字段）
SELECT '--- users 表的试用字段 ---' AS '';
SELECT COLUMN_NAME, COLUMN_TYPE, COLUMN_DEFAULT, COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'member_system'
  AND TABLE_NAME = 'users'
  AND COLUMN_NAME LIKE 'trial_%';

-- 显示 products 表的试用配置
SELECT '--- products 表的试用配置 ---' AS '';
SELECT slug, name, trial_enabled, trial_count
FROM products
WHERE trial_enabled = 1;

-- 显示现有用户的试用次数（前5个用户）
SELECT '--- 现有用户的试用次数（示例）---' AS '';
SELECT id, username, trial_bk, trial_xinli, trial_fuplan
FROM users
LIMIT 5;

-- 确认 trial_logs 表已创建
SELECT '--- trial_logs 表信息 ---' AS '';
SELECT TABLE_NAME, TABLE_COMMENT, ENGINE, TABLE_COLLATION
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'member_system'
  AND TABLE_NAME = 'trial_logs';

SELECT '========================================' AS '';
SELECT '✓ 试用功能数据库迁移成功完成！' AS '';
SELECT '========================================' AS '';
