#!/usr/bin/env node
/**
 * 数据库迁移脚本：为现有数据库添加试用功能支持
 * 用途：在不重建数据库的情况下，添加试用相关的字段和表
 * 执行：node scripts/migrate-add-trial-support.js
 */

const mysql = require('mysql2/promise');

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'member_system',
  multipleStatements: true
};

async function checkColumnExists(connection, table, column) {
  const [rows] = await connection.query(
    `SELECT COUNT(*) as count
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [DB_CONFIG.database, table, column]
  );
  return rows[0].count > 0;
}

async function checkTableExists(connection, table) {
  const [rows] = await connection.query(
    `SELECT COUNT(*) as count
     FROM INFORMATION_SCHEMA.TABLES
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
    [DB_CONFIG.database, table]
  );
  return rows[0].count > 0;
}

async function runMigration() {
  let connection;

  try {
    console.log('🔄 开始数据库迁移...\n');
    console.log(`📍 连接到数据库: ${DB_CONFIG.host}/${DB_CONFIG.database}`);

    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✓ 数据库连接成功\n');

    // 1. 检查并添加 users 表的试用字段
    console.log('[1/4] 检查 users 表的试用字段...');

    const trialFields = [
      { name: 'trial_bk', comment: '板块节奏系统试用次数' },
      { name: 'trial_xinli', comment: '心理测评系统试用次数' },
      { name: 'trial_fuplan', comment: '复盘系统试用次数' }
    ];

    for (const field of trialFields) {
      const exists = await checkColumnExists(connection, 'users', field.name);
      if (!exists) {
        console.log(`  添加字段: ${field.name}`);
        await connection.query(
          `ALTER TABLE users ADD COLUMN ${field.name} INT DEFAULT 5 COMMENT '${field.comment}'`
        );
        console.log(`  ✓ ${field.name} 添加成功`);
      } else {
        console.log(`  ⊙ ${field.name} 已存在，跳过`);
      }
    }

    // 2. 检查并添加 products 表的试用配置字段
    console.log('\n[2/4] 检查 products 表的试用配置字段...');

    const trialEnabledExists = await checkColumnExists(connection, 'products', 'trial_enabled');
    if (!trialEnabledExists) {
      console.log('  添加字段: trial_enabled');
      await connection.query(
        `ALTER TABLE products ADD COLUMN trial_enabled TINYINT DEFAULT 0 COMMENT '是否支持试用'`
      );
      console.log('  ✓ trial_enabled 添加成功');
    } else {
      console.log('  ⊙ trial_enabled 已存在，跳过');
    }

    const trialCountExists = await checkColumnExists(connection, 'products', 'trial_count');
    if (!trialCountExists) {
      console.log('  添加字段: trial_count');
      await connection.query(
        `ALTER TABLE products ADD COLUMN trial_count INT DEFAULT 5 COMMENT '试用次数'`
      );
      console.log('  ✓ trial_count 添加成功');
    } else {
      console.log('  ⊙ trial_count 已存在，跳过');
    }

    // 更新产品的试用配置
    console.log('\n  更新产品试用配置...');
    const [products] = await connection.query(
      `SELECT slug, trial_enabled FROM products WHERE slug IN ('bk', 'xinli', 'fuplan')`
    );

    for (const product of products) {
      if (product.trial_enabled === 0) {
        await connection.query(
          `UPDATE products SET trial_enabled = 1, trial_count = 5 WHERE slug = ?`,
          [product.slug]
        );
        console.log(`  ✓ 产品 ${product.slug} 试用功能已启用`);
      } else {
        console.log(`  ⊙ 产品 ${product.slug} 试用功能已启用，跳过`);
      }
    }

    // 3. 检查并添加"宇硕陪伴营"产品
    console.log('\n[3/5] 检查"宇硕陪伴营"产品...');

    const [peibanyingExists] = await connection.query(
      `SELECT COUNT(*) as count FROM products WHERE slug = 'peibanying'`
    );

    if (peibanyingExists[0].count === 0) {
      console.log('  添加"宇硕陪伴营"产品...');
      await connection.query(`
        INSERT INTO products (slug, name, description, url, icon, required_level, price_type, standalone_prices, trial_enabled, trial_count, status)
        VALUES (
          'peibanying',
          '宇硕陪伴营',
          '携手同行，成长无忧 - 全体系交付，陪伴式学习',
          NULL,
          '🎓',
          'lifetime',
          'membership',
          NULL,
          0,
          0,
          1
        )
      `);
      console.log('  ✓ "宇硕陪伴营"产品添加成功');
    } else {
      console.log('  ⊙ "宇硕陪伴营"产品已存在，跳过');
    }

    // 4. 检查并创建 trial_logs 表
    console.log('\n[4/5] 检查 trial_logs 表...');

    const trialLogsExists = await checkTableExists(connection, 'trial_logs');
    if (!trialLogsExists) {
      console.log('  创建 trial_logs 表...');
      await connection.query(`
        CREATE TABLE trial_logs (
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
      console.log('  ✓ trial_logs 表创建成功');
    } else {
      console.log('  ⊙ trial_logs 表已存在，跳过');
    }

    // 5. 验证迁移结果
    console.log('\n[5/5] 验证迁移结果...\n');

    const [userColumns] = await connection.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE, COLUMN_DEFAULT, COLUMN_COMMENT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME LIKE 'trial_%'
    `, [DB_CONFIG.database]);

    console.log('✓ users 表的试用字段:');
    userColumns.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME}: ${col.COLUMN_TYPE} (默认: ${col.COLUMN_DEFAULT})`);
    });

    const [productConfig] = await connection.query(`
      SELECT slug, name, trial_enabled, trial_count
      FROM products
      WHERE trial_enabled = 1
    `);

    console.log('\n✓ 启用试用的产品:');
    productConfig.forEach(p => {
      console.log(`  - ${p.slug} (${p.name}): ${p.trial_count}次`);
    });

    const [userCount] = await connection.query(`
      SELECT COUNT(*) as count FROM users
    `);

    console.log(`\n✓ 现有用户数量: ${userCount[0].count}`);
    console.log('  所有用户已获得默认试用次数（每个产品5次）');

    console.log('\n========================================');
    console.log('✅ 试用功能数据库迁移成功完成！');
    console.log('========================================\n');

  } catch (error) {
    console.error('\n❌ 迁移失败:', error.message);
    console.error('\n错误详情:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('✓ 数据库连接已关闭');
    }
  }
}

// 执行迁移
if (require.main === module) {
  runMigration();
}

module.exports = { runMigration };
