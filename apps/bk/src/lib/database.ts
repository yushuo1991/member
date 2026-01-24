import { MemberDatabase } from '@repo/database';

/**
 * 将Date对象或字符串转换为YYYY-MM-DD格式
 */
export function formatDateToISO(date: Date | string): string {
  if (typeof date === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
    if (/^\d{8}$/.test(date)) {
      return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
    }
    date = new Date(date);
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 检查是否禁用数据库
const isDatabaseDisabled = process.env.DB_DISABLE === 'true';

// BK系统数据库管理类（使用共享数据库连接池）
export class StockDatabase {
  private static instance: StockDatabase;
  private baseDb: MemberDatabase;

  private constructor() {
    this.baseDb = MemberDatabase.getInstance();
  }

  public static getInstance(): StockDatabase {
    if (!StockDatabase.instance) {
      StockDatabase.instance = new StockDatabase();
    }
    return StockDatabase.instance;
  }

  // 获取连接池（访问私有pool通过类型断言）
  get pool() {
    return (this.baseDb as any).pool;
  }

  // 初始化BK系统专用表
  async initializeTables(): Promise<void> {
    if (isDatabaseDisabled) {
      console.log('[BK数据库] 数据库已禁用，跳过初始化');
      return;
    }

    try {
      console.log('[BK数据库] 开始初始化数据库表...');

      // 创建股票数据表
      await this.pool.execute(`
        CREATE TABLE IF NOT EXISTS stock_data (
          id INT AUTO_INCREMENT PRIMARY KEY,
          stock_code VARCHAR(10) NOT NULL,
          stock_name VARCHAR(50) NOT NULL,
          sector_name VARCHAR(100) NOT NULL,
          td_type VARCHAR(20) NOT NULL,
          trade_date DATE NOT NULL,
          limit_up_time VARCHAR(10) DEFAULT NULL COMMENT '涨停时间(HH:MM)',
          amount DECIMAL(10,2) DEFAULT NULL COMMENT '成交额(亿元)',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE KEY unique_stock_date (stock_code, trade_date),
          INDEX idx_trade_date (trade_date),
          INDEX idx_sector_name (sector_name),
          INDEX idx_stock_code (stock_code)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      // 创建股票表现数据表
      await this.pool.execute(`
        CREATE TABLE IF NOT EXISTS stock_performance (
          id INT AUTO_INCREMENT PRIMARY KEY,
          stock_code VARCHAR(10) NOT NULL,
          base_date DATE NOT NULL COMMENT '涨停基准日期',
          performance_date DATE NOT NULL COMMENT '后续交易日期',
          pct_change DECIMAL(10,4) DEFAULT NULL COMMENT '涨跌幅(%)',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE KEY unique_performance (stock_code, base_date, performance_date),
          INDEX idx_base_date (base_date),
          INDEX idx_performance_date (performance_date),
          INDEX idx_stock_code (stock_code)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      // 创建7天数据缓存表
      await this.pool.execute(`
        CREATE TABLE IF NOT EXISTS seven_days_cache (
          id INT AUTO_INCREMENT PRIMARY KEY,
          cache_key VARCHAR(100) NOT NULL UNIQUE,
          cache_data JSON NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          expires_at TIMESTAMP NOT NULL,
          INDEX idx_cache_key (cache_key),
          INDEX idx_expires_at (expires_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      // 创建分时图快照表
      await this.pool.execute(`
        CREATE TABLE IF NOT EXISTS minute_chart_snapshots (
          id INT AUTO_INCREMENT PRIMARY KEY,
          stock_code VARCHAR(10) NOT NULL,
          trade_date DATE NOT NULL,
          snapshot_data JSON NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE KEY unique_snapshot (stock_code, trade_date),
          INDEX idx_trade_date (trade_date),
          INDEX idx_stock_code (stock_code)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      console.log('[BK数据库] 数据库表初始化完成');
    } catch (error) {
      console.error('[BK数据库] 初始化失败:', error);
      throw error;
    }
  }

  // 升级数据库（检查并添加新字段）
  async upgradeDatabase(): Promise<void> {
    if (isDatabaseDisabled) return;

    try {
      // 检查stock_data表的amount字段
      const [columns] = await this.pool.execute(
        "SHOW COLUMNS FROM stock_data LIKE 'amount'"
      );

      if ((columns as any[]).length === 0) {
        await this.pool.execute(
          "ALTER TABLE stock_data ADD COLUMN amount DECIMAL(10,2) DEFAULT NULL COMMENT '成交额(亿元)'"
        );
        console.log('[BK数据库] 已添加stock_data.amount字段');
      }

      // 检查stock_data表的limit_up_time字段
      const [limitUpTimeColumns] = await this.pool.execute(
        "SHOW COLUMNS FROM stock_data LIKE 'limit_up_time'"
      );

      if ((limitUpTimeColumns as any[]).length === 0) {
        await this.pool.execute(
          "ALTER TABLE stock_data ADD COLUMN limit_up_time VARCHAR(10) DEFAULT NULL COMMENT '涨停时间(HH:MM)'"
        );
        console.log('[BK数据库] 已添加stock_data.limit_up_time字段');
      }
    } catch (error) {
      console.error('[BK数据库] 升级失败:', error);
    }
  }
}

// 导出单例
export const db = StockDatabase.getInstance();

// 导出格式化函数
export { formatDateToISO as formatDate };
