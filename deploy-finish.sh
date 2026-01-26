#!/bin/bash

# 服务器完成部署脚本 - 精简版
# 复制此脚本到服务器 /www/wwwroot/member-monorepo/deploy-finish.sh
# 然后执行: bash deploy-finish.sh

set -e

echo "========================================="
echo "完成Monorepo部署 - 自动执行"
echo "========================================="
echo ""

cd /www/wwwroot/member-monorepo

# 步骤1: 快速检查和构建
echo "步骤1/4: 构建应用..."
if [ ! -d "apps/web/.next" ] || [ ! -d "apps/bk/.next" ] || [ ! -d "apps/fuplan/.next" ] || [ ! -d "apps/xinli/.next" ]; then
    echo "开始构建（这可能需要5-8分钟）..."
    pnpm build
    echo "✅ 构建完成"
else
    echo "✅ 所有应用已构建"
fi

# 步骤2: 创建PM2配置
echo ""
echo "步骤2/4: 创建PM2配置..."
cat > ecosystem.config.js << 'EOFCONFIG'
module.exports = {
  apps: [
    {
      name: 'member-web',
      cwd: '/www/wwwroot/member-monorepo/apps/web',
      script: './node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      instances: 1,
      autorestart: true,
      max_memory_restart: '1G',
      env: { NODE_ENV: 'production', PORT: 3000 }
    },
    {
      name: 'member-bk',
      cwd: '/www/wwwroot/member-monorepo/apps/bk',
      script: './node_modules/next/dist/bin/next',
      args: 'start -p 3001',
      instances: 1,
      autorestart: true,
      max_memory_restart: '512M',
      env: { NODE_ENV: 'production', PORT: 3001 }
    },
    {
      name: 'member-fuplan',
      cwd: '/www/wwwroot/member-monorepo/apps/fuplan',
      script: './node_modules/next/dist/bin/next',
      args: 'start -p 3002',
      instances: 1,
      autorestart: true,
      max_memory_restart: '512M',
      env: { NODE_ENV: 'production', PORT: 3002 }
    },
    {
      name: 'member-xinli',
      cwd: '/www/wwwroot/member-monorepo/apps/xinli',
      script: './node_modules/next/dist/bin/next',
      args: 'start -p 3003',
      instances: 1,
      autorestart: true,
      max_memory_restart: '512M',
      env: { NODE_ENV: 'production', PORT: 3003 }
    }
  ]
};
EOFCONFIG

mkdir -p logs
echo "✅ PM2配置完成"

# 步骤3: 启动服务
echo ""
echo "步骤3/4: 启动PM2服务..."
pm2 delete all 2>/dev/null || true
sleep 2
pm2 start ecosystem.config.js
pm2 save
echo "✅ 服务启动完成"

# 步骤4: 验证
echo ""
echo "步骤4/4: 验证服务状态..."
sleep 3
pm2 list

echo ""
echo "端口监听状态:"
netstat -tlnp | grep -E ":(3000|3001|3002|3003)" | grep LISTEN || echo "等待端口启动..."

echo ""
echo "========================================="
echo "✅ 部署完成！"
echo "========================================="
echo ""
echo "访问地址:"
echo "  http://8.153.110.212:3000  (Web应用)"
echo "  http://8.153.110.212:3001  (BK应用)"
echo "  http://8.153.110.212:3002  (Fuplan应用)"
echo "  http://8.153.110.212:3003  (Xinli应用)"
echo ""
echo "管理命令:"
echo "  pm2 list          - 查看状态"
echo "  pm2 logs          - 查看日志"
echo "  pm2 restart all   - 重启所有"
echo ""
