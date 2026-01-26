#!/bin/bash

#############################################
# Monorepo生产环境部署脚本
# 服务器: 8.153.110.212
# 部署方式: 直接替换原有系统
#############################################

set -e  # 遇到错误立即退出

echo "🚀 开始部署Monorepo到生产环境"
echo "服务器: 8.153.110.212"
echo "时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "================================"

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 服务器信息
SERVER="root@8.153.110.212"
DEPLOY_PATH="/www/wwwroot"
OLD_SYSTEM_PATH="${DEPLOY_PATH}/member-system"
NEW_SYSTEM_PATH="${DEPLOY_PATH}/member-monorepo"
BACKUP_PATH="${DEPLOY_PATH}/backups"

echo ""
echo "📋 部署配置:"
echo "  - 旧系统路径: ${OLD_SYSTEM_PATH}"
echo "  - 新系统路径: ${NEW_SYSTEM_PATH}"
echo "  - 备份路径: ${BACKUP_PATH}"
echo ""

# 第1步: 创建备份
echo "================================"
echo "📦 第1步: 创建完整备份"
echo "================================"

ssh ${SERVER} << 'ENDSSH'
# 创建备份目录
BACKUP_PATH="/www/wwwroot/backups"
mkdir -p ${BACKUP_PATH}

# 备份旧系统
BACKUP_FILE="${BACKUP_PATH}/member-system-backup-$(date +%Y%m%d-%H%M%S).tar.gz"
echo "正在备份旧系统到: ${BACKUP_FILE}"

if [ -d "/www/wwwroot/member-system" ]; then
    cd /www/wwwroot
    tar -czf ${BACKUP_FILE} member-system/
    echo "✅ 旧系统备份完成"
    ls -lh ${BACKUP_FILE}
else
    echo "⚠️  旧系统不存在，跳过备份"
fi

# 备份数据库
DB_BACKUP_FILE="${BACKUP_PATH}/member-system-db-$(date +%Y%m%d-%H%M%S).sql"
echo "正在备份数据库到: ${DB_BACKUP_FILE}"
mysqldump -u root -p'ChangeMe2026!Secure' member_system > ${DB_BACKUP_FILE}
echo "✅ 数据库备份完成"
ls -lh ${DB_BACKUP_FILE}

# 列出所有备份
echo ""
echo "📂 当前所有备份:"
ls -lh ${BACKUP_PATH}/ | tail -10
ENDSSH

echo ""
read -p "✅ 备份完成。按Enter继续..."

# 第2步: 停止旧系统
echo ""
echo "================================"
echo "⏸️  第2步: 停止旧系统服务"
echo "================================"

ssh ${SERVER} << 'ENDSSH'
# 查看当前PM2进程
echo "当前运行的PM2进程:"
pm2 list

# 停止member-system
if pm2 describe member-system > /dev/null 2>&1; then
    echo "正在停止 member-system..."
    pm2 stop member-system
    echo "✅ member-system 已停止"
else
    echo "⚠️  member-system 进程不存在"
fi

# 显示停止后的状态
echo ""
echo "停止后的PM2状态:"
pm2 list
ENDSSH

echo ""
read -p "✅ 旧系统已停止。按Enter继续..."

# 第3步: 上传Monorepo代码
echo ""
echo "================================"
echo "📤 第3步: 上传Monorepo代码"
echo "================================"

# 创建临时目录用于上传
TEMP_DIR="/tmp/monorepo-deploy-$(date +%s)"
mkdir -p ${TEMP_DIR}

echo "准备上传文件..."
echo "本地路径: $(pwd)"

# 使用rsync同步代码（排除不必要的文件）
rsync -avz --progress \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.git' \
  --exclude='*.log' \
  --exclude='.env' \
  --exclude='temp_*' \
  --exclude='test-*.js' \
  ./ ${SERVER}:${TEMP_DIR}/

echo "✅ 代码上传完成"

# 第4步: 部署到服务器
echo ""
echo "================================"
echo "🔧 第4步: 部署新系统"
echo "================================"

ssh ${SERVER} << ENDSSH
set -e

echo "📁 创建部署目录..."
mkdir -p /www/wwwroot/member-monorepo

