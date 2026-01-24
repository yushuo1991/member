#!/bin/bash
# 手动修复服务器 - 会员列表500错误
# 使用方法：在服务器上运行此脚本

set -e

DEPLOY_PATH="/www/wwwroot/member-system"

echo "=========================================="
echo "手动修复会员列表API"
echo "=========================================="

cd "$DEPLOY_PATH"

echo "1. 拉取最新代码..."
git pull origin main || {
  echo "Git仓库不存在，克隆新仓库..."
  cd /www/wwwroot
  rm -rf member-system
  git clone https://github.com/yushuo1991/member.git member-system
  cd member-system
}

echo "2. 安装依赖..."
sudo chown -R deploy:deploy "$DEPLOY_PATH"
npm ci

echo "3. 构建项目..."
npm run build

echo "4. 重启PM2服务..."
pm2 startOrReload ecosystem.config.js --env production
pm2 save

echo ""
echo "✅ 修复完成！"
echo ""
echo "验证修复："
echo "1. 登录管理后台: http://your-server-ip/admin"
echo "2. 查看会员列表，确认不再出现500错误"
echo ""
