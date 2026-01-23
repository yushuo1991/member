#!/bin/bash

################################################################################
# Member System - 数据库自动备份脚本
# 功能：自动备份MySQL数据库，保留7天备份
# 使用方式：
#   1. 直接运行：bash /www/wwwroot/member-system/scripts/backup-database.sh
#   2. 定时任务：crontab -e
#      添加：0 2 * * * /www/wwwroot/member-system/scripts/backup-database.sh
################################################################################

set -e

# ============================================================================
# 配置变量
# ============================================================================
MYSQL_CONTAINER="mysql-member-system"
DATABASE_NAME="member_system"
MYSQL_USER="root"
MYSQL_PASSWORD="ChangeMe2026!Secure"
BACKUP_DIR="/www/backups"
BACKUP_LOG_FILE="/var/log/member-system-backup.log"
RETENTION_DAYS=7
COMPRESS=true
RETENTION_ARCHIVES=14

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================================================
# 日志函数
# ============================================================================
log_info() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[${timestamp}] [INFO] $1" | tee -a "$BACKUP_LOG_FILE"
}

log_success() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "[${timestamp}] ${GREEN}[SUCCESS]${NC} $1" | tee -a "$BACKUP_LOG_FILE"
}

log_warning() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "[${timestamp}] ${YELLOW}[WARNING]${NC} $1" | tee -a "$BACKUP_LOG_FILE"
}

log_error() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "[${timestamp}] ${RED}[ERROR]${NC} $1" | tee -a "$BACKUP_LOG_FILE"
}

# ============================================================================
# 检查环境
# ============================================================================
check_environment() {
    log_info "检查环境..."

    # 检查备份目录
    if [ ! -d "$BACKUP_DIR" ]; then
        log_info "创建备份目录: $BACKUP_DIR"
        mkdir -p "$BACKUP_DIR"
    fi

    # 检查 Docker 是否运行
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装或不在 PATH 中"
        exit 1
    fi

    # 检查 MySQL 容器是否运行
    if ! docker ps --format '{{.Names}}' | grep -q "^${MYSQL_CONTAINER}$"; then
        log_error "MySQL 容器 ($MYSQL_CONTAINER) 未运行"
        exit 1
    fi

    log_success "环境检查完成"
}

# ============================================================================
# 生成备份文件名
# ============================================================================
generate_backup_filename() {
    local timestamp=$(date '+%Y%m%d_%H%M%S')
    local filename="${DATABASE_NAME}_${timestamp}.sql"

    if [ "$COMPRESS" = true ]; then
        filename="${filename}.gz"
    fi

    echo "$filename"
}

# ============================================================================
# 执行数据库备份
# ============================================================================
backup_database() {
    log_info "开始备份数据库..."

    local backup_file=$(generate_backup_filename)
    local backup_path="${BACKUP_DIR}/${backup_file}"
    local start_time=$(date +%s)

    # 获取数据库大小（备份前）
    local db_size=$(docker exec "$MYSQL_CONTAINER" mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" \
        -e "SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) FROM information_schema.tables WHERE table_schema = '$DATABASE_NAME';" \
        -N 2>/dev/null || echo "unknown")

    log_info "数据库大小: ${db_size}MB"
    log_info "备份文件: $backup_file"

    # 执行备份
    if [ "$COMPRESS" = true ]; then
        log_info "执行备份并压缩..."
        docker exec "$MYSQL_CONTAINER" mysqldump \
            -u"$MYSQL_USER" \
            -p"$MYSQL_PASSWORD" \
            --single-transaction \
            --lock-tables=false \
            --quick \
            --hex-blob \
            "$DATABASE_NAME" | gzip > "$backup_path"
    else
        log_info "执行备份..."
        docker exec "$MYSQL_CONTAINER" mysqldump \
            -u"$MYSQL_USER" \
            -p"$MYSQL_PASSWORD" \
            --single-transaction \
            --lock-tables=false \
            --quick \
            "$DATABASE_NAME" > "$backup_path"
    fi

    # 检查备份是否成功
    if [ $? -eq 0 ]; then
        local file_size=$(du -h "$backup_path" | cut -f1)
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))

        log_success "数据库备份成功"
        log_info "备份文件大小: $file_size"
        log_info "备份耗时: ${duration}秒"

        # 验证备份文件
        verify_backup "$backup_path"

        return 0
    else
        log_error "数据库备份失败"
        rm -f "$backup_path"
        return 1
    fi
}

