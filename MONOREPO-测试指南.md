# Monorepo系统完整测试指南

**测试时间**: 2026-01-24
**版本**: v1.2.0
**测试目标**: 验证所有4个应用正常运行

---

## 📋 测试前准备

### 1. 环境检查

```bash
# 进入项目目录
cd "C:\Users\yushu\Desktop\我的会员体系"

# 检查Node.js版本 (需要 >= 18.17.0)
node --version

# 检查pnpm版本
pnpm --version

# 检查依赖是否已安装
ls node_modules
```

### 2. 数据库准备

#### 选项A：使用现有数据库（推荐）

如果之前的member-system数据库还在使用：

```bash
# 检查数据库连接
mysql -u root -p -e "SHOW DATABASES LIKE 'member_system';"
```

#### 选项B：创建新的测试数据库

```bash
# 创建主数据库
mysql -u root -p < apps/web/database-init-v3.sql

# 创建BK数据库（可选）
mysql -u root -p < apps/bk/database-init.sql

# 添加Fuplan表（可选）
mysql -u root -p member_system < apps/fuplan/database-migration.sql

# 添加Xinli表（可选）
mysql -u root -p member_system < apps/xinli/database-psychology.sql
```

### 3. 环境变量配置

#### apps/web/.env

```bash
# 复制模板
cp apps/web/.env.example apps/web/.env

# 编辑配置
notepad apps/web/.env
```

**最小配置**：
```env
# 数据库配置（必填）
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=你的数据库密码
DB_NAME=member_system

# JWT配置（必填）
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# 应用配置
NODE_ENV=development
APP_URL=http://localhost:3000
PORT=3000
```

#### apps/bk/.env（如果测试BK系统）

```bash
cp apps/bk/.env.example apps/bk/.env
notepad apps/bk/.env
```

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=你的数据库密码
DB_NAME=stock_tracker

NODE_ENV=development
PORT=3001
```

#### apps/fuplan/.env 和 apps/xinli/.env

```bash
# 可以使用与web相同的数据库配置
cp apps/web/.env apps/fuplan/.env
cp apps/web/.env apps/xinli/.env

# 修改端口
# fuplan: PORT=3002
# xinli: PORT=3003
```

---

## 🧪 测试步骤

### 阶段1：单独测试每个应用（推荐）

#### 测试1：Web应用（会员管理系统）

**1. 启动应用**：
```bash
cd apps/web
pnpm dev
```

**2. 访问测试**：
- 打开浏览器：http://localhost:3000

**3. 功能测试清单**：

- [ ] **首页显示**
  - [ ] 产品列表显示正常
  - [ ] 导航栏显示正常
  - [ ] 页面样式正常

- [ ] **用户注册**
  - [ ] 访问：http://localhost:3000/register
  - [ ] 填写：用户名、邮箱、密码
  - [ ] 点击注册
  - [ ] 检查是否跳转到登录页

- [ ] **用户登录**
  - [ ] 访问：http://localhost:3000/login
  - [ ] 使用刚注册的账号登录
  - [ ] 检查是否跳转到会员页面

- [ ] **会员页面**
  - [ ] 访问：http://localhost:3000/member
  - [ ] 查看会员等级显示
  - [ ] 查看会员到期时间
  - [ ] 查看可访问产品列表

- [ ] **管理后台**
  - [ ] 访问：http://localhost:3000/admin
  - [ ] 使用管理员账号登录（需要先在数据库创建）
  - [ ] 查看会员列表
  - [ ] 查看激活码管理

**4. 停止应用**：
- 按 `Ctrl + C`

---

#### 测试2：BK应用（板块节奏系统）

**1. 启动应用**：
```bash
cd apps/bk
pnpm dev
```

**2. 访问测试**：
- 打开浏览器：http://localhost:3001

**3. 功能测试清单**：

- [ ] **首页显示**
  - [ ] 7日涨停板统计显示
  - [ ] 板块轮动信息显示
  - [ ] 连板梯队显示

- [ ] **数据状态检查**
  - [ ] 访问：http://localhost:3001/status
  - [ ] 查看数据更新状态
  - [ ] 查看最后更新时间

- [ ] **API测试**（可选）
  ```bash
  # 在新终端测试API
  curl http://localhost:3001/api/data-status
  ```

**4. 已知问题**：
- ⚠️ 11个TypeScript警告（不影响运行）
- ⚠️ 如果数据库为空，页面会显示"暂无数据"

**5. 停止应用**：
- 按 `Ctrl + C`

---

#### 测试3：Fuplan应用（复盘系统）

**1. 启动应用**：
```bash
cd apps/fuplan
pnpm dev
```

**2. 访问测试**：
- 打开浏览器：http://localhost:3002

**3. 功能测试清单**：

- [ ] **首页显示**
  - [ ] 页面正常加载
  - [ ] 导航正常

- [ ] **仪表盘**
  - [ ] 访问：http://localhost:3002/dashboard
  - [ ] 查看布局

- [ ] **复盘页面**
  - [ ] 访问：http://localhost:3002/review
  - [ ] 情绪周期选择器显示
  - [ ] 6大模块表单显示

**4. 已知问题**：
- ⚠️ API端点未完成（0/6）
- ⚠️ 数据保存功能暂不可用

**5. 停止应用**：
- 按 `Ctrl + C`

---

#### 测试4：Xinli应用（心理测评系统）

**1. 启动应用**：
```bash
cd apps/xinli
pnpm dev
```

**2. 访问测试**：
- 打开浏览器：http://localhost:3003

**3. 功能测试清单**：

- [ ] **首页显示**
  - [ ] 页面正常加载
  - [ ] 系统介绍显示

- [ ] **测评主页**
  - [ ] 访问：http://localhost:3003/xinli
  - [ ] 9大分类导航显示
  - [ ] 80场景问卷显示

- [ ] **使用指南**
  - [ ] 访问：http://localhost:3003/xinli/guide
  - [ ] 使用说明显示正常

- [ ] **历史记录**
  - [ ] 访问：http://localhost:3003/xinli/history
  - [ ] 页面正常显示（可能为空）

**4. 停止应用**：
- 按 `Ctrl + C`

---

### 阶段2：并行测试所有应用

**1. 启动所有应用**：
```bash
# 回到根目录
cd "C:\Users\yushu\Desktop\我的会员体系"