echo "📋 复制代码..."
cp -r ${TEMP_DIR}/* /www/wwwroot/member-monorepo/

cd /www/wwwroot/member-monorepo

echo "📝 配置环境变量..."
# 为Web应用创建.env
cat > apps/web/.env << 'EOF'
# 生产环境配置
NODE_ENV=production
APP_URL=http://8.153.110.212
PORT=3000

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=ChangeMe2026!Secure
DB_NAME=member_system

# JWT配置
JWT_SECRET=yushuo_member_system_jwt_secret_key_2026
JWT_EXPIRES_IN=7d

# 会话配置
SESSION_SECRET=yushuo_member_system_session_secret_key_2026

# 安全配置
BCRYPT_ROUNDS=10

# 管理员账号
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@yushuo.com
ADMIN_PASSWORD=7287843Wu

# 日志配置
LOG_LEVEL=info
EOF

echo "✅ Web应用环境变量配置完成"

# BK应用环境变量
cat > apps/bk/.env << 'EOF'
NODE_ENV=production
PORT=3001

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=ChangeMe2026!Secure
DB_NAME=stock_tracker
EOF

echo "✅ BK应用环境变量配置完成"

# Fuplan应用环境变量
cat > apps/fuplan/.env << 'EOF'
NODE_ENV=production
PORT=3002

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=ChangeMe2026!Secure
DB_NAME=member_system
EOF

echo "✅ Fuplan应用环境变量配置完成"

# Xinli应用环境变量
cat > apps/xinli/.env << 'EOF'
NODE_ENV=production
PORT=3003

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=ChangeMe2026!Secure
DB_NAME=member_system
EOF

echo "✅ Xinli应用环境变量配置完成"

echo ""
echo "📦 安装依赖..."
pnpm install --prod

echo ""
echo "🏗️  构建所有应用..."
pnpm build

echo ""
echo "✅ 构建完成！"

# 清理临时文件
rm -rf ${TEMP_DIR}
echo "🧹 清理临时文件完成"
ENDSSH

echo ""
read -p "✅ 代码部署完成。按Enter继续..."

# 第5步: 配置PM2
echo ""
echo "================================"
echo "⚙️  第5步: 配置PM2进程管理"
echo "================================"

ssh ${SERVER} << 'ENDSSH'
cd /www/wwwroot/member-monorepo

# 创建PM2配置文件
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'member-web',
      cwd: '/www/wwwroot/member-monorepo/apps/web',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/www/wwwroot/member-monorepo/logs/web-error.log',
      out_file: '/www/wwwroot/member-monorepo/logs/web-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
    },
    {
      name: 'member-bk',
      cwd: '/www/wwwroot/member-monorepo/apps/bk',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3001',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: '/www/wwwroot/member-monorepo/logs/bk-error.log',
      out_file: '/www/wwwroot/member-monorepo/logs/bk-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
    },
    {
      name: 'member-fuplan',
      cwd: '/www/wwwroot/member-monorepo/apps/fuplan',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3002',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      },
      error_file: '/www/wwwroot/member-monorepo/logs/fuplan-error.log',
      out_file: '/www/wwwroot/member-monorepo/logs/fuplan-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
    },
    {
      name: 'member-xinli',
      cwd: '/www/wwwroot/member-monorepo/apps/xinli',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3003',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3003
      },
      error_file: '/www/wwwroot/member-monorepo/logs/xinli-error.log',
      out_file: '/www/wwwroot/member-monorepo/logs/xinli-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
    }
  ]
};
EOF

# 创建日志目录
mkdir -p logs

echo "✅ PM2配置文件创建完成"
ENDSSH

echo ""
read -p "✅ PM2配置完成。按Enter继续..."

# 第6步: 启动服务
echo ""
echo "================================"
echo "🚀 第6步: 启动所有服务"
echo "================================"

ssh ${SERVER} << 'ENDSSH'
cd /www/wwwroot/member-monorepo

echo "启动PM2进程..."
pm2 start ecosystem.config.js

echo ""
echo "等待服务启动..."
sleep 5

echo ""
echo "📊 PM2进程状态:"
pm2 list

echo ""
echo "💾 保存PM2配置:"
pm2 save

echo ""
echo "🔄 设置PM2开机自启:"
pm2 startup | tail -1 | bash || true
ENDSSH

echo ""
echo "✅ 服务启动完成！"

# 第7步: 健康检查
echo ""
echo "================================"
echo "🏥 第7步: 健康检查"
echo "================================"

echo "等待10秒让服务完全启动..."
sleep 10

echo ""
echo "检查各应用访问状态:"

# 检查Web应用
if curl -s -o /dev/null -w "%{http_code}" http://8.153.110.212:3000 | grep -q "200\|301\|302"; then
    echo "✅ Web应用 (3000) - 正常"
else
    echo "⚠️  Web应用 (3000) - 可能未启动"
fi

# 检查BK应用
if curl -s -o /dev/null -w "%{http_code}" http://8.153.110.212:3001 | grep -q "200\|301\|302"; then
    echo "✅ BK应用 (3001) - 正常"
else
    echo "⚠️  BK应用 (3001) - 可能未启动"
fi

# 检查Fuplan应用
if curl -s -o /dev/null -w "%{http_code}" http://8.153.110.212:3002 | grep -q "200\|301\|302"; then
    echo "✅ Fuplan应用 (3002) - 正常"
else
    echo "⚠️  Fuplan应用 (3002) - 可能未启动"
fi

# 检查Xinli应用
if curl -s -o /dev/null -w "%{http_code}" http://8.153.110.212:3003 | grep -q "200\|301\|302"; then
    echo "✅ Xinli应用 (3003) - 正常"
else
    echo "⚠️  Xinli应用 (3003) - 可能未启动"
fi

# 第8步: 部署总结
echo ""
echo "================================"
echo "✅ 部署完成总结"
echo "================================"
echo ""
echo "🎉 Monorepo已成功部署到生产环境！"
echo ""
echo "📊 系统信息:"
echo "  - 部署路径: /www/wwwroot/member-monorepo"
echo "  - 备份位置: /www/wwwroot/backups/"
echo ""
echo "🌐 访问地址:"
echo "  - Web应用:    http://8.153.110.212:3000"
echo "  - BK应用:     http://8.153.110.212:3001"
echo "  - Fuplan应用: http://8.153.110.212:3002"
echo "  - Xinli应用:  http://8.153.110.212:3003"
echo ""
echo "🔧 管理命令:"
echo "  查看状态:   pm2 list"
echo "  查看日志:   pm2 logs"
echo "  重启所有:   pm2 restart all"
echo "  停止所有:   pm2 stop all"
echo ""
echo "📋 后续步骤:"
echo "  1. 访问各应用测试功能"
echo "  2. 检查PM2日志: pm2 logs"
echo "  3. 配置Nginx反向代理（如需要）"
echo "  4. 测试注册/登录功能"
echo ""
echo "🔙 回滚方法（如遇问题）:"
echo "  ssh root@8.153.110.212"
echo "  pm2 stop all"
echo "  cd /www/wwwroot/backups"
echo "  tar -xzf member-system-backup-*.tar.gz -C /www/wwwroot/"
echo "  pm2 start member-system"
echo ""
echo "部署时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "================================"
