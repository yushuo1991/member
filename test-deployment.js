/**
 * 全面功能测试脚本
 * 测试会员系统所有核心功能
 */

const BASE_URL = 'http://yushuofupan.com';

// 测试结果收集
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  details: []
};

// 用于存储认证信息
const authData = {
  userCookies: '',
  adminCookies: '',
  testUserId: null,
  testUsername: `test_${Date.now()}`
};

/**
 * 执行HTTP请求
 */
async function request(method, path, options = {}) {
  const startTime = Date.now();
  const url = `${BASE_URL}${path}`;

  const fetchOptions = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  };

  if (options.body) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, fetchOptions);
    const responseTime = Date.now() - startTime;

    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // 提取Set-Cookie
    const setCookie = response.headers.get('set-cookie');

    return {
      status: response.status,
      data,
      responseTime,
      cookies: setCookie,
      ok: response.ok
    };
  } catch (error) {
    return {
      status: 0,
      error: error.message,
      responseTime: Date.now() - startTime,
      ok: false
    };
  }
}

/**
 * 记录测试结果
 */
function logTest(category, testName, passed, details) {
  testResults.total++;
  if (passed) {
    testResults.passed++;
  } else {
    testResults.failed++;
  }

  const result = {
    category,
    testName,
    passed,
    details,
    timestamp: new Date().toISOString()
  };

  testResults.details.push(result);

  const icon = passed ? '✅' : '❌';
  console.log(`${icon} [${category}] ${testName}`);
  if (!passed) {
    console.log(`   Error: ${JSON.stringify(details)}`);
  }
}

/**
 * A. 用户功能测试
 */
async function testUserFunctions() {
  console.log('\n=== A. 用户功能测试 ===\n');

  // A1. 用户注册
  console.log('A1. 测试用户注册...');
  const registerRes = await request('POST', '/api/auth/register', {
    body: {
      username: authData.testUsername,
      email: `${authData.testUsername}@test.com`,
      password: 'Test123456'
    }
  });

  logTest(
    '用户功能',
    '用户注册',
    registerRes.ok && registerRes.data.success,
    {
      status: registerRes.status,
      responseTime: registerRes.responseTime,
      data: registerRes.data
    }
  );

  if (registerRes.ok && registerRes.data.userId) {
    authData.testUserId = registerRes.data.userId;
  }

  // A2. 用户登录
  console.log('A2. 测试用户登录...');
  const loginRes = await request('POST', '/api/auth/login', {
    body: {
      username: authData.testUsername,
      password: 'Test123456'
    }
  });

  logTest(
    '用户功能',
    '用户登录',
    loginRes.ok && loginRes.data.success,
    {
      status: loginRes.status,
      responseTime: loginRes.responseTime,
      hasCookie: !!loginRes.cookies
    }
  );

  if (loginRes.cookies) {
    authData.userCookies = loginRes.cookies;
  }

  // A3. 获取用户信息
  console.log('A3. 测试获取用户信息...');
  const meRes = await request('GET', '/api/auth/me', {
    headers: {
      'Cookie': authData.userCookies
    }
  });

  logTest(
    '用户功能',
    '获取用户信息',
    meRes.ok && meRes.data.user,
    {
      status: meRes.status,
      responseTime: meRes.responseTime,
      username: meRes.data.user?.username
    }
  );

  // A4. 测试产品访问门控 - 学习圈
  console.log('A4. 测试产品访问门控 - 学习圈...');
  const gateCircleRes = await request('GET', '/api/gate/circle', {
    headers: {
      'Cookie': authData.userCookies
    }
  });

  logTest(
    '用户功能',
    '产品访问门控 - 学习圈',
    gateCircleRes.status === 200,
    {
      status: gateCircleRes.status,
      responseTime: gateCircleRes.responseTime,
      hasAccess: gateCircleRes.data?.hasAccess,
      reason: gateCircleRes.data?.reason
    }
  );

  // A5. 测试产品访问门控 - 板块节奏系统
  console.log('A5. 测试产品访问门控 - 板块节奏系统...');
  const gateBkRes = await request('GET', '/api/gate/bk', {
    headers: {
      'Cookie': authData.userCookies
    }
  });

  logTest(
    '用户功能',
    '产品访问门控 - 板块节奏系统',
    gateBkRes.status === 200,
    {
      status: gateBkRes.status,
      responseTime: gateBkRes.responseTime,
      hasAccess: gateBkRes.data?.hasAccess,
      trialRemaining: gateBkRes.data?.trialRemaining
    }
  );
}

/**
 * B. 管理员功能测试
 */
