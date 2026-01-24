/**
 * 生成管理员密码哈希
 * 使用方法: node generate-admin-hash.js
 */

const bcrypt = require('bcryptjs');

async function generateHash() {
  const username = 'admin';
  const email = 'admin@yushuo.com';
  const password = '7287843Wu';
  const role = 'super_admin';
  const rounds = 10;

  console.log('正在生成密码哈希...\n');

  const passwordHash = await bcrypt.hash(password, rounds);

  console.log('========== 管理员账号信息 ==========');
  console.log('用户名:', username);
  console.log('邮箱:', email);
  console.log('密码:', password);
  console.log('角色:', role);
  console.log('密码哈希:', passwordHash);
  console.log('=======================================\n');

  console.log('请在服务器上执行以下 SQL 命令:\n');
  console.log('方法1: 创建新管理员账号');
  console.log('-------------------------------------');
  console.log(`INSERT INTO admins (username, email, password_hash, role, created_at, updated_at)`);
  console.log(`VALUES ('${username}', '${email}', '${passwordHash}', '${role}', NOW(), NOW());`);

  console.log('\n方法2: 更新已存在的管理员账号');
  console.log('-------------------------------------');
  console.log(`UPDATE admins SET password_hash = '${passwordHash}', role = '${role}', updated_at = NOW() WHERE username = '${username}';`);

  console.log('\n执行步骤:');
  console.log('1. SSH 登录到服务器: ssh root@8.153.110.212');
  console.log('2. 连接到 MySQL: mysql -u root -p member_system');
  console.log('3. 粘贴上面的 SQL 命令');
  console.log('4. 退出 MySQL: exit');
  console.log('\n登录地址: http://8.153.110.212:3000/admin/login');
  console.log('或: http://yushuofupan.com/admin/login (如果域名已配置)');
}

generateHash().catch(console.error);
