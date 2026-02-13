# 服务器修复工具包

这个工具包包含了诊断和修复 502 Bad Gateway 错误的所有脚本。

## 📦 工具包内容

### 诊断工具
- **server-diagnose.sh** - 全面诊断脚本，生成详细的系统状态报告
  - PM2进程状态
  - 端口占用情况
  - Nginx状态和配置
  - 应用日志
  - 系统资源使用

### 修复工具
- **server-fix.sh** - 自动修复脚本（推荐）
  - 自动检测问题
  - 智能修复常见错误
  - 交互式确认
  - 详细的修复报告

- **server-quick-restart.sh** - 快速重启脚本
  - 快速重启所有服务
  - 适合紧急情况

- **one-line-fix.sh** - 一键修复脚本
  - 最简单的修复方式
  - 适合快速尝试

### 上传工具
- **upload-scripts.ps1** - PowerShell上传脚本（Windows推荐）
- **upload-scripts.bat** - 批处理上传脚本（Windows备选）

### 文档
- **QUICK-FIX-GUIDE.md** - 快速修复指南
- **SERVER-TROUBLESHOOTING.md** - 详细故障排查文档

## 🚀 快速开始

### 方法一：自动上传并修复（最简单）

**Windows PowerShell:**
```powershell
cd C:\Users\yushu\Desktop\我的会员体系
.\upload-scripts.ps1
```

**Windows CMD:**
```cmd
cd C:\Users\yushu\Desktop\我的会员体系
upload-scripts.bat
```

脚本会自动：
1. 上传所有修复脚本到服务器
2. 设置执行权限
3. 询问是否立即运行修复

### 方法二：手动上传和执行

**1. 上传脚本到服务器**
```bash
# 在本地Windows PowerShell中执行
cd C:\Users\yushu\Desktop\我的会员体系
scp server-fix.sh root@yushuofupan.com:/tmp/
```

**2. SSH登录服务器**
```bash
ssh root@yushuofupan.com
```

**3. 运行修复脚本**
```bash
chmod +x /tmp/server-fix.sh
bash /tmp/server-fix.sh
```

### 方法三：一行命令修复

如果你只想快速重启服务：

```bash
ssh root@yushuofupan.com "pm2 restart all && sudo systemctl reload nginx && pm2 list"
```

## 📋 使用场景

### 场景1: 网站突然502错误
```bash
# 使用自动修复脚本
bash /tmp/server-fix.sh
```

### 场景2: 不确定问题原因
```bash
# 先运行诊断
bash /tmp/server-diagnose.sh > diagnosis.txt
cat diagnosis.txt
```

### 场景3: 紧急快速重启
```bash
# 快速重启所有服务
bash /tmp/server-quick-restart.sh
```

### 场景4: 最简单的尝试
```bash
# 一键修复
bash /tmp/one-line-fix.sh
```

## 🔍 诊断问题

运行诊断脚本生成详细报告：

```bash
bash /tmp/server-diagnose.sh > /tmp/diagnosis.txt
cat /tmp/diagnosis.txt
```

诊断报告包含：
- PM2进程状态和详细信息
- 端口3000-3003的占用情况
- Nginx运行状态和配置测试
- 最近50行PM2日志
- Nginx错误日志
- 应用错误日志
- 系统资源使用（内存、磁盘、CPU）

## 🛠️ 修复流程

**server-fix.sh** 执行以下步骤：

1. **检查PM2进程** - 确认应用是否运行
2. **检查端口占用** - 确保3000-3003端口可用
3. **检查数据库** - 验证MySQL连接
4. **检查配置文件** - 确认.env文件存在
5. **重启应用** - 重启或启动PM2进程
6. **重启Nginx** - 重新加载Nginx配置

## ⚠️ 常见问题

### Q: 脚本上传失败
**A:** 检查SSH连接和权限
```bash
# 测试SSH连接
ssh root@yushuofupan.com "echo 'Connection OK'"

# 检查SCP是否可用
where scp  # Windows
which scp  # Linux/Mac
```

### Q: 权限不足
**A:** 使用sudo运行
```bash
sudo bash /tmp/server-fix.sh
```

### Q: PM2命令找不到
**A:** 安装或使用完整路径
```bash
# 安装PM2
npm install -g pm2

# 或使用npx
npx pm2 list
```

### Q: 修复后仍然502
**A:** 查看详细日志
```bash
pm2 logs --lines 200
sudo tail -100 /var/log/nginx/error.log
```

## 📊 监控命令

修复后，使用这些命令监控状态：

```bash
# 实时监控
pm2 monit

# 查看日志
pm2 logs

# 查看进程列表
pm2 list

# 查看特定应用
pm2 describe member-web

# 测试端口
curl -I http://localhost:3000
curl -I http://localhost:3002
```

## 🔄 预防措施

修复成功后，建议执行：

```bash
# 1. 保存PM2配置
pm2 save

# 2. 设置开机自启
pm2 startup
# 按照提示执行命令

# 3. 安装日志轮转
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# 4. 定期备份数据库
mysqldump -u root -p member_system > backup_$(date +%Y%m%d).sql
```

## 📞 获取帮助

如果所有方法都失败：

1. 运行完整诊断并保存结果
```bash
bash /tmp/server-diagnose.sh > /tmp/full-diagnosis.txt
```

2. 下载诊断报告到本地
```bash
# 在本地Windows执行
scp root@yushuofupan.com:/tmp/full-diagnosis.txt ./
```

3. 查看诊断报告并寻求帮助

## 📝 脚本位置

所有脚本上传到服务器的 `/tmp/` 目录：
- `/tmp/server-diagnose.sh`
- `/tmp/server-fix.sh`
- `/tmp/server-quick-restart.sh`
- `/tmp/one-line-fix.sh`

## 🎯 推荐修复顺序

1. **首次尝试**: `one-line-fix.sh` - 最快速
2. **标准修复**: `server-fix.sh` - 最全面
3. **深度诊断**: `server-diagnose.sh` - 找出根本原因
4. **紧急重启**: `server-quick-restart.sh` - 强制重启

## ✅ 验证修复

修复完成后，验证网站是否正常：

```bash
# 在服务器上测试
curl -I http://localhost:3000
curl -I http://localhost:3002

# 检查PM2状态
pm2 list

# 查看最近日志
pm2 logs --lines 20
```

然后在浏览器访问：
- https://yushuofupan.com
- 检查是否返回正常页面

## 📚 相关文档

- [QUICK-FIX-GUIDE.md](./QUICK-FIX-GUIDE.md) - 详细操作步骤
- [SERVER-TROUBLESHOOTING.md](./SERVER-TROUBLESHOOTING.md) - 故障排查指南
- [CLAUDE.md](./CLAUDE.md) - 项目完整文档
