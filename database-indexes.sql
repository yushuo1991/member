-- ============================================================================
-- 数据库索引优化脚本
-- Database Index Optimization Script
-- ============================================================================
-- 用途: 优化查询性能，提升系统响应速度
-- Purpose: Optimize query performance and improve system response time
--
-- 使用方法:
-- Usage:
--   mysql -u root -p member_system < database-indexes.sql
--
-- 注意事项:
-- Notes:
--   1. 在生产环境执行前请先备份数据库
--   2. 索引会占用额外的磁盘空间
--   3. 索引会略微降低写入性能，但大幅提升查询性能
--   4. 如果索引已存在，会显示警告但不会影响执行
-- ============================================================================

USE member_system;

-- ============================================================================
-- users 表索引优化
-- Users Table Index Optimization
-- ============================================================================

-- 用户状态和删除状态组合索引
-- 优化场景: 查询活跃用户、过滤已删除用户
-- Composite index for user status and deletion status
-- Optimizes: Active user queries, filtering deleted users
CREATE INDEX IF NOT EXISTS idx_user_status_deleted
ON users(status, deleted_at);

-- 用户名索引 (如果不存在)
-- Username index for login queries
CREATE INDEX IF NOT EXISTS idx_user_username
ON users(username);

-- 邮箱索引 (如果不存在)
-- Email index for email-based queries
CREATE INDEX IF NOT EXISTS idx_user_email
ON users(email);

-- 创建时间索引
-- Creation time index for sorting and filtering
CREATE INDEX IF NOT EXISTS idx_user_created_at
ON users(created_at);

-- ============================================================================
-- memberships 表索引优化
-- Memberships Table Index Optimization
-- ============================================================================

-- 用户ID、会员等级、过期时间组合索引
-- 优化场景: 检查用户会员权限、查询有效会员
-- Composite index for user membership validation
-- Optimizes: Permission checks, active membership queries
CREATE INDEX IF NOT EXISTS idx_membership_user_level_expires
ON memberships(user_id, level, expires_at);

-- 会员等级和过期时间索引
-- 优化场景: 统计各等级会员数量、查询即将过期的会员
-- Membership level and expiry index
-- Optimizes: Level statistics, expiring membership queries
CREATE INDEX IF NOT EXISTS idx_membership_level_expires
ON memberships(level, expires_at);

-- 过期时间索引
-- 优化场景: 定时任务清理过期会员
-- Expiry time index for cleanup tasks
CREATE INDEX IF NOT EXISTS idx_membership_expires_at
ON memberships(expires_at);

-- ============================================================================
-- activation_codes 表索引优化
-- Activation Codes Table Index Optimization
-- ============================================================================

-- 激活码使用状态、等级、创建时间组合索引
-- 优化场景: 查询未使用的激活码、按等级筛选
-- Composite index for code availability queries
-- Optimizes: Unused code queries, level-based filtering
CREATE INDEX IF NOT EXISTS idx_activation_used_level
ON activation_codes(used, level, created_at);

-- 批次ID和创建时间索引
-- 优化场景: 按批次查询激活码、批次统计
-- Batch ID and creation time index
-- Optimizes: Batch queries, batch statistics
CREATE INDEX IF NOT EXISTS idx_activation_batch
ON activation_codes(batch_id, created_at);

-- 激活码索引 (唯一索引，如果不存在)
-- Unique index for activation code lookup
CREATE UNIQUE INDEX IF NOT EXISTS idx_activation_code
ON activation_codes(code);

-- 使用状态和过期时间索引
-- 优化场景: 查询有效的未使用激活码
-- Used status and expiry time index
-- Optimizes: Valid unused code queries
CREATE INDEX IF NOT EXISTS idx_activation_used_expires
ON activation_codes(used, expires_at);

-- ============================================================================
-- trial_logs 表索引优化
-- Trial Logs Table Index Optimization
-- ============================================================================

-- 用户ID、产品标识、使用时间组合索引
-- 优化场景: 检查用户试用次数、统计产品试用情况
-- Composite index for trial usage tracking
-- Optimizes: User trial count checks, product trial statistics
CREATE INDEX IF NOT EXISTS idx_trial_user_product_time
ON trial_logs(user_id, product_slug, used_at);

-- 产品标识和使用时间索引
-- 优化场景: 统计产品试用趋势
-- Product and time index for trial trends
CREATE INDEX IF NOT EXISTS idx_trial_product_time
ON trial_logs(product_slug, used_at);

-- 使用时间索引
-- 优化场景: 按时间范围统计试用数据
-- Time index for time-based statistics
CREATE INDEX IF NOT EXISTS idx_trial_used_at
ON trial_logs(used_at);

-- ============================================================================
-- login_logs 表索引优化
-- Login Logs Table Index Optimization
-- ============================================================================

-- 用户ID和登录时间组合索引
-- 优化场景: 查询用户登录历史
-- User ID and login time composite index
-- Optimizes: User login history queries
CREATE INDEX IF NOT EXISTS idx_login_user_time
ON login_logs(user_id, created_at);

-- 登录成功状态和时间索引
-- 优化场景: 统计登录成功率、查询失败登录
-- Success status and time index
-- Optimizes: Success rate statistics, failed login queries
CREATE INDEX IF NOT EXISTS idx_login_success_time
ON login_logs(success, created_at);

