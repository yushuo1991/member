#!/usr/bin/env node

/**
 * 环境变量验证脚本
 * 验证所有应用的必需环境变量是否已配置
 */

const fs = require('fs');
const path = require('path');

// 定义每个应用的必需环境变量
const APP_ENV_REQUIREMENTS = {
  web: {
    name: '会员管理系统 (Web)',
    required: [
      'DB_HOST',
      'DB_PORT',
      'DB_USER',
      'DB_PASSWORD',
      'DB_NAME',
      'JWT_SECRET',
      'JWT_EXPIRES_IN',
      'NODE_ENV',
      'APP_URL',
      'PORT'
    ],
    optional: []
  },
  bk: {
    name: '板块节奏系统 (BK)',
    required: [
      'DB_HOST',
      'DB_PORT',
      'DB_USER',
      'DB_PASSWORD',
      'DB_NAME',
      'TUSHARE_TOKEN',
      'SCHEDULER_TOKEN',
      'PORT'
    ],
    optional: [
      'NEXT_PUBLIC_APP_VERSION',
      'DB_DISABLE'
    ]
  },
  fuplan: {
    name: '复盘系统 (Fuplan)',
    required: [
      'DB_HOST',
      'DB_PORT',
      'DB_USER',
      'DB_PASSWORD',
      'DB_NAME',
      'JWT_SECRET',
      'JWT_EXPIRES_IN',
      'NODE_ENV',
      'PORT'
    ],
    optional: []
  },
  xinli: {
    name: '心理测评系统 (Xinli)',
    required: [
      'DB_HOST',
      'DB_PORT',
      'DB_USER',
      'DB_PASSWORD',
      'DB_NAME',
      'JWT_SECRET',
      'JWT_EXPIRES_IN',
      'NODE_ENV',
      'PORT'
    ],
    optional: []
  }
};

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

// 解析 .env 文件
function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const env = {};

  content.split('\n').forEach(line => {
    line = line.trim();

    // 跳过注释和空行
    if (!line || line.startsWith('#')) {
      return;
    }

    // 解析 KEY=VALUE
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();

      // 移除引号
      env[key] = value.replace(/^["']|["']$/g, '');
    }
  });

  return env;
}

// 验证单个应用的环境变量
function validateApp(appName) {
  const config = APP_ENV_REQUIREMENTS[appName];
  const envPath = path.join(__dirname, '..', 'apps', appName, '.env');
  const examplePath = path.join(__dirname, '..', 'apps', appName, '.env.example');

  console.log(`\n${colorize('━'.repeat(60), 'cyan')}`);
  console.log(colorize(`检查应用: ${config.name}`, 'cyan'));
  console.log(colorize('━'.repeat(60), 'cyan'));

  // 检查 .env.example 是否存在
  if (!fs.existsSync(examplePath)) {
    console.log(colorize(`⚠ 警告: 缺少 .env.example 文件`, 'yellow'));
    console.log(`  路径: ${examplePath}`);
  } else {
    console.log(colorize(`✓ .env.example 文件存在`, 'green'));
  }

  // 检查 .env 文件是否存在
  if (!fs.existsSync(envPath)) {
    console.log(colorize(`✗ 错误: 缺少 .env 文件`, 'red'));
    console.log(`  路径: ${envPath}`);
    console.log(`  请复制 .env.example 并配置环境变量`);
    return false;
  }

  console.log(colorize(`✓ .env 文件存在`, 'green'));

  // 解析环境变量
  const env = parseEnvFile(envPath);
  if (!env) {
    console.log(colorize(`✗ 错误: 无法解析 .env 文件`, 'red'));
    return false;
  }

  // 验证必需的环境变量
  let isValid = true;
  const missing = [];
  const empty = [];
  const placeholder = [];

  config.required.forEach(key => {
    if (!(key in env)) {
      missing.push(key);
      isValid = false;
    } else if (!env[key] || env[key].trim() === '') {
      empty.push(key);
      isValid = false;
    } else if (
      env[key].includes('your_') ||
      env[key].includes('your-') ||
      env[key] === 'change_me' ||
      env[key] === 'changeme'
    ) {
      placeholder.push(key);
      isValid = false;
    }
  });

  // 输出验证结果
  console.log(`\n${colorize('必需环境变量:', 'blue')}`);

  if (missing.length > 0) {
    console.log(colorize(`  ✗ 缺失 (${missing.length}):`, 'red'));
    missing.forEach(key => console.log(`    - ${key}`));
  }

  if (empty.length > 0) {
    console.log(colorize(`  ✗ 为空 (${empty.length}):`, 'red'));
    empty.forEach(key => console.log(`    - ${key}`));
  }

  if (placeholder.length > 0) {
    console.log(colorize(`  ✗ 使用占位符 (${placeholder.length}):`, 'red'));
    placeholder.forEach(key => console.log(`    - ${key} = ${env[key]}`));
  }

  const configured = config.required.filter(key =>
    env[key] &&
    env[key].trim() !== '' &&
    !env[key].includes('your_') &&
    !env[key].includes('your-') &&
    env[key] !== 'change_me' &&
    env[key] !== 'changeme'
  );

  if (configured.length > 0) {
    console.log(colorize(`  ✓ 已配置 (${configured.length}/${config.required.length}):`, 'green'));
    configured.forEach(key => {
      // 隐藏敏感信息
      const value = env[key];
      const displayValue = ['PASSWORD', 'SECRET', 'TOKEN'].some(s => key.includes(s))
        ? '***' + value.slice(-4)
        : value.length > 30
        ? value.slice(0, 27) + '...'
        : value;
      console.log(`    - ${key} = ${displayValue}`);
    });
  }

  // 显示可选环境变量
  if (config.optional.length > 0) {
    console.log(`\n${colorize('可选环境变量:', 'blue')}`);
    config.optional.forEach(key => {
      if (env[key]) {
        console.log(colorize(`  ✓ ${key} = ${env[key]}`, 'green'));
      } else {
        console.log(colorize(`  - ${key} (未设置)`, 'yellow'));
      }
    });
  }

  return isValid;
}

