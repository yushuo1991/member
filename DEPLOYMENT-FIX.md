# Standalone构建依赖修复指南

## 问题描述

Next.js standalone构建后，`.next/standalone/server.js` 需要 `next` 模块，但该目录缺少 `node_modules`，导致应用启动失败并出现502错误。

## 错误信息

```
Error: Cannot find module 'next'
Require stack:
- /www/wwwroot/member-system/.next/standalone/server.js
```

## 根本原因

1. Next.js standalone构建会生成自包含的 `server.js`
2. 但在monorepo环境中，workspace依赖（`workspace:*`）无法被正确复制
3. 导致standalone目录缺少运行时必需的node_modules

## 解决方案

### 方法一：手动安装依赖（已验证有效）

```bash
# 进入standalone目录
cd /www/wwwroot/member-system/.next/standalone

# 备份package.json（避免workspace依赖问题）
mv package.json package.json.bak

# 创建node_modules并安装核心依赖
mkdir -p node_modules
cd node_modules
npm install next@14.2.35 react@18.3.1 react-dom@18.3.1 sharp@0.33.5 --no-save --legacy-peer-deps

# 重启应用
pm2 restart member-web
```

### 方法二：使用自动化脚本

上传并运行 `fix-standalone-dependencies.sh`：

```bash
# 上传脚本
scp fix-standalone-dependencies.sh root@yushuofupan.com:/tmp/

# SSH登录并执行
ssh root@yushuofupan.com
chmod +x /tmp/fix-standalone-dependencies.sh
bash /tmp/fix-standalone-dependencies.sh

# 重启所有应用
pm2 restart all
```

### 方法三：修改构建流程（长期方案）

在 `apps/web/next.config.js` 中添加：

```javascript
experimental: {
  outputFileTracingIncludes: {
    '/*': [
      './node_modules/next/**',
      './node_modules/react/**',
      './node_modules/react-dom/**',
      './node_modules/sharp/**'
    ]
  }
}
```

然后重新构建：

```bash
pnpm build:web
```

## 部署检查清单

每次部署后，执行以下检查：

```bash
# 1. 检查standalone是否有node_modules
ls -la /www/wwwroot/member-system/.next/standalone/node_modules/

# 2. 检查next模块是否存在
test -f /www/wwwroot/member-system/.next/standalone/node_modules/next/dist/server/lib/start-server.js && echo "OK" || echo "MISSING"

# 3. 如果缺失，运行修复脚本
bash /tmp/fix-standalone-dependencies.sh

# 4. 重启应用
pm2 restart all

# 5. 验证应用启动
pm2 logs --lines 50

# 6. 测试端口
curl -I http://localhost:3000

# 7. 测试域名
curl -I https://yushuofupan.com
```

## 预防措施

### 1. 添加部署后钩子

在 `.github/workflows/deploy-monorepo.yml` 中添加：

```yaml
- name: Fix standalone dependencies
  run: |
    cd /www/wwwroot/member-system/.next/standalone
    mkdir -p node_modules
    cd node_modules
    npm install next@14.2.35 react@18.3.1 react-dom@18.3.1 sharp@0.33.5 --no-save --legacy-peer-deps
```

### 2. 创建健康检查脚本

```bash
#!/bin/bash
# health-check.sh

for port in 3000 3001 3002 3003; do
    if curl -f http://localhost:$port > /dev/null 2>&1; then
        echo "✓ Port $port OK"
    else
        echo "✗ Port $port FAILED"
        exit 1
    fi
done
```

### 3. 设置监控告警

使用PM2 Plus或其他监控工具，当应用重启次数超过阈值时发送告警。

## 相关文件

- `fix-standalone-dependencies.sh` - 自动修复脚本
- `server-fix.sh` - 综合修复脚本
- `server-diagnose.sh` - 诊断脚本

## 参考

- Next.js Standalone Output: https://nextjs.org/docs/advanced-features/output-file-tracing
- Turborepo Deployment: https://turbo.build/repo/docs/handbook/deploying-with-docker
- Git历史中的相关修复：
  - `179c96f` - 在standalone目录中npm install核心依赖
  - `c099c8b` - 用npm install替换pnpm符号链接
  - `ac1dbcb` - 递归解引用standalone中所有pnpm符号链接
