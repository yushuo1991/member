import { copyFileSync, cpSync, existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('📦 复制standalone构建资源...');

const standaloneDir = join(projectRoot, '.next', 'standalone');
const staticDir = join(projectRoot, '.next', 'static');
const publicDir = join(projectRoot, 'public');

// 确保standalone目录存在
if (!existsSync(standaloneDir)) {
  console.error('❌ standalone目录不存在');
  process.exit(1);
}

// 1. 复制 .next/static
if (existsSync(staticDir)) {
  const targetStatic = join(standaloneDir, '.next', 'static');
  mkdirSync(dirname(targetStatic), { recursive: true });
  cpSync(staticDir, targetStatic, { recursive: true });
  console.log('✅ 已复制 .next/static');
}

// 2. 复制 public
if (existsSync(publicDir)) {
  const targetPublic = join(standaloneDir, 'public');
  cpSync(publicDir, targetPublic, { recursive: true });
  console.log('✅ 已复制 public/');
}

// 3. 复制 .env (如果存在)
const envFile = join(projectRoot, '.env');
if (existsSync(envFile)) {
  const targetEnv = join(standaloneDir, '.env');
  copyFileSync(envFile, targetEnv);
  console.log('✅ 已复制 .env');
}

console.log('✨ standalone构建资源复制完成！');
