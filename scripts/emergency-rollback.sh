#!/bin/bash
# emergency-rollback.sh
# 紧急回滚脚本 - 从apps/web回滚到member-system
# 使用方法: bash emergency-rollback.sh

set -e

echo "🚨 ===== 紧急回滚到member-system ====="
echo ""
echo "⚠️  警告: 此脚本将停止apps/web并启动member-system"
echo "请确认你需要执行回滚操作"
echo ""
read -p "是否继续? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ 回滚已取消"
    exit 0
fi

echo ""
echo "开始回滚..."
echo ""

# 记录回滚时间
ROLLBACK_TIME=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="/backup/rollback-$ROLLBACK_TIME"

# 1. 创建备份目录
echo "📁 创建备份目录: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

# 2. 备份当前状态
echo "💾 备份当前状态..."

# 备份PM2进程列表
pm2 list > "$BACKUP_DIR/pm2-list.txt" 2>&1 || true

# 备份apps/web日志
if pm2 describe member-web-test > /dev/null 2>&1; then
    echo "  - 备份apps/web日志..."
    pm2 logs member-web-test --lines 1000 --nostream > "$BACKUP_DIR/apps-web.log" 2>&1 || true
fi

# 3. 停止apps/web进程
echo ""
echo "⏹️  停止apps/web进程..."
if pm2 describe member-web-test > /dev/null 2>&1; then
    pm2 stop member-web-test || true
    pm2 delete member-web-test || true
    echo "  ✅ apps/web已停止"
else
    echo "  ℹ️  apps/web进程不存在，跳过"
fi

# 4. 启动member-system进程
echo ""
echo "▶️  启动member-system进程..."

if pm2 describe member-system > /dev/null 2>&1; then
    echo "  - 重启现有进程..."
    pm2 restart member-system
else
    echo "  - 启动新进程..."
    if [ -f "/www/wwwroot/member-system/ecosystem.config.js" ]; then
        cd /www/wwwroot/member-system
        pm2 start ecosystem.config.js --env production
    else
        echo "  ❌ 未找到ecosystem.config.js"
        exit 1
    fi
fi

# 5. 等待启动
echo ""
echo "⏳ 等待应用启动..."
sleep 5

# 6. 验证member-system运行正常
echo ""
echo "✅ 验证应用状态..."
if curl -s -I http://localhost:3000 > /dev/null 2>&1; then
    echo "  ✅ member-system响应正常（端口3000）"
else
    echo "  ⚠️  应用可能未正常启动，请手动检查"
fi

# 7. 显示PM2状态
echo ""
echo "📊 当前PM2进程状态："
pm2 list

# 8. 保存PM2配置
pm2 save

echo ""
echo "✅ ===== 回滚完成 ====="
echo ""
echo "📌 下一步操作："
echo "   1. 手动切换Nginx配置到端口3000"
echo "      编辑: /etc/nginx/sites-available/member-system"
echo "      修改: proxy_pass http://localhost:3000;"
echo "      执行: nginx -t && systemctl reload nginx"
echo ""
echo "   2. 验证网站访问"
echo "      curl http://localhost:3000"
echo "      curl http://yourdomain.com"
echo ""
echo "   3. 查看日志"
echo "      pm2 logs member-system"
echo ""
echo "📁 备份文件保存在: $BACKUP_DIR"
echo ""
