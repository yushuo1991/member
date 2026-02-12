/**
 * @yushuo/database - MySQL数据库连接池
 * 提供单例连接池、查询封装、表初始化等功能
 */

// 导出数据库类
export { MemberDatabase, memberDatabase } from './database';

// 导出便捷函数
export const getConnection = () => {
  const { memberDatabase } = require('./database');
  return memberDatabase.getPool().getConnection();
};
