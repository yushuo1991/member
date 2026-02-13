# 🚨 502错误修复 - 立即行动指南

## ⚡ 最快修复方法（3步搞定）

### 步骤1: 打开PowerShell
在项目文件夹右键 → "在终端中打开" 或按 `Win+X` → 选择 "Windows PowerShell"

### 步骤2: 运行上传脚本
```powershell
.\upload-scripts.ps1
```

### 步骤3: 按提示操作
- 输入服务器地址: `yushuofupan.com`
- 输入用户名: `root`
- 输入密码
- 选择 `y` 立即运行修复

**完成！** 等待30秒，访问 https://yushuofupan.com 测试

---

## 🔧 备选方法（如果上面的方法不行）

### 方法A: 一行命令修复（最简单）

在本地PowerShell执行：
```powershell
ssh root@yushuofupan.com "pm2 restart all && sleep 3 && sudo systemctl reload nginx && pm2 list"
```

### 方法B: 手动SSH修复

1. **SSH登录服务器**
```bash
ssh root@yushuofupan.com
```

2. **执行修复命令**
```bash
pm2 restart all
sudo systemctl reload nginx
pm2 list
```

3. **测试网站**
访问 https://yushuofupan.com

### 方法C: 使用修复脚本（最全面）

1. **上传脚本**
```powershell
scp server-fix.sh root@yushuofupan.com:/tmp/
```

2. **SSH登录并执行**
```bash
ssh root@yushuofupan.com
chmod +x /tmp/server-fix.sh
bash /tmp/server-fix.sh
```

---

## 📋 修复后检查清单

- [ ] 访问 https://yushuofupan.com - 页面正常加载
- [ ] 检查PM2状态: `pm2 list` - 所有进程显示 "online"
- [ ] 查看日志: `pm2 logs --lines 20` - 无错误信息
- [ ] 测试端口: `curl -I http://localhost:3000` - 返回200

---

## ❌ 如果仍然502

### 运行诊断
```bash
ssh root@yushuofupan.com "pm2 logs --lines 100"
```

### 查看具体错误
```bash
ssh root@yushuofupan.com "sudo tail -50 /var/log/nginx/error.log"
```

### 完全重置（最后手段）
```bash
ssh root@yushuofupan.com
pm2 stop all
pm2 delete all
cd /www/wwwroot/member-system
pm2 start ecosystem.config.monorepo.js --env production
pm2 save
sudo systemctl restart nginx
```

---

## 📞 需要帮助？

如果以上方法都不行，运行诊断并发给我：

```bash
ssh root@yushuofupan.com "bash /tmp/server-diagnose.sh" > diagnosis.txt
```

然后把 `diagnosis.txt` 的内容发给我。

---

## 🎯 现在就开始

**推荐操作顺序:**

1. 先试 **方法A**（一行命令）- 最快
2. 不行就用 **方法B**（手动SSH）- 最简单
3. 还不行用 **步骤1-3**（自动脚本）- 最全面
4. 都不行就 **运行诊断** - 找出根本原因

**立即执行这个命令:**
```powershell
ssh root@yushuofupan.com "pm2 restart all && sudo systemctl reload nginx && pm2 list"
```

输入密码后等待30秒，然后访问你的网站！
