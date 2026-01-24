#!/bin/bash

# 服务器500错误诊断脚本
# 时间: $(date '+%Y-%m-%d %H:%M:%S')

echo "========================================="
echo "服务器500错误紧急诊断报告"
echo "时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================="
echo ""

# 1. PM2状态检查
echo "1. PM2进程状态检查"
echo "-----------------------------------------"
pm2 list
echo ""

# 2. PM2日志检查（最近100行错误日志）
echo "2. PM2错误日志（最近100行）"
echo "-----------------------------------------"
pm2 logs member-system --err --lines 100 --nostream
echo ""

# 3. PM2标准输出日志（最近50行）
echo "3. PM2标准输出日志（最近50行）"
echo "-----------------------------------------"
pm2 logs member-system --out --lines 50 --nostream
echo ""

# 4. 检查.env文件是否存在
echo "4. .env文件检查"
echo "-----------------------------------------"
if [ -f /www/wwwroot/member-system/.env ]; then
    echo "✓ .env文件存在"
    echo "环境变量配置（隐藏敏感信息）："
    cat /www/wwwroot/member-system/.env | sed 's/=.*/=***HIDDEN***/'
else
    echo "✗ .env文件不存在！"
fi
echo ""

# 5. 检查端口占用
echo "5. 端口3000占用情况"
echo "-----------------------------------------"
lsof -i :3000 || echo "端口3000未被占用"
echo ""

# 6. 检查Node.js进程
echo "6. Node.js进程检查"
echo "-----------------------------------------"
ps aux | grep node | grep -v grep
echo ""

# 7. 检查目录结构和关键文件
echo "7. 关键文件检查"
echo "-----------------------------------------"
cd /www/wwwroot/member-system
echo "部署路径: $(pwd)"
echo ""
echo "目录结构:"
ls -la | head -20
echo ""
echo "检查关键文件:"
[ -f server.js ] && echo "✓ server.js 存在" || echo "✗ server.js 不存在"
[ -f .next/standalone/server.js ] && echo "✓ .next/standalone/server.js 存在" || echo "✗ .next/standalone/server.js 不存在"
[ -d .next ] && echo "✓ .next 目录存在" || echo "✗ .next 目录不存在"
[ -d node_modules ] && echo "✓ node_modules 目录存在" || echo "✗ node_modules 目录不存在"
[ -f package.json ] && echo "✓ package.json 存在" || echo "✗ package.json 不存在"
echo ""

# 8. 检查MySQL连接
echo "8. MySQL数据库连接测试"
echo "-----------------------------------------"
if command -v mysql &> /dev/null; then
    # 尝试从.env读取数据库配置
    if [ -f .env ]; then
        DB_HOST=$(grep "^DB_HOST=" .env | cut -d'=' -f2)
        DB_USER=$(grep "^DB_USER=" .env | cut -d'=' -f2)
        DB_PASSWORD=$(grep "^DB_PASSWORD=" .env | cut -d'=' -f2)
        DB_NAME=$(grep "^DB_NAME=" .env | cut -d'=' -f2)

        echo "测试MySQL连接..."
        mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1 as connection_test; SHOW DATABASES;" 2>&1

        if [ $? -eq 0 ]; then
            echo "✓ MySQL连接成功"
            echo ""
            echo "检查member_system数据库表:"
            mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "SHOW TABLES;" 2>&1
        else
            echo "✗ MySQL连接失败"
        fi
    else
        echo "无法读取.env配置文件"
    fi
else
    echo "MySQL客户端未安装"
fi
echo ""

# 9. 检查Nginx状态和配置
echo "9. Nginx状态检查"
echo "-----------------------------------------"
systemctl status nginx --no-pager | head -20
echo ""
echo "Nginx错误日志（最近20行）:"
tail -20 /var/log/nginx/error.log 2>/dev/null || echo "无法访问Nginx错误日志"
echo ""

# 10. 检查磁盘空间
echo "10. 磁盘空间检查"
echo "-----------------------------------------"
df -h | grep -E "Filesystem|/dev/"
echo ""

# 11. 检查内存使用
echo "11. 内存使用检查"
echo "-----------------------------------------"
free -h
echo ""

# 12. 测试本地API端点
echo "12. API端点测试（本地curl）"
echo "-----------------------------------------"
echo "测试 http://localhost:3000/api/health (如果存在):"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:3000/api/health 2>&1 || echo "无法连接"
echo ""
echo "测试 http://localhost:3000/ (首页):"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:3000/ 2>&1 || echo "无法连接"
echo ""
echo "测试 http://localhost:3000/api/auth/me:"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:3000/api/auth/me 2>&1 || echo "无法连接"
echo ""

# 13. 检查最近的系统日志
echo "13. 系统日志（最近20行与node相关）"
echo "-----------------------------------------"
journalctl -u nginx --no-pager -n 20 2>/dev/null || echo "无法访问系统日志"
echo ""

# 14. 检查ecosystem.config.js
echo "14. PM2配置文件检查"
echo "-----------------------------------------"
if [ -f /www/wwwroot/member-system/ecosystem.config.js ]; then
    echo "✓ ecosystem.config.js 存在"
    cat /www/wwwroot/member-system/ecosystem.config.js
else
    echo "✗ ecosystem.config.js 不存在"
fi
echo ""

# 15. 尝试捕获实时错误
echo "15. 尝试重启服务并捕获启动错误"
echo "-----------------------------------------"
cd /www/wwwroot/member-system
echo "当前目录: $(pwd)"
echo "执行: pm2 restart member-system"
pm2 restart member-system
sleep 3
echo "等待3秒后检查日志..."
pm2 logs member-system --lines 30 --nostream
echo ""

echo "========================================="
echo "诊断报告完成"
echo "时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================="
