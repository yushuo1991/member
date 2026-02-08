# 试用功能修复指南

## 问题诊断结果

### 根本原因
数据库缺少试用功能所需的表结构：
- ❌ `users` 表缺少 `trial_bk`, `trial_xinli`, `trial_fuplan` 字段
- ❌ `products` 表缺少 `trial_enabled`, `trial_count` 字段
- ❌ 缺少 `trial_logs` 表

### 代码状态
- ✅ 前端组件完整（产品卡片、详情页、会员中心）
- ✅ 后端API完整（`/api/products/trial/[slug]`）
- ✅ 服务层完整（`trial-service.ts`）
- ✅ 配置正确（3个产品已启用试用）

---

## 快速修复步骤

### 步骤1：启动MySQL服务

选择以下方法之一：

**方法A：使用服务管理器**
1. 按 `Win + R`，输入 `services.msc`，回车
2. 找到 MySQL 服务（可能叫 MySQL80、MySQL 或 MySQL57）
3. 右键点击 → 启动

**方法B：使用命令行（管理员权限）**
```bash
# 以管理员身份打开命令提示符，然后运行：
net start MySQL80
```

**方法C：使用XAMPP/WAMP控制面板**
- 打开控制面板，点击启动MySQL

**方法D：使用MySQL Workbench**
- 打开MySQL Workbench会自动尝试启动服务

---

### 步骤2：执行数据库迁移

MySQL服务启动后，选择以下方法之一：

#### 方法1：使用MySQL Workbench（推荐，最简单）

1. 打开 MySQL Workbench
2. 连接到本地MySQL服务器（用户名：root，密码：123456）
3. 选择 `member_system` 数据库
4. 点击菜单：File → Open SQL Script
5. 选择文件：`database-add-trial-support.sql`
6. 点击工具栏的闪电图标（Execute）执行脚本
7. 查看输出窗口，确认所有操作成功

#### 方法2：使用Node.js脚本（自动化）

```bash
# 在项目根目录打开命令行，运行：
node scripts\migrate-trial-support-simple.js
```

#### 方法3：使用命令行

```bash
# 在项目根目录打开命令行，运行：
mysql -u root -p123456 member_system < database-add-trial-support.sql
```

#### 方法4：使用phpMyAdmin

1. 打开 phpMyAdmin（通常是 http://localhost/phpmyadmin）
2. 登录（用户名：root，密码：123456）
3. 选择 `member_system` 数据库
4. 点击"SQL"标签
5. 复制 `database-add-trial-support.sql` 文件的全部内容
6. 粘贴到SQL输入框
7. 点击"执行"按钮

---

## 迁移脚本执行的操作

### 1. users 表添加试用字段
```sql
ALTER TABLE users
ADD COLUMN trial_bk INT DEFAULT 5 COMMENT '板块节奏系统剩余试用次数',
ADD COLUMN trial_xinli INT DEFAULT 5 COMMENT '心理测评系统剩余试用次数',
ADD COLUMN trial_fuplan INT DEFAULT 5 COMMENT '复盘系统剩余试用次数';
```

### 2. products 表添加试用配置
```sql
ALTER TABLE products
ADD COLUMN trial_enabled TINYINT DEFAULT 0 COMMENT '是否支持试用',
ADD COLUMN trial_count INT DEFAULT 0 COMMENT '默认试用次数';

UPDATE products SET trial_enabled = 1, trial_count = 5 WHERE slug = 'bk';
UPDATE products SET trial_enabled = 1, trial_count = 5 WHERE slug = 'xinli';
UPDATE products SET trial_enabled = 1, trial_count = 5 WHERE slug = 'fuplan';
```

### 3. 创建 trial_logs 表
```sql
CREATE TABLE trial_logs (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNSIGNED NOT NULL,
    product_slug VARCHAR(50) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_product (user_id, product_slug),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## 验证迁移成功

执行迁移后，运行以下SQL验证：

```sql
-- 1. 检查 users 表结构
DESCRIBE users;
-- 应该看到 trial_bk, trial_xinli, trial_fuplan 字段

-- 2. 检查产品配置
SELECT slug, name, trial_enabled, trial_count FROM products;
-- 应该看到 bk, xinli, fuplan 的 trial_enabled = 1, trial_count = 5

-- 3. 检查用户试用次数
SELECT id, username, trial_bk, trial_xinli, trial_fuplan FROM users LIMIT 5;
-- 所有用户应该有默认的5次试用机会

-- 4. 确认 trial_logs 表存在
SHOW TABLES LIKE 'trial_logs';
-- 应该返回 trial_logs 表
```

---

## 测试试用功能

### 前端测试

1. 启动Web应用
```bash
cd apps\web
pnpm dev
```

2. 访问 http://localhost:3000

3. 检查以下功能：
   - [ ] 产品卡片显示"可试用5次"标签
   - [ ] 产品详情页显示"免费试用"按钮
   - [ ] 会员中心显示试用次数统计
   - [ ] 点击试用按钮能正常跳转到产品页面
   - [ ] 试用次数正确扣减

### API测试

使用Postman或curl测试API：

```bash
# 1. 登录获取token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"testuser\",\"password\":\"password\"}"

# 2. 获取试用状态
curl http://localhost:3000/api/products/trial/bk \
  -H "Cookie: token=YOUR_TOKEN_HERE"

# 3. 使用试用
curl -X POST http://localhost:3000/api/products/trial/bk \
  -H "Cookie: token=YOUR_TOKEN_HERE"
```

---

## 常见问题

### Q1: MySQL服务启动失败
**解决方案**：
- 检查端口3306是否被占用：`netstat -ano | findstr :3306`
- 查看MySQL错误日志（通常在MySQL安装目录的data文件夹）
- 尝试重新安装MySQL服务

### Q2: 迁移脚本执行失败
**解决方案**：
- 确认已连接到正确的数据库（member_system）
- 检查MySQL用户权限（需要ALTER和CREATE权限）
- 查看具体错误信息，可能是字段已存在

### Q3: 前端不显示试用按钮
**解决方案**：
- 清除浏览器缓存
- 重启开发服务器
- 检查浏览器控制台是否有错误
- 确认用户已登录

### Q4: 试用次数不扣减
**解决方案**：
- 检查API响应是否成功
- 查看数据库中用户的试用次数是否更新
- 检查 trial_logs 表是否有记录

---

## 技术支持

如果遇到问题，请检查：
1. MySQL服务是否正在运行
2. 数据库连接配置是否正确（apps/web/.env）
3. 迁移脚本是否完全执行成功
4. 浏览器控制台和服务器日志中的错误信息

---

## 完成后的效果

迁移成功后，用户将能够：
- 每个产品获得5次免费试用机会
- 在产品页面看到试用次数提示
- 点击试用按钮直接访问产品
- 试用次数独立计算（bk、xinli、fuplan各5次）
- 系统自动记录试用历史

**无需修改任何代码，试用功能立即可用！**
