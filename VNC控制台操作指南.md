# 阿里云 VNC 控制台操作指南

## 🎯 目标
通过阿里云VNC控制台登录服务器,检查和修复应用问题

## 📋 操作步骤

### 第一步: 登录阿里云并打开VNC

1. **访问阿里云控制台**
   ```
   https://ecs.console.aliyun.com
   ```

2. **找到您的ECS实例**
   - 在实例列表中找到 IP: `8.153.110.212`
   - 或搜索实例ID/IP地址

3. **打开VNC控制台**
   - 点击实例右侧的 **远程连接**
   - 选择 **VNC远程连接** (或 **通过Workbench远程连接**)
   - 如果是第一次使用,会要求设置VNC密码(6位数字)
   - 记住这个密码,后续登录需要

4. **登录服务器**
   - 在VNC窗口中输入用户名: `root`
   - 输入服务器密码 (您设置的root密码)
   - 如果看到命令行提示符 `[root@xxx ~]#`,说明登录成功

### 第二步: 检查服务器状态

登录成功后,依次执行以下命令:

#### 1. 检查PM2应用状态
```bash
pm2 status
```

**期望输出:**
```
┌────┬──────────────────┬─────────┬─────────┬─────────┬──────────┐
│ id │ name             │ status  │ restart │ uptime  │ cpu      │
├────┼──────────────────┼─────────┼─────────┼─────────┼──────────┤
│ 0  │ member-system    │ online  │ 0       │ 2h      │ 0%       │
└────┴──────────────────┴─────────┴─────────┴─────────┴──────────┘
```

**如果状态是 `stopped` 或 `errored`:**
```bash
pm2 restart member-system
pm2 logs member-system --lines 30
```

**如果没有任何应用:**
```bash
cd /www/wwwroot/member-system
pm2 start ecosystem.config.js --env production
pm2 save
```

#### 2. 检查端口监听
```bash
netstat -tlnp | grep -E ':(22|3000|80)'
```

**期望输出:**
```
tcp6  0  0 :::3000    :::*    LISTEN  12345/node
tcp   0  0 0.0.0.0:22 0.0.0.0:* LISTEN  678/sshd
```

**如果3000端口没有监听:**
- PM2应用没有正常启动,查看日志排查

#### 3. 检查防火墙状态
```bash
systemctl status firewalld
```

**如果显示 `active (running)`:**
```bash
# 开放3000端口
firewall-cmd --permanent --add-port=3000/tcp
firewall-cmd --permanent --add-port=22/tcp
firewall-cmd --reload

# 查看已开放端口
firewall-cmd --list-ports
```

**如果想临时关闭防火墙测试:**
```bash
systemctl stop firewalld
```

#### 4. 检查应用日志
```bash
pm2 logs member-system --lines 50
```

查看是否有错误信息,常见问题:
- 数据库连接失败
- 端口被占用
- 环境变量缺失

### 第三步: 开放安全组端口

即使服务器内部一切正常,如果安全组没开放端口,外部仍无法访问。

**在VNC窗口中:**

1. 保持VNC连接(确保服务正常运行)

2. 在浏览器新标签页打开阿里云控制台

3. **安全组配置:**
   - ECS控制台 → 找到实例 → 点击实例ID
   - 左侧菜单 → **安全组** → 点击安全组ID
   - **入方向** → **手动添加**

4. **添加规则:**

   **规则1 - SSH端口:**
   ```
   授权策略: 允许
   优先级: 1
   协议类型: 自定义TCP
   端口范围: 22/22
   授权对象: 0.0.0.0/0
   描述: SSH访问
   ```

   **规则2 - 应用端口:**
   ```
   授权策略: 允许
   优先级: 1
   协议类型: 自定义TCP
   端口范围: 3000/3000
   授权对象: 0.0.0.0/0
   描述: member-system应用
   ```

   **规则3 - HTTP端口(可选):**
   ```
   授权策略: 允许
   优先级: 1
   协议类型: HTTP(80)
   端口范围: 80/80
   授权对象: 0.0.0.0/0
   描述: Nginx代理
   ```

5. 点击 **保存**,等待1-2分钟生效

