#!/bin/bash

###############################################################################
# Cron定时任务配置脚本
# 用途: 配置自动化数据库备份的定时任务
# 使用: bash scripts/setup-cron.sh
###############################################################################

set -e

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}==================== Cron定时任务配置 ====================${NC}"

# 获取项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_SCRIPT="$PROJECT_ROOT/scripts/auto-backup.sh"

# 确保备份脚本可执行
chmod +x "$BACKUP_SCRIPT"

# 读取环境变量
if [ -f "$PROJECT_ROOT/.env.production" ]; then
    export $(grep -v '^#' "$PROJECT_ROOT/.env.production" | xargs)
elif [ -f "$PROJECT_ROOT/.env" ]; then
    export $(grep -v '^#' "$PROJECT_ROOT/.env" | xargs)
fi

# 创建cron任务包装脚本（包含环境变量）
CRON_WRAPPER="$PROJECT_ROOT/scripts/cron-backup-wrapper.sh"

cat > "$CRON_WRAPPER" <<EOF
#!/bin/bash
# Cron任务包装脚本（自动生成，请勿手动编辑）

# 设置环境变量
export DB_HOST="${DB_HOST:-localhost}"
export DB_PORT="${DB_PORT:-3306}"
export DB_USER="${DB_USER:-root}"
export DB_PASSWORD="${DB_PASSWORD}"
export DB_NAME="${DB_NAME:-member_system}"
export BACKUP_DIR="${BACKUP_DIR:-/root/db_backups}"

# 执行备份脚本
bash "$BACKUP_SCRIPT" >> /var/log/db_backup.log 2>&1
EOF

chmod +x "$CRON_WRAPPER"

echo -e "${GREEN}✓ 创建Cron包装脚本: $CRON_WRAPPER${NC}"

# 创建cron任务
CRON_JOB="0 2 * * * $CRON_WRAPPER"

# 检查cron任务是否已存在
if crontab -l 2>/dev/null | grep -q "$CRON_WRAPPER"; then
    echo -e "${YELLOW}⚠ Cron任务已存在，跳过添加${NC}"
else
    # 添加到crontab
    (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
    echo -e "${GREEN}✓ 添加Cron任务成功${NC}"
fi

# 显示当前cron任务
echo ""
echo -e "${GREEN}当前Cron任务列表:${NC}"
crontab -l

echo ""
echo -e "${GREEN}==================== 配置完成 ====================${NC}"
echo ""
echo "备份计划: 每天凌晨2点自动备份数据库"
echo "备份脚本: $BACKUP_SCRIPT"
echo "日志文件: /var/log/db_backup.log"
echo ""
echo "常用命令:"
echo "  查看cron任务: crontab -l"
echo "  编辑cron任务: crontab -e"
echo "  查看备份日志: tail -f /var/log/db_backup.log"
echo "  手动执行备份: bash $BACKUP_SCRIPT"
echo ""