# ============================================================================
# 验证备份文件
# ============================================================================
verify_backup() {
    local backup_file=$1

    log_info "验证备份文件..."

    if [ ! -f "$backup_file" ]; then
        log_error "备份文件不存在: $backup_file"
        return 1
    fi

    local file_size=$(stat -f%z "$backup_file" 2>/dev/null || stat -c%s "$backup_file" 2>/dev/null)

    if [ "$file_size" -eq 0 ]; then
        log_error "备份文件为空"
        return 1
    fi

    # 如果是压缩文件，检查压缩完整性
    if [[ "$backup_file" == *.gz ]]; then
        if ! gzip -t "$backup_file" 2>/dev/null; then
            log_error "压缩文件损坏: $backup_file"
            return 1
        fi
    fi

    log_success "备份文件验证通过"
    return 0
}

# ============================================================================
# 清理过期备份
# ============================================================================
cleanup_old_backups() {
    log_info "清理过期备份..."

    local retention_date=$(date -d "$RETENTION_DAYS days ago" '+%Y%m%d' 2>/dev/null || \
                          date -v-${RETENTION_DAYS}d '+%Y%m%d' 2>/dev/null)

    if [ -z "$retention_date" ]; then
        log_warning "无法计算过期日期，跳过清理"
        return
    fi

    local deleted_count=0

    while IFS= read -r file; do
        if [ -f "$file" ]; then
            local file_date=$(basename "$file" | cut -d'_' -f2 | cut -d'.' -f1)

            # 比较日期（数字比较）
            if [ "$file_date" -lt "$retention_date" ]; then
                log_info "删除过期备份: $(basename $file)"
                rm -f "$file"
                ((deleted_count++))
            fi
        fi
    done < <(find "$BACKUP_DIR" -maxdepth 1 -name "${DATABASE_NAME}_*.sql*" -type f)

    if [ "$deleted_count" -gt 0 ]; then
        log_success "清理过期备份完成，删除 $deleted_count 个文件"
    else
        log_info "没有过期备份需要清理"
    fi
}

# ============================================================================
# 生成备份报告
# ============================================================================
generate_backup_report() {
    log_info "生成备份报告..."

    local report_file="${BACKUP_DIR}/backup-report-$(date '+%Y%m%d').txt"

    {
        echo "============================================================================"
        echo "Member System - 数据库备份报告"
        echo "============================================================================"
        echo "报告生成时间: $(date '+%Y-%m-%d %H:%M:%S')"
        echo ""
        echo "备份统计:"
        echo "  数据库名: $DATABASE_NAME"
        echo "  备份目录: $BACKUP_DIR"
        echo "  保留期限: ${RETENTION_DAYS} 天"
        echo ""
        echo "备份文件列表 (最近10个):"
        echo "---"
        ls -lh "$BACKUP_DIR"/${DATABASE_NAME}_*.sql* 2>/dev/null | tail -10 | awk '{printf "  %-40s %10s %s %s %s\n", $9, $5, $6, $7, $8}'
        echo "---"
        echo ""
        echo "备份目录磁盘使用情况:"
        du -sh "$BACKUP_DIR" 2>/dev/null || echo "  无法获取磁盘使用信息"
        echo ""
        echo "数据库表统计:"
        docker exec "$MYSQL_CONTAINER" mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" \
            -e "SELECT table_name, ROUND((data_length + index_length) / 1024 / 1024, 2) as size_mb FROM information_schema.tables WHERE table_schema = '$DATABASE_NAME' ORDER BY (data_length + index_length) DESC;" \
            2>/dev/null | awk '{printf "  %-40s %10s\n", $1, $2}' || echo "  无法获取表信息"
        echo ""
        echo "============================================================================"
    } > "$report_file"

    log_success "备份报告生成完成: $report_file"
}

# ============================================================================
# 发送备份通知（可选）
# ============================================================================
send_notification() {
    local backup_status=$1
    local message=$2

    log_info "记录备份状态: $backup_status"

    # 这里可以集成邮件、钉钉、企业微信等通知
    # 示例: 发送邮件
    # echo "$message" | mail -s "Member System - 数据库备份报告" admin@example.com

    # 或写入系统日志
    logger -t "member-system-backup" "$backup_status: $message"
}

