#!/bin/bash

echo "=== 服务器内存和缓存清理脚本 ==="
echo ""

echo "📊 清理前的状态："
free -h
df -h /

echo ""
echo "🧹 开始清理..."

# 1. 清理PM2日志
echo ""
echo "1️⃣ 清理PM2日志..."
pm2 flush
rm -rf /root/.pm2/logs/*.log
echo "✅ PM2日志已清理"

# 2. 清理npm缓存
echo ""
echo "2️⃣ 清理npm缓存..."
npm cache clean --force
echo "✅ npm缓存已清理"

# 3. 清理pnpm缓存
echo ""
echo "3️⃣ 清理pnpm缓存..."
pnpm store prune
echo "✅ pnpm缓存已清理"

# 4. 清理系统缓存
echo ""
echo "4️⃣ 清理系统缓存..."
sync
echo 3 > /proc/sys/vm/drop_caches
echo "✅ 系统缓存已清理"

# 5. 清理APT缓存
echo ""
echo "5️⃣ 清理APT缓存..."
apt-get clean
apt-get autoclean
echo "✅ APT缓存已清理"

# 6. 清理临时文件
echo ""
echo "6️⃣ 清理临时文件..."
rm -rf /tmp/*
echo "✅ 临时文件已清理"

# 7. 清理旧的构建文件
echo ""
echo "7️⃣ 清理旧的构建缓存..."
rm -rf /www/wwwroot/member-system/.next/cache
rm -rf /www/wwwroot/member-monorepo/apps/web/.next/cache
echo "✅ 构建缓存已清理"

# 8. 清理系统日志
echo ""
echo "8️⃣ 清理旧的系统日志..."
journalctl --vacuum-time=7d
find /var/log -type f -name "*.log" -mtime +7 -delete
find /var/log -type f -name "*.gz" -delete
echo "✅ 系统日志已清理"

echo ""
echo "📊 清理后的状态："
free -h
df -h /

echo ""
echo "✅ 清理完成！"
