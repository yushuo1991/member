/**
 * MySQL数据库连接池管理
 * 单例模式确保全局唯一连接池
 */

import mysql from 'mysql2/promise';

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'member_system',
  charset: 'utf8mb4',
  timezone: '+08:00'
};

// 创建连接池（提升并发能力）
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  connectTimeout: 60000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

/**
 * 数据库连接管理类（单例模式）
 */
export class MemberDatabase {
  private static instance: MemberDatabase;
  private pool: mysql.Pool;

  private constructor() {
    this.pool = pool;
  }

  /**
   * 获取数据库实例（单例）
   */
  public static getInstance(): MemberDatabase {
    if (!MemberDatabase.instance) {
      MemberDatabase.instance = new MemberDatabase();
    }
    return MemberDatabase.instance;
  }

  /**
   * 初始化数据库表结构（v3架构）
   */
  async initializeTables(): Promise<void> {
    try {
      console.log('[数据库] 开始初始化数据库表（v3架构）...');

      // ============================================================================
      // 1. 创建 users 表（用户表 - v3架构，含试用次数）
      // ============================================================================
      await this.pool.execute(`
        CREATE TABLE IF NOT EXISTS users (
          id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
          username VARCHAR(100) NOT NULL UNIQUE COMMENT '用户名',
          email VARCHAR(255) NOT NULL UNIQUE COMMENT '邮箱',
          password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希',
          phone VARCHAR(20) COMMENT '电话号码',
          real_name VARCHAR(100) COMMENT '真实姓名',
          avatar_url VARCHAR(500) COMMENT '头像URL',
          status TINYINT DEFAULT 1 COMMENT '用户状态：1=正常，0=禁用',
          trial_bk INT DEFAULT 5 COMMENT '板块节奏系统试用次数',
          trial_xinli INT DEFAULT 5 COMMENT '心理测评系统试用次数',
          trial_fuplan INT DEFAULT 5 COMMENT '复盘系统试用次数',
          last_login_at TIMESTAMP NULL COMMENT '最后登录时间',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
          deleted_at TIMESTAMP NULL COMMENT '删除时间（软删除）',
          INDEX idx_username (username),
          INDEX idx_email (email),
          INDEX idx_status (status),
          INDEX idx_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表'
      `);

      // 检查并添加 trial_bk, trial_xinli, trial_fuplan 字段（迁移旧架构）
      const [userColumns] = await this.pool.execute("SHOW COLUMNS FROM users LIKE 'trial_bk'");
      if ((userColumns as any[]).length === 0) {
        console.log('[数据库] 正在添加试用次数字段到 users 表...');
        await this.pool.execute("ALTER TABLE users ADD COLUMN trial_bk INT DEFAULT 5 COMMENT '板块节奏系统试用次数'");
        await this.pool.execute("ALTER TABLE users ADD COLUMN trial_xinli INT DEFAULT 5 COMMENT '心理测评系统试用次数'");
        await this.pool.execute("ALTER TABLE users ADD COLUMN trial_fuplan INT DEFAULT 5 COMMENT '复盘系统试用次数'");
      }

      // 检查并添加 status 字段
      const [statusColumn] = await this.pool.execute("SHOW COLUMNS FROM users LIKE 'status'");
      if ((statusColumn as any[]).length === 0) {
        console.log('[数据库] 正在添加 status 字段到 users 表...');
        await this.pool.execute("ALTER TABLE users ADD COLUMN status TINYINT DEFAULT 1 COMMENT '用户状态：1=正常，0=禁用'");
      }

      // 检查并添加 deleted_at 字段（软删除）
      const [deletedAtColumn] = await this.pool.execute("SHOW COLUMNS FROM users LIKE 'deleted_at'");
      if ((deletedAtColumn as any[]).length === 0) {
        console.log('[数据库] 正在添加 deleted_at 字段到 users 表...');
        await this.pool.execute("ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP NULL COMMENT '删除时间（软删除）'");
      }

      // ============================================================================
      // 2. 创建 memberships 表（会员表 - v3架构）
      // ============================================================================
      await this.pool.execute(`
        CREATE TABLE IF NOT EXISTS memberships (
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会员表'
      `);

      // ============================================================================
      // 3. 创建 admins 表（管理员表）
      // ============================================================================
      await this.pool.execute(`
        CREATE TABLE IF NOT EXISTS admins (
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理员表'
      `);

      // 检查并添加 is_super 字段
      const [isSuperColumn] = await this.pool.execute("SHOW COLUMNS FROM admins LIKE 'is_super'");
      if ((isSuperColumn as any[]).length === 0) {
        console.log('[数据库] 正在添加 is_super 字段到 admins 表...');
        await this.pool.execute("ALTER TABLE admins ADD COLUMN is_super TINYINT DEFAULT 0 COMMENT '是否为超级管理员'");
      }

      // 检查并添加 last_login_at 字段
      const [lastLoginColumn] = await this.pool.execute("SHOW COLUMNS FROM admins LIKE 'last_login_at'");
      if ((lastLoginColumn as any[]).length === 0) {
        console.log('[数据库] 正在添加 last_login_at 字段到 admins 表...');
        await this.pool.execute("ALTER TABLE admins ADD COLUMN last_login_at TIMESTAMP NULL COMMENT '最后登录时间'");
      }

      // ============================================================================
      // 4. 创建 activation_codes 表（激活码表 - 支持会员和产品激活码）
      // ============================================================================
      await this.pool.execute(`
        CREATE TABLE IF NOT EXISTS activation_codes (
          id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '激活码ID',
          code VARCHAR(50) NOT NULL UNIQUE COMMENT '激活码',
          code_type ENUM('membership', 'product') DEFAULT 'membership' COMMENT '激活码类型',
          level ENUM('monthly', 'quarterly', 'yearly', 'lifetime') NULL COMMENT '会员等级',
          duration_days INT NULL COMMENT '有效天数',
          product_slug VARCHAR(50) NULL COMMENT '产品标识（产品激活码使用）',
          product_duration ENUM('monthly', 'yearly', 'lifetime') NULL COMMENT '产品有效期类型',
          used TINYINT DEFAULT 0 COMMENT '是否已使用：0=未使用，1=已使用',
          used_by INT UNSIGNED NULL COMMENT '使用者用户ID',
          used_at TIMESTAMP NULL COMMENT '使用时间',
          admin_id INT UNSIGNED NULL COMMENT '生成管理员ID',
          batch_id VARCHAR(100) COMMENT '批次ID（用于批量生成）',
          expires_at TIMESTAMP NULL COMMENT '激活码过期时间',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
          INDEX idx_code (code),
          INDEX idx_code_type (code_type),
          INDEX idx_level (level),
          INDEX idx_product_slug (product_slug),
          INDEX idx_used (used),
          INDEX idx_batch_id (batch_id),
          INDEX idx_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='激活码表'
      `);

      // 检查并添加 code_type 字段（迁移旧架构）
      const [codeTypeColumn] = await this.pool.execute("SHOW COLUMNS FROM activation_codes LIKE 'code_type'");
      if ((codeTypeColumn as any[]).length === 0) {
        console.log('[数据库] 正在升级 activation_codes 表到 v3 架构...');
        await this.pool.execute("ALTER TABLE activation_codes ADD COLUMN code_type ENUM('membership', 'product') DEFAULT 'membership' COMMENT '激活码类型' AFTER code");
        await this.pool.execute("ALTER TABLE activation_codes ADD COLUMN product_slug VARCHAR(50) NULL COMMENT '产品标识（产品激活码使用）' AFTER duration_days");
        await this.pool.execute("ALTER TABLE activation_codes ADD COLUMN product_duration ENUM('monthly', 'yearly', 'lifetime') NULL COMMENT '产品有效期类型' AFTER product_slug");
      }

      // ============================================================================
      // 5. 创建 products 表（产品表 - v3架构）
      // ============================================================================
      await this.pool.execute(`
        CREATE TABLE IF NOT EXISTS products (
          id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '产品ID',
          slug VARCHAR(50) NOT NULL UNIQUE COMMENT '产品标识',
          name VARCHAR(100) NOT NULL COMMENT '产品名称',
          description TEXT COMMENT '产品描述',
          url VARCHAR(500) COMMENT '产品URL',
          icon VARCHAR(50) COMMENT '图标emoji',
          required_level ENUM('none', 'monthly', 'quarterly', 'yearly', 'lifetime') DEFAULT 'none' COMMENT '所需会员等级',
          price_type ENUM('membership', 'standalone', 'both') DEFAULT 'membership' COMMENT '价格类型',
          standalone_prices JSON COMMENT '单独购买价格',
          trial_enabled TINYINT DEFAULT 0 COMMENT '是否支持试用',
          trial_count INT DEFAULT 5 COMMENT '试用次数',
          status TINYINT DEFAULT 1 COMMENT '状态：1=激活，0=停用',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
          INDEX idx_slug (slug),
          INDEX idx_status (status),
          INDEX idx_required_level (required_level),
          INDEX idx_price_type (price_type)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='产品表'
      `);

      // 检查并添加 v3 新增字段
      const [priceTypeColumn] = await this.pool.execute("SHOW COLUMNS FROM products LIKE 'price_type'");
      if ((priceTypeColumn as any[]).length === 0) {
        console.log('[数据库] 正在升级 products 表到 v3 架构...');
        await this.pool.execute("ALTER TABLE products ADD COLUMN url VARCHAR(500) COMMENT '产品URL' AFTER description");
        await this.pool.execute("ALTER TABLE products ADD COLUMN icon VARCHAR(50) COMMENT '图标emoji' AFTER url");
        await this.pool.execute("ALTER TABLE products ADD COLUMN price_type ENUM('membership', 'standalone', 'both') DEFAULT 'membership' COMMENT '价格类型' AFTER required_level");
        await this.pool.execute("ALTER TABLE products ADD COLUMN standalone_prices JSON COMMENT '单独购买价格' AFTER price_type");
        await this.pool.execute("ALTER TABLE products ADD COLUMN trial_enabled TINYINT DEFAULT 0 COMMENT '是否支持试用' AFTER standalone_prices");
        await this.pool.execute("ALTER TABLE products ADD COLUMN trial_count INT DEFAULT 5 COMMENT '试用次数' AFTER trial_enabled");
        await this.pool.execute("ALTER TABLE products ADD COLUMN status TINYINT DEFAULT 1 COMMENT '状态：1=激活，0=停用' AFTER trial_count");
      }

      // ============================================================================
      // 6. 创建 user_product_purchases 表（用户产品购买记录）
      // ============================================================================
      await this.pool.execute(`
        CREATE TABLE IF NOT EXISTS user_product_purchases (
          id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '购买记录ID',
          user_id INT UNSIGNED NOT NULL COMMENT '用户ID',
          product_slug VARCHAR(50) NOT NULL COMMENT '产品标识',
          purchase_type ENUM('monthly', 'yearly', 'lifetime') NOT NULL COMMENT '购买类型',
          price DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '购买价格',
          expires_at TIMESTAMP NULL COMMENT '到期时间（lifetime为NULL）',
          activation_code VARCHAR(50) NULL COMMENT '使用的激活码',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_user_id (user_id),
          INDEX idx_product_slug (product_slug),
          INDEX idx_user_product (user_id, product_slug),
          INDEX idx_expires_at (expires_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户产品购买记录表'
      `);

      // ============================================================================
      // 7. 创建 trial_logs 表（试用日志）
      // ============================================================================
      await this.pool.execute(`
        CREATE TABLE IF NOT EXISTS trial_logs (
          id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '日志ID',
          user_id INT UNSIGNED NOT NULL COMMENT '用户ID',
          product_slug VARCHAR(50) NOT NULL COMMENT '产品标识',
          used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '使用时间',
          ip_address VARCHAR(45) COMMENT 'IP地址',
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_user_product (user_id, product_slug),
          INDEX idx_used_at (used_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='试用日志表'
      `);

      // ============================================================================
      // 8. 创建 product_access_logs 表（产品访问日志）
      // ============================================================================
      await this.pool.execute(`
        CREATE TABLE IF NOT EXISTS product_access_logs (
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='产品访问日志表'
      `);

      // ============================================================================
      // 9. 创建 login_logs 表（登录日志）
      // ============================================================================
      await this.pool.execute(`
        CREATE TABLE IF NOT EXISTS login_logs (
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='登录日志表'
      `);

      // ============================================================================
      // 10. 创建 rate_limits 表（限流表）
      // ============================================================================
      await this.pool.execute(`
        CREATE TABLE IF NOT EXISTS rate_limits (
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='限流表'
      `);

      // ============================================================================
      // 11. 创建 admin_audit_logs 表（管理员操作审计日志）
      // ============================================================================
      await this.pool.execute(`
        CREATE TABLE IF NOT EXISTS admin_audit_logs (
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理员操作审计日志表'
      `);

      console.log('[数据库] 数据库表初始化完成（v3架构）');

    } catch (error) {
      console.error('[数据库] 初始化表失败:', error);
      throw error;
    }
  }