-- IP地址索引
-- 优化场景: 检测异常登录、IP黑名单
-- IP address index for security monitoring
CREATE INDEX IF NOT EXISTS idx_login_ip
ON login_logs(ip_address);

-- 登录时间索引
-- 优化场景: 按时间范围查询登录记录
-- Time index for time-based queries
CREATE INDEX IF NOT EXISTS idx_login_created_at
ON login_logs(created_at);

-- ============================================================================
-- user_product_purchases 表索引优化
-- User Product Purchases Table Index Optimization
-- ============================================================================

-- 用户ID、产品标识、过期时间组合索引
-- 优化场景: 检查用户产品权限、查询有效购买
-- Composite index for product access validation
-- Optimizes: Product permission checks, active purchase queries
CREATE INDEX IF NOT EXISTS idx_purchase_user_product_expires
ON user_product_purchases(user_id, product_slug, expires_at);

-- 产品标识和过期时间索引
-- 优化场景: 统计产品购买情况
-- Product and expiry index for purchase statistics
CREATE INDEX IF NOT EXISTS idx_purchase_product_expires
ON user_product_purchases(product_slug, expires_at);

-- 过期时间索引
-- 优化场景: 定时任务清理过期购买记录
-- Expiry time index for cleanup tasks
CREATE INDEX IF NOT EXISTS idx_purchase_expires_at
ON user_product_purchases(expires_at);

-- 购买时间索引
-- 优化场景: 按时间统计购买趋势
-- Purchase time index for trend analysis
CREATE INDEX IF NOT EXISTS idx_purchase_purchased_at
ON user_product_purchases(purchased_at);

-- ============================================================================
-- products 表索引优化
-- Products Table Index Optimization
-- ============================================================================

-- 产品标识索引 (唯一索引，如果不存在)
-- Unique index for product slug lookup
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_slug
ON products(slug);

-- 产品状态索引
-- 优化场景: 查询可用产品
-- Status index for active product queries
CREATE INDEX IF NOT EXISTS idx_product_status
ON products(status);

-- 产品类别索引
-- 优化场景: 按类别筛选产品
-- Category index for category-based filtering
CREATE INDEX IF NOT EXISTS idx_product_category
ON products(category);

-- ============================================================================
-- rate_limits 表索引优化
-- Rate Limits Table Index Optimization
-- ============================================================================

-- 用户ID、端点、时间窗口组合索引
-- 优化场景: 检查API调用频率限制
-- Composite index for rate limit checks
-- Optimizes: API rate limit validation
CREATE INDEX IF NOT EXISTS idx_ratelimit_user_endpoint_window
ON rate_limits(user_id, endpoint, window_start);

-- 时间窗口索引
-- 优化场景: 清理过期的限流记录
-- Window start index for cleanup tasks
CREATE INDEX IF NOT EXISTS idx_ratelimit_window_start
ON rate_limits(window_start);

-- ============================================================================
-- admin_audit_logs 表索引优化
-- Admin Audit Logs Table Index Optimization
-- ============================================================================

-- 管理员ID和操作时间索引
-- 优化场景: 查询管理员操作历史
-- Admin ID and time index for audit queries
CREATE INDEX IF NOT EXISTS idx_audit_admin_time
ON admin_audit_logs(admin_id, created_at);

-- 操作类型和时间索引
-- 优化场景: 按操作类型统计
-- Action type and time index for action statistics
CREATE INDEX IF NOT EXISTS idx_audit_action_time
ON admin_audit_logs(action, created_at);

-- 目标用户ID索引
-- 优化场景: 查询针对特定用户的管理操作
-- Target user ID index for user-specific audit queries
CREATE INDEX IF NOT EXISTS idx_audit_target_user
ON admin_audit_logs(target_user_id);

-- 操作时间索引
-- 优化场景: 按时间范围查询审计日志
-- Time index for time-based audit queries
CREATE INDEX IF NOT EXISTS idx_audit_created_at
ON admin_audit_logs(created_at);

-- ============================================================================
-- 索引创建完成
-- Index Creation Completed
-- ============================================================================

-- 显示所有表的索引信息
-- Show index information for all tables
SELECT
    TABLE_NAME as '表名/Table',
    INDEX_NAME as '索引名/Index Name',
    COLUMN_NAME as '列名/Column',
    SEQ_IN_INDEX as '列顺序/Sequence',
    INDEX_TYPE as '索引类型/Type'
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
-- 性能优化建议
-- Performance Optimization Recommendations
-- ============================================================================
--
-- 1. 定期分析表和索引使用情况:
--    ANALYZE TABLE users, memberships, activation_codes, trial_logs, login_logs;
--
-- 2. 监控慢查询日志:
--    SET GLOBAL slow_query_log = 'ON';
--    SET GLOBAL long_query_time = 2;
--
-- 3. 定期清理过期数据:
--    - 删除过期的 rate_limits 记录
--    - 归档旧的 login_logs 和 admin_audit_logs
--    - 清理过期的 activation_codes
--
-- 4. 考虑分区表 (对于大数据量):
--    - login_logs 按月分区
--    - trial_logs 按月分区
--    - admin_audit_logs 按月分区
--
-- 5. 索引维护:
--    - 定期重建索引: ALTER TABLE table_name ENGINE=InnoDB;
--    - 检查索引碎片: SHOW TABLE STATUS LIKE 'table_name';
--
-- ============================================================================