# ============================================================================
# 创建定时任务（crontab）
# ============================================================================
setup_cron_job() {
    local cron_file="/etc/cron.d/member-system-backup"

    if [ -f "$cron_file" ]; then
        log_warning "定时任务已存在"
        return
    fi

    log_info "创建定时备份任务..."

    cat > "$cron_file" << 'EOF'
# Member System - 数据库自动备份
# 每天凌晨2点执行备份
0 2 * * * root /www/wwwroot/member-system/scripts/backup-database.sh >> /var/log/member-system-backup.log 2>&1

# 每周日凌晨3点生成备份报告
0 3 * * 0 root /www/wwwroot/member-system/scripts/backup-database.sh --report >> /var/log/member-system-backup.log 2>&1
EOF

    chmod 644 "$cron_file"
    log_success "定时任务创建完成"
}

# ============================================================================
# 恢复数据库备份
# ============================================================================
restore_database() {
    local backup_file=$1

    log_info "开始恢复数据库..."

    if [ ! -f "$backup_file" ]; then
        log_error "备份文件不存在: $backup_file"
        return 1
    fi

    log_warning "恢复操作将覆盖现有数据库！"
    read -p "确认恢复？ (yes/no): " confirm

    if [ "$confirm" != "yes" ]; then
        log_info "恢复操作已取消"
        return 0
    fi

    log_info "执行恢复..."

    if [[ "$backup_file" == *.gz ]]; then
        gzip -dc "$backup_file" | docker exec -i "$MYSQL_CONTAINER" mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$DATABASE_NAME"
    else
        docker exec -i "$MYSQL_CONTAINER" mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$DATABASE_NAME" < "$backup_file"
    fi

    if [ $? -eq 0 ]; then
        log_success "数据库恢复成功"
        return 0
    else
        log_error "数据库恢复失败"
        return 1
    fi
}

# ============================================================================
# 显示使用说明
# ============================================================================
show_usage() {
    cat << 'EOF'
使用说明：
  bash backup-database.sh [COMMAND] [OPTIONS]

命令：
  (default)          执行备份
  --list            列出所有备份
  --restore FILE    恢复指定备份
  --report          生成备份报告
  --setup-cron      设置定时备份任务
  --help            显示此帮助信息

示例：
  # 执行备份
  bash backup-database.sh

  # 列出备份文件
  bash backup-database.sh --list

  # 恢复指定备份
  bash backup-database.sh --restore /www/backups/member_system_20240104_150000.sql.gz

  # 生成报告
  bash backup-database.sh --report

  # 设置定时任务
  sudo bash backup-database.sh --setup-cron

EOF
}

# ============================================================================
# 列出备份文件
# ============================================================================
list_backups() {
    log_info "列出所有备份文件..."
    echo ""
    echo "============================================================================"
    echo "备份文件列表"
    echo "============================================================================"

    if [ ! -d "$BACKUP_DIR" ] || [ -z "$(ls -A $BACKUP_DIR)" ]; then
        echo "未找到备份文件"
        return
    fi

    ls -lh "$BACKUP_DIR"/${DATABASE_NAME}_*.sql* 2>/dev/null | awk 'BEGIN {print "时间                    大小        文件名"} {printf "%s %s  %s  %s\n", $6, $7, $8, $9}'

    echo ""
    echo "备份目录: $BACKUP_DIR"
    echo "总大小: $(du -sh $BACKUP_DIR 2>/dev/null | cut -f1)"
    echo "============================================================================"
}

# ============================================================================
# 主函数
# ============================================================================
main() {
    # 创建日志目录
    mkdir -p "$(dirname "$BACKUP_LOG_FILE")"

    log_info "================ 开始执行备份任务 ================"

    # 解析命令行参数
    case "${1:-}" in
        --list)
            list_backups
            ;;
        --restore)
            restore_database "$2"
            ;;
        --report)
            check_environment
            generate_backup_report
            ;;
        --setup-cron)
            setup_cron_job
            ;;
        --help|-h)
            show_usage
            ;;
        *)
            # 执行备份
            check_environment

            if backup_database; then
                cleanup_old_backups
                generate_backup_report
                send_notification "SUCCESS" "数据库备份完成"
                log_info "================ 备份任务完成 ================"
                exit 0
            else
                send_notification "FAILED" "数据库备份失败"
                log_error "================ 备份任务失败 ================"
                exit 1
            fi
            ;;
    esac
}

# 运行主函数
main "$@"
