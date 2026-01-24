#!/bin/bash
# 完整的手动部署脚本 - 绕过GitHub Actions
# 2026-01-24

set -e

echo "=========================================="
echo "  手动部署会员系统到生产环境"
echo "=========================================="
echo ""

# 配置
SERVER="8.153.110.212"
USER="root"
DEPLOY_PATH="/www/wwwroot/member-system"
LOCAL_PATH="./member-system"

echo "[1/10] 准备本地构建环境..."
cd "$LOCAL_PATH"

echo "[2/10] 安装依赖..."
npm ci

echo "[3/10] 构建应用..."
npm run build

echo "[4/10] 创建部署包..."
cd ..
tar -czf deploy-package.tar.gz \
  member-system/.next \
  member-system/public \
  member-system/src \
  member-system/package.json \
  member-system/package-lock.json \
  member-system/next.config.js \
  member-system/ecosystem.config.js \
  member-system/database-init-v3.sql \
  member-system/DATABASE_V3_MIGRATION_GUIDE.md

echo "[5/10] 上传到服务器..."
scp deploy-package.tar.gz ${USER}@${SERVER}:/tmp/

echo "[6/10] 在服务器上解压并部署..."
ssh ${USER}@${SERVER} << 'ENDSSH'
set -e

DEPLOY_PATH="/www/wwwroot/member-system"

echo "  备份.env文件..."
if [ -f "$DEPLOY_PATH/.env" ]; then
  cp "$DEPLOY_PATH/.env" /tmp/.env.backup
fi

echo "  解压部署包..."
cd /tmp
tar -xzf deploy-package.tar.gz

echo "  同步文件..."
rsync -av --delete \
  --exclude='.env' \
  --exclude='logs' \
  --exclude='node_modules' \
  /tmp/member-system/ "$DEPLOY_PATH/"

echo "  恢复.env文件..."
if [ -f /tmp/.env.backup ]; then
  cp /tmp/.env.backup "$DEPLOY_PATH/.env"
fi

cd "$DEPLOY_PATH"

echo "  清理旧依赖..."
rm -rf node_modules package-lock.json

echo "  安装生产依赖..."
npm install --production --no-audit --prefer-offline

echo "  重启PM2..."
pm2 stop member-system 2>/dev/null || true
pm2 startOrReload ecosystem.config.js --env production
pm2 save

echo "  清理临时文件..."
rm -rf /tmp/member-system /tmp/deploy-package.tar.gz

echo "✅ 部署完成!"
pm2 list
ENDSSH

echo "[7/10] 清理本地临时文件..."
rm -f deploy-package.tar.gz

echo ""
echo "=========================================="
echo "  ✅ 部署成功完成!"
echo "=========================================="
echo ""
echo "下一步: 执行数据库迁移"
echo "  ssh root@8.153.110.212"
echo "  mysql -u root -p member_system < /www/wwwroot/member-system/database-init-v3.sql"
echo ""