# 启动所有应用
pnpm dev:all
```

**2. 访问测试**：

打开4个浏览器标签页：
- Tab 1: http://localhost:3000 (Web)
- Tab 2: http://localhost:3001 (BK)
- Tab 3: http://localhost:3002 (Fuplan)
- Tab 4: http://localhost:3003 (Xinli)

**3. 并行测试清单**：

- [ ] **所有应用同时运行**
  - [ ] 4个端口都能访问
  - [ ] 没有端口冲突
  - [ ] 所有页面正常显示

- [ ] **热重载测试**
  - [ ] 修改任意应用的代码
  - [ ] 检查是否自动刷新
  - [ ] 修改共享包代码
  - [ ] 检查所有使用该包的应用是否更新

- [ ] **性能测试**
  - [ ] 4个应用同时运行是否卡顿
  - [ ] 内存占用是否正常
  - [ ] CPU占用是否正常

**4. 停止所有应用**：
- 按 `Ctrl + C`

---

### 阶段3：构建测试

**1. 构建所有应用**：
```bash
cd "C:\Users\yushu\Desktop\我的会员体系"
pnpm build
```

**2. 验证构建结果**：

- [ ] **构建成功**
  ```
  ✓ Compiled successfully
  Tasks: 4 successful, 4 total
  ```

- [ ] **检查输出文件**
  ```bash
  # 检查各应用的构建输出
  ls apps/web/.next
  ls apps/bk/.next
  ls apps/fuplan/.next
  ls apps/xinli/.next
  ```

**3. 生产模式测试**（可选）：

```bash
# 构建并启动Web应用
cd apps/web
pnpm build
pnpm start

# 访问 http://localhost:3000
```

---

## 🔍 故障排查

### 问题1：端口被占用

**错误信息**：
```
Error: listen EADDRINUSE: address already in use :::3000
```

**解决方案**：
```bash
# Windows - 查找占用端口的进程
netstat -ano | findstr :3000

# 杀死进程（替换PID）
taskkill /PID <进程ID> /F

# 或者修改端口
# 编辑 apps/web/package.json
# "dev": "next dev -p 3005"  # 改为其他端口
```

### 问题2：数据库连接失败

**错误信息**：
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**解决方案**：
```bash
# 1. 检查MySQL是否运行
# Windows服务管理 → 查找MySQL服务

# 2. 检查.env配置
cat apps/web/.env

# 3. 测试数据库连接
mysql -u root -p -e "SELECT 1"
```

### 问题3：依赖缺失

**错误信息**：
```
Error: Cannot find module 'next'
```

**解决方案**：
```bash
# 重新安装依赖
rm -rf node_modules
pnpm install

