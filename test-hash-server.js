const bcrypt = require('bcrypt');
const hash = '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

async function test() {
  const result = await bcrypt.compare('Admin123456', hash);
  console.log('Password Admin123456 matches:', result);
}

test();
