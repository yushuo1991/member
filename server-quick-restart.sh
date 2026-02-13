#!/bin/bash
# 快速重启脚本 - 用于紧急重启所有服务
# 使用方法: bash server-quick-restart.sh

echo "=========================================="
echo "快速重启所有服务"
echo "=========================================="

# 停止所有PM2进程
echo "[1/4] 停止PM2进程..."
pm2 stop all

# 等待2秒
sleep 2

# 启动所有应用
echo "[2/4] 启动应用..."
cd /www/wwwroot/member-system
pm2 start ecosystem.config.monorepo.js --env production

# 等待应用启动
echo "[3/4] 等待应用启动..."
sleep 5

# 重启Nginx
echo "[4/4] 重启Nginx..."
sudo systemctl reload nginx

echo ""
echo "=========================================="
echo "重启完成！"
echo "=========================================="
pm2 list
