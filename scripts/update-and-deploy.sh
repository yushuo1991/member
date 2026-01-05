#!/bin/bash
set -e

echo "========================================"
echo "  御朔复盘会员系统 - 完整更新部署"
echo "  开始时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================"
echo ""

# 进入项目目录
cd /www/wwwroot/member-system

echo "[1/8] 拉取最新代码..."
git fetch origin main
git reset --hard origin/main

echo ""
echo "[2/8] 备份现有数据库..."
BACKUP_FILE="/www/backups/member-system-backup-$(date +%Y%m%d_%H%M%S).sql"
mkdir -p /www/backups
mysqldump -uroot -p'ChangeMe2026!Secure' member_system > "$BACKUP_FILE" 2>/dev/null || echo "  (数据库可能不存在，跳过备份)"
if [ -f "$BACKUP_FILE" ]; then
  echo "  ✓ 备份已保存：$BACKUP_FILE"
else
  echo "  ⚠ 未找到现有数据库，将创建新数据库"
fi

echo ""
echo "[3/8] 重新初始化数据库（新结构）..."
mysql -uroot -p'ChangeMe2026!Secure' < scripts/init-database-v2.sql

echo ""
echo "[4/8] 验证数据库表结构..."
mysql -uroot -p'ChangeMe2026!Secure' -e "USE member_system; SHOW TABLES;"

echo ""
echo "[5/8] 安装/更新依赖..."
npm install --production

echo ""
echo "[6/8] 构建应用..."
npm run build

echo ""
echo "[7/8] 重启应用..."
pm2 delete member-system 2>/dev/null || true
pm2 start ecosystem.config.js --env production
pm2 save

echo ""
echo "[8/8] 等待应用启动..."
sleep 5

# 验证应用状态
if pm2 list | grep -q "member-system.*online"; then
  echo ""
  echo "========================================"
  echo "  ✅ 部署成功！"
  echo "========================================"
  echo ""
  echo "访问地址："
  echo "  - 主页: http://8.153.110.212"
  echo "  - 会员方案: http://8.153.110.212/membership"
  echo "  - 会员中心: http://8.153.110.212/member"
  echo "  - 后台管理: http://8.153.110.212/admin"
  echo ""
  echo "默认账号："
  echo "  管理员: admin@example.com / Admin123456"
  echo "  测试用户: zhangsan@example.com / Test123456 (月度会员)"
  echo ""
  echo "测试激活码（在数据库中查看）:"
  mysql -uroot -p'ChangeMe2026!Secure' -e "USE member_system; SELECT code, level, duration_days FROM activation_codes WHERE used = 0 LIMIT 5;"
  echo ""
  echo "应用状态："
  pm2 status
  echo ""
  echo "最近日志："
  pm2 logs member-system --lines 10 --nostream
  echo ""
else
  echo ""
  echo "========================================"
  echo "  ❌ 应用启动失败"
  echo "========================================"
  echo ""
  echo "请查看日志："
  pm2 logs member-system --lines 50
  exit 1
fi

echo "完成时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""
