#!/bin/bash

echo "🔧 切换PM2到Monorepo系统"
echo "================================"

ssh root@8.153.110.212 << 'ENDSSH'

echo "1️⃣ 检查Monorepo结构"
ls -la /www/wwwroot/member-monorepo/apps/web/.next/ 2>/dev/null | head -10

echo ""
echo "2️⃣ 停止当前的member-web"
pm2 stop member-web

echo ""
echo "3️⃣ 删除旧的PM2配置"
pm2 delete member-web

echo ""
echo "4️⃣ 使用Monorepo启动member-web"
cd /www/wwwroot/member-monorepo/apps/web

# 检查是否有构建输出
if [ -d ".next/standalone" ]; then
    echo "✅ 找到standalone构建，使用standalone模式"
    pm2 start .next/standalone/server.js \
        --name member-web \
        --cwd /www/wwwroot/member-monorepo/apps/web \
        --env production
elif [ -d ".next" ]; then
    echo "✅ 找到.next目录，使用next start"
    pm2 start npm \
        --name member-web \
        --cwd /www/wwwroot/member-monorepo/apps/web \
        -- start
else
    echo "❌ 没有找到构建输出，需要先构建"
    echo "正在构建..."
    npm run build
    pm2 start npm \
        --name member-web \
        --cwd /www/wwwroot/member-monorepo/apps/web \
        -- start
fi

echo ""
echo "5️⃣ 等待启动..."
sleep 8

echo ""
echo "6️⃣ 检查状态"
pm2 list

echo ""
echo "7️⃣ 保存PM2配置"
pm2 save

echo ""
echo "8️⃣ 查看日志"
pm2 logs member-web --lines 30 --nostream

ENDSSH

echo ""
echo "================================"
echo "✅ PM2已切换到Monorepo"
echo "================================"