  /**
   * 获取连接池实例
   */
  getPool(): mysql.Pool {
    return this.pool;
  }

  /**
   * 执行查询（封装错误处理）
   */
  async query<T = any>(sql: string, params?: any[]): Promise<T> {
    try {
      const [rows] = await this.pool.execute(sql, params);
      return rows as T;
    } catch (error) {
      console.error('[数据库] 查询失败:', error);
      throw error;
    }
  }

  /**
   * 测试数据库连接
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.pool.execute('SELECT 1');
      console.log('[数据库] 数据库连接测试成功');
      return true;
    } catch (error) {
      console.error('[数据库] 数据库连接测试失败:', error);
      return false;
    }
  }

  /**
   * 清理过期的限流记录（定期清理）
   */
  async cleanExpiredRateLimits(): Promise<void> {
    try {
      await this.pool.execute(`
        DELETE FROM rate_limits
        WHERE blocked_until IS NOT NULL AND blocked_until < NOW()
        AND last_attempt_at < DATE_SUB(NOW(), INTERVAL 24 HOUR)
      `);
      console.log('[数据库] 清理过期限流记录完成');
    } catch (error) {
      console.error('[数据库] 清理过期限流记录失败:', error);
    }
  }

  /**
   * 关闭连接池
   */
  async close(): Promise<void> {
    await this.pool.end();
  }
}

// 导出单例实例
export const memberDatabase = MemberDatabase.getInstance();
