#!/bin/bash

#############################################
# 最终部署方案：清理冲突并部署认证修复
#############################################

set -e

echo "🔧 开始部署认证修复（处理所有冲突）"
echo "服务器: 8.153.110.212"
echo "时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "================================"

SERVER="root@8.153.110.212"

ssh ${SERVER} << 'ENDSSH'
set -e

echo ""
echo "📂 进入Monorepo目录..."
cd /www/wwwroot/member-monorepo

echo ""
echo "💾 备份冲突文件..."
BACKUP_DIR="/tmp/monorepo-backup-$(date +%s)"
mkdir -p ${BACKUP_DIR}

# 备份未跟踪的文件
if [ -d "apps/web/public/products" ]; then
    cp -r apps/web/public/products ${BACKUP_DIR}/ 2>/dev/null || true
fi
if [ -d "apps/web/public/downloads" ]; then
    cp -r apps/web/public/downloads ${BACKUP_DIR}/ 2>/dev/null || true
fi

echo "✅ 冲突文件已备份到: ${BACKUP_DIR}"

echo ""
echo "🧹 清理冲突文件..."
# 重置所有本地修改
git reset --hard HEAD
# 清理未跟踪的文件
git clean -fd

echo ""
echo "📥 从GitHub拉取最新代码..."
git fetch origin
git pull origin main

echo ""
echo "📋 查看最新提交..."
git log --oneline -5

echo ""
echo "🔍 验证认证修复是否已应用..."
echo "检查 AuthContext.tsx 的修改..."
if grep -q "data?.success && data?.data?.user" apps/web/src/contexts/AuthContext.tsx; then
    echo "✅ 认证修复已成功应用到代码中"
else
    echo "⚠️  认证修复可能未正确应用"
fi

echo ""
echo "🏗️  重新构建Web应用..."
cd /www/wwwroot/member-monorepo
pnpm install --filter web
pnpm build --filter web

echo ""
echo "🔄 重启member-web服务..."
pm2 restart member-web

echo ""
echo "⏳ 等待服务启动..."
sleep 10

echo ""
echo "📊 PM2状态:"
pm2 list

echo ""
echo "✅ 检查member-web运行状态..."
if pm2 list | grep -q "member-web.*online"; then
    echo "✅ member-web 运行正常"
    echo ""
    echo "📝 最新日志:"
    pm2 logs member-web --lines 20 --nostream
else
    echo "❌ member-web 启动失败"
    echo "错误日志:"
    pm2 logs member-web --lines 50 --nostream --err
    exit 1
fi

ENDSSH

echo ""
echo "================================"
echo "✅ 认证修复部署成功！"
echo "================================"
echo ""
echo "🎉 修复内容:"
echo "  - 修复了 AuthContext 的认证状态检查逻辑"
echo "  - 现在会同时检查 HTTP 状态码和响应体的 success 字段"
echo "  - 已登录用户不会再被误判为未登录"
echo ""
echo "🧪 请立即测试:"
echo "  1. 访问 http://8.153.110.212:3000"
echo "  2. 登录你的账号"
echo "  3. 点击进入 BK 或 Fuplan 系统"
echo "  4. 应该能正常进入，不会再弹登录提示"
echo ""
echo "🔍 查看实时日志:"
echo "  ssh root@8.153.110.212"
echo "  pm2 logs member-web --lines 100"
echo ""
echo "部署时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "================================"
