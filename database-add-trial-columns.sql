-- ============================================================================
-- 添加试用功能支持 - 数据库迁移脚本
-- 版本：v1.0
-- 日期：2026-02-08
-- 说明：为现有的 member_system 数据库添加试用功能支持
-- ============================================================================

USE member_system;

-- ============================================================================
-- 1. 为 users 表添加试用次数字段
-- ============================================================================
ALTER TABLE users
ADD COLUMN trial_bk TINYINT UNSIGNED DEFAULT 5 COMMENT '板块助手试用次数（默认5次）' AFTER status,
ADD COLUMN trial_xinli TINYINT UNSIGNED DEFAULT 5 COMMENT '心理测评试用次数（默认5次）' AFTER trial_bk,
ADD COLUMN trial_fuplan TINYINT UNSIGNED DEFAULT 5 COMMENT '复盘系统试用次数（默认5次）' AFTER trial_xinli;

-- 添加索引以优化查询性能
ALTER TABLE users
ADD INDEX idx_trial_bk (trial_bk),
ADD INDEX idx_trial_xinli (trial_xinli),
ADD INDEX idx_trial_fuplan (trial_fuplan);

-- ============================================================================
-- 2. 创建 trial_logs 表（试用日志表）
-- ============================================================================
CREATE TABLE IF NOT EXISTS trial_logs (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '日志ID',
    user_id INT UNSIGNED NOT NULL COMMENT '用户ID',
    product_slug VARCHAR(50) NOT NULL COMMENT '产品标识(bk/xinli/fuplan)',
    ip_address VARCHAR(45) COMMENT 'IP地址',
    user_agent TEXT COMMENT '用户代理',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '试用时间',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_product_slug (product_slug),
    INDEX idx_created_at (created_at),
    INDEX idx_user_product (user_id, product_slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='试用日志表';

-- ============================================================================
-- 3. 验证修改
-- ============================================================================
-- 查看 users 表结构
DESCRIBE users;

-- 查看 trial_logs 表结构
DESCRIBE trial_logs;

-- 统计现有用户的试用次数
SELECT
    COUNT(*) as total_users,
    AVG(trial_bk) as avg_trial_bk,
    AVG(trial_xinli) as avg_trial_xinli,
    AVG(trial_fuplan) as avg_trial_fuplan
FROM users
WHERE deleted_at IS NULL;

-- ============================================================================
-- 完成
-- ============================================================================
SELECT '✓ 试用功能数据库迁移完成！' as status;
