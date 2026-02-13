#!/bin/bash

echo "🔍 诊断 member-web 服务问题"
echo "================================"

ssh root@8.153.110.212 << 'ENDSSH'

echo "1️⃣ 检查 PM2 状态"
pm2 list

echo ""
echo "2️⃣ 检查 member-web 详细状态"
pm2 describe member-web

echo ""
echo "3️⃣ 查看错误日志（最近50行）"
pm2 logs member-web --err --lines 50 --nostream

echo ""
echo "4️⃣ 检查端口占用"
netstat -tlnp | grep 3000

echo ""
echo "5️⃣ 检查进程"
ps aux | grep "member-web\|next" | grep -v grep

ENDSSH
