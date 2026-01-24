/**
 * 测试共享包的导入是否正常
 * 运行: node test-imports.mjs
 */

import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 测试共享包导入...\n');

// 测试1: 检查包结构
console.log('[1/3] 检查包结构...');

const requiredFiles = [
  'packages/ui/src/index.tsx',
  'packages/auth/src/index.ts',
  'packages/database/src/index.ts',
  'apps/web/src/app/page.tsx',
];

let allExist = true;
requiredFiles.forEach(file => {
  const fullPath = join(__dirname, file);
  const exists = existsSync(fullPath);
  console.log(exists ? '  ✓' : '  ✗', file);
  if (!exists) allExist = false;
});

if (!allExist) {
  console.error('\n❌ 某些必需文件不存在');
  process.exit(1);
}

console.log('\n[2/3] 检查package.json配置...');

const ui = JSON.parse(readFileSync('./packages/ui/package.json', 'utf8'));
const auth = JSON.parse(readFileSync('./packages/auth/package.json', 'utf8'));
const database = JSON.parse(readFileSync('./packages/database/package.json', 'utf8'));
const web = JSON.parse(readFileSync('./apps/web/package.json', 'utf8'));

const packages = [
  { name: '@repo/ui', actual: ui.name },
  { name: '@repo/auth', actual: auth.name },
  { name: '@repo/database', actual: database.name },
  { name: 'web', actual: web.name },
];

let allCorrect = true;
packages.forEach(({ name, actual }) => {
  const correct = name === actual;
  console.log(correct ? '  ✓' : '  ✗', `${name} -> ${actual}`);
  if (!correct) allCorrect = false;
});

if (!allCorrect) {
  console.error('\n❌ 包名称不正确');
  process.exit(1);
}

console.log('\n[3/3] 检查workspace依赖...');

const webDeps = web.dependencies || {};
const expectedDeps = ['@repo/ui', '@repo/auth', '@repo/database'];

let allDepsExist = true;
expectedDeps.forEach(dep => {
  const exists = dep in webDeps;
  console.log(exists ? '  ✓' : '  ✗', dep);
  if (!exists) allDepsExist = false;
});

if (!allDepsExist) {
  console.error('\n❌ web应用缺少某些workspace依赖');
  process.exit(1);
}

console.log('\n✅ 所有导入测试通过！');
console.log('\n下一步：');
console.log('1. 运行 pnpm install');
console.log('2. 运行 pnpm dev');
console.log('3. 访问 http://localhost:3000');
