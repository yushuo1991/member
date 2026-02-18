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

  // 获取连接池（使用公共方法）
  get pool() {
    return this.baseDb.getPool();
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

  // 获取缓存的股票数据
  async getCachedStockData(date: string): Promise<any[] | null> {
    if (isDatabaseDisabled) return null;

    try {
      const formattedDate = formatDateToISO(date);
      const [rows] = await this.pool.execute(
        `SELECT stock_code as StockCode, stock_name as StockName,
                sector_name as ZSName, td_type as TDType,
                limit_up_time as LimitUpTime, amount as Amount
         FROM stock_data
         WHERE trade_date = ?
         ORDER BY sector_name, td_type DESC`,
        [formattedDate]
      );

      const data = rows as any[];
      if (data.length > 0) {
        console.log(`[BK数据库] 从缓存获取 ${formattedDate} 的 ${data.length} 只股票`);
        return data;
      }
      return null;
    } catch (error) {
      console.error('[BK数据库] 获取缓存数据失败:', error);
      return null;
    }
  }

  // 缓存股票数据到数据库
  async cacheStockData(date: string, stocks: any[]): Promise<void> {
    if (isDatabaseDisabled) return;
    if (!stocks || stocks.length === 0) return;

    const connection = await this.pool.getConnection();
    try {
      const formattedDate = formatDateToISO(date);

      // 开启事务以确保数据一致性
      await connection.beginTransaction();

      // 准备批量插入的值数组
      const values = stocks.map(stock => [
        stock.StockCode,
        stock.StockName,
        stock.ZSName || '未分类',
        stock.TDType || '首板',
        formattedDate,
        stock.LimitUpTime || null,
        stock.Amount || null
      ]);

      // 构建批量插入SQL（使用单条SQL语句插入所有数据）
      const placeholders = values.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(', ');
      const flatValues = values.flat();

      await connection.execute(
        `INSERT INTO stock_data
         (stock_code, stock_name, sector_name, td_type, trade_date, limit_up_time, amount)
         VALUES ${placeholders}
         ON DUPLICATE KEY UPDATE
           amount = COALESCE(VALUES(amount), amount),
           limit_up_time = COALESCE(VALUES(limit_up_time), limit_up_time),
           updated_at = CURRENT_TIMESTAMP`,
        flatValues
      );

      // 提交事务
      await connection.commit();

      console.log(`[BK数据库] 批量缓存 ${formattedDate} 的 ${stocks.length} 只股票`);
    } catch (error) {
      // 发生错误时回滚事务
      await connection.rollback();
      console.error('[BK数据库] 缓存股票数据失败:', error);
    } finally {
      // 释放连接回连接池
      connection.release();
    }
  }

  // 获取缓存的股票表现数据（溢价数据）
  async getCachedStockPerformance(stockCode: string, baseDate: string, tradingDays: string[]): Promise<Record<string, number> | null> {
    if (isDatabaseDisabled) return null;

    try {
      const formattedBaseDate = formatDateToISO(baseDate);
      const [rows] = await this.pool.execute(
        `SELECT performance_date, pct_change
         FROM stock_performance
         WHERE stock_code = ? AND base_date = ?
         ORDER BY performance_date`,
        [stockCode, formattedBaseDate]
      );

      const data = rows as any[];
      if (data.length > 0) {
        const result: Record<string, number> = {};
        data.forEach(row => {
          // 将日期格式化为YYYY-MM-DD
          const perfDate = row.performance_date instanceof Date
            ? formatDateToISO(row.performance_date)
            : formatDateToISO(row.performance_date);
          result[perfDate] = parseFloat(row.pct_change) || 0;
        });

        // 验证缓存的日期是否匹配预期的交易日
        const cachedDates = Object.keys(result).sort();
        const expectedDates = tradingDays.slice().sort();
        if (cachedDates.length !== expectedDates.length || !cachedDates.every((d, i) => d === expectedDates[i])) {
          console.log(`[BK数据库] 缓存日期不匹配，丢弃: ${stockCode} 在 ${formattedBaseDate} (缓存=${cachedDates}, 预期=${expectedDates})`);
          // 删除过期缓存数据
          await this.pool.execute(
            `DELETE FROM stock_performance WHERE stock_code = ? AND base_date = ?`,
            [stockCode, formattedBaseDate]
          );
          return null;
        }

        console.log(`[BK数据库] 从缓存获取 ${stockCode} 在 ${formattedBaseDate} 的 ${data.length} 条表现数据`);
        return result;
      }
      return null;
    } catch (error) {
      console.error('[BK数据库] 获取股票表现缓存失败:', error);
      return null;
    }
  }

  // 批量获取多只股票的表现数据
  async getBatchStockPerformance(stockCodes: string[], baseDate: string): Promise<Map<string, Record<string, number>>> {
    const result = new Map<string, Record<string, number>>();
    if (isDatabaseDisabled || stockCodes.length === 0) return result;

    try {
      const formattedBaseDate = formatDateToISO(baseDate);
      const placeholders = stockCodes.map(() => '?').join(',');
      const [rows] = await this.pool.execute(
        `SELECT stock_code, performance_date, pct_change
         FROM stock_performance
         WHERE stock_code IN (${placeholders}) AND base_date = ?
         ORDER BY stock_code, performance_date`,
        [...stockCodes, formattedBaseDate]
      );

      const data = rows as any[];
      data.forEach(row => {
        const stockCode = row.stock_code;
        const perfDate = row.performance_date instanceof Date
          ? formatDateToISO(row.performance_date)
          : formatDateToISO(row.performance_date);
        const pctChange = parseFloat(row.pct_change) || 0;

        if (!result.has(stockCode)) {
          result.set(stockCode, {});
        }
        result.get(stockCode)![perfDate] = pctChange;
      });

      console.log(`[BK数据库] 批量获取 ${result.size} 只股票在 ${formattedBaseDate} 的表现数据`);
      return result;
    } catch (error) {
      console.error('[BK数据库] 批量获取股票表现失败:', error);
      return result;
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

  // 缓存股票表现数据到数据库
  async cacheStockPerformance(stockCode: string, baseDate: string, performance: Record<string, number>): Promise<void> {
    if (isDatabaseDisabled) return;

    try {
      const formattedBaseDate = formatDateToISO(baseDate);

      for (const [perfDate, pctChange] of Object.entries(performance)) {
        const formattedPerfDate = formatDateToISO(perfDate);
        await this.pool.execute(
          `INSERT INTO stock_performance (stock_code, base_date, performance_date, pct_change)
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE pct_change = VALUES(pct_change), updated_at = CURRENT_TIMESTAMP`,
          [stockCode, formattedBaseDate, formattedPerfDate, pctChange]
        );
      }

      console.log(`[BK数据库] 缓存 ${stockCode} 在 ${formattedBaseDate} 的 ${Object.keys(performance).length} 条表现数据`);
    } catch (error) {
      console.error('[BK数据库] 缓存股票表现数据失败:', error);
    }
  }

  // 获取7天数据缓存
  async get7DaysCache(cacheKey: string): Promise<{ data: Record<string, any>; dates: string[] } | null> {
    if (isDatabaseDisabled) return null;

    try {
      const [rows] = await this.pool.execute(
        `SELECT cache_data FROM seven_days_cache
         WHERE cache_key = ? AND expires_at > NOW()`,
        [cacheKey]
      );

      const data = rows as any[];
      if (data.length > 0) {
        const cacheData = typeof data[0].cache_data === 'string'
          ? JSON.parse(data[0].cache_data)
          : data[0].cache_data;

        console.log(`[BK数据库] 从缓存获取7天数据: ${cacheKey}`);
        return {
          data: cacheData.data || cacheData,
          dates: cacheData.dates || Object.keys(cacheData.data || cacheData)
        };
      }
      return null;
    } catch (error) {
      console.error('[BK数据库] 获取7天缓存失败:', error);
      return null;
    }
  }

  // 缓存7天数据到数据库
  async cache7DaysData(cacheKey: string, data: Record<string, any>, dates: string[]): Promise<void> {
    if (isDatabaseDisabled) return;

    try {
      // 计算过期时间：如果包含今天则30分钟，否则24小时
      const today = new Date().toISOString().split('T')[0];
      const hasToday = dates.includes(today);
      const ttlMinutes = hasToday ? 30 : 1440; // 30分钟或24小时

      const cacheData = JSON.stringify({ data, dates });

      await this.pool.execute(
        `INSERT INTO seven_days_cache (cache_key, cache_data, expires_at)
         VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE))
         ON DUPLICATE KEY UPDATE cache_data = VALUES(cache_data), expires_at = DATE_ADD(NOW(), INTERVAL ? MINUTE)`,
        [cacheKey, cacheData, ttlMinutes, ttlMinutes]
      );

      console.log(`[BK数据库] 缓存7天数据: ${cacheKey}, TTL: ${ttlMinutes}分钟`);
    } catch (error) {
      console.error('[BK数据库] 缓存7天数据失败:', error);
    }
  }

  // 清理过期缓存
  async cleanExpiredCache(): Promise<void> {
    if (isDatabaseDisabled) return;

    try {
      const [result] = await this.pool.execute(
        `DELETE FROM seven_days_cache WHERE expires_at < NOW()`
      );
      console.log(`[BK数据库] 清理过期缓存完成`);
    } catch (error) {
      console.error('[BK数据库] 清理过期缓存失败:', error);
    }
  }
}

// 导出单例
export const db = StockDatabase.getInstance();

// 导出格式化函数
export { formatDateToISO as formatDate };
