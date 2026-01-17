/**
 * MySQL数据库连接池管理
 * 单例模式确保全局唯一连接池
 */

import mysql from 'mysql2/promise';

const debug = process.env.NODE_ENV === 'development';

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

// 连接重试配置
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

/**
 * 延迟函数
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
   * 初始化数据库表结构
   */
  async initializeTables(): Promise<void> {
    try {
      if (debug) console.log('[数据库] 开始初始化数据库表...');

      // 创建用户表
      await this.pool.execute(`
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
          INDEX idx_membership (membership_level, membership_expiry),
          INDEX idx_level_created (membership_level, created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      // 创建管理员表
      await this.pool.execute(`
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      // 创建激活码表
      await this.pool.execute(`
        CREATE TABLE IF NOT EXISTS activation_codes (
          id INT AUTO_INCREMENT PRIMARY KEY,
          code VARCHAR(50) NOT NULL UNIQUE,
          level ENUM('monthly', 'quarterly', 'yearly', 'lifetime') NOT NULL,
          duration_days INT DEFAULT NULL COMMENT '会员时长（天），NULL表示永久',
          used BOOLEAN DEFAULT FALSE,
          used_by INT DEFAULT NULL,
          used_at DATETIME DEFAULT NULL,
          admin_id INT NOT NULL COMMENT '生成管理员ID',
          batch_id VARCHAR(100) DEFAULT NULL COMMENT '批次ID',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          expires_at DATETIME DEFAULT NULL COMMENT '激活码过期时间',
          INDEX idx_code (code),
          INDEX idx_used (used),
          INDEX idx_expires (expires_at),
          INDEX idx_batch_id (batch_id),
          INDEX idx_admin_id (admin_id),
          INDEX idx_available (used, expires_at),
          FOREIGN KEY (used_by) REFERENCES users(id) ON DELETE SET NULL,
          FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      // 创建产品表
      await this.pool.execute(`
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      // 创建登录日志表（安全审计）
      await this.pool.execute(`
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
          INDEX idx_success_time (success, created_at),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      // 创建限流表（防暴力破解）
      await this.pool.execute(`
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      // 创建会员操作日志表（管理员操作审计）
    await this.pool.execute(`
      CREATE TABLE IF NOT EXISTS member_operation_logs (
        id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '日志ID',
        admin_id INT UNSIGNED NOT NULL COMMENT '管理员ID',
        user_id INT UNSIGNED NOT NULL COMMENT '目标用户ID',
        action VARCHAR(100) NOT NULL COMMENT '操作类型',
        old_value TEXT COMMENT '旧值',
        new_value TEXT COMMENT '新值',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        INDEX idx_admin_id (admin_id),
        INDEX idx_user_id (user_id),
        INDEX idx_action (action),
        INDEX idx_created_at (created_at),
        INDEX idx_admin_time (admin_id, created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    if (debug) console.log('[数据库] 数据库表初始化完成');

    } catch (error) {
      if (debug) console.error('[数据库] 初始化表失败:', error);
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
   * 执行查询（封装错误处理和重试逻辑）
   */
  async query<T = any>(sql: string, params?: any[]): Promise<T> {
    let lastError: any;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const [rows] = await this.pool.execute(sql, params);
        return rows as T;
      } catch (error: any) {
        lastError = error;

        // 判断是否为可重试的错误
        const isRetryable = this.isRetryableError(error);

        if (debug) {
          console.error(`[数据库] 查询失败 (尝试 ${attempt}/${MAX_RETRIES}):`, error.message);
        }

        // 如果是不可重试的错误，或已达到最大重试次数，直接抛出
        if (!isRetryable || attempt === MAX_RETRIES) {
          break;
        }

        // 等待后重试（指数退避）
        const retryDelay = RETRY_DELAY * attempt;
        if (debug) console.log(`[数据库] ${retryDelay}ms后重试...`);
        await delay(retryDelay);
      }
    }

    if (debug) console.error('[数据库] 查询最终失败:', lastError);
    throw lastError;
  }

  /**
   * 判断错误是否可重试
   */
  private isRetryableError(error: any): boolean {
    const retryableErrors = [
      'PROTOCOL_CONNECTION_LOST',
      'ECONNREFUSED',
      'ETIMEDOUT',
      'ENOTFOUND',
      'ER_LOCK_WAIT_TIMEOUT',
      'ER_LOCK_DEADLOCK'
    ];

    return retryableErrors.some(code =>
      error.code === code || error.message?.includes(code)
    );
  }

  /**
   * 测试数据库连接（带重试）
   */
  async testConnection(): Promise<boolean> {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        await this.pool.execute('SELECT 1');
        if (debug) console.log('[数据库] 数据库连接测试成功');
        return true;
      } catch (error: any) {
        if (debug) {
          console.error(`[数据库] 数据库连接测试失败 (尝试 ${attempt}/${MAX_RETRIES}):`, error.message);
        }

        if (attempt < MAX_RETRIES) {
          const retryDelay = RETRY_DELAY * attempt;
          if (debug) console.log(`[数据库] ${retryDelay}ms后重试连接...`);
          await delay(retryDelay);
        }
      }
    }

    if (debug) console.error('[数据库] 数据库连接测试最终失败');
    return false;
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
      if (debug) console.log('[数据库] 清理过期限流记录完成');
    } catch (error) {
      if (debug) console.error('[数据库] 清理过期限流记录失败:', error);
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
