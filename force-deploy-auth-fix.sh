#!/bin/bash

#############################################
# 强制部署认证修复到Monorepo
# 处理本地修改冲突
#############################################

set -e

echo "🔧 开始强制部署认证修复"
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
echo "💾 保存本地修改..."
git stash push -m "Auto-stash before auth fix deployment $(date '+%Y-%m-%d %H:%M:%S')"

echo ""
echo "📥 从GitHub拉取最新代码..."
git fetch origin
git pull origin main

echo ""
echo "📋 查看最新提交（应该包含认证修复 c25abb9）..."
git log --oneline -5

echo ""
echo "🔍 检查认证修复是否已应用..."
if git log --oneline -1 | grep -q "c25abb9"; then
    echo "✅ 认证修复已包含在最新代码中"
else
    echo "⚠️  最新提交不是认证修复，继续检查..."
    git log --oneline -10 | grep "认证" || echo "未找到认证相关提交"
fi

echo ""
echo "🏗️  重新构建Web应用..."
cd /www/wwwroot/member-monorepo
pnpm install --filter web
pnpm build --filter web

echo ""
echo "🔄 重启member-web服务..."
pm2 restart member-web

echo ""
echo "⏳ 等待服务启动..."
sleep 8

echo ""
echo "📊 PM2状态:"
pm2 list

echo ""
echo "✅ 检查member-web是否正常运行..."
if pm2 list | grep -q "member-web.*online"; then
    echo "✅ member-web 运行正常"
else
    echo "❌ member-web 启动失败，查看错误日志:"
    pm2 logs member-web --lines 30 --nostream --err
    exit 1
fi

echo ""
echo "📝 查看Web应用最新日志:"
pm2 logs member-web --lines 30 --nostream

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
echo "  pm2 logs member-web --lines 100"
echo ""
echo "部署时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "================================"
