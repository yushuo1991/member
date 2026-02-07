#!/bin/bash
# 修复git冲突并更新xinli应用

SERVER="root@8.153.110.212"

echo "🚀 修复git冲突并更新xinli应用"
echo "================================"

ssh ${SERVER} << 'ENDSSH'
cd /www/wwwroot/member-monorepo

echo "📥 处理git冲突..."
# 保存当前更改
git stash

# 拉取最新代码
git pull origin main

# 恢复保存的更改（如果有冲突会提示）
git stash pop || echo "⚠️ 有冲突，使用远程版本"

echo ""
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

echo ""
echo "📦 重新安装依赖..."
cd /www/wwwroot/member-monorepo
pnpm install --prod --no-interactive

echo ""
echo "🏗️  构建xinli应用..."
cd apps/xinli
pnpm build

echo ""
echo "🔄 重启xinli服务..."
pm2 restart member-xinli

echo ""
echo "✅ xinli应用更新完成！"
echo ""
echo "📊 服务状态："
pm2 list | grep xinli

echo ""
echo "🌐 访问地址："
echo "  http://8.153.110.212:3003"
echo "  https://xinli.yushuofupan.com"
ENDSSH

echo ""
echo "✅ 部署完成！"
