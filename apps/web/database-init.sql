-- ============================================================================
-- 宇硕会员体系 - 数据库初始化脚本 v3.0
-- 功能：完整的会员系统 + 产品购买 + 试用功能
-- 版本：v3.0
-- 创建日期：2026-01-11
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
DROP TABLE IF EXISTS trial_logs;
DROP TABLE IF EXISTS user_product_purchases;
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
    -- 试用次数字段
    trial_bk INT DEFAULT 5 COMMENT '板块节奏系统剩余试用次数',
    trial_xinli INT DEFAULT 5 COMMENT '心理测评系统剩余试用次数',
    trial_fuplan INT DEFAULT 5 COMMENT '复盘系统剩余试用次数',
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
-- 5. 创建 products 表（产品表）
-- ============================================================================
CREATE TABLE products (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '产品ID',
    slug VARCHAR(50) NOT NULL UNIQUE COMMENT '产品标识',
    name VARCHAR(100) NOT NULL COMMENT '产品名称',
    description TEXT COMMENT '产品描述',
    detail_description TEXT COMMENT '产品详细描述',
    url VARCHAR(500) COMMENT '产品URL',
    icon VARCHAR(50) COMMENT '图标emoji',
    image_url VARCHAR(500) COMMENT '产品封面图URL',
    -- 权限相关
    required_level ENUM('none', 'monthly', 'quarterly', 'yearly', 'lifetime') DEFAULT 'none' COMMENT '所需会员等级',
    price_type ENUM('membership', 'standalone', 'both') DEFAULT 'membership' COMMENT '价格类型',
    standalone_prices JSON COMMENT '单独购买价格 {"monthly":30,"yearly":300,"lifetime":600}',
    -- 试用相关
    trial_enabled TINYINT DEFAULT 0 COMMENT '是否支持试用：0=否，1=是',
    trial_count INT DEFAULT 5 COMMENT '试用次数',
    -- 状态
    status TINYINT DEFAULT 1 COMMENT '状态：1=激活，0=停用',
    sort_order INT DEFAULT 0 COMMENT '排序顺序',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_slug (slug),
    INDEX idx_status (status),
    INDEX idx_required_level (required_level),
    INDEX idx_price_type (price_type),
    INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='产品表';

-- ============================================================================
-- 6. 创建 user_product_purchases 表（用户产品购买记录）
-- ============================================================================
CREATE TABLE user_product_purchases (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '购买记录ID',
    user_id INT UNSIGNED NOT NULL COMMENT '用户ID',
    product_slug VARCHAR(50) NOT NULL COMMENT '产品标识',
    purchase_type ENUM('monthly', 'yearly', 'lifetime') NOT NULL COMMENT '购买类型',
    price DECIMAL(10,2) NOT NULL COMMENT '购买价格',
    expires_at TIMESTAMP NULL COMMENT '到期时间（NULL表示永久）',
    activation_code VARCHAR(50) COMMENT '使用的激活码',
    order_no VARCHAR(100) COMMENT '订单号',
    payment_method VARCHAR(50) COMMENT '支付方式',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '购买时间',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_product (user_id, product_slug),
    INDEX idx_expires_at (expires_at),
    INDEX idx_order_no (order_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户产品购买记录表';

-- ============================================================================
-- 7. 创建 trial_logs 表（试用记录表）
-- ============================================================================
CREATE TABLE trial_logs (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '试用记录ID',
    user_id INT UNSIGNED NOT NULL COMMENT '用户ID',
    product_slug VARCHAR(50) NOT NULL COMMENT '产品标识',
    ip_address VARCHAR(45) COMMENT 'IP地址',
    user_agent TEXT COMMENT '用户代理',
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '使用时间',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_product_trial (user_id, product_slug),
    INDEX idx_used_at (used_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='试用记录表';

-- ============================================================================
-- 8. 创建 activation_codes 表（激活码表）
-- ============================================================================
CREATE TABLE activation_codes (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '激活码ID',
    code VARCHAR(50) NOT NULL UNIQUE COMMENT '激活码',
    -- 会员激活码
    level ENUM('monthly', 'quarterly', 'yearly', 'lifetime') COMMENT '会员等级（会员激活码）',
    duration_days INT COMMENT '有效天数（会员激活码）',
    -- 产品激活码
    product_slug VARCHAR(50) COMMENT '产品标识（产品激活码）',
    product_duration ENUM('monthly', 'yearly', 'lifetime') COMMENT '产品购买类型（产品激活码）',
    -- 通用字段
    code_type ENUM('membership', 'product') DEFAULT 'membership' COMMENT '激活码类型',
    used TINYINT DEFAULT 0 COMMENT '是否已使用：0=未使用，1=已使用',
    used_by INT UNSIGNED NULL COMMENT '使用者用户ID',
    used_at TIMESTAMP NULL COMMENT '使用时间',
    admin_id INT UNSIGNED NULL COMMENT '生成管理员ID',
    batch_id VARCHAR(100) COMMENT '批次ID',
    expires_at TIMESTAMP NULL COMMENT '激活码过期时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_code (code),
    INDEX idx_level (level),
    INDEX idx_product_slug (product_slug),
    INDEX idx_code_type (code_type),
    INDEX idx_used (used),
    INDEX idx_batch_id (batch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='激活码表';

-- ============================================================================
-- 9. 创建 product_access_logs 表（产品访问日志）
-- ============================================================================
CREATE TABLE product_access_logs (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '日志ID',
    user_id INT UNSIGNED NOT NULL COMMENT '用户ID',
    product_slug VARCHAR(50) NOT NULL COMMENT '产品标识',
    access_type ENUM('membership', 'purchased', 'trial') NOT NULL COMMENT '访问类型',
    access_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '访问时间',
    ip_address VARCHAR(45) COMMENT 'IP地址',
    user_agent TEXT COMMENT '用户代理',
    session_id VARCHAR(100) COMMENT '会话ID',
    INDEX idx_user_product (user_id, product_slug),
    INDEX idx_access_time (access_time),
    INDEX idx_access_type (access_type),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='产品访问日志表';

-- ============================================================================
-- 10. 创建 admins 表（管理员表）
-- ============================================================================
CREATE TABLE admins (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '管理员ID',
    username VARCHAR(100) NOT NULL UNIQUE COMMENT '管理员用户名',
    email VARCHAR(255) NOT NULL UNIQUE COMMENT '邮箱',
    password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希',
    role VARCHAR(50) NOT NULL DEFAULT 'admin' COMMENT '角色',
    is_super TINYINT DEFAULT 0 COMMENT '是否为超级管理员',
    last_login_at TIMESTAMP NULL COMMENT '最后登录时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理员表';

-- ============================================================================
-- 11. 创建 login_logs 表（登录日志）
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
-- 12. 创建 admin_audit_logs 表（管理员操作审计日志）
-- ============================================================================
CREATE TABLE admin_audit_logs (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '日志ID',
    admin_id INT UNSIGNED NOT NULL COMMENT '管理员ID',
    action VARCHAR(100) NOT NULL COMMENT '操作类型',
    target_type VARCHAR(50) COMMENT '目标类型',
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
-- 13. 创建 rate_limits 表（限流表）
-- ============================================================================
CREATE TABLE rate_limits (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '限流记录ID',
    ip_address VARCHAR(45) NOT NULL COMMENT 'IP地址',
    action_type VARCHAR(50) NOT NULL COMMENT '操作类型',
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
-- 14. 插入产品数据（9个产品）
-- ============================================================================
INSERT INTO products (slug, name, description, detail_description, url, icon, required_level, price_type, standalone_prices, trial_enabled, trial_count, sort_order) VALUES
-- 会员专属产品
('xuexiquan', '学习圈', '私密学习圈，包含微信群和百度网盘资源', '加入宇硕学习圈，获取专属微信群邀请和百度网盘学习资源，与志同道合的交易者共同成长。', NULL, '👥', 'monthly', 'membership', NULL, 0, 0, 1),

('bankuaizhushou', '板块助手', '智能板块分析软件，自动化复盘神器', '板块助手是一款专业的板块分析工具，帮助您快速识别热点板块，把握市场脉搏。', NULL, '💻', 'monthly', 'both', '{"monthly":30,"yearly":300}', 0, 0, 2),

('bankuaijiezou', '板块节奏系统', '涨停板追踪分析系统，实时追踪市场热点', '专业的涨停板追踪系统，实时监控市场热点，提供7日涨停数据分析，帮助您把握板块轮动节奏。', '/bk', '📊', 'quarterly', 'membership', NULL, 1, 5, 3),

('xinli', '心理测评系统', '交易心理问卷评估，80个场景深度分析', '通过80个交易场景的心理问卷，全面评估您的交易心理状态，发现潜在的心理盲点。', '/xinli', '🧠', 'yearly', 'membership', NULL, 1, 5, 4),

('fuplan', '复盘系统', '交易复盘图鉴，系统化复盘工具', '专业的交易复盘平台，记录每日交易，分析市场情绪，帮助您系统化总结交易经验。', '/fuplan', '📈', 'lifetime', 'membership', NULL, 1, 5, 5),

-- 单独购买产品
('qingxubiaoge_2022', '情绪表格(2022起)', '每日更新情绪数据，自2022年起', '包含自2022年以来的完整市场情绪数据，每日更新，帮助您追踪市场情绪变化。', NULL, '📊', 'none', 'standalone', '{"lifetime":600}', 0, 0, 6),

('qingxubiaoge_2018', '情绪表格(2018起)', '完整历史情绪数据，自2018年起', '包含自2018年以来的完整历史市场情绪数据，每日更新，提供更长期的市场情绪参考。', NULL, '📊', 'none', 'standalone', '{"lifetime":999}', 0, 0, 7),

('fupanbanmian', '复盘版面', '复盘版面工具，限时优惠', '专业的复盘版面工具，帮助您更好地组织和展示复盘内容。', NULL, '📋', 'none', 'standalone', '{"lifetime":300}', 0, 0, 8),

('jiandanfupan', '简单复盘', '简易复盘工具', '轻量级的复盘工具，适合快速记录每日交易心得。', NULL, '📝', 'none', 'standalone', '{"lifetime":200}', 0, 0, 9);

-- ============================================================================
-- 15. 创建默认管理员账户
-- ============================================================================
-- 密码：Admin123456
INSERT INTO admins (username, email, password_hash, role, is_super) VALUES
('admin', 'admin@yushuo.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'super_admin', 1);

-- ============================================================================
-- 16. 创建测试数据
-- ============================================================================

-- 测试用户 (密码：Test123456)
INSERT INTO users (username, email, password_hash, real_name, status, trial_bk, trial_xinli, trial_fuplan) VALUES
('testuser', 'test@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '测试用户', 1, 5, 5, 5);

-- 为测试用户创建会员记录（免费用户）
INSERT INTO memberships (user_id, level, expires_at, activated_at)
SELECT id, 'none', NULL, NOW()
FROM users WHERE username = 'testuser' LIMIT 1;

-- 创建测试激活码
INSERT INTO activation_codes (code, level, duration_days, code_type, admin_id, batch_id) VALUES
-- 会员激活码
('YS-M-TEST001', 'monthly', 30, 'membership', 1, 'test-batch'),
('YS-Q-TEST001', 'quarterly', 90, 'membership', 1, 'test-batch'),
('YS-Y-TEST001', 'yearly', 365, 'membership', 1, 'test-batch'),
('YS-L-TEST001', 'lifetime', 36500, 'membership', 1, 'test-batch');

-- 产品激活码
INSERT INTO activation_codes (code, product_slug, product_duration, code_type, admin_id, batch_id) VALUES
('YS-BK-M-TEST', 'bankuaizhushou', 'monthly', 'product', 1, 'test-batch'),
('YS-BK-Y-TEST', 'bankuaizhushou', 'yearly', 'product', 1, 'test-batch'),
('YS-QX22-TEST', 'qingxubiaoge_2022', 'lifetime', 'product', 1, 'test-batch'),
('YS-QX18-TEST', 'qingxubiaoge_2018', 'lifetime', 'product', 1, 'test-batch'),
('YS-FPBM-TEST', 'fupanbanmian', 'lifetime', 'product', 1, 'test-batch'),
('YS-JDFP-TEST', 'jiandanfupan', 'lifetime', 'product', 1, 'test-batch');

-- ============================================================================
-- 完成
-- ============================================================================
SELECT '✅ 宇硕会员体系数据库初始化完成！(v3.0)' AS message;
SELECT '📧 默认管理员：admin@yushuo.com / Admin123456' AS admin_account;
SELECT '👤 测试用户：test@example.com / Test123456' AS test_user;
SELECT '🎟️  测试激活码已生成，查看 activation_codes 表' AS test_codes;
SELECT '📦 9个产品已初始化，查看 products 表' AS products;
