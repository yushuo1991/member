#!/bin/bash

################################################################################
# Member System - 服务器环境一键安装脚本
# 适用于：Ubuntu 20.04+ / Debian 11+
# 功能：自动安装和配置服务器环境
################################################################################

set -e

# ============================================================================
# 配置变量
# ============================================================================
MYSQL_PASSWORD="ChangeMe2026!Secure"
MYSQL_CONTAINER="mysql-member-system"
DATABASE_NAME="member_system"
PROJECT_PATH="/www/wwwroot/member-system"
PROJECT_USER="www-data"
BACKUP_PATH="/www/backups"

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
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# ============================================================================
# 检查系统要求
# ============================================================================
check_system_requirements() {
    log_info "检查系统要求..."

    # 检查是否为 root 用户
    if [ "$EUID" -ne 0 ]; then
        log_error "此脚本必须使用 root 用户运行"
        exit 1
    fi

    # 检查操作系统
    if [ ! -f /etc/os-release ]; then
        log_error "无法识别操作系统"
        exit 1
    fi

    . /etc/os-release
    if [[ "$ID" != "ubuntu" && "$ID" != "debian" ]]; then
        log_warning "此脚本针对 Ubuntu/Debian 系统优化，其他系统可能不兼容"
    fi

    log_success "系统检查通过"
}

# ============================================================================
# 更新系统
# ============================================================================
update_system() {
    log_info "更新系统包..."

    apt-get update
    apt-get upgrade -y
    apt-get install -y curl wget git gnupg lsb-release ca-certificates apt-transport-https software-properties-common

    log_success "系统更新完成"
}

# ============================================================================
# 安装 Docker
# ============================================================================
install_docker() {
    log_info "检查 Docker 安装状态..."

    if command -v docker &> /dev/null; then
        log_warning "Docker 已安装，版本: $(docker --version)"
        return
    fi

    log_info "安装 Docker..."

    # 添加 Docker 官方 GPG key
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

    # 添加 Docker 仓库
    echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | \
        tee /etc/apt/sources.list.d/docker.list > /dev/null

    # 安装 Docker
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

    # 启动 Docker 服务
    systemctl start docker
    systemctl enable docker

    log_success "Docker 安装完成，版本: $(docker --version)"
}

# ============================================================================
# 安装 Docker Compose
# ============================================================================
install_docker_compose() {
    log_info "检查 Docker Compose 安装状态..."

    if command -v docker-compose &> /dev/null; then
        log_warning "Docker Compose 已安装，版本: $(docker-compose --version)"
        return
    fi

    log_info "安装 Docker Compose..."

    # 获取最新版本号
    DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d'"' -f4)

    # 下载 Docker Compose
    curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

    # 设置执行权限
    chmod +x /usr/local/bin/docker-compose

    log_success "Docker Compose 安装完成，版本: $(docker-compose --version)"
}

# ============================================================================
# 安装 Node.js 18+
# ============================================================================
install_nodejs() {
    log_info "检查 Node.js 安装状态..."

    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v)
        log_warning "Node.js 已安装，版本: $NODE_VERSION"
        return
    fi

    log_info "安装 Node.js 18+..."

    # 添加 NodeSource 仓库
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -

    # 安装 Node.js 和 npm
    apt-get install -y nodejs

    # 更新 npm
    npm install -g npm@latest

    log_success "Node.js 安装完成，版本: $(node -v)"
    log_success "npm 版本: $(npm -v)"
}

# ============================================================================
# 安装 PM2
# ============================================================================
install_pm2() {
    log_info "检查 PM2 安装状态..."

    if command -v pm2 &> /dev/null; then
        log_warning "PM2 已安装，版本: $(pm2 -v)"
        return
    fi

    log_info "安装 PM2..."

    npm install -g pm2

    # 启用 PM2 开机自启
    pm2 startup systemd -u root --hp /root

    log_success "PM2 安装完成，版本: $(pm2 -v)"
}

