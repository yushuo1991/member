#!/bin/bash

echo "🔧 完成构建并启动服务"
echo "================================"

ssh root@8.153.110.212 << 'ENDSSH'

echo "1️⃣ 停止当前服务"
pm2 stop member-web

echo ""
echo "2️⃣ 进入web应用目录"
cd /www/wwwroot/member-monorepo/apps/web

echo ""
echo "3️⃣ 清理旧的构建"
rm -rf .next

echo ""
echo "4️⃣ 开始构建（这可能需要5-10分钟）"
pnpm build

echo ""
echo "5️⃣ 检查构建结果"
if [ -f ".next/BUILD_ID" ]; then
    echo "✅ 构建成功"
    cat .next/BUILD_ID
else
    echo "❌ 构建失败"
    exit 1
fi

echo ""
echo "6️⃣ 重启服务"
pm2 restart member-web

echo ""
echo "7️⃣ 等待启动..."
sleep 10

echo ""
echo "8️⃣ 检查状态"
pm2 list

echo ""
echo "9️⃣ 查看日志"
pm2 logs member-web --lines 30 --nostream

ENDSSH

echo ""
echo "================================"
echo "✅ 构建和启动完成"
echo "================================"
