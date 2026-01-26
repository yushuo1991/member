#!/bin/bash

#################################################
# Monorepo部署完成脚本
# 在服务器上直接执行此脚本
# 使用方法: bash finish-deploy-server.sh
#################################################

set -e

cd /www/wwwroot/member-monorepo

echo "========================================"
echo "🚀 快速完成Monorepo部署"
echo "========================================"
echo "时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# ============================================
# 步骤1: 检查并完成构建
# ============================================
echo "=== 步骤1: 检查构建状态 ==="

check_and_build() {
    app=$1
    echo -n "检查 apps/$app ... "
    if [ -d "apps/$app/.next" ]; then
        echo "✅ 已构建"
    else
        echo "⏳ 开始构建"
        cd apps/$app
        pnpm build
        cd ../..
        echo "✅ 构建完成"
    fi
}

check_and_build "web"
check_and_build "bk"
check_and_build "fuplan"
check_and_build "xinli"

echo ""

# ============================================
# 步骤2: 创建PM2配置
# ============================================
echo "=== 步骤2: 创建PM2配置 ==="

cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'member-web',
      cwd: '/www/wwwroot/member-monorepo/apps/web',
      script: './node_modules/next/dist/bin/next',
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
      script: './node_modules/next/dist/bin/next',
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
      script: './node_modules/next/dist/bin/next',
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
      script: './node_modules/next/dist/bin/next',
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

echo "✅ PM2配置文件创建完成"

# 创建日志目录
mkdir -p logs

echo ""

# ============================================
# 步骤3: 停止旧进程
# ============================================
echo "=== 步骤3: 停止旧进程 ==="

pm2 list
echo ""
echo "停止所有旧进程..."
pm2 delete all 2>/dev/null || echo "没有旧进程需要停止"

echo ""

# ============================================
# 步骤4: 启动新服务
# ============================================
echo "=== 步骤4: 启动所有服务 ==="

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
echo "🔄 设置开机自启:"
pm2 startup systemd -u root --hp /root | tail -1 | bash 2>/dev/null || echo "开机自启可能需要手动配置"

echo ""

# ============================================
# 步骤5: 健康检查
# ============================================
echo "=== 步骤5: 健康检查 ==="

sleep 3

echo "检查端口监听状态:"
netstat -tlnp | grep -E ":(3000|3001|3002|3003)" | grep LISTEN || echo "⚠️  部分端口未监听"

echo ""
echo "检查HTTP访问:"

for port in 3000 3001 3002 3003; do
    response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$port 2>/dev/null || echo "000")
    if [ "$response" != "000" ]; then
        echo "✅ 端口 $port - HTTP $response"
    else
        echo "❌ 端口 $port - 无响应"
    fi
done

echo ""

# ============================================
# 完成
# ============================================
echo "========================================"
echo "✅ Monorepo部署完成！"
echo "========================================"
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
echo "📋 日志位置:"
echo "  /www/wwwroot/member-monorepo/logs/"
echo ""
echo "完成时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================"
