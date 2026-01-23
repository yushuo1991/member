-- ============================================================================
-- Member System - 数据库初始化脚本
-- 功能：创建数据库、表结构、索引、外键和初始数据
-- ============================================================================

-- ============================================================================
-- 1. 创建数据库
-- ============================================================================
CREATE DATABASE IF NOT EXISTS member_system
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE member_system;

-- ============================================================================
-- 2. 创建 products 表（产品表）
-- ============================================================================
CREATE TABLE IF NOT EXISTS products (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '产品ID',
    name VARCHAR(100) NOT NULL UNIQUE COMMENT '产品名称',
    code VARCHAR(50) NOT NULL UNIQUE COMMENT '产品代码',
    description TEXT COMMENT '产品描述',
    price DECIMAL(10, 2) NOT NULL DEFAULT 0 COMMENT '产品价格',
    duration_days INT NOT NULL DEFAULT 365 COMMENT '会员有效期（天）',
    status TINYINT DEFAULT 1 COMMENT '状态：1=激活，0=停用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_code (code),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='产品表';

-- ============================================================================
-- 3. 创建 users 表（用户表）
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
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
-- 4. 创建 memberships 表（会员表）
-- ============================================================================
CREATE TABLE IF NOT EXISTS memberships (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '会员ID',
    user_id INT UNSIGNED NOT NULL COMMENT '用户ID',
    product_id INT UNSIGNED NOT NULL COMMENT '产品ID',
    activation_code_id INT UNSIGNED COMMENT '激活码ID',
    member_number VARCHAR(100) UNIQUE COMMENT '会员编号',
    start_date DATE NOT NULL COMMENT '会员开始日期',
    end_date DATE NOT NULL COMMENT '会员结束日期',
    status TINYINT DEFAULT 1 COMMENT '状态：1=有效，0=已过期，2=已取消',
    is_auto_renew TINYINT DEFAULT 0 COMMENT '是否自动续期',
    activated_at TIMESTAMP NULL COMMENT '激活时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id),
    INDEX idx_user_id (user_id),
    INDEX idx_product_id (product_id),
    INDEX idx_status (status),
    INDEX idx_end_date (end_date),
    INDEX idx_member_number (member_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会员表';

-- ============================================================================
-- 5. 创建 activation_codes 表（激活码表）
-- ============================================================================
CREATE TABLE IF NOT EXISTS activation_codes (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '激活码ID',
    product_id INT UNSIGNED NOT NULL COMMENT '产品ID',
    code VARCHAR(50) NOT NULL UNIQUE COMMENT '激活码',
    activation_count INT DEFAULT 0 COMMENT '激活次数',
    max_activations INT NOT NULL DEFAULT 1 COMMENT '最大激活次数',
    activated_by INT UNSIGNED COMMENT '激活者用户ID',
    activated_at TIMESTAMP NULL COMMENT '激活时间',
    expires_at TIMESTAMP NULL COMMENT '过期时间',
    status TINYINT DEFAULT 1 COMMENT '状态：1=未使用，0=已使用，2=已过期',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (activated_by) REFERENCES users(id),
    INDEX idx_code (code),
    INDEX idx_product_id (product_id),
    INDEX idx_status (status),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='激活码表';

-- ============================================================================
-- 6. 创建 access_logs 表（访问日志表）
-- ============================================================================
CREATE TABLE IF NOT EXISTS access_logs (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '日志ID',
    user_id INT UNSIGNED COMMENT '用户ID',
    membership_id INT UNSIGNED COMMENT '会员ID',
    product_id INT UNSIGNED COMMENT '产品ID',
    ip_address VARCHAR(45) COMMENT 'IP地址',
    user_agent VARCHAR(500) COMMENT '用户代理',
    access_type VARCHAR(50) COMMENT '访问类型：login,view,download等',
    status INT DEFAULT 200 COMMENT 'HTTP状态码',
    response_time INT DEFAULT 0 COMMENT '响应时间（毫秒）',
    error_message TEXT COMMENT '错误信息',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_user_id (user_id),
    INDEX idx_membership_id (membership_id),
    INDEX idx_product_id (product_id),
    INDEX idx_access_type (access_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='访问日志表';

-- ============================================================================
-- 7. 创建 admins 表（管理员表）
-- ============================================================================
CREATE TABLE IF NOT EXISTS admins (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '管理员ID',
    user_id INT UNSIGNED NOT NULL UNIQUE COMMENT '用户ID',
    role VARCHAR(50) NOT NULL DEFAULT 'admin' COMMENT '角色：admin=管理员，super_admin=超级管理员',
    permissions JSON COMMENT '权限JSON',
    is_super TINYINT DEFAULT 0 COMMENT '是否为超级管理员',
    last_login_at TIMESTAMP NULL COMMENT '最后登录时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_role (role),
    INDEX idx_is_super (is_super)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理员表';

-- ============================================================================
-- 8. 创建 member_operation_logs 表（会员操作日志表）
-- ============================================================================
CREATE TABLE IF NOT EXISTS member_operation_logs (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '日志ID',
    admin_id INT UNSIGNED COMMENT '操作管理员ID',
    membership_id INT UNSIGNED COMMENT '会员ID',
    user_id INT UNSIGNED COMMENT '用户ID',
    operation_type VARCHAR(50) NOT NULL COMMENT '操作类型：create,update,renew,cancel,activate等',
    old_value JSON COMMENT '旧值',
    new_value JSON COMMENT '新值',
    description TEXT COMMENT '操作描述',
    ip_address VARCHAR(45) COMMENT '操作IP地址',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_admin_id (admin_id),
    INDEX idx_membership_id (membership_id),
    INDEX idx_user_id (user_id),
    INDEX idx_operation_type (operation_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会员操作日志表';

-- ============================================================================
-- 9. 插入初始产品数据
-- ============================================================================
INSERT INTO products (name, code, description, price, duration_days, status) VALUES
('百科会员', 'bk', '百科产品会员，包含所有百科内容访问权限', 99.00, 365, 1),
('心理咨询会员', 'xinli', '心理咨询服务会员，可享受专业咨询服务', 299.00, 365, 1),
('理财规划会员', 'fuplan', '理财规划专业版会员，包含个性化投资方案', 599.00, 365, 1);

-- ============================================================================
-- 10. 创建默认管理员账户
-- ============================================================================
-- 插入默认管理员用户（密码：admin123，已MD5加密）
INSERT INTO users (username, email, password_hash, real_name, status) VALUES
('admin', 'admin@member-system.local', '$2y$10$Nt8FqRJFWHE8QvH2kVkfvez3YkRYKLR5KRj0e6rDHqxGJl5d6NNb2', '系统管理员', 1);

-- 插入管理员角色
INSERT INTO admins (user_id, role, is_super)
SELECT id, 'super_admin', 1 FROM users WHERE username = 'admin' LIMIT 1;

-- ============================================================================
-- 11. 创建视图和存储过程
-- ============================================================================

-- 创建有效会员统计视图
CREATE VIEW v_active_memberships AS
SELECT
    m.id,
    m.user_id,
    u.username,
    u.email,
    p.name AS product_name,
    p.code AS product_code,
    m.start_date,
    m.end_date,
    DATEDIFF(m.end_date, CURDATE()) AS days_remaining,
    m.status
FROM memberships m
JOIN users u ON m.user_id = u.id
JOIN products p ON m.product_id = p.id
WHERE m.status = 1 AND m.end_date >= CURDATE();

-- 创建过期会员统计视图
CREATE VIEW v_expired_memberships AS
SELECT
    m.id,
    m.user_id,
    u.username,
    u.email,
    p.name AS product_name,
    p.code AS product_code,
    m.start_date,
    m.end_date,
    DATEDIFF(CURDATE(), m.end_date) AS days_expired
FROM memberships m
JOIN users u ON m.user_id = u.id
JOIN products p ON m.product_id = p.id
WHERE m.status = 1 AND m.end_date < CURDATE();

-- ============================================================================
-- 12. 创建存储过程
-- ============================================================================

-- 存储过程：自动更新过期会员状态
DELIMITER $$

CREATE PROCEDURE sp_update_expired_memberships()
BEGIN
    UPDATE memberships
    SET status = 0
    WHERE status = 1 AND end_date < CURDATE();
END$$

DELIMITER ;

-- ============================================================================
-- 13. 创建索引
-- ============================================================================

-- users 表额外索引
ALTER TABLE users ADD INDEX idx_phone (phone);
ALTER TABLE users ADD INDEX idx_deleted_at (deleted_at);

-- memberships 表额外索引
ALTER TABLE memberships ADD INDEX idx_activation_code_id (activation_code_id);

-- activation_codes 表额外索引
ALTER TABLE activation_codes ADD INDEX idx_activated_by (activated_by);

-- access_logs 表额外索引
ALTER TABLE access_logs ADD INDEX idx_status (status);

-- member_operation_logs 表外键索引
ALTER TABLE member_operation_logs ADD FOREIGN KEY (admin_id) REFERENCES admins(id);
ALTER TABLE member_operation_logs ADD FOREIGN KEY (membership_id) REFERENCES memberships(id);
ALTER TABLE member_operation_logs ADD FOREIGN KEY (user_id) REFERENCES users(id);

-- ============================================================================
-- 14. 创建计划事件（定时任务）
-- ============================================================================

-- 创建事件：每天凌晨2点更新过期会员
CREATE EVENT IF NOT EXISTS evt_update_expired_memberships
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP + INTERVAL 1 DAY
DO
    CALL sp_update_expired_memberships();

-- 创建事件：每天清理过期的激活码
DELIMITER $$

CREATE EVENT IF NOT EXISTS evt_cleanup_expired_activation_codes
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP + INTERVAL 1 DAY
DO
BEGIN
    UPDATE activation_codes
    SET status = 2
    WHERE status = 1 AND expires_at IS NOT NULL AND expires_at < NOW();
END$$

DELIMITER ;

-- ============================================================================
-- 15. 设置数据库参数
-- ============================================================================

-- 启用事件调度器
SET GLOBAL event_scheduler = ON;

-- 设置时区
SET @@global.time_zone = '+08:00';
SET @@session.time_zone = '+08:00';

-- ============================================================================
-- 16. 验证和统计
-- ============================================================================

-- 显示所有表
SELECT CONCAT('表数量: ', COUNT(*)) FROM information_schema.tables WHERE table_schema = 'member_system';

-- 显示初始数据
SELECT '=== 产品数据 ===' AS info;
SELECT id, name, code, price, duration_days FROM products;

SELECT '=== 管理员数据 ===' AS info;
SELECT u.id, u.username, u.email, a.role FROM users u JOIN admins a ON u.id = a.user_id;

-- ============================================================================
-- 初始化完成
-- ============================================================================
