#!/bin/bash
cd /www/wwwroot/member-monorepo
echo "=== 检查PM2 ===" && pm2 list
echo "" && echo "=== 检查端口 ===" && netstat -tlnp | grep ":300"
echo "" && echo "=== 启动PM2 ===" && pm2 delete all && pm2 start ecosystem.config.js && pm2 save && pm2 list
