#!/bin/bash

# 在服务器上直接运行此脚本完成部署
# 复制整个脚本内容，SSH登录后粘贴执行

cd /www/wwwroot/member-monorepo

echo "========================================"
echo "🚀 开始完成部署"
echo "========================================"

# 步骤1: 构建应用
echo ""
echo "=== 检查构建状态 ==="
for app in web bk fuplan xinli; do
  if [ -d "apps/$app/.next" ]; then
    echo "✅ apps/$app 已构建"
  else
    echo "⏳ 构建 apps/$app..."
    cd apps/$app && pnpm build && cd ../..
  fi
done

# 步骤2: 创建PM2配置
echo ""
echo "=== 创建PM2配置 ==="
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    { name: 'member-web', cwd: '/www/wwwroot/member-monorepo/apps/web', script: './node_modules/next/dist/bin/next', args: 'start -p 3000', instances: 1, autorestart: true, max_memory_restart: '1G', env: { NODE_ENV: 'production', PORT: 3000 } },
    { name: 'member-bk', cwd: '/www/wwwroot/member-monorepo/apps/bk', script: './node_modules/next/dist/bin/next', args: 'start -p 3001', instances: 1, autorestart: true, max_memory_restart: '512M', env: { NODE_ENV: 'production', PORT: 3001 } },
    { name: 'member-fuplan', cwd: '/www/wwwroot/member-monorepo/apps/fuplan', script: './node_modules/next/dist/bin/next', args: 'start -p 3002', instances: 1, autorestart: true, max_memory_restart: '512M', env: { NODE_ENV: 'production', PORT: 3002 } },
    { name: 'member-xinli', cwd: '/www/wwwroot/member-monorepo/apps/xinli', script: './node_modules/next/dist/bin/next', args: 'start -p 3003', instances: 1, autorestart: true, max_memory_restart: '512M', env: { NODE_ENV: 'production', PORT: 3003 } }
  ]
};
EOF

mkdir -p logs
echo "✅ PM2配置完成"

# 步骤3: 启动服务
echo ""
echo "=== 启动服务 ==="
pm2 delete all 2>/dev/null || true
sleep 2
pm2 start ecosystem.config.js
pm2 save
pm2 list

# 步骤4: 验证
echo ""
echo "=== 健康检查 ==="
sleep 3
netstat -tlnp | grep -E ":(3000|3001|3002|3003)" | grep LISTEN

echo ""
echo "========================================"
echo "✅ 部署完成！"
echo "========================================"
echo "访问地址:"
echo "  http://8.153.110.212:3000  (Web)"
echo "  http://8.153.110.212:3001  (BK)"
echo "  http://8.153.110.212:3002  (Fuplan)"
echo "  http://8.153.110.212:3003  (Xinli)"
