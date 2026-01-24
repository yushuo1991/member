#!/bin/bash
# 手动部署脚本 - 在服务器上执行

set -e

echo "========================================="
echo "  开始部署 member-system"
echo "========================================="
echo ""

DEPLOY_PATH="/www/wwwroot/member-system"

cd "$DEPLOY_PATH"

echo "[1/5] 拉取最新代码..."
git pull origin main

echo ""
echo "[2/5] 安装依赖..."
npm ci --prefer-offline --no-audit

echo ""
echo "[3/5] 构建项目..."
npm run build

echo ""
echo "[4/5] 停止旧进程..."
pm2 stop member-system 2>/dev/null || echo "  (没有运行的进程)"

echo ""
echo "[5/5] 启动应用..."
pm2 startOrReload ecosystem.config.js --env production
pm2 save

echo ""
echo "========================================="
echo "  ✅ 部署完成!"
echo "========================================="
echo ""
echo "查看状态: pm2 status"
echo "查看日志: pm2 logs member-system"
echo "访问地址: http://8.153.110.212:3000"
echo ""
