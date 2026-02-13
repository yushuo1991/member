#!/bin/bash

#############################################
# 修复并部署认证补丁到Monorepo
#############################################

set -e

echo "🔧 开始修复并部署认证补丁"
echo "服务器: 8.153.110.212"
echo "时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "================================"

SERVER="root@8.153.110.212"

ssh ${SERVER} << 'ENDSSH'
set -e

echo ""
echo "📂 进入Monorepo目录..."
cd /www/wwwroot/member-monorepo

echo ""
echo "📥 从GitHub拉取最新代码..."
git fetch origin
git pull origin main

echo ""
echo "📋 查看最新提交（应该包含认证修复）..."
git log --oneline -5

echo ""
echo "🏗️  重新构建Web应用..."
cd apps/web
pnpm install
pnpm build

echo ""
echo "🔄 重启member-web服务..."
pm2 restart member-web

echo ""
echo "⏳ 等待服务启动..."
sleep 5

echo ""
echo "📊 PM2状态:"
pm2 list

echo ""
echo "📝 查看Web应用日志:"
pm2 logs member-web --lines 20 --nostream

ENDSSH

echo ""
echo "================================"
echo "✅ 认证修复部署完成！"
echo "================================"
echo ""
echo "🧪 测试步骤:"
echo "  1. 访问 http://8.153.110.212:3000"
echo "  2. 登录你的账号"
echo "  3. 点击进入 BK 或 Fuplan 系统"
echo "  4. 应该能正常进入，不会再弹登录提示"
echo ""
echo "🔍 如需查看详细日志:"
echo "  ssh root@8.153.110.212"
echo "  pm2 logs member-web"
echo ""
echo "部署时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "================================"
