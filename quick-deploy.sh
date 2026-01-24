#!/bin/bash
# 紧急直接部署脚本 - 修复会员列表500错误

set -e

SERVER="8.153.110.212"
USER="root"

echo "=========================================="
echo "  紧急部署 - 修复会员列表500错误"
echo "=========================================="
echo ""

echo "[1/6] 本地构建..."
cd member-system
npm run build

echo ""
echo "[2/6] 创建部署包..."
cd ..
tar -czf deploy-hotfix.tar.gz \
  member-system/.next \
  member-system/public \
  member-system/package.json \
  member-system/ecosystem.config.js

echo ""
echo "[3/6] 上传到服务器..."
scp deploy-hotfix.tar.gz ${USER}@${SERVER}:/tmp/

echo ""
echo "[4/6] 在服务器上部署..."
ssh ${USER}@${SERVER} << 'ENDSSH'
set -e

DEPLOY_PATH="/www/wwwroot/member-system"

echo "  备份.env..."
cp "$DEPLOY_PATH/.env" /tmp/.env.backup 2>/dev/null || true

echo "  解压..."
cd /tmp
tar -xzf deploy-hotfix.tar.gz

echo "  同步文件..."
rsync -av --delete \
  --exclude='.env' \
  --exclude='logs' \
  --exclude='node_modules' \
  /tmp/member-system/ "$DEPLOY_PATH/"

echo "  恢复.env..."
cp /tmp/.env.backup "$DEPLOY_PATH/.env" 2>/dev/null || true

echo "  重启PM2..."
cd "$DEPLOY_PATH"
pm2 restart member-system
pm2 save

echo "  清理..."
rm -rf /tmp/member-system /tmp/deploy-hotfix.tar.gz

echo "✅ 部署完成"
pm2 list
ENDSSH

echo ""
echo "[5/6] 清理本地..."
rm -f deploy-hotfix.tar.gz

echo ""
echo "[6/6] 验证修复..."
sleep 3
bash verify-members-fix.sh

echo ""
echo "部署完成！请访问管理后台测试："
echo "http://yushuofupan.com/admin/login"
