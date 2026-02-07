#!/bin/bash
# 强制更新xinli应用（处理git冲突）

SERVER="root@8.153.110.212"

echo "🚀 强制更新xinli应用到服务器"
echo "================================"

ssh ${SERVER} << 'ENDSSH'
cd /www/wwwroot/member-monorepo

echo "📥 强制同步远程代码..."
# 重置所有本地更改
git fetch origin main
git reset --hard origin/main
git clean -fd

echo ""
echo "📝 配置xinli环境变量..."
cat > apps/xinli/.env << 'EOF2'
NODE_ENV=production
PORT=3003

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=ChangeMe2026!Secure
DB_NAME=member_system

# JWT配置
JWT_SECRET=yushuo_member_system_jwt_secret_key_2026
JWT_EXPIRES_IN=7d

# 主应用URL（用于跨应用重定向）
NEXT_PUBLIC_MAIN_APP_URL=http://8.153.110.212:3000
EOF2

echo ""
echo "📦 安装依赖..."
cd /www/wwwroot/member-monorepo
pnpm install --prod

echo ""
echo "🏗️  构建xinli应用..."
cd apps/xinli
pnpm build

echo ""
echo "🔄 重启xinli服务..."
pm2 restart member-xinli || pm2 start

echo ""
echo "✅ xinli应用更新完成！"
echo ""
echo "📊 服务状态："
pm2 list

echo ""
echo "🌐 访问地址："
echo "  - 本地: http://8.153.110.212:3003"
echo "  - 域名: https://xinli.yushuofupan.com"
echo ""
echo "🔍 查看日志："
echo "  pm2 logs member-xinli --lines 50"
ENDSSH

echo ""
echo "✅ 部署完成！"