async function testAdminFunctions() {
  console.log('\n=== B. 管理员功能测试 ===\n');

  // B1. 管理员登录
  console.log('B1. 测试管理员登录...');
  const adminLoginRes = await request('POST', '/api/admin/auth/login', {
    body: {
      username: 'admin',
      password: 'admin123456'
    }
  });

  logTest(
    '管理员功能',
    '管理员登录',
    adminLoginRes.ok && adminLoginRes.data.success,
    {
      status: adminLoginRes.status,
      responseTime: adminLoginRes.responseTime,
      hasCookie: !!adminLoginRes.cookies
    }
  );

  if (adminLoginRes.cookies) {
    authData.adminCookies = adminLoginRes.cookies;
  }

  // B2. 获取会员列表
  console.log('B2. 测试获取会员列表...');
  const membersRes = await request('GET', '/api/admin/members/list', {
    headers: {
      'Cookie': authData.adminCookies
    }
  });

  logTest(
    '管理员功能',
    '获取会员列表',
    membersRes.ok && Array.isArray(membersRes.data.members),
    {
      status: membersRes.status,
      responseTime: membersRes.responseTime,
      memberCount: membersRes.data.members?.length
    }
  );

  // B3. 获取统计数据
  console.log('B3. 测试获取统计数据...');
  const statsRes = await request('GET', '/api/admin/dashboard/stats', {
    headers: {
      'Cookie': authData.adminCookies
    }
  });

  logTest(
    '管理员功能',
    '获取统计数据',
    statsRes.ok && statsRes.data.stats,
    {
      status: statsRes.status,
      responseTime: statsRes.responseTime,
      totalUsers: statsRes.data.stats?.totalUsers,
      activeMembers: statsRes.data.stats?.activeMembers
    }
  );

  // B4. 编辑会员等级（如果有测试用户）
  if (authData.testUserId) {
    console.log('B4. 测试编辑会员等级...');
    const editRes = await request('POST', '/api/admin/members/edit', {
      headers: {
        'Cookie': authData.adminCookies
      },
      body: {
        userId: authData.testUserId,
        membershipLevel: 'monthly',
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    });

    logTest(
      '管理员功能',
      '编辑会员等级',
      editRes.ok && editRes.data.success,
      {
        status: editRes.status,
        responseTime: editRes.responseTime
      }
    );
  }

  // B5. 冻结会员
  if (authData.testUserId) {
    console.log('B5. 测试冻结会员...');
    const freezeRes = await request('POST', '/api/admin/members/freeze', {
      headers: {
        'Cookie': authData.adminCookies
      },
      body: {
        userId: authData.testUserId
      }
    });

    logTest(
      '管理员功能',
      '冻结会员',
      freezeRes.ok && freezeRes.data.success,
      {
        status: freezeRes.status,
        responseTime: freezeRes.responseTime
      }
    );
  }

  // B6. 解冻会员
  if (authData.testUserId) {
    console.log('B6. 测试解冻会员...');
    const unfreezeRes = await request('POST', '/api/admin/members/unfreeze', {
      headers: {
        'Cookie': authData.adminCookies
      },
      body: {
        userId: authData.testUserId
      }
    });

    logTest(
      '管理员功能',
      '解冻会员',
      unfreezeRes.ok && unfreezeRes.data.success,
      {
        status: unfreezeRes.status,
        responseTime: unfreezeRes.responseTime
      }
    );
  }

  // B7. 删除会员
  if (authData.testUserId) {
    console.log('B7. 测试删除会员...');
    const deleteRes = await request('POST', '/api/admin/members/delete', {
      headers: {
        'Cookie': authData.adminCookies
      },
      body: {
        userId: authData.testUserId
      }
    });

    logTest(
      '管理员功能',
      '删除会员',
      deleteRes.ok && deleteRes.data.success,
      {
        status: deleteRes.status,
        responseTime: deleteRes.responseTime
      }
    );
  }
}

/**
 * C. 前端页面测试
 */
async function testFrontendPages() {
  console.log('\n=== C. 前端页面测试 ===\n');

  const pages = [
    { name: '首页', path: '/' },
    { name: '会员页', path: '/member' },
    { name: '管理后台', path: '/admin' },
    { name: '会员管理页', path: '/admin/members' }
  ];

  for (const page of pages) {
    console.log(`C. 测试访问${page.name}...`);
    const res = await request('GET', page.path);

    logTest(
      '前端页面',
      `访问${page.name}`,
      res.status === 200 || res.status === 307, // 307是重定向
      {
        status: res.status,
        responseTime: res.responseTime
      }
    );
  }
}

/**
 * 生成测试报告
 */
function generateReport() {
  console.log('\n');
  console.log('='.repeat(60));
  console.log('           全面功能测试报告');
  console.log('='.repeat(60));
  console.log(`\n测试时间: ${new Date().toLocaleString('zh-CN')}`);
  console.log(`测试服务器: ${BASE_URL}`);
  console.log(`\n总测试数: ${testResults.total}`);
  console.log(`✅ 成功: ${testResults.passed}`);
  console.log(`❌ 失败: ${testResults.failed}`);

  const successRate = ((testResults.passed / testResults.total) * 100).toFixed(2);
  console.log(`\n成功率: ${successRate}%`);

  // 系统健康评分
  let healthScore = 'A';
  if (successRate < 100) healthScore = 'B';
  if (successRate < 90) healthScore = 'C';
  if (successRate < 80) healthScore = 'D';
  if (successRate < 70) healthScore = 'F';

  console.log(`系统健康评分: ${healthScore}`);

  // 详细错误列表
  const failures = testResults.details.filter(r => !r.passed);
  if (failures.length > 0) {
    console.log('\n失败的测试详情:');
    console.log('-'.repeat(60));
    failures.forEach((failure, index) => {
      console.log(`\n${index + 1}. [${failure.category}] ${failure.testName}`);
      console.log(`   详情: ${JSON.stringify(failure.details, null, 2)}`);
    });
  }

  console.log('\n' + '='.repeat(60));

  return {
    successRate: parseFloat(successRate),
    healthScore,
    failures: failures.length,
    report: testResults
  };
}

/**
 * 主测试流程
 */
async function runAllTests() {
  console.log('开始全面功能测试...\n');

  try {
    await testUserFunctions();
    await testAdminFunctions();
    await testFrontendPages();

    const report = generateReport();

    // 写入报告文件
    const fs = require('fs');
    fs.writeFileSync(
      'test-report.json',
      JSON.stringify(testResults, null, 2),
      'utf-8'
    );
    console.log('\n✅ 测试报告已保存到 test-report.json');

    return report;
  } catch (error) {
    console.error('测试执行出错:', error);
    process.exit(1);
  }
}

// 执行测试
runAllTests().then(report => {
  if (report.successRate < 100) {
    process.exit(1);
  }
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
