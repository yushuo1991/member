#!/bin/bash

echo "🔧 快速修复方案：使用旧系统+应用认证修复"
echo "================================"

ssh root@8.153.110.212 << 'ENDSSH'

echo "1️⃣ 检查旧系统目录结构"
ls -la /www/wwwroot/member-system/src/ 2>/dev/null | head -10

echo ""
echo "2️⃣ 找到正确的源码路径"
find /www/wwwroot/member-system -name "AuthContext.tsx" -o -name "SystemAccessFrame.tsx" 2>/dev/null

echo ""
echo "3️⃣ 停止当前PM2服务"
pm2 stop member-web
pm2 delete member-web

echo ""
echo "4️⃣ 检查旧系统的PM2配置"
cat /www/wwwroot/member-system/ecosystem.config.js | head -40

echo ""
echo "5️⃣ 使用旧系统的PM2配置启动"
cd /www/wwwroot/member-system
pm2 start ecosystem.config.js

echo ""
echo "6️⃣ 等待启动..."
sleep 8

echo ""
echo "7️⃣ 检查状态"
pm2 list

echo ""
echo "8️⃣ 查看日志"
pm2 logs member-system --lines 30 --nostream

ENDSSH

echo ""
echo "================================"
echo "✅ 检查完成"
echo "================================"