### 第四步: 测试访问

1. **测试SSH连接** (在本地Windows命令行)
   ```bash
   ssh root@8.153.110.212
   ```
   如果能连接,说明22端口开放成功

2. **测试应用访问**
   ```
   http://8.153.110.212:3000/admin/login
   ```

3. **登录系统**
   ```
   用户名: admin
   密码: 7287843Wu
   ```

## 🔧 常见问题排查

### 问题1: PM2 显示 "stopped" 或 "errored"

**解决方法:**
```bash
cd /www/wwwroot/member-system

# 查看详细日志
pm2 logs member-system --lines 100

# 重启应用
pm2 restart member-system

# 如果持续报错,手动启动
pm2 delete member-system
pm2 start ecosystem.config.js --env production
pm2 save
```

### 问题2: 数据库连接失败

**检查.env文件:**
```bash
cat /www/wwwroot/member-system/.env
```

**确保配置正确:**
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=ChangeMe2026!Secure
DB_NAME=member_system
```

**测试数据库连接:**
```bash
mysql -u root -p'ChangeMe2026!Secure' -e "SHOW DATABASES;"
```

### 问题3: 端口被占用

**查找占用3000端口的进程:**
```bash
lsof -i :3000
```

**杀死占用进程:**
```bash
kill -9 <PID>
```

### 问题4: 构建文件缺失

**如果.next目录不存在:**
```bash
cd /www/wwwroot/member-system

# 确保代码是最新的
git pull origin main

# 重新构建
export NODE_OPTIONS="--max-old-space-size=2048"
npm ci
npm run build

# 启动
pm2 restart member-system
```

### 问题5: 服务器资源不足

**检查内存:**
```bash
free -h
```

**检查磁盘:**
```bash
df -h
```

**如果内存不足,重启服务器:**
```bash
reboot
```
(重启后需要等待1-2分钟,然后重新通过VNC连接)

## 📞 如果还是无法解决

### 联系阿里云技术支持

1. **在线工单:**
   - 阿里云控制台 → 右上角 → **工单** → **提交工单**
   - 选择: 云服务器ECS → 网络配置问题

2. **工单内容模板:**
   ```
   标题: ECS实例端口无法访问

   描述:
   实例ID: [您的实例ID]
   公网IP: 8.153.110.212
   问题描述:
   - 无法SSH连接(22端口)
   - 无法访问应用(3000端口)
   - Ping正常,但TCP连接超时

   已尝试:
   - 检查安全组规则
   - 通过VNC登录检查服务正常运行
   - 检查服务器防火墙

   请求:
   请协助检查网络配置,确保22和3000端口可以正常访问
   ```

3. **电话支持:**
   - 阿里云客服: 95187

## ✅ 成功标志

当以下都成功时,说明问题已解决:

- ✅ SSH 可以连接: `ssh root@8.153.110.212`
- ✅ PM2 状态正常: `pm2 status` 显示 `online`
- ✅ 端口正在监听: `netstat -tlnp | grep 3000`
- ✅ 网页可以访问: http://8.153.110.212:3000
- ✅ 可以登录系统: admin / 7287843Wu

## 🎯 快速命令参考

```bash
# 一键检查所有状态
pm2 status && \
echo "---端口监听---" && \
netstat -tlnp | grep -E ':(22|3000)' && \
echo "---防火墙状态---" && \
systemctl status firewalld --no-pager && \
echo "---应用日志---" && \
pm2 logs member-system --lines 10 --nostream

# 一键重启应用
cd /www/wwwroot/member-system && \
pm2 restart member-system && \
pm2 save && \
pm2 logs member-system --lines 20 --nostream

# 一键开放防火墙端口
firewall-cmd --permanent --add-port=3000/tcp && \
firewall-cmd --permanent --add-port=22/tcp && \
firewall-cmd --reload && \
firewall-cmd --list-ports
```

---

**记住:**
1. VNC是您的"救命稻草" - 即使SSH断开也能访问
2. 安全组是外部访问的"大门" - 必须开放端口
3. 服务器防火墙是内部的"检查站" - 也要配置

祝您顺利解决问题! 🚀
