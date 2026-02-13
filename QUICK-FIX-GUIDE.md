# 快速修复 502 错误 - 操作指南

## 第一步：上传脚本到服务器

### 方法A：使用SCP（推荐）
在本地Windows PowerShell或CMD中执行：

```bash
# 进入项目目录
cd C:\Users\yushu\Desktop\我的会员体系

# 上传脚本到服务器（替换your-server-ip为实际IP）
scp server-diagnose.sh root@your-server-ip:/tmp/
scp server-fix.sh root@your-server-ip:/tmp/
scp server-quick-restart.sh root@your-server-ip:/tmp/
```

### 方法B：使用FTP工具
1. 打开FileZilla或WinSCP
2. 连接到服务器
3. 将以下文件上传到 `/tmp/` 目录：
   - server-diagnose.sh
   - server-fix.sh
   - server-quick-restart.sh

### 方法C：手动复制粘贴
1. SSH登录服务器
2. 创建文件并粘贴内容：
```bash
nano /tmp/server-fix.sh
# 粘贴 server-fix.sh 的内容，Ctrl+X 保存
```

## 第二步：SSH登录服务器

```bash
ssh root@your-server-ip
# 或
ssh root@yushuofupan.com
```

## 第三步：运行自动修复脚本

```bash
# 进入tmp目录
cd /tmp

# 添加执行权限
chmod +x server-diagnose.sh server-fix.sh server-quick-restart.sh

# 运行自动修复（推荐）
bash server-fix.sh
```

修复脚本会自动：
- ✓ 检查PM2进程状态
- ✓ 检查端口占用
- ✓ 检查数据库连接
- ✓ 检查.env文件
- ✓ 重启PM2应用
- ✓ 重启Nginx

## 第四步：验证修复结果

修复完成后，访问你的网站：
- https://yushuofupan.com

如果仍有问题，查看日志：
```bash
pm2 logs --lines 100
```

## 如果自动修复失败

### 运行诊断脚本
```bash
bash /tmp/server-diagnose.sh > diagnosis.txt
cat diagnosis.txt
```

将诊断结果发给我，我会帮你分析。

### 手动快速重启
```bash
bash /tmp/server-quick-restart.sh
```

### 完全重置（最后手段）
```bash
# 1. 停止所有PM2进程
pm2 stop all
pm2 delete all

# 2. 检查并清理端口
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:3001 | xargs kill -9 2>/dev/null
lsof -ti:3002 | xargs kill -9 2>/dev/null
lsof -ti:3003 | xargs kill -9 2>/dev/null

# 3. 重新启动
cd /www/wwwroot/member-system
pm2 start ecosystem.config.monorepo.js --env production
pm2 save

# 4. 重启Nginx
sudo systemctl restart nginx

# 5. 检查状态
pm2 list
curl -I http://localhost:3000
```

## 常见问题

### Q: 脚本提示"权限不足"
```bash
# 使用sudo运行
sudo bash server-fix.sh
```

### Q: 找不到ecosystem.config.monorepo.js
```bash
# 检查文件是否存在
ls -la /www/wwwroot/member-system/ecosystem.config.monorepo.js

# 如果不存在，需要重新部署代码
```

### Q: PM2命令找不到
```bash
# 安装PM2
npm install -g pm2

# 或使用npx
npx pm2 list
```

### Q: 数据库连接失败
```bash
# 启动MySQL
sudo systemctl start mysql
sudo systemctl enable mysql

# 检查.env文件
cat /www/wwwroot/member-system/.env | grep DB_
```

### Q: Nginx配置测试失败
```bash
# 查看详细错误
sudo nginx -t

# 检查配置文件
sudo nano /etc/nginx/sites-available/member-system-monorepo

# 恢复默认配置
sudo cp /path/to/backup/nginx.conf /etc/nginx/sites-available/member-system-monorepo
```

## 紧急联系命令

如果所有方法都失败，执行以下命令并将输出发给我：

```bash
# 生成完整诊断报告
bash /tmp/server-diagnose.sh > /tmp/full-diagnosis.txt 2>&1

# 查看报告
cat /tmp/full-diagnosis.txt

# 或下载到本地
# 在本地执行：
scp root@your-server-ip:/tmp/full-diagnosis.txt ./
```

## 预防措施

修复成功后，建议执行：

```bash
# 1. 保存PM2配置
pm2 save

# 2. 设置开机自启
pm2 startup
# 按照提示执行命令

# 3. 安装日志轮转
pm2 install pm2-logrotate

# 4. 测试自动重启
pm2 restart member-web
# 等待10秒，检查是否正常
curl -I http://localhost:3000
```

## 监控命令

```bash
# 实时监控
pm2 monit

# 查看日志
pm2 logs

# 查看特定应用
pm2 logs member-web --lines 100

# 查看错误日志
pm2 logs --err
```
