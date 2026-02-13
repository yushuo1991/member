# 服务器故障排查指南

## 快速修复 502 错误

### 方法一：使用自动修复脚本（推荐）

```bash
# 1. SSH登录服务器
ssh root@your-server-ip

# 2. 上传并运行修复脚本
cd /tmp
# 将 server-fix.sh 上传到服务器，然后执行：
bash server-fix.sh
```

### 方法二：手动排查和修复

#### 第一步：诊断问题

```bash
# 上传并运行诊断脚本
bash server-diagnose.sh > diagnosis.txt

# 查看诊断结果
cat diagnosis.txt
```

#### 第二步：根据诊断结果修复

**情况1: PM2进程已停止**
```bash
cd /www/wwwroot/member-system
pm2 start ecosystem.config.monorepo.js --env production
pm2 save
```

**情况2: PM2进程存在但状态异常**
```bash
pm2 restart all
pm2 logs --lines 100
```

**情况3: 端口被占用**
```bash
# 查看占用进程
lsof -i :3000
lsof -i :3002

# 杀掉进程（替换<PID>为实际进程ID）
kill -9 <PID>

# 重启应用
pm2 restart all
```

**情况4: Nginx配置错误**
```bash
# 测试配置
sudo nginx -t

# 如果有错误，检查配置文件
sudo nano /etc/nginx/sites-available/member-system-monorepo

# 修复后重新加载
sudo systemctl reload nginx
```

**情况5: 数据库连接失败**
```bash
# 检查MySQL状态
sudo systemctl status mysql

# 如果未运行，启动MySQL
sudo systemctl start mysql

# 测试连接
mysql -u root -p -e "SHOW DATABASES;"

# 检查.env文件
cat /www/wwwroot/member-system/.env | grep DB_
```

**情况6: 内存不足**
```bash
# 查看内存使用
free -h

# 如果内存不足，重启占用内存最多的应用
pm2 restart member-web

# 或者增加swap空间
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### 方法三：完全重置（最后手段）

```bash
# 1. 停止所有服务
pm2 stop all
pm2 delete all

# 2. 检查端口
netstat -tlnp | grep -E ':(3000|3001|3002|3003)'

# 3. 如果有占用，杀掉进程
kill -9 <PID>

# 4. 重新启动
cd /www/wwwroot/member-system
pm2 start ecosystem.config.monorepo.js --env production
pm2 save

# 5. 重启Nginx
sudo systemctl restart nginx

# 6. 检查状态
pm2 list
sudo systemctl status nginx
```

## 常见错误代码

- **502 Bad Gateway**: 后端应用无响应（PM2进程停止或端口未监听）
- **504 Gateway Timeout**: 后端应用响应超时（应用卡死或性能问题）
- **500 Internal Server Error**: 应用内部错误（检查应用日志）
- **404 Not Found**: 路由配置错误或文件不存在

## 日志查看命令

```bash
# PM2日志
pm2 logs                          # 实时查看所有日志
pm2 logs member-web               # 查看特定应用日志
pm2 logs --err --lines 200        # 查看错误日志

# Nginx日志
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/member-web.error.log

# 应用日志
tail -f /www/wwwroot/member-system/logs/error.log
tail -f /www/wwwroot/fuplan-system/logs/error.log
```

## 性能监控

```bash
# PM2监控
pm2 monit

# 系统资源
htop          # 需要安装: sudo apt install htop
top
free -h
df -h

# 网络连接
netstat -an | grep ESTABLISHED | wc -l
```

## 预防措施

1. **设置PM2开机自启**
```bash
pm2 startup
pm2 save
```

2. **配置日志轮转**
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

3. **设置监控告警**
```bash
# 安装PM2 Plus（可选）
pm2 link <secret> <public>
```

4. **定期备份**
```bash
# 备份数据库
mysqldump -u root -p member_system > backup_$(date +%Y%m%d).sql

# 备份代码
tar -czf backup_$(date +%Y%m%d).tar.gz /www/wwwroot/
```

## 紧急联系方式

如果以上方法都无法解决问题：

1. 查看完整的诊断报告
2. 检查服务器磁盘空间是否充足
3. 检查服务器是否被攻击（查看访问日志）
4. 考虑回滚到上一个稳定版本

## 脚本文件说明

- `server-diagnose.sh` - 全面诊断脚本，生成详细报告
- `server-fix.sh` - 自动修复脚本，处理常见问题
- `server-quick-restart.sh` - 快速重启所有服务