# 或清理缓存后重装
pnpm clean:all
pnpm install
```

### 问题4：TypeScript错误

**错误信息**：
```
Type error: Property 'xxx' does not exist
```

**解决方案**：
```bash
# 运行类型检查
pnpm type-check

# 如果是共享包的类型问题
cd packages/auth  # 或其他包
pnpm build
```

---

## 📊 测试报告模板

### 测试环境

- 操作系统: Windows 11
- Node.js版本: ____________
- pnpm版本: ____________
- MySQL版本: ____________
- 测试日期: ____________

### 测试结果

#### Web应用 (apps/web)

| 测试项 | 状态 | 备注 |
|--------|------|------|
| 启动成功 | ☐ 是 ☐ 否 | |
| 首页显示 | ☐ 是 ☐ 否 | |
| 用户注册 | ☐ 是 ☐ 否 | |
| 用户登录 | ☐ 是 ☐ 否 | |
| 会员页面 | ☐ 是 ☐ 否 | |
| 管理后台 | ☐ 是 ☐ 否 | |

#### BK应用 (apps/bk)

| 测试项 | 状态 | 备注 |
|--------|------|------|
| 启动成功 | ☐ 是 ☐ 否 | |
| 首页显示 | ☐ 是 ☐ 否 | |
| 数据状态 | ☐ 是 ☐ 否 | |

#### Fuplan应用 (apps/fuplan)

| 测试项 | 状态 | 备注 |
|--------|------|------|
| 启动成功 | ☐ 是 ☐ 否 | |
| 首页显示 | ☐ 是 ☐ 否 | |
| 仪表盘 | ☐ 是 ☐ 否 | |
| 复盘页面 | ☐ 是 ☐ 否 | |

#### Xinli应用 (apps/xinli)

| 测试项 | 状态 | 备注 |
|--------|------|------|
| 启动成功 | ☐ 是 ☐ 否 | |
| 首页显示 | ☐ 是 ☐ 否 | |
| 测评主页 | ☐ 是 ☐ 否 | |
| 历史记录 | ☐ 是 ☐ 否 | |

#### 并行测试

| 测试项 | 状态 | 备注 |
|--------|------|------|
| 同时运行 | ☐ 是 ☐ 否 | |
| 热重载 | ☐ 是 ☐ 否 | |
| 性能正常 | ☐ 是 ☐ 否 | |

#### 构建测试

| 测试项 | 状态 | 备注 |
|--------|------|------|
| 构建成功 | ☐ 是 ☐ 否 | |
| 输出文件完整 | ☐ 是 ☐ 否 | |
| 生产模式运行 | ☐ 是 ☐ 否 | |

### 发现的问题

1. ____________
2. ____________
3. ____________

### 总体评价

- [ ] ✅ 完全正常，可以使用
- [ ] ⚠️ 有小问题，但不影响使用
- [ ] ❌ 有严重问题，需要修复

---

## 🎯 快速测试脚本

创建一个快速测试脚本：

```bash
# 保存为 test-monorepo.sh

#!/bin/bash

echo "🧪 Monorepo快速测试"
echo "===================="

# 1. 检查依赖
echo "📦 检查依赖..."
if [ ! -d "node_modules" ]; then
  echo "❌ 依赖未安装，正在安装..."
  pnpm install
fi

# 2. 检查环境变量
echo "🔧 检查环境变量..."
for app in web bk fuplan xinli; do
  if [ ! -f "apps/$app/.env" ]; then
    echo "⚠️  apps/$app/.env 不存在"
  fi
done

# 3. 构建测试
echo "🏗️  构建测试..."
pnpm build

if [ $? -eq 0 ]; then
  echo "✅ 构建成功！"
else
  echo "❌ 构建失败！"
  exit 1
fi

# 4. 提示下一步
echo ""
echo "✅ 快速测试完成！"
echo ""
echo "下一步："
echo "1. 配置环境变量（如果还没配置）"
echo "2. 运行: pnpm dev:all"
echo "3. 访问各应用进行功能测试"
```

**使用方法**：
```bash
chmod +x test-monorepo.sh
./test-monorepo.sh
```

---

## 📚 相关文档

- **MONOREPO-构建成功报告.md** - 构建详情
- **MONOREPO-DEVELOPMENT-GUIDE.md** - 开发指南
- **apps/*/README.md** - 各应用的详细说明

---

**最后更新**: 2026-01-24
**测试版本**: v1.2.0
**建议测试时长**: 30-60分钟
