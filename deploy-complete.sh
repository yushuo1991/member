#!/bin/bash
set -e

echo "=========================================="
echo "  御朔复盘系统 - 完整部署脚本"
echo "  开始时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "=========================================="

# 进入项目目录
cd /www/wwwroot/member-system

# ============================================
# 清理旧资源
# ============================================
echo ""
echo "[清理] 停止并删除旧容器和进程..."
pm2 delete member-system 2>/dev/null || true
docker stop mysql-member-system 2>/dev/null || true
docker rm mysql-member-system 2>/dev/null || true

echo "✓ 清理完成"

# ============================================
# 第1步：创建MySQL容器
# ============================================
echo ""
echo "[1/7] 创建MySQL容器..."
echo "（如果是首次安装，需要3-5分钟下载MySQL镜像，请耐心等待）"

docker run -d \
  --name mysql-member-system \
  --restart always \
  -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD='ChangeMe2026!Secure' \
  -e MYSQL_DATABASE=member_system \
  -v /www/data/mysql:/var/lib/mysql \
  mysql:8.0 \
  --character-set-server=utf8mb4 \
  --collation-server=utf8mb4_unicode_ci

echo "等待MySQL容器启动（30秒）..."
sleep 30

# 验证MySQL容器
if docker ps | grep -q mysql-member-system; then
  echo "✓ MySQL容器已成功启动"
else
  echo "❌ MySQL容器启动失败"
  docker logs mysql-member-system --tail 50
  exit 1
fi

# ============================================
# 第2步：初始化数据库
# ============================================
echo ""
echo "[2/7] 初始化数据库..."
docker exec -i mysql-member-system mysql -uroot -p'ChangeMe2026!Secure' < scripts/init-database.sql

echo "验证数据库表..."
docker exec mysql-member-system mysql -uroot -p'ChangeMe2026!Secure' -e "USE member_system; SHOW TABLES;"

echo "✓ 数据库初始化完成（7张表）"

# ============================================
# 第3步：配置环境变量
# ============================================
echo ""
echo "[3/7] 配置环境变量..."
if [ ! -f ".env" ]; then
  cp .env.example .env

  # 配置数据库
  sed -i 's/DB_HOST=localhost/DB_HOST=localhost/g' .env
  sed -i 's/DB_PORT=3306/DB_PORT=3306/g' .env
  sed -i 's/DB_USER=root/DB_USER=root/g' .env
  sed -i 's/DB_PASSWORD=your_password_here/DB_PASSWORD=ChangeMe2026!Secure/g' .env
  sed -i 's/DB_NAME=member_system/DB_NAME=member_system/g' .env

  # 生成随机JWT密钥
  JWT_SECRET=$(openssl rand -base64 32)
  sed -i "s/JWT_SECRET=your_jwt_secret_key_here_change_in_production/JWT_SECRET=${JWT_SECRET}/g" .env

  # 配置应用URL
  sed -i 's|NEXT_PUBLIC_APP_URL=.*|NEXT_PUBLIC_APP_URL=http://8.153.110.212:3000|g' .env

  echo "✓ 环境变量已配置"
  echo "  JWT_SECRET已生成: ${JWT_SECRET:0:16}..."
else
  echo "✓ .env文件已存在，跳过配置"
fi

# ============================================
# 第4步：清理并安装依赖
# ============================================
echo ""
echo "[4/7] 清理并安装依赖..."
echo "（预计需要2-3分钟）"

npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# 验证关键依赖
if [ -d "node_modules/next" ]; then
  echo "✓ 依赖安装完成"
else
  echo "❌ 依赖安装失败"
  exit 1
fi

# ============================================
# 第5步：构建Next.js应用
# ============================================
echo ""
echo "[5/7] 构建Next.js应用..."
echo "（预计需要1-2分钟）"

npm run build

# 验证构建文件
if [ -f "node_modules/next/dist/bin/next" ] && [ -d ".next" ]; then
  echo "✓ 应用构建完成"
else
  echo "❌ 应用构建失败"
  exit 1
fi

# ============================================
# 第6步：启动PM2
# ============================================
echo ""
echo "[6/7] 启动PM2..."

pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup systemd -u root --hp /root

# 等待应用启动
sleep 5

# 验证PM2进程
if pm2 list | grep -q "member-system.*online"; then
  echo "✓ PM2进程已启动"
else
  echo "❌ PM2进程启动失败"
  pm2 logs member-system --lines 50
  exit 1
fi

# ============================================
# 第7步：配置自动备份
# ============================================
echo ""
echo "[7/7] 配置数据库自动备份..."

chmod +x scripts/backup-database.sh

CRON_JOB="0 3 * * * /www/wwwroot/member-system/scripts/backup-database.sh >> /var/log/member-backup.log 2>&1"

if ! crontab -l 2>/dev/null | grep -q "backup-database.sh"; then
  (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
  echo "✓ 自动备份已配置（每天凌晨3点）"
else
  echo "✓ 自动备份任务已存在"
fi

# ============================================
# 完成并显示状态
# ============================================
echo ""
echo "=========================================="
echo "  🎉 部署成功！"
echo "=========================================="
echo ""
echo "📍 访问地址:"
echo "   主页:     http://8.153.110.212:3000"
echo "   会员方案: http://8.153.110.212:3000/membership"
echo "   会员中心: http://8.153.110.212:3000/member"
echo "   后台管理: http://8.153.110.212:3000/admin"
echo "   登录页面: http://8.153.110.212:3000/login"
echo ""
echo "🔑 默认管理员账户:"
echo "   邮箱: admin@example.com"
echo "   密码: Admin123456"
echo "   ⚠️  请登录后立即修改密码！"
echo ""
echo "📊 查看应用状态:"
echo "   pm2 status"
echo "   pm2 logs member-system"
echo "   pm2 monit"
echo ""
echo "🗄️  数据库操作:"
echo "   连接: docker exec -it mysql-member-system mysql -uroot -p'ChangeMe2026!Secure'"
echo "   备份: bash scripts/backup-database.sh"
echo ""
echo "🔄 常用命令:"
echo "   重启应用: pm2 restart member-system"
echo "   查看日志: pm2 logs member-system"
echo "   停止应用: pm2 stop member-system"
echo ""
echo "=========================================="
echo "  完成时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "=========================================="
echo ""

# 显示PM2状态
echo "📋 当前PM2进程状态:"
pm2 status

echo ""
echo "📝 应用日志（最后20行）:"
pm2 logs member-system --lines 20 --nostream

echo ""
echo "✅ 部署完成！现在可以访问网站了！"
echo ""
