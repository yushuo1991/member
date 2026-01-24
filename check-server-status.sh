#!/bin/bash
# 服务器部署状态诊断脚本

echo "=========================================="
echo "🔍 会员系统服务器诊断"
echo "=========================================="
echo ""

echo "1️⃣ 检查 PM2 进程状态"
echo "------------------------------------------"
pm2 list
echo ""

echo "2️⃣ 检查端口 3000 占用情况"
echo "------------------------------------------"
netstat -tlnp 2>/dev/null | grep :3000 || ss -tlnp 2>/dev/null | grep :3000 || echo "端口3000未监听"
echo ""

echo "3️⃣ 检查 Nginx 状态"
echo "------------------------------------------"
systemctl status nginx --no-pager | head -10
echo ""

echo "4️⃣ 检查 Nginx 配置"
echo "------------------------------------------"
nginx -t
echo ""

echo "5️⃣ 检查部署目录"
echo "------------------------------------------"
ls -lh /www/wwwroot/member-system/ 2>/dev/null || ls -lh /opt/member-system/ 2>/dev/null || echo "部署目录不存在"
echo ""

echo "6️⃣ 检查 .env 文件"
echo "------------------------------------------"
if [ -f /www/wwwroot/member-system/.env ]; then
    echo "✅ /www/wwwroot/member-system/.env 存在"
    echo "内容预览（隐藏敏感信息）："
    grep -v "PASSWORD\|SECRET" /www/wwwroot/member-system/.env | head -5
elif [ -f /opt/member-system/.env ]; then
    echo "✅ /opt/member-system/.env 存在"
    echo "内容预览（隐藏敏感信息）："
    grep -v "PASSWORD\|SECRET" /opt/member-system/.env | head -5
else
    echo "❌ .env 文件不存在"
fi
echo ""

echo "7️⃣ 检查最近的 PM2 日志"
echo "------------------------------------------"
pm2 logs member-system --lines 20 --nostream 2>/dev/null || echo "无法获取日志"
echo ""

echo "8️⃣ 测试本地访问"
echo "------------------------------------------"
curl -I http://127.0.0.1:3000 2>/dev/null | head -5 || echo "❌ 本地3000端口无响应"
echo ""

echo "=========================================="
echo "✅ 诊断完成"
echo "=========================================="
