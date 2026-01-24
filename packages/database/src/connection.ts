import mysql from 'mysql2/promise';

export class Database {
  private static instance: mysql.Pool | null = null;

  /**
   * 获取数据库连接池单例
   */
  static getInstance(): mysql.Pool {
    if (!this.instance) {
      this.instance = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'member_system',
        waitForConnections: true,
        connectionLimit: 20,
        queueLimit: 0,
        timezone: '+08:00',
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000
      });

      console.log('[Database] Connection pool created');
    }
    return this.instance;
  }

  /**
   * 执行SQL查询
   * @param sql SQL语句
   * @param params 参数
   * @returns 查询结果
   */
  static async query<T = any>(sql: string, params?: any[]): Promise<T[]> {
    const pool = this.getInstance();
    try {
      const [rows] = await pool.execute(sql, params);
      return rows as T[];
    } catch (error) {
      console.error('[Database] Query error:', error);
      throw error;
    }
  }

  /**
   * 执行单行查询
   * @param sql SQL语句
   * @param params 参数
   * @returns 单行结果或null
   */
  static async queryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
    const results = await this.query<T>(sql, params);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * 执行插入操作
   * @param sql SQL语句
   * @param params 参数
   * @returns 插入的ID
   */
  static async insert(sql: string, params?: any[]): Promise<number> {
    const pool = this.getInstance();
    try {
      const [result] = await pool.execute(sql, params);
      return (result as any).insertId;
    } catch (error) {
      console.error('[Database] Insert error:', error);
      throw error;
    }
  }

  /**
   * 执行更新/删除操作
   * @param sql SQL语句
   * @param params 参数
   * @returns 影响的行数
   */
  static async execute(sql: string, params?: any[]): Promise<number> {
    const pool = this.getInstance();
    try {
      const [result] = await pool.execute(sql, params);
      return (result as any).affectedRows;
    } catch (error) {
      console.error('[Database] Execute error:', error);
      throw error;
    }
  }

  /**
   * 执行事务
   * @param callback 事务回调函数
   * @returns 事务结果
   */
  static async transaction<T>(
    callback: (connection: mysql.PoolConnection) => Promise<T>
  ): Promise<T> {
    const pool = this.getInstance();
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      console.error('[Database] Transaction error:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * 关闭数据库连接池
   */
  static async close(): Promise<void> {
    if (this.instance) {
      await this.instance.end();
      this.instance = null;
      console.log('[Database] Connection pool closed');
    }
  }

  /**
   * 测试数据库连接
   */
  static async testConnection(): Promise<boolean> {
    try {
      await this.query('SELECT 1');
      return true;
    } catch (error) {
      console.error('[Database] Connection test failed:', error);
      return false;
    }
  }
}
