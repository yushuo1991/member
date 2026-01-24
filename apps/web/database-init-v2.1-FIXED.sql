-- ============================================================================
-- Member System - 数据库初始化脚本 (修复版 v2.1)
-- 功能：修复缺失的 rate_limits 表
-- 版本：v2.1
-- 修复日期：2026-01-05
-- ============================================================================

-- ============================================================================
-- 1. 创建数据库
-- ============================================================================
CREATE DATABASE IF NOT EXISTS member_system
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE member_system;

-- ============================================================================
-- 2. 删除旧表（如果存在）
-- ============================================================================
DROP TABLE IF EXISTS admin_audit_logs;
DROP TABLE IF EXISTS product_access_logs;
DROP TABLE IF EXISTS login_logs;
DROP TABLE IF EXISTS activation_codes;
DROP TABLE IF EXISTS memberships;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS rate_limits;
DROP TABLE IF EXISTS admins;
DROP TABLE IF EXISTS users;

-- ============================================================================
-- 3. 创建 users 表（用户表）
-- ============================================================================
CREATE TABLE users (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
    username VARCHAR(100) NOT NULL UNIQUE COMMENT '用户名',
    email VARCHAR(255) NOT NULL UNIQUE COMMENT '邮箱',
    password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希',
    phone VARCHAR(20) COMMENT '电话号码',
    real_name VARCHAR(100) COMMENT '真实姓名',
    avatar_url VARCHAR(500) COMMENT '头像URL',
    status TINYINT DEFAULT 1 COMMENT '用户状态：1=正常，0=禁用',
    last_login_at TIMESTAMP NULL COMMENT '最后登录时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted_at TIMESTAMP NULL COMMENT '删除时间（软删除）',
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- ============================================================================
-- 4. 创建 memberships 表（会员表 - 简化设计）
-- ============================================================================
CREATE TABLE memberships (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '会员ID',
    user_id INT UNSIGNED NOT NULL UNIQUE COMMENT '用户ID（一个用户只有一个会员记录）',
    level ENUM('none', 'monthly', 'quarterly', 'yearly', 'lifetime') DEFAULT 'none' COMMENT '会员等级',
    expires_at TIMESTAMP NULL COMMENT '到期时间（lifetime为NULL）',
    activated_at TIMESTAMP NULL COMMENT '最后激活时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_level (level),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会员表';

-- ============================================================================
-- 5. 创建 activation_codes 表（激活码表）
-- ============================================================================
CREATE TABLE activation_codes (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '激活码ID',
    code VARCHAR(50) NOT NULL UNIQUE COMMENT '激活码',
    level ENUM('monthly', 'quarterly', 'yearly', 'lifetime') NOT NULL COMMENT '会员等级',
    duration_days INT NOT NULL COMMENT '有效天数（lifetime=36500）',
    used TINYINT DEFAULT 0 COMMENT '是否已使用：0=未使用，1=已使用',
    used_by INT UNSIGNED NULL COMMENT '使用者用户ID',
    used_at TIMESTAMP NULL COMMENT '使用时间',
    admin_id INT UNSIGNED NULL COMMENT '生成管理员ID',
    batch_id VARCHAR(100) COMMENT '批次ID（用于批量生成）',
    expires_at TIMESTAMP NULL COMMENT '激活码过期时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_code (code),
    INDEX idx_level (level),
    INDEX idx_used (used),
    INDEX idx_batch_id (batch_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='激活码表';

-- ============================================================================
-- 6. 创建 products 表（产品表 - 外部系统）
-- ============================================================================
CREATE TABLE products (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '产品ID',
    slug VARCHAR(50) NOT NULL UNIQUE COMMENT '产品标识(bk/xinli/fuplan)',
    name VARCHAR(100) NOT NULL COMMENT '产品名称',
    description TEXT COMMENT '产品描述',
    url VARCHAR(500) NOT NULL COMMENT '产品URL',
    icon VARCHAR(50) COMMENT '图标emoji',
    required_level ENUM('none', 'monthly', 'quarterly', 'yearly', 'lifetime') NOT NULL COMMENT '所需会员等级',
    status TINYINT DEFAULT 1 COMMENT '状态：1=激活，0=停用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_slug (slug),
    INDEX idx_status (status),
    INDEX idx_required_level (required_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='产品表';

-- ============================================================================
-- 7. 创建 product_access_logs 表（产品访问日志）
-- ============================================================================
CREATE TABLE product_access_logs (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '日志ID',
    user_id INT UNSIGNED NOT NULL COMMENT '用户ID',
    product_slug VARCHAR(50) NOT NULL COMMENT '产品标识',
    access_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '访问时间',
    ip_address VARCHAR(45) COMMENT 'IP地址',
    user_agent TEXT COMMENT '用户代理',
    session_id VARCHAR(100) COMMENT '会话ID',
    INDEX idx_user_product (user_id, product_slug),
    INDEX idx_access_time (access_time),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='产品访问日志表';

-- ============================================================================
-- 8. 创建 admins 表（管理员表）
-- ============================================================================
CREATE TABLE admins (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '管理员ID',
    username VARCHAR(100) NOT NULL UNIQUE COMMENT '管理员用户名',
    email VARCHAR(255) NOT NULL UNIQUE COMMENT '邮箱',
    password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希',
    role VARCHAR(50) NOT NULL DEFAULT 'admin' COMMENT '角色：admin=管理员，super_admin=超级管理员',
    is_super TINYINT DEFAULT 0 COMMENT '是否为超级管理员',
    last_login_at TIMESTAMP NULL COMMENT '最后登录时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理员表';

-- ============================================================================
-- 9. 创建 login_logs 表（登录日志）
-- ============================================================================
CREATE TABLE login_logs (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '日志ID',
    user_id INT UNSIGNED NULL COMMENT '用户ID',
    email VARCHAR(255) NOT NULL COMMENT '登录邮箱',
    ip_address VARCHAR(45) COMMENT 'IP地址',
    user_agent TEXT COMMENT '用户代理',
    success TINYINT NOT NULL COMMENT '是否成功：1=成功，0=失败',
    failure_reason VARCHAR(255) COMMENT '失败原因',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_user_id (user_id),
    INDEX idx_email (email),
    INDEX idx_created_at (created_at),
    INDEX idx_success (success)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='登录日志表';

-- ============================================================================
-- 10. 创建 admin_audit_logs 表（管理员操作审计日志）
-- ============================================================================
CREATE TABLE admin_audit_logs (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '日志ID',
    admin_id INT UNSIGNED NOT NULL COMMENT '管理员ID',
    action VARCHAR(100) NOT NULL COMMENT '操作类型',
    target_type VARCHAR(50) COMMENT '目标类型(user/membership/code)',
    target_id INT UNSIGNED COMMENT '目标ID',
    old_value JSON COMMENT '旧值',
    new_value JSON COMMENT '新值',
    description TEXT COMMENT '操作描述',
    ip_address VARCHAR(45) COMMENT '操作IP地址',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_admin_id (admin_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理员操作审计日志表';

-- ============================================================================
-- 11. 创建 rate_limits 表（限流表）- 修复：原 v2 缺失此表
-- ============================================================================
CREATE TABLE rate_limits (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '限流记录ID',
    ip_address VARCHAR(45) NOT NULL COMMENT 'IP地址',
    action_type VARCHAR(50) NOT NULL COMMENT '操作类型：login, register, activate等',
    attempt_count INT DEFAULT 1 COMMENT '尝试次数',
    first_attempt_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '首次尝试时间',
    last_attempt_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后尝试时间',
    blocked_until DATETIME DEFAULT NULL COMMENT '封禁截止时间',
    UNIQUE KEY unique_ip_action (ip_address, action_type),
    INDEX idx_ip (ip_address),
    INDEX idx_action_type (action_type),
    INDEX idx_blocked (blocked_until)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='限流表';

-- ============================================================================
-- 12. 插入初始产品数据
-- ============================================================================
INSERT INTO products (slug, name, description, url, icon, required_level, status) VALUES
('bk', '板块节奏系统', '专业的股市板块轮动分析工具，实时追踪热点板块，把握投资机会', 'https://bk.yushuo.click', '📊', 'monthly', 1),
('xinli', '心理评估系统', '专业心理健康评估平台，提供科学的心理测评和专业咨询建议', 'https://xinli.yushuo.click', '🧠', 'monthly', 1),
('fuplan', '交易复盘系统', '系统化的交易复盘工具，帮助您总结经验，提升交易水平', 'https://yushuo.click', '📈', 'quarterly', 1);

-- ============================================================================
-- 13. 创建默认管理员账户
-- ============================================================================
-- 密码：Admin123456
-- bcrypt hash: $2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
INSERT INTO admins (username, email, password_hash, role, is_super) VALUES
('admin', 'admin@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'super_admin', 1);

-- ============================================================================
-- 14. 创建测试数据（可选）
-- ============================================================================

-- 创建测试用户
-- 密码：Test123456
-- bcrypt hash: $2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
INSERT INTO users (username, email, password_hash, real_name, status) VALUES
('zhangsan', 'zhangsan@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '张三', 1);

-- 为测试用户创建会员记录（月度会员，30天后过期）
INSERT INTO memberships (user_id, level, expires_at, activated_at)
SELECT id, 'monthly', DATE_ADD(NOW(), INTERVAL 30 DAY), NOW()
FROM users WHERE username = 'zhangsan' LIMIT 1;

-- 创建一些测试激活码
INSERT INTO activation_codes (code, level, duration_days, admin_id, batch_id) VALUES
('MONTHLY-TEST-2026-001', 'monthly', 30, 1, 'test-batch-001'),
('QUARTERLY-TEST-2026-001', 'quarterly', 90, 1, 'test-batch-001'),
('YEARLY-TEST-2026-001', 'yearly', 365, 1, 'test-batch-001'),
('LIFETIME-TEST-2026-001', 'lifetime', 36500, 1, 'test-batch-001');

-- ============================================================================
-- 完成
-- ============================================================================
SELECT '✅ 数据库初始化完成！(v2.1 - 修复版)' AS message;
SELECT '📧 默认管理员：admin@example.com / Admin123456' AS admin_account;
SELECT '👤 测试用户：zhangsan@example.com / Test123456 (月度会员)' AS test_user;
SELECT '🎟️  测试激活码已生成，查看 activation_codes 表' AS test_codes;
SELECT '🔧 修复内容：添加缺失的 rate_limits 表' AS fix_notes;