// 主函数
function main() {
  const args = process.argv.slice(2);

  console.log(colorize('\n╔════════════════════════════════════════════════════════════╗', 'cyan'));
  console.log(colorize('║          宇硕会员体系 - 环境变量验证工具                  ║', 'cyan'));
  console.log(colorize('╚════════════════════════════════════════════════════════════╝', 'cyan'));

  // 如果指定了应用名称，只验证该应用
  if (args.length > 0) {
    const appName = args[0];
    if (!APP_ENV_REQUIREMENTS[appName]) {
      console.log(colorize(`\n✗ 错误: 未知的应用名称 "${appName}"`, 'red'));
      console.log(`\n可用的应用: ${Object.keys(APP_ENV_REQUIREMENTS).join(', ')}`);
      process.exit(1);
    }

    const isValid = validateApp(appName);
    console.log(`\n${colorize('━'.repeat(60), 'cyan')}`);

    if (isValid) {
      console.log(colorize(`\n✓ ${appName} 应用的环境变量配置正确`, 'green'));
      process.exit(0);
    } else {
      console.log(colorize(`\n✗ ${appName} 应用的环境变量配置不完整`, 'red'));
      process.exit(1);
    }
  }

  // 验证所有应用
  const results = {};
  Object.keys(APP_ENV_REQUIREMENTS).forEach(appName => {
    results[appName] = validateApp(appName);
  });

  // 输出总结
  console.log(`\n${colorize('╔════════════════════════════════════════════════════════════╗', 'cyan')}`);
  console.log(colorize('║                        验证总结                            ║', 'cyan'));
  console.log(colorize('╚════════════════════════════════════════════════════════════╝', 'cyan'));

  const allValid = Object.values(results).every(v => v);
  const validCount = Object.values(results).filter(v => v).length;
  const totalCount = Object.keys(results).length;

  Object.entries(results).forEach(([appName, isValid]) => {
    const config = APP_ENV_REQUIREMENTS[appName];
    const status = isValid
      ? colorize('✓ 通过', 'green')
      : colorize('✗ 失败', 'red');
    console.log(`  ${status} - ${config.name} (${appName})`);
  });

  console.log(`\n${colorize(`总计: ${validCount}/${totalCount} 应用配置正确`, allValid ? 'green' : 'yellow')}`);

  if (!allValid) {
    console.log(colorize('\n提示:', 'yellow'));
    console.log('  1. 复制 .env.example 为 .env');
    console.log('  2. 编辑 .env 文件，填入正确的配置值');
    console.log('  3. 确保所有占位符（如 your_password）都已替换');
    console.log('  4. 重新运行此脚本验证配置');
    console.log('\n使用方法:');
    console.log('  验证所有应用: node scripts/validate-env.js');
    console.log('  验证单个应用: node scripts/validate-env.js <app-name>');
    console.log('  示例: node scripts/validate-env.js web');
  }

  console.log('');
  process.exit(allValid ? 0 : 1);
}

// 运行主函数
main();
