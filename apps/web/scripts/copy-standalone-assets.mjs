import { existsSync } from 'node:fs';
import { cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';

const projectRoot = process.cwd();
const nextDir = path.join(projectRoot, '.next');
const standaloneDir = path.join(nextDir, 'standalone');

if (!existsSync(standaloneDir)) {
  process.exit(0);
}

const srcStatic = path.join(nextDir, 'static');
const destNextDir = path.join(standaloneDir, '.next');
const destStatic = path.join(destNextDir, 'static');

await mkdir(destNextDir, { recursive: true });
if (existsSync(srcStatic)) {
  await rm(destStatic, { recursive: true, force: true });
  await cp(srcStatic, destStatic, { recursive: true });
}

const srcPublic = path.join(projectRoot, 'public');
const destPublic = path.join(standaloneDir, 'public');
if (existsSync(srcPublic)) {
  await rm(destPublic, { recursive: true, force: true });
  await cp(srcPublic, destPublic, { recursive: true });
}

const srcEnv = path.join(projectRoot, '.env');
const destEnv = path.join(standaloneDir, '.env');
if (existsSync(srcEnv)) {
  await cp(srcEnv, destEnv);
}

console.log('Prepared standalone assets (.next/static + public).');
