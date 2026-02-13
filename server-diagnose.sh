#!/bin/bash
# 服务器诊断脚本 - 用于排查502错误
# 使用方法: bash server-diagnose.sh

echo "=========================================="
echo "宇硕会员体系 - 服务器诊断报告"
echo "时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "=========================================="

echo -e "\n[1/8] PM2进程状态"
echo "----------------------------------------"
pm2 list
echo ""
pm2 describe member-web 2>/dev/null || echo "member-web 进程不存在"
pm2 describe member-fuplan 2>/dev/null || echo "member-fuplan 进程不存在"

echo -e "\n[2/8] 端口占用情况"
echo "----------------------------------------"
echo "检查3000-3003端口..."
netstat -tlnp 2>/dev/null | grep -E ':(3000|3001|3002|3003)' || echo "未发现端口占用"

echo -e "\n[3/8] Nginx状态"
echo "----------------------------------------"
sudo systemctl status nginx --no-pager -l

echo -e "\n[4/8] Nginx配置测试"
echo "----------------------------------------"
sudo nginx -t

echo -e "\n[5/8] 最近的PM2日志 (最后50行)"
echo "----------------------------------------"
pm2 logs --lines 50 --nostream 2>/dev/null || echo "无法获取PM2日志"

echo -e "\n[6/8] Nginx错误日志 (最后30行)"
echo "----------------------------------------"
sudo tail -30 /var/log/nginx/error.log 2>/dev/null || echo "无法读取Nginx错误日志"

echo -e "\n[7/8] 应用错误日志"
echo "----------------------------------------"
echo "=== member-web ==="
tail -20 /www/wwwroot/member-system/logs/error.log 2>/dev/null || echo "无日志文件"
echo ""
echo "=== member-fuplan ==="
tail -20 /www/wwwroot/fuplan-system/logs/error.log 2>/dev/null || echo "无日志文件"

echo -e "\n[8/8] 系统资源状态"
echo "----------------------------------------"
echo "内存使用:"
free -h
echo ""
echo "磁盘使用:"
df -h | grep -E '(Filesystem|/www|/$)'
echo ""
echo "CPU负载:"
uptime

echo -e "\n=========================================="
echo "诊断完成"
echo "=========================================="
