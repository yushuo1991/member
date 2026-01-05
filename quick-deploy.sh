#!/bin/bash

################################################################################
# 会员系统 - 超级快速部署脚本
# 使用方法：
#   1. SSH登录服务器：ssh root@8.153.110.212
#   2. 复制并执行此脚本：curl -fsSL https://raw.githubusercontent.com/yushuo1991/member/main/quick-deploy.sh | bash
################################################################################

set -e

echo "=========================================="
echo "  会员系统 - 一键部署"
echo "  开始时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "=========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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
# 第一步：克隆项目
# ============================================================================
log_info "第1步：克隆项目到服务器..."

cd /www/wwwroot || mkdir -p /www/wwwroot && cd /www/wwwroot

if [ -d "member-system" ]; then
    log_warning "项目目录已存在，拉取最新代码..."
    cd member-system
    git pull origin main
else
    log_info "克隆GitHub仓库..."
    git clone https://github.com/yushuo1991/member.git member-system
    cd member-system
fi

log_success "项目代码准备完成"
echo ""

# ============================================================================
# 第二步：安装服务器环境
# ============================================================================
log_info "第2步：安装服务器环境（Docker、Node.js、PM2、Nginx、MySQL）..."
log_warning "这可能需要10-15分钟，请耐心等待..."
echo ""

chmod +x scripts/server-setup.sh
./scripts/server-setup.sh

log_success "服务器环境安装完成"
echo ""

# ============================================================================
# 第三步：初始化数据库
# ============================================================================
log_info "第3步：初始化数据库..."

# 等待MySQL容器完全启动
sleep 5

# 导入数据库Schema
docker exec -i mysql-member-system mysql -uroot -pChangeMe2026!Secure < scripts/init-database.sql

# 验证数据库
log_info "验证数据库表结构..."
docker exec -it mysql-member-system mysql -uroot -pChangeMe2026!Secure -e "USE member_system; SHOW TABLES;"

log_success "数据库初始化完成"
echo ""

# ============================================================================
# 第四步：安装Node.js依赖
# ============================================================================
log_info "第4步：安装Node.js依赖..."

npm install

log_success "依赖安装完成"
echo ""

# ============================================================================
# 第五步：配置环境变量
# ============================================================================
log_info "第5步：配置环境变量..."

if [ ! -f ".env" ]; then
    cp .env.example .env

    # 自动配置基本环境变量
    sed -i 's/DB_HOST=localhost/DB_HOST=localhost/g' .env
    sed -i 's/DB_PORT=3306/DB_PORT=3306/g' .env
    sed -i 's/DB_USER=root/DB_USER=root/g' .env
    sed -i 's/DB_PASSWORD=your_password_here/DB_PASSWORD=ChangeMe2026!Secure/g' .env
    sed -i 's/DB_NAME=member_system/DB_NAME=member_system/g' .env

    # 生成随机JWT密钥
    JWT_SECRET=$(openssl rand -base64 32)
    sed -i "s/JWT_SECRET=your_jwt_secret_key_here_change_in_production/JWT_SECRET=${JWT_SECRET}/g" .env

    log_success "环境变量配置完成"
else
    log_warning ".env 文件已存在，跳过配置"
fi

echo ""

# ============================================================================
# 第六步：构建应用
# ============================================================================
log_info "第6步：构建Next.js应用..."

npm run build

log_success "应用构建完成"
echo ""

# ============================================================================
# 第七步：启动PM2
# ============================================================================
log_info "第7步：使用PM2启动应用..."

# 停止旧进程（如果存在）
pm2 delete member-system 2>/dev/null || true

# 启动新进程
pm2 start ecosystem.config.js --env production

# 保存配置
pm2 save

# 设置开机自启
pm2 startup systemd -u root --hp /root

log_success "应用启动完成"
echo ""

# ============================================================================
# 第八步：配置自动备份
# ============================================================================
log_info "第8步：配置数据库自动备份..."

# 设置备份脚本权限
chmod +x scripts/backup-database.sh

# 添加定时任务（每天凌晨3点）
CRON_JOB="0 3 * * * /www/wwwroot/member-system/scripts/backup-database.sh >> /var/log/member-backup.log 2>&1"

# 检查是否已存在
if ! crontab -l 2>/dev/null | grep -q "backup-database.sh"; then
    (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
    log_success "自动备份任务已添加"
else
    log_warning "自动备份任务已存在，跳过"
fi

echo ""

# ============================================================================
# 部署完成
# ============================================================================
echo ""
echo "=========================================="
echo "  🎉 部署成功！"
echo "=========================================="
echo ""
echo "访问地址:"
echo "  主页:     http://8.153.110.212:3000"
echo "  会员中心: http://8.153.110.212:3000/member"
echo "  后台管理: http://8.153.110.212:3000/admin"
echo "  登录页面: http://8.153.110.212:3000/login"
echo ""
echo "默认管理员账户:"
echo "  邮箱: admin@example.com"
echo "  密码: Admin123456"
echo "  ⚠️  请登录后立即修改密码！"
echo ""
echo "查看应用状态:"
echo "  pm2 status"
echo "  pm2 logs member-system"
echo ""
echo "查看数据库:"
echo "  docker exec -it mysql-member-system mysql -uroot -pChangeMe2026!Secure"
echo ""
echo "=========================================="
echo "  完成时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "=========================================="
echo ""

# 显示PM2状态
pm2 status

# 显示最后的日志
pm2 logs member-system --lines 10 --nostream
