#!/bin/bash

echo "🔧 将认证修复应用到旧系统"
echo "================================"

ssh root@8.153.110.212 << 'ENDSSH'

echo "1️⃣ 复制修复的文件到旧系统"
cp /www/wwwroot/member-monorepo/apps/web/src/contexts/AuthContext.tsx \
   /www/wwwroot/member-system/src/contexts/AuthContext.tsx

cp /www/wwwroot/member-monorepo/apps/web/src/components/SystemAccessFrame.tsx \
   /www/wwwroot/member-system/src/components/SystemAccessFrame.tsx

echo "✅ 文件已复制"

echo ""
echo "2️⃣ 重新构建旧系统"
cd /www/wwwroot/member-system
npm run build

echo ""
echo "3️⃣ 重启服务"
pm2 restart member-web

echo ""
echo "4️⃣ 等待启动..."
sleep 5

echo ""
echo "5️⃣ 检查状态"
pm2 list

echo ""
echo "6️⃣ 查看日志"
pm2 logs member-web --lines 20 --nostream

ENDSSH

echo ""
echo "================================"
echo "✅ 修复已应用到旧系统"
echo "================================"
