const bcrypt = require('bcrypt');

const hash = '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
const passwords = ['Admin123456', 'admin123456', 'Admin12345', 'admin', 'Admin'];

async function testPasswords() {
  console.log('测试密码哈希验证...\n');
  console.log('Hash:', hash);
  console.log('\n尝试以下密码:\n');

  for (const password of passwords) {
    try {
      const isValid = await bcrypt.compare(password, hash);
      console.log(`密码: "${password}" -> ${isValid ? '✅ 匹配' : '❌ 不匹配'}`);
    } catch (error) {
      console.log(`密码: "${password}" -> ❌ 错误: ${error.message}`);
    }
  }

  // 尝试生成新的哈希
  console.log('\n\n生成新的密码哈希:');
  const newHash = await bcrypt.hash('Admin123456', 10);
  console.log('Admin123456 ->', newHash);

  const isValid = await bcrypt.compare('Admin123456', newHash);
  console.log('验证新哈希:', isValid ? '✅ 正确' : '❌ 错误');
}

testPasswords().catch(console.error);
