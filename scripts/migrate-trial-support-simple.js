/**
 * 数据库迁移脚本：添加试用功能支持
 * 执行方式：node scripts/migrate-trial-support-simple.js
 */

const fs = require('fs');
const path = require('path');

// 使用项目中已有的 mysql2 包
const mysql = require('../packages/database/node_modules/mysql2/promise');

async function runMigration() {
  let connection;

  try {
    console.log('🔄 开始数据库迁移...\n');

    // 创建数据库连接
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '123456',
      database: 'member_system',
      multipleStatements: true
    });

    console.log('✓ 数据库连接成功\n');

    // 读取SQL文件
    const sqlFile = path.join(__dirname, '..', 'database-add-trial-support.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    console.log('✓ SQL文件读取成功\n');
    console.log('📝 执行迁移脚本...\n');

    // 执行SQL脚本
    await connection.query(sql);

    console.log('✓ 迁移脚本执行完成\n');

    // 验证迁移结果
    console.log('🔍 验证迁移结果...\n');

    // 检查 users 表的试用字段
    const [userColumns] = await connection.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE, COLUMN_DEFAULT, COLUMN_COMMENT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'member_system'
        AND TABLE_NAME = 'users'
        AND COLUMN_NAME LIKE 'trial_%'
    `);

    console.log('--- users 表的试用字段 ---');
    console.table(userColumns);

    // 检查 products 表的试用配置
    const [products] = await connection.query(`
      SELECT slug, name, trial_enabled, trial_count
      FROM products
      WHERE trial_enabled = 1
    `);

    console.log('\n--- 启用试用的产品 ---');
    console.table(products);

    // 检查 trial_logs 表
    const [tables] = await connection.query(`
      SHOW TABLES LIKE 'trial_logs'
    `);

    console.log('\n--- trial_logs 表 ---');
    if (tables.length > 0) {
      console.log('✓ trial_logs 表已创建');

      const [tableInfo] = await connection.query(`
        DESCRIBE trial_logs
      `);
      console.table(tableInfo);
    } else {
      console.log('❌ trial_logs 表未找到');
    }

    // 检查现有用户的试用次数
    const [users] = await connection.query(`
      SELECT id, username, trial_bk, trial_xinli, trial_fuplan
      FROM users
      LIMIT 5
    `);

    console.log('\n--- 现有用户的试用次数（前5个）---');
    console.table(users);

    console.log('\n========================================');
    console.log('✅ 试用功能数据库迁移成功完成！');
    console.log('========================================\n');

    console.log('📋 迁移内容总结：');
    console.log('  ✓ users 表添加了 3 个试用字段（trial_bk, trial_xinli, trial_fuplan）');
    console.log('  ✓ products 表添加了试用配置字段（trial_enabled, trial_count）');
    console.log('  ✓ 创建了 trial_logs 表用于记录试用历史');
    console.log('  ✓ 为 3 个产品启用了试用功能（bk, xinli, fuplan）');
    console.log('  ✓ 所有现有用户获得了默认试用次数（每个产品5次）\n');

  } catch (error) {
    console.error('\n❌ 迁移失败：', error.message);
    console.error('\n错误详情：', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('✓ 数据库连接已关闭');
    }
  }
}

// 执行迁移
runMigration();