# ============================================================================
# 安装 Nginx
# ============================================================================
install_nginx() {
    log_info "检查 Nginx 安装状态..."

    if command -v nginx &> /dev/null; then
        log_warning "Nginx 已安装，版本: $(nginx -v 2>&1)"
        return
    fi

    log_info "安装 Nginx..."

    apt-get install -y nginx

    # 启动 Nginx 服务
    systemctl start nginx
    systemctl enable nginx

    log_success "Nginx 安装完成"
}

# ============================================================================
# 配置防火墙
# ============================================================================
configure_firewall() {
    log_info "配置防火墙..."

    # 检查 ufw 是否已安装
    if ! command -v ufw &> /dev/null; then
        log_info "安装 UFW..."
        apt-get install -y ufw
    fi

    # 启用防火墙
    ufw --force enable

    # 设置默认规则
    ufw default deny incoming
    ufw default allow outgoing

    # 允许 SSH
    ufw allow 22/tcp

    # 允许 HTTP 和 HTTPS
    ufw allow 80/tcp
    ufw allow 443/tcp

    # 允许 Node.js 应用端口
    ufw allow 3000/tcp
    ufw allow 3001/tcp

    # 允许 MySQL（仅本地）
    ufw allow from 127.0.0.1 to 127.0.0.1 port 3306/tcp

    log_success "防火墙配置完成"
    ufw status
}

# ============================================================================
# 创建项目目录结构
# ============================================================================
create_project_structure() {
    log_info "创建项目目录结构..."

    # 创建主项目目录
    mkdir -p "$PROJECT_PATH"

    # 创建子目录
    mkdir -p "$PROJECT_PATH/backend"
    mkdir -p "$PROJECT_PATH/frontend"
    mkdir -p "$PROJECT_PATH/config"
    mkdir -p "$PROJECT_PATH/logs"
    mkdir -p "$PROJECT_PATH/scripts"

    # 创建备份目录
    mkdir -p "$BACKUP_PATH"

    # 设置权限
    chown -R "$PROJECT_USER:$PROJECT_USER" "$PROJECT_PATH"
    chmod -R 755 "$PROJECT_PATH"

    chown -R "$PROJECT_USER:$PROJECT_USER" "$BACKUP_PATH"
    chmod -R 755 "$BACKUP_PATH"

    log_success "项目目录结构创建完成"
}

# ============================================================================
# 启动 MySQL Docker 容器
# ============================================================================
start_mysql_container() {
    log_info "启动 MySQL Docker 容器..."

    # 检查容器是否已存在
    if docker ps -a --format '{{.Names}}' | grep -q "^${MYSQL_CONTAINER}$"; then
        log_warning "MySQL 容器已存在，重新启动..."
        docker restart "$MYSQL_CONTAINER"
    else
        log_info "创建 MySQL 容器..."

        docker run -d \
            --name "$MYSQL_CONTAINER" \
            --restart unless-stopped \
            -p 3306:3306 \
            -e MYSQL_ROOT_PASSWORD="$MYSQL_PASSWORD" \
            -e MYSQL_DATABASE="$DATABASE_NAME" \
            -v mysql-data:/var/lib/mysql \
            -v "$PROJECT_PATH/scripts/init-database.sql:/docker-entrypoint-initdb.d/init.sql" \
            mysql:8.0 \
            --character-set-server=utf8mb4 \
            --collation-server=utf8mb4_unicode_ci

        # 等待 MySQL 完全启动
        sleep 10

        log_info "验证 MySQL 连接..."
        for i in {1..30}; do
            if docker exec "$MYSQL_CONTAINER" mysql -uroot -p"$MYSQL_PASSWORD" -e "SELECT 1" > /dev/null 2>&1; then
                log_success "MySQL 容器启动成功"
                return
            fi
            log_info "等待 MySQL 启动... ($i/30)"
            sleep 2
        done

        log_error "MySQL 启动失败"
        docker logs "$MYSQL_CONTAINER"
        exit 1
    fi
}

