/**
 * 重置所有会员的试用次数脚本
 * 将所有用户的 trial_bk, trial_xinli, trial_fuplan 重置为 5
 */

const mysql = require('mysql2/promise');

async function resetTrialCounts() {
  let connection;

  try {
    console.log('正在连接数据库...');

    // 创建数据库连接
    connection = await mysql.createConnection({
      host: '127.0.0.1',
      port: 3307,
      user: 'root',
      password: 'ChangeMe2026!Secure',
      database: 'member_system'
    });

    console.log('数据库连接成功！');

    // 查询当前用户数量
    const [users] = await connection.execute(
      'SELECT COUNT(*) as total FROM users'
    );
    console.log(`\n当前用户总数: ${users[0].total}`);

    // 查询需要重置的用户数量
    const [needReset] = await connection.execute(
      `SELECT COUNT(*) as count FROM users
       WHERE trial_bk != 5 OR trial_xinli != 5 OR trial_fuplan != 5`
    );
    console.log(`需要重置试用次数的用户: ${needReset[0].count}`);

    if (needReset[0].count === 0) {
      console.log('\n所有用户的试用次数已经是 5 次，无需重置。');
      return;
    }

    // 执行重置
    console.log('\n开始重置试用次数...');
    const [result] = await connection.execute(
      `UPDATE users
       SET trial_bk = 5,
           trial_xinli = 5,
           trial_fuplan = 5`
    );

    console.log(`\n✅ 重置完成！`);
    console.log(`影响的行数: ${result.affectedRows}`);
    console.log(`\n所有用户的试用次数已重置为:`);
    console.log(`  - 板块节奏系统: 5 次`);
    console.log(`  - 心理测评系统: 5 次`);
    console.log(`  - 复盘系统: 5 次`);

    // 验证重置结果
    const [verification] = await connection.execute(
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN trial_bk = 5 THEN 1 ELSE 0 END) as bk_ok,
        SUM(CASE WHEN trial_xinli = 5 THEN 1 ELSE 0 END) as xinli_ok,
        SUM(CASE WHEN trial_fuplan = 5 THEN 1 ELSE 0 END) as fuplan_ok
       FROM users`
    );

    console.log(`\n验证结果:`);
    console.log(`  - trial_bk = 5: ${verification[0].bk_ok}/${verification[0].total} 用户`);
    console.log(`  - trial_xinli = 5: ${verification[0].xinli_ok}/${verification[0].total} 用户`);
    console.log(`  - trial_fuplan = 5: ${verification[0].fuplan_ok}/${verification[0].total} 用户`);

  } catch (error) {
    console.error('\n❌ 错误:', error.message);

    if (error.code === 'ECONNREFUSED') {
      console.error('\n无法连接到数据库。请确保：');
      console.error('1. SSH隧道已建立: ssh -L 3307:localhost:3306 root@8.153.110.212');
      console.error('2. 端口 3307 没有被其他程序占用');
    }

    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n数据库连接已关闭。');
    }
  }
}

// 执行脚本
resetTrialCounts();
