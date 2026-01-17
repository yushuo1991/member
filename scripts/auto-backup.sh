#!/bin/bash

###############################################################################
# 自动化数据库备份脚本
# 用途: 定期备份MySQL数据库，保留最近7天的备份
# 使用: bash scripts/auto-backup.sh
###############################################################################

set -e  # 遇到错误立即退出

# 配置
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-3306}"
DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_PASSWORD}"
DB_NAME="${DB_NAME:-member_system}"
BACKUP_DIR="${BACKUP_DIR:-/root/db_backups}"
RETENTION_DAYS=7  # 保留天数

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# 检查环境
check_environment() {
    log_info "检查备份环境..."

    # 检查mysqldump命令
    if ! command -v mysqldump &> /dev/null; then
        log_error "mysqldump命令不存在，请安装MySQL客户端"
        exit 1
    fi

    # 检查数据库密码
    if [ -z "$DB_PASSWORD" ]; then
        log_error "DB_PASSWORD环境变量未设置"
        exit 1
    fi

    # 创建备份目录
    if [ ! -d "$BACKUP_DIR" ]; then
        log_info "创建备份目录: $BACKUP_DIR"
        mkdir -p "$BACKUP_DIR"
    fi

    log_info "环境检查通过"
}

# 执行备份
perform_backup() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$BACKUP_DIR/${DB_NAME}_${timestamp}.sql"
    local backup_file_gz="${backup_file}.gz"

    log_info "开始备份数据库: $DB_NAME"

    # 执行mysqldump
    if mysqldump \
        --host="$DB_HOST" \
        --port="$DB_PORT" \
        --user="$DB_USER" \
        --password="$DB_PASSWORD" \
        --single-transaction \
        --routines \
        --triggers \
        --events \
        --set-gtid-purged=OFF \
        "$DB_NAME" > "$backup_file" 2>&1; then

        # 压缩备份文件
        log_info "压缩备份文件..."
        gzip "$backup_file"

        # 获取文件大小
        local file_size=$(du -h "$backup_file_gz" | cut -f1)

        log_info "备份成功: $backup_file_gz (大小: $file_size)"
        echo "$backup_file_gz"
        return 0
    else
        log_error "备份失败"
        rm -f "$backup_file"
        return 1
    fi
}

# 清理旧备份
cleanup_old_backups() {
    log_info "清理${RETENTION_DAYS}天前的旧备份..."

    local deleted_count=0

    # 查找并删除旧备份文件
    while IFS= read -r file; do
        if [ -f "$file" ]; then
            log_info "删除旧备份: $(basename "$file")"
            rm -f "$file"
            ((deleted_count++))
        fi
    done < <(find "$BACKUP_DIR" -name "${DB_NAME}_*.sql.gz" -mtime +$RETENTION_DAYS)

    if [ $deleted_count -eq 0 ]; then
        log_info "没有需要清理的旧备份"
    else
        log_info "已清理 $deleted_count 个旧备份文件"
    fi
}

# 验证备份
verify_backup() {
    local backup_file=$1

    log_info "验证备份文件..."

    # 检查文件是否存在
    if [ ! -f "$backup_file" ]; then
        log_error "备份文件不存在: $backup_file"
        return 1
    fi

    # 检查文件大小（至少1KB）
    local file_size=$(stat -f%z "$backup_file" 2>/dev/null || stat -c%s "$backup_file" 2>/dev/null)
    if [ "$file_size" -lt 1024 ]; then
        log_error "备份文件过小，可能损坏: $file_size bytes"
        return 1
    fi

    # 检查gzip文件完整性
    if ! gzip -t "$backup_file" 2>/dev/null; then
        log_error "备份文件损坏，gzip验证失败"
        return 1
    fi

    log_info "备份文件验证通过"
    return 0
}

# 主函数
main() {
    log_info "==================== 数据库备份开始 ===================="

    # 检查环境
    check_environment

    # 执行备份
    backup_file=$(perform_backup)
    if [ $? -ne 0 ]; then
        log_error "备份失败，退出"
        exit 1
    fi

    # 验证备份
    if ! verify_backup "$backup_file"; then
        log_error "备份验证失败"
        exit 1
    fi

    # 清理旧备份
    cleanup_old_backups

    log_info "==================== 数据库备份完成 ===================="
    log_info "备份文件: $backup_file"

    # 显示备份列表
    log_info "当前所有备份:"
    ls -lh "$BACKUP_DIR"/${DB_NAME}_*.sql.gz 2>/dev/null || log_warn "没有找到备份文件"
}

# 执行主函数
main
