/**
 * API测试脚本示例
 * 使用Node.js运行：node api-test-examples.js
 */

const BASE_URL = 'http://localhost:3000/api';

// 测试用户注册
async function testRegister() {
  console.log('\n=== 测试用户注册 ===');

  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: 'testuser',
      email: 'test@example.com',
      password: 'Test123456'
    })
  });

  const data = await response.json();
  console.log('响应:', JSON.stringify(data, null, 2));
}

// 测试用户登录
async function testLogin() {
  console.log('\n=== 测试用户登录 ===');

  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'Test123456'
    })
  });

  const data = await response.json();
  console.log('响应:', JSON.stringify(data, null, 2));

  // 返回Token供后续测试使用
  return data.data?.token;
}

// 测试激活码激活
async function testActivate(token, activationCode) {
  console.log('\n=== 测试激活码 ===');

  const response = await fetch(`${BASE_URL}/activation/activate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `auth_token=${token}`
    },
    body: JSON.stringify({
      code: activationCode
    })
  });

  const data = await response.json();
  console.log('响应:', JSON.stringify(data, null, 2));
}

// 测试产品访问
async function testProductAccess(token, slug) {
  console.log(`\n=== 测试产品访问: ${slug} ===`);

  const response = await fetch(`${BASE_URL}/products/access/${slug}`, {
    method: 'GET',
    headers: {
      'Cookie': `auth_token=${token}`
    }
  });

  const data = await response.json();
  console.log('响应:', JSON.stringify(data, null, 2));
}

// 测试管理员登录
async function testAdminLogin() {
  console.log('\n=== 测试管理员登录 ===');

  const response = await fetch(`${BASE_URL}/admin/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'admin@example.com',
      password: 'Admin123456'
    })
  });

  const data = await response.json();
  console.log('响应:', JSON.stringify(data, null, 2));

  return data.data?.token;
}

// 测试生成激活码
async function testGenerateCode(adminToken) {
  console.log('\n=== 测试生成激活码 ===');

  const response = await fetch(`${BASE_URL}/activation/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `admin_token=${adminToken}`
    },
    body: JSON.stringify({
      membershipLevel: 'monthly',
      quantity: 5,
      expiresInDays: 30
    })
  });

  const data = await response.json();
  console.log('响应:', JSON.stringify(data, null, 2));

  return data.data?.codes?.[0];
}

// 测试会员列表
async function testMembersList(adminToken) {
  console.log('\n=== 测试会员列表 ===');

  const response = await fetch(`${BASE_URL}/admin/members?page=1&limit=10`, {
    method: 'GET',
    headers: {
      'Cookie': `admin_token=${adminToken}`
    }
  });

  const data = await response.json();
  console.log('响应:', JSON.stringify(data, null, 2));
}

// 测试统计数据
async function testStats(adminToken) {
  console.log('\n=== 测试统计数据 ===');

  const response = await fetch(`${BASE_URL}/admin/dashboard/stats`, {
    method: 'GET',
    headers: {
      'Cookie': `admin_token=${adminToken}`
    }
  });

  const data = await response.json();
  console.log('响应:', JSON.stringify(data, null, 2));
}

// 运行所有测试
async function runAllTests() {
  try {
    // 1. 用户注册
    await testRegister();

    // 2. 用户登录
    const userToken = await testLogin();

    // 3. 管理员登录
    const adminToken = await testAdminLogin();

    // 4. 生成激活码
    const activationCode = await testGenerateCode(adminToken);

    // 5. 激活会员
    if (activationCode && userToken) {
      await testActivate(userToken, activationCode);
    }

    // 6. 测试产品访问
    if (userToken) {
      await testProductAccess(userToken, 'free-content');
      await testProductAccess(userToken, 'monthly-exclusive');
      await testProductAccess(userToken, 'yearly-premium');
    }

    // 7. 测试会员列表
    if (adminToken) {
      await testMembersList(adminToken);
    }

    // 8. 测试统计数据
    if (adminToken) {
      await testStats(adminToken);
    }

    console.log('\n✅ 所有测试完成！');

  } catch (error) {
    console.error('\n❌ 测试失败:', error);
  }
}

// 执行测试
runAllTests();
