-- 会员系统数据库初始化脚本
-- 运行前请修改数据库名称

-- 创建数据库
CREATE DATABASE IF NOT EXISTS member_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE member_system;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  membership_level ENUM('none', 'monthly', 'quarterly', 'yearly', 'lifetime') DEFAULT 'none',
  membership_expiry DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_username (username),
  INDEX idx_membership (membership_level, membership_expiry)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 管理员表
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'super_admin') DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 激活码表
CREATE TABLE IF NOT EXISTS activation_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  membership_level ENUM('monthly', 'quarterly', 'yearly', 'lifetime') NOT NULL,
  duration_days INT DEFAULT NULL COMMENT '会员时长（天），NULL表示永久',
  is_used BOOLEAN DEFAULT FALSE,
  used_by INT DEFAULT NULL,
  used_at DATETIME DEFAULT NULL,
  created_by INT NOT NULL COMMENT '生成管理员ID',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME DEFAULT NULL COMMENT '激活码过期时间',
  INDEX idx_code (code),
  INDEX idx_used (is_used),
  INDEX idx_expires (expires_at),
  FOREIGN KEY (used_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 产品表
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  required_level ENUM('none', 'monthly', 'quarterly', 'yearly', 'lifetime') DEFAULT 'monthly',
  content LONGTEXT COMMENT '产品内容（仅授权用户可访问）',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_slug (slug),
  INDEX idx_required_level (required_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 登录日志表
CREATE TABLE IF NOT EXISTS login_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT DEFAULT NULL,
  email VARCHAR(100) NOT NULL,
  ip_address VARCHAR(45) NOT NULL,
  user_agent TEXT,
  success BOOLEAN NOT NULL,
  failure_reason VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_email (email),
  INDEX idx_ip (ip_address),
  INDEX idx_created (created_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 限流表
CREATE TABLE IF NOT EXISTS rate_limits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ip_address VARCHAR(45) NOT NULL,
  action_type VARCHAR(50) NOT NULL COMMENT '操作类型：login, register等',
  attempt_count INT DEFAULT 1,
  first_attempt_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_attempt_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  blocked_until DATETIME DEFAULT NULL,
  UNIQUE KEY unique_ip_action (ip_address, action_type),
  INDEX idx_ip (ip_address),
  INDEX idx_blocked (blocked_until)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入示例管理员账户（密码：Admin123456，请在生产环境中修改）
-- 密码哈希使用bcrypt生成：$2a$10$XqJd.aBTvJYYj8M3YX3ORuy5wEg4gN9p5.x8QGxzqZQJZYXNOQi8e
INSERT INTO admins (username, email, password_hash, role) VALUES
('admin', 'admin@example.com', '$2a$10$XqJd.aBTvJYYj8M3YX3ORuy5wEg4gN9p5.x8QGxzqZQJZYXNOQi8e', 'super_admin')
ON DUPLICATE KEY UPDATE username=username;

-- 插入示例产品
INSERT INTO products (slug, name, description, required_level, content) VALUES
('free-content', '免费内容', '所有用户都可以访问的基础内容', 'none', '这是免费内容，所有用户都可以查看。'),
('monthly-exclusive', '月度专属', '月度会员及以上可访问', 'monthly', '这是月度会员专属内容，包含更多高级功能和资源。'),
('yearly-premium', '年度高级', '年度会员及以上可访问', 'yearly', '这是年度会员高级内容，包含最新的研究成果和深度分析。'),
('lifetime-ultimate', '终身终极', '终身会员专属', 'lifetime', '这是终身会员终极内容，享受最高级别的服务和特权。')
ON DUPLICATE KEY UPDATE slug=slug;

-- 完成提示
SELECT '数据库初始化完成！' AS message;
SELECT '默认管理员账户：admin@example.com / Admin123456' AS admin_account;
SELECT '请在生产环境中立即修改管理员密码！' AS warning;
