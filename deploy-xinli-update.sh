#!/bin/bash
# 快速更新xinli应用的脚本

SERVER="root@8.153.110.212"

echo "🚀 更新xinli应用到服务器"
echo "================================"

ssh ${SERVER} << 'ENDSSH'
cd /www/wwwroot/member-monorepo

echo "📥 拉取最新代码..."
git pull origin main

echo "📝 更新xinli环境变量..."
cat > apps/xinli/.env << 'EOF2'
NODE_ENV=production
PORT=3003

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=ChangeMe2026!Secure
DB_NAME=member_system

# 主应用URL（用于跨应用重定向）
NEXT_PUBLIC_MAIN_APP_URL=http://8.153.110.212:3000
EOF2

echo "📦 安装依赖..."
cd apps/xinli
pnpm install --prod

echo "🏗️  构建xinli应用..."
pnpm build

echo "🔄 重启xinli服务..."
pm2 restart member-xinli

echo "✅ xinli应用更新完成！"
echo ""
echo "📊 服务状态："
pm2 list | grep xinli

echo ""
echo "🌐 访问地址："
echo "  http://8.153.110.212:3003"
ENDSSH

echo ""
echo "✅ 部署完成！"
