#!/bin/bash
# 在服务器上执行此脚本进行完整重新部署

set -e

echo "=========================================="
echo "  会员系统完整重新部署"
echo "=========================================="
echo ""

DEPLOY_PATH="/www/wwwroot/member-system"

echo "[1/8] 检查部署目录..."
if [ ! -d "$DEPLOY_PATH" ]; then
    echo "❌ 部署目录不存在: $DEPLOY_PATH"
    echo "请确认部署路径是否正确"
    exit 1
fi

cd "$DEPLOY_PATH"
echo "✅ 当前目录: $(pwd)"
echo ""

echo "[2/8] 停止旧进程..."
pm2 stop member-system 2>/dev/null || echo "  (没有运行的进程)"
pm2 delete member-system 2>/dev/null || echo "  (没有已保存的进程)"
echo ""

echo "[3/8] 检查 .env 文件..."
if [ ! -f ".env" ]; then
    echo "❌ .env 文件不存在!"
    echo "请从 .env.example 复制并配置:"
    echo "  cp .env.example .env"
    echo "  nano .env  # 编辑配置"
    exit 1
fi
echo "✅ .env 文件存在"
echo ""

echo "[4/8] 清理旧构建..."
rm -rf .next node_modules package-lock.json
echo "✅ 清理完成"
echo ""

echo "[5/8] 安装依赖..."
npm install
echo ""

echo "[6/8] 构建项目..."
npm run build
echo ""

echo "[7/8] 启动应用..."
pm2 start ecosystem.config.js --env production
pm2 save
echo ""

echo "[8/8] 测试应用..."
sleep 3
if curl -f http://127.0.0.1:3000 >/dev/null 2>&1; then
    echo "✅ 应用正常运行"
else
    echo "⚠️  应用可能未正常启动，请检查日志:"
    echo "   pm2 logs member-system"
fi
echo ""

echo "=========================================="
echo "  ✅ 部署完成!"
echo "=========================================="
echo ""
echo "查看状态: pm2 status"
echo "查看日志: pm2 logs member-system"
echo "重启应用: pm2 restart member-system"
echo ""
echo "访问地址:"
echo "  - http://8.153.110.212"
echo "  - http://yushuofupan.com"
echo ""
