-- 数据库索引优化脚本
-- 为现有表添加额外的复合索引以提升查询性能

USE member_system;

-- 激活码表：添加批次ID索引
ALTER TABLE activation_codes ADD INDEX idx_batch_id (batch_id) IF NOT EXISTS;

-- 激活码表：添加创建者索引（用于管理员查看自己生成的激活码）
ALTER TABLE activation_codes ADD INDEX idx_created_by (created_by) IF NOT EXISTS;

-- 激活码表：复合索引（未使用 + 未过期）
ALTER TABLE activation_codes ADD INDEX idx_available (is_used, expires_at) IF NOT EXISTS;

-- 登录日志表：复合索引（成功状态 + 时间）
ALTER TABLE login_logs ADD INDEX idx_success_time (success, created_at) IF NOT EXISTS;

-- 用户表：复合索引（会员等级 + 创建时间，用于统计）
ALTER TABLE users ADD INDEX idx_level_created (membership_level, created_at) IF NOT EXISTS;

-- 会员操作日志：复合索引（管理员 + 时间）
ALTER TABLE member_operation_logs ADD INDEX idx_admin_time (admin_id, created_at) IF NOT EXISTS;

-- 查看所有索引（验证）
SELECT
  TABLE_NAME,
  INDEX_NAME,
  GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) AS COLUMNS
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'member_system'
GROUP BY TABLE_NAME, INDEX_NAME
ORDER BY TABLE_NAME, INDEX_NAME;
