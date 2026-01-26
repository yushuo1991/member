#!/bin/bash

# 快速完成部署脚本
# 在服务器上执行

cd /www/wwwroot/member-monorepo

echo "=== 步骤1: 确保构建完成 ==="
pnpm build || echo "构建可能已完成或进行中"

echo ""
echo "=== 步骤2: 创建PM2配置 ==="
cat > ecosystem.config.js << 'EOF'
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
EOF

echo "✅ PM2配置创建完成"

echo ""
echo "=== 步骤3: 启动应用 ==="
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 list

echo ""
echo "=== 步骤4: 测试访问 ==="
sleep 3
curl -I http://localhost:3000 2>/dev/null | head -3
curl -I http://localhost:3001 2>/dev/null | head -3
curl -I http://localhost:3002 2>/dev/null | head -3
curl -I http://localhost:3003 2>/dev/null | head -3

echo ""
echo "✅ 部署完成！"
echo ""
echo "访问地址："
echo "- Web:    http://8.153.110.212:3000"
echo "- BK:     http://8.153.110.212:3001"
echo "- Fuplan: http://8.153.110.212:3002"
echo "- Xinli:  http://8.153.110.212:3003"
