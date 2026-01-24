/**
 * 创建管理员账号脚本
 * 使用方法: node create-admin.js
 */

const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// 读取 .env 文件
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  const env = {};

  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#')) {
        const [key, ...values] = line.split('=');
        if (key) {
          env[key.trim()] = values.join('=').trim();
        }
      }
    });
  }
  return env;
}

const env = loadEnv();

async function createAdmin() {
  const username = 'admin';
  const email = 'admin@yushuo.com';
  const password = '7287843Wu';
  const role = 'super_admin';

  try {
    // 1. 生成密码哈希
    console.log('正在生成密码哈希...');
    const rounds = parseInt(env.BCRYPT_ROUNDS || '12');
    const passwordHash = await bcrypt.hash(password, rounds);
    console.log('✓ 密码哈希生成成功');

    // 2. 连接数据库
    console.log('\n正在连接数据库...');
    const connection = await mysql.createConnection({
      host: env.DB_HOST || 'localhost',
      port: parseInt(env.DB_PORT || '3306'),
      user: env.DB_USER || 'root',
      password: env.DB_PASSWORD || '',
      database: env.DB_NAME || 'member_system',
      charset: 'utf8mb4',
      timezone: '+08:00'
    });
    console.log('✓ 数据库连接成功');

    // 3. 检查管理员是否已存在
    console.log('\n检查管理员账号是否已存在...');
    const [existing] = await connection.execute(
      'SELECT id, username FROM admins WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existing.length > 0) {
      console.log('⚠ 管理员账号已存在，正在更新密码...');
      await connection.execute(
        'UPDATE admins SET password_hash = ?, role = ?, updated_at = NOW() WHERE username = ?',
        [passwordHash, role, username]
      );
      console.log('✓ 密码更新成功');
    } else {
      // 4. 插入新管理员
      console.log('正在创建新管理员账号...');
      await connection.execute(
        'INSERT INTO admins (username, email, password_hash, role, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
        [username, email, passwordHash, role]
      );
      console.log('✓ 管理员账号创建成功');
    }

    // 5. 验证创建结果
    const [result] = await connection.execute(
      'SELECT id, username, email, role, created_at FROM admins WHERE username = ?',
      [username]
    );

    console.log('\n========== 管理员账号信息 ==========');
    console.log('ID:', result[0].id);
    console.log('用户名:', result[0].username);
    console.log('邮箱:', result[0].email);
    console.log('角色:', result[0].role);
    console.log('创建时间:', result[0].created_at);
    console.log('=======================================');

    console.log('\n登录信息:');
    console.log('用户名: admin');
    console.log('密码: 7287843Wu');
    console.log('登录地址: http://localhost:3000/admin/login');

    await connection.end();
    console.log('\n✓ 操作完成');
    process.exit(0);

  } catch (error) {
    console.error('\n✗ 错误:', error.message);

    if (error.code === 'ECONNREFUSED') {
      console.error('\n提示: 无法连接到数据库。请检查:');
      console.error('1. MySQL 服务是否运行');
      console.error('2. .env 文件中的数据库配置是否正确');
      console.error('3. 数据库 member_system 是否已创建');
    } else if (error.code === 'ER_NO_SUCH_TABLE') {
      console.error('\n提示: admins 表不存在。请先运行数据库初始化脚本:');
      console.error('mysql -u root -p member_system < database-init-v3.sql');
    }

    process.exit(1);
  }
}

createAdmin();
