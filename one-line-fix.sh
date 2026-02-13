#!/bin/bash
# 一键修复脚本 - 最简单的修复方式
# 复制这个脚本的内容，在服务器上执行

echo "开始修复 502 错误..."

# 重启PM2
echo "1. 重启PM2应用..."
pm2 restart all

# 等待启动
sleep 5

# 重启Nginx
echo "2. 重启Nginx..."
sudo systemctl reload nginx

# 检查状态
echo "3. 检查状态..."
pm2 list

echo ""
echo "修复完成！请访问 https://yushuofupan.com 测试"
echo "如果仍有问题，运行: pm2 logs"
