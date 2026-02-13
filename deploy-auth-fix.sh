#!/bin/bash

#############################################
# 认证修复部署脚本 - 从GitHub拉取并重新构建
#############################################

set -e

echo "🔧 开始部署认证修复"
echo "服务器: 8.153.110.212"
echo "时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "================================"

SERVER="root@8.153.110.212"

ssh ${SERVER} << 'ENDSSH'
set -e

echo ""
echo "📂 进入部署目录..."
cd /www/wwwroot/member-system

echo ""
echo "📥 从GitHub拉取最新代码..."
git fetch origin
git pull origin main

echo ""
echo "📋 查看最新提交..."
git log --oneline -3

echo ""
echo "🏗️  重新构建应用..."
npm run build

echo ""
echo "🔄 重启PM2服务..."
if pm2 describe member-system > /dev/null 2>&1; then
    pm2 restart member-system
    echo "✅ member-system 已重启"
elif pm2 describe member-web > /dev/null 2>&1; then
    pm2 restart member-web
    echo "✅ member-web 已重启"
else
    echo "⚠️  未找到PM2进程"
    pm2 list
fi

echo ""
echo "⏳ 等待服务启动..."
sleep 5

echo ""
echo "📊 PM2状态:"
pm2 list

echo ""
echo "📝 查看最近日志:"
pm2 logs --lines 30 --nostream | tail -30

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
echo "  pm2 logs member-system"
echo ""
echo "部署时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "================================"