# ============================================================================
# 创建环境配置文件示例
# ============================================================================
create_env_example() {
    log_info "创建环境配置文件示例..."

    cat > "$PROJECT_PATH/.env.example" << 'EOF'
# ============================================================================
# Member System - 环境配置示例
# ============================================================================

# 服务器配置
NODE_ENV=production
SERVER_PORT=3000
SERVER_HOST=0.0.0.0

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=member_system
DB_USER=root
DB_PASSWORD=ChangeMe2026!Secure

# JWT 配置
JWT_SECRET=your-secret-key-change-this
JWT_EXPIRY=24h

# Redis 配置（可选）
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# 邮件配置（可选）
MAIL_HOST=
MAIL_PORT=587
MAIL_USER=
MAIL_PASSWORD=

# 日志配置
LOG_LEVEL=info
LOG_DIR=/www/wwwroot/member-system/logs

# API 配置
API_PREFIX=/api
API_VERSION=v1

# CORS 配置
CORS_ORIGIN=*
EOF

    chown "$PROJECT_USER:$PROJECT_USER" "$PROJECT_PATH/.env.example"
    chmod 644 "$PROJECT_PATH/.env.example"

    log_success "环境配置示例创建完成"
}

# ============================================================================
# 显示安装摘要
# ============================================================================
show_installation_summary() {
    log_info "显示安装摘要..."

    echo ""
    echo "============================================================================"
    echo "Member System - 安装完成"
    echo "============================================================================"
    echo ""
    echo "系统信息:"
    echo "  OS: $(lsb_release -ds)"
    echo ""
    echo "已安装的组件:"
    echo "  Docker 版本:        $(docker --version)"
    echo "  Docker Compose 版本: $(docker-compose --version)"
    echo "  Node.js 版本:        $(node -v)"
    echo "  npm 版本:           $(npm -v)"
    echo "  PM2 版本:           $(pm2 -v)"
    echo "  Nginx 版本:         $(nginx -v 2>&1)"
    echo ""
    echo "配置信息:"
    echo "  MySQL 容器:         $MYSQL_CONTAINER"
    echo "  数据库名:           $DATABASE_NAME"
    echo "  项目路径:           $PROJECT_PATH"
    echo "  备份路径:           $BACKUP_PATH"
    echo "  MySQL 密码:         [已设置]"
    echo ""
    echo "后续步骤:"
    echo "  1. 复制 .env.example 为 .env 并修改配置:"
    echo "     cp $PROJECT_PATH/.env.example $PROJECT_PATH/.env"
    echo ""
    echo "  2. 验证 MySQL 数据库:"
    echo "     docker exec -it $MYSQL_CONTAINER mysql -uroot -p$MYSQL_PASSWORD -e \"SELECT * FROM $DATABASE_NAME.products;\""
    echo ""
    echo "  3. 部署后端应用:"
    echo "     cd $PROJECT_PATH/backend"
    echo "     npm install"
    echo "     npm run build"
    echo "     pm2 start dist/index.js --name 'member-system-api'"
    echo ""
    echo "  4. 配置 Nginx 反向代理:"
    echo "     编辑 /etc/nginx/sites-available/default"
    echo "     重载 Nginx: systemctl reload nginx"
    echo ""
    echo "  5. 设置定时备份任务:"
    echo "     crontab -e"
    echo "     添加: 0 2 * * * $PROJECT_PATH/scripts/backup-database.sh"
    echo ""
    echo "容器管理命令:"
    echo "  查看容器状态:  docker ps -a"
    echo "  查看容器日志:  docker logs $MYSQL_CONTAINER"
    echo "  进入容器:     docker exec -it $MYSQL_CONTAINER /bin/bash"
    echo ""
    echo "============================================================================"
    echo ""
}

# ============================================================================
# 主函数
# ============================================================================
main() {
    echo ""
    echo "============================================================================"
    echo "Member System - 服务器环境安装向导"
    echo "============================================================================"
    echo ""

    check_system_requirements
    update_system
    install_docker
    install_docker_compose
    install_nodejs
    install_pm2
    install_nginx
    configure_firewall
    create_project_structure
    start_mysql_container
    create_env_example
    show_installation_summary

    log_success "服务器环境安装完成！"
}

# 运行主函数
main "$@"
