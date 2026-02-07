-- ============================================================================
-- 数据库索引验证脚本
-- Database Index Verification Script
-- ============================================================================
-- 用途: 验证索引是否正确创建，检查索引统计信息
-- Purpose: Verify indexes are created correctly and check index statistics
--
-- 使用方法:
-- Usage:
--   mysql -u root -p member_system < scripts/verify-indexes.sql
-- ============================================================================

USE member_system;

-- ============================================================================
-- 1. 显示所有表的索引信息
-- Show index information for all tables
-- ============================================================================

SELECT '========================================' AS '';
SELECT '所有表的索引信息 / Index Information for All Tables' AS '';
SELECT '========================================' AS '';

SELECT
    TABLE_NAME as '表名/Table',
    INDEX_NAME as '索引名/Index Name',
    COLUMN_NAME as '列名/Column',
    SEQ_IN_INDEX as '列顺序/Sequence',
    NON_UNIQUE as '非唯一/Non-Unique',
    INDEX_TYPE as '索引类型/Type',
    CARDINALITY as '基数/Cardinality'
FROM
    information_schema.STATISTICS
WHERE
    TABLE_SCHEMA = 'member_system'
    AND TABLE_NAME IN (
        'users',
        'memberships',
        'activation_codes',
        'trial_logs',
        'login_logs',
        'user_product_purchases',
        'products',
        'rate_limits',
        'admin_audit_logs'
    )
ORDER BY
    TABLE_NAME,
    INDEX_NAME,
    SEQ_IN_INDEX;

-- ============================================================================
-- 2. 按表统计索引数量
-- Count indexes by table
-- ============================================================================

SELECT '========================================' AS '';
SELECT '各表索引数量统计 / Index Count by Table' AS '';
SELECT '========================================' AS '';

SELECT
    TABLE_NAME as '表名/Table',
    COUNT(DISTINCT INDEX_NAME) as '索引数量/Index Count'
FROM
    information_schema.STATISTICS
WHERE
    TABLE_SCHEMA = 'member_system'
    AND TABLE_NAME IN (
        'users',
        'memberships',
        'activation_codes',
        'trial_logs',
        'login_logs',
        'user_product_purchases',
        'products',
        'rate_limits',
        'admin_audit_logs'
    )
GROUP BY
    TABLE_NAME
ORDER BY
    TABLE_NAME;

-- ============================================================================
-- 3. 验证关键索引是否存在
-- Verify critical indexes exist
-- ============================================================================

SELECT '========================================' AS '';
SELECT '关键索引验证 / Critical Index Verification' AS '';
SELECT '========================================' AS '';

SELECT
    '检查项/Check' as 'Item',
    '状态/Status' as 'Status'
FROM DUAL WHERE FALSE

UNION ALL

-- users 表索引
SELECT 'users.idx_user_status_deleted',
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = 'member_system'
        AND TABLE_NAME = 'users'
        AND INDEX_NAME = 'idx_user_status_deleted'
    ) THEN '✓ 存在/Exists' ELSE '✗ 缺失/Missing' END

UNION ALL

SELECT 'users.idx_user_username',
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = 'member_system'
        AND TABLE_NAME = 'users'
        AND INDEX_NAME = 'idx_user_username'
    ) THEN '✓ 存在/Exists' ELSE '✗ 缺失/Missing' END

UNION ALL

-- memberships 表索引
SELECT 'memberships.idx_membership_user_level_expires',
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = 'member_system'
        AND TABLE_NAME = 'memberships'
        AND INDEX_NAME = 'idx_membership_user_level_expires'
    ) THEN '✓ 存在/Exists' ELSE '✗ 缺失/Missing' END

UNION ALL

-- activation_codes 表索引
SELECT 'activation_codes.idx_activation_code',
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = 'member_system'
        AND TABLE_NAME = 'activation_codes'
        AND INDEX_NAME = 'idx_activation_code'
    ) THEN '✓ 存在/Exists' ELSE '✗ 缺失/Missing' END

UNION ALL

SELECT 'activation_codes.idx_activation_used_level',
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = 'member_system'
        AND TABLE_NAME = 'activation_codes'
        AND INDEX_NAME = 'idx_activation_used_level'
    ) THEN '✓ 存在/Exists' ELSE '✗ 缺失/Missing' END

UNION ALL

-- trial_logs 表索引
SELECT 'trial_logs.idx_trial_user_product_time',
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = 'member_system'
        AND TABLE_NAME = 'trial_logs'
        AND INDEX_NAME = 'idx_trial_user_product_time'
    ) THEN '✓ 存在/Exists' ELSE '✗ 缺失/Missing' END

UNION ALL

-- login_logs 表索引
SELECT 'login_logs.idx_login_user_time',
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = 'member_system'
        AND TABLE_NAME = 'login_logs'
        AND INDEX_NAME = 'idx_login_user_time'
    ) THEN '✓ 存在/Exists' ELSE '✗ 缺失/Missing' END

UNION ALL

-- products 表索引
SELECT 'products.idx_product_slug',
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = 'member_system'
        AND TABLE_NAME = 'products'
        AND INDEX_NAME = 'idx_product_slug'
    ) THEN '✓ 存在/Exists' ELSE '✗ 缺失/Missing' END

UNION ALL

-- rate_limits 表索引
SELECT 'rate_limits.idx_ratelimit_user_endpoint_window',
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = 'member_system'
        AND TABLE_NAME = 'rate_limits'
        AND INDEX_NAME = 'idx_ratelimit_user_endpoint_window'
    ) THEN '✓ 存在/Exists' ELSE '✗ 缺失/Missing' END;

-- ============================================================================
-- 4. 表大小和索引大小统计
-- Table and index size statistics
-- ============================================================================

SELECT '========================================' AS '';
SELECT '表和索引大小统计 / Table and Index Size Statistics' AS '';
SELECT '========================================' AS '';

SELECT
    TABLE_NAME as '表名/Table',
    ROUND(DATA_LENGTH / 1024 / 1024, 2) as '数据大小MB/Data Size MB',
    ROUND(INDEX_LENGTH / 1024 / 1024, 2) as '索引大小MB/Index Size MB',
    ROUND((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024, 2) as '总大小MB/Total Size MB',
    TABLE_ROWS as '行数/Rows'
FROM
    information_schema.TABLES
WHERE
    TABLE_SCHEMA = 'member_system'
    AND TABLE_NAME IN (
        'users',
        'memberships',
        'activation_codes',
        'trial_logs',
        'login_logs',
        'user_product_purchases',
        'products',
        'rate_limits',
        'admin_audit_logs'
    )
ORDER BY
    (DATA_LENGTH + INDEX_LENGTH) DESC;

-- ============================================================================
-- 5. 索引使用情况分析 (需要运行一段时间后才有数据)
-- Index usage analysis (requires data after running for a while)
-- ============================================================================

SELECT '========================================' AS '';
SELECT '索引使用情况提示 / Index Usage Note' AS '';
SELECT '========================================' AS '';

SELECT
    '提示: 索引使用统计需要在生产环境运行一段时间后才能获取' as 'Note',
    'Note: Index usage statistics require running in production for a while' as '';

-- ============================================================================
-- 验证完成
-- Verification Completed
-- ============================================================================

SELECT '========================================' AS '';
SELECT '✓ 索引验证完成 / Index Verification Completed' AS '';
SELECT '========================================' AS '';
