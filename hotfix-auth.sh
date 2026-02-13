#!/bin/bash

#############################################
# 认证修复热部署脚本
# 只更新 apps/web 的认证相关文件
# 快速修复，不影响其他服务
#############################################

set -e

echo "🔧 开始部署认证修复补丁"
echo "服务器: 8.153.110.212"
echo "时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "================================"

SERVER="root@8.153.110.212"
WEB_PATH="/www/wwwroot/member-system"

# 检查服务器上的路径
echo "📋 检查服务器部署路径..."
ssh ${SERVER} << 'ENDSSH'
if [ -d "/www/wwwroot/member-system" ]; then
    echo "✅ 找到部署路径: /www/wwwroot/member-system"
elif [ -d "/www/wwwroot/member-monorepo" ]; then
    echo "✅ 找到部署路径: /www/wwwroot/member-monorepo"
    WEB_PATH="/www/wwwroot/member-monorepo/apps/web"
else
    echo "❌ 未找到部署路径"
    exit 1
fi
ENDSSH

echo ""
echo "📤 上传修复的文件..."

# 上传 AuthContext.tsx
echo "  - 上传 AuthContext.tsx"
scp apps/web/src/contexts/AuthContext.tsx \
    ${SERVER}:${WEB_PATH}/src/contexts/AuthContext.tsx

# 上传 SystemAccessFrame.tsx
echo "  - 上传 SystemAccessFrame.tsx"
scp apps/web/src/components/SystemAccessFrame.tsx \
    ${SERVER}:${WEB_PATH}/src/components/SystemAccessFrame.tsx

echo "✅ 文件上传完成"

echo ""
echo "🔄 重启 Web 应用..."

ssh ${SERVER} << 'ENDSSH'
# 检查PM2进程名称
if pm2 describe member-web > /dev/null 2>&1; then
    echo "重启 member-web..."
    pm2 restart member-web
elif pm2 describe member-system > /dev/null 2>&1; then
    echo "重启 member-system..."
    pm2 restart member-system
else
    echo "⚠️  未找到PM2进程，尝试查看所有进程..."
    pm2 list
    exit 1
fi

echo ""
echo "等待服务重启..."
sleep 3

echo ""
echo "📊 PM2 状态:"
pm2 list

echo ""
echo "📝 最近的日志:"
pm2 logs --lines 20 --nostream
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
echo "🔍 查看日志:"
echo "  ssh root@8.153.110.212"
echo "  pm2 logs member-web --lines 50"
echo ""
echo "部署时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "================================"
