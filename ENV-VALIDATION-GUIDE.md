# 环境变量验证指南

## 概述

本项目包含一个自动化的环境变量验证工具，用于确保所有应用的环境配置正确完整。

## 文件结构

```
我的会员体系/
├── scripts/
│   └── validate-env.js          # 环境变量验证脚本
├── apps/
│   ├── web/
│   │   └── .env.example         # Web应用环境变量模板
│   ├── bk/
│   │   └── .env.example         # BK应用环境变量模板
│   ├── fuplan/
│   │   └── .env.example         # Fuplan应用环境变量模板
│   └── xinli/
│       └── .env.example         # Xinli应用环境变量模板
└── package.json                 # 包含验证脚本命令
```

## 验证脚本功能

### 主要功能

1. **检查 .env.example 文件存在性** - 确保每个应用都有环境变量模板
2. **检查 .env 文件存在性** - 确保每个应用都有实际的环境配置
3. **验证必需环境变量** - 检查所有必需的环境变量是否已配置
4. **检测空值** - 识别已定义但为空的环境变量
5. **检测占位符** - 识别未替换的占位符值（如 `your_password`）
6. **隐藏敏感信息** - 在输出中自动隐藏密码、密钥等敏感信息
7. **彩色输出** - 使用颜色区分成功、警告和错误信息

### 验证规则

#### Web 应用 (apps/web)
**必需环境变量:**
- `DB_HOST` - 数据库主机地址
- `DB_PORT` - 数据库端口
- `DB_USER` - 数据库用户名
- `DB_PASSWORD` - 数据库密码
- `DB_NAME` - 数据库名称 (member_system)
- `JWT_SECRET` - JWT密钥
- `JWT_EXPIRES_IN` - JWT过期时间
- `NODE_ENV` - 运行环境
- `APP_URL` - 应用URL
- `PORT` - 应用端口 (3000)

#### BK 应用 (apps/bk)
**必需环境变量:**
- `DB_HOST` - 数据库主机地址
- `DB_PORT` - 数据库端口
- `DB_USER` - 数据库用户名
- `DB_PASSWORD` - 数据库密码
- `DB_NAME` - 数据库名称 (bk_system)
- `TUSHARE_TOKEN` - Tushare API Token
- `SCHEDULER_TOKEN` - 定时任务认证Token
- `PORT` - 应用端口 (3001)

**可选环境变量:**
- `NEXT_PUBLIC_APP_VERSION` - 应用版本号
- `DB_DISABLE` - 数据库禁用标志（调试用）

#### Fuplan 应用 (apps/fuplan)
**必需环境变量:**
- `DB_HOST` - 数据库主机地址
- `DB_PORT` - 数据库端口
- `DB_USER` - 数据库用户名
- `DB_PASSWORD` - 数据库密码
- `DB_NAME` - 数据库名称 (fuplan_system)
- `JWT_SECRET` - JWT密钥
- `JWT_EXPIRES_IN` - JWT过期时间
- `NODE_ENV` - 运行环境
- `PORT` - 应用端口 (3002)

#### Xinli 应用 (apps/xinli)
**必需环境变量:**
- `DB_HOST` - 数据库主机地址
- `DB_PORT` - 数据库端口
- `DB_USER` - 数据库用户名
- `DB_PASSWORD` - 数据库密码
- `DB_NAME` - 数据库名称 (xinli_system)
- `JWT_SECRET` - JWT密钥
- `JWT_EXPIRES_IN` - JWT过期时间
- `NODE_ENV` - 运行环境
- `PORT` - 应用端口 (3003)

## 使用方法

### 1. 验证所有应用

```bash
# 使用 npm/pnpm 脚本
pnpm validate-env

# 或直接运行脚本
node scripts/validate-env.js
```

**输出示例:**
```
╔════════════════════════════════════════════════════════════╗
║          宇硕会员体系 - 环境变量验证工具                  ║
╚════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
检查应用: 会员管理系统 (Web)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ .env.example 文件存在
✓ .env 文件存在

必需环境变量:
  ✓ 已配置 (10/10):
    - DB_HOST = localhost
    - DB_PORT = 3306
    - DB_USER = root
    - DB_PASSWORD = ***word
    - DB_NAME = member_system
    - JWT_SECRET = ***cret
    - JWT_EXPIRES_IN = 7d
    - NODE_ENV = development
    - APP_URL = http://localhost:3000
    - PORT = 3000

╔════════════════════════════════════════════════════════════╗
║                        验证总结                            ║
╚════════════════════════════════════════════════════════════╝
  ✓ 通过 - 会员管理系统 (Web) (web)
  ✗ 失败 - 板块节奏系统 (BK) (bk)
  ✗ 失败 - 复盘系统 (Fuplan) (fuplan)
  ✗ 失败 - 心理测评系统 (Xinli) (xinli)

总计: 1/4 应用配置正确
```

### 2. 验证单个应用

```bash
# 验证 web 应用
pnpm validate-env:web
# 或
node scripts/validate-env.js web

# 验证 bk 应用
pnpm validate-env:bk
# 或
node scripts/validate-env.js bk

# 验证 fuplan 应用
pnpm validate-env:fuplan
# 或
node scripts/validate-env.js fuplan

# 验证 xinli 应用
pnpm validate-env:xinli
# 或
node scripts/validate-env.js xinli
```

### 3. 在 CI/CD 中使用

可以在部署前自动验证环境变量:

```bash
# 在部署脚本中添加
pnpm validate-env || exit 1
```

## 配置新应用

### 步骤 1: 创建 .env.example 文件

在应用目录下创建 `.env.example` 文件，包含所有必需的环境变量及其说明:

```bash
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=your_database_name

# JWT 配置
JWT_SECRET=your_jwt_secret_key_change_this_to_a_random_string
JWT_EXPIRES_IN=7d

# 应用配置
NODE_ENV=development
PORT=3000
```

### 步骤 2: 复制并配置 .env 文件

```bash
# 复制模板文件
cp apps/web/.env.example apps/web/.env

# 编辑 .env 文件，替换所有占位符
nano apps/web/.env
```

### 步骤 3: 运行验证

```bash
pnpm validate-env:web
```

## 常见问题

### Q1: 验证失败 - 缺少 .env 文件

**错误信息:**
```
✗ 错误: 缺少 .env 文件
  路径: C:\Users\...\apps\bk\.env
  请复制 .env.example 并配置环境变量
```

**解决方法:**
```bash
# 复制 .env.example 为 .env
cp apps/bk/.env.example apps/bk/.env

# 编辑 .env 文件，填入正确的配置值
```

### Q2: 验证失败 - 环境变量为空

**错误信息:**
```
✗ 为空 (2):
  - DB_PASSWORD
  - JWT_SECRET
```

**解决方法:**
打开 `.env` 文件，为这些变量设置实际的值:
```bash
DB_PASSWORD=your_actual_password
JWT_SECRET=your_actual_jwt_secret
```

### Q3: 验证失败 - 使用占位符

**错误信息:**
```
✗ 使用占位符 (1):
  - TUSHARE_TOKEN = your_tushare_token_here
```

**解决方法:**
将占位符替换为实际的值:
```bash
TUSHARE_TOKEN=actual_token_from_tushare_pro
```

### Q4: 如何生成安全的 JWT_SECRET?

使用以下命令生成随机密钥:

```bash
# 使用 Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 使用 OpenSSL
openssl rand -hex 32

# 使用 PowerShell (Windows)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

## 最佳实践

### 1. 环境变量命名规范

- 使用大写字母和下划线
- 使用描述性名称
- 分组相关变量（如 `DB_*`, `JWT_*`）

### 2. 安全性

- **永远不要提交 .env 文件到 Git**
- 在 `.gitignore` 中添加 `.env`
- 使用强密码和随机密钥
- 定期轮换敏感凭证

### 3. 文档化

- 在 `.env.example` 中添加注释说明
- 记录每个变量的用途和格式
- 提供示例值（非敏感信息）

### 4. 开发流程

```bash
# 1. 克隆项目后
git clone <repository>
cd 我的会员体系

# 2. 安装依赖
pnpm install

# 3. 配置环境变量
cp apps/web/.env.example apps/web/.env
cp apps/bk/.env.example apps/bk/.env
cp apps/fuplan/.env.example apps/fuplan/.env
cp apps/xinli/.env.example apps/xinli/.env

# 4. 编辑 .env 文件
# 使用你喜欢的编辑器编辑每个 .env 文件

# 5. 验证配置
pnpm validate-env

# 6. 启动开发服务器
pnpm dev:all
```

## 脚本维护

### 添加新的环境变量

编辑 `scripts/validate-env.js`，在 `APP_ENV_REQUIREMENTS` 对象中添加新的变量:

```javascript
const APP_ENV_REQUIREMENTS = {
  web: {
    name: '会员管理系统 (Web)',
    required: [
      'DB_HOST',
      'DB_PORT',
      // ... 现有变量
      'NEW_VARIABLE',  // 添加新变量
    ],
    optional: []
  },
  // ...
};
```

### 添加新的应用

1. 在 `APP_ENV_REQUIREMENTS` 中添加新应用配置
2. 创建 `apps/newapp/.env.example` 文件
3. 在 `package.json` 中添加验证命令:

```json
{
  "scripts": {
    "validate-env:newapp": "node scripts/validate-env.js newapp"
  }
}
```

## 退出代码

脚本使用标准退出代码:

- `0` - 所有验证通过
- `1` - 验证失败或错误

这使得脚本可以在 CI/CD 管道中使用:

```bash
pnpm validate-env && pnpm build || exit 1
```

## 相关文件

- `C:\Users\yushu\Desktop\我的会员体系\scripts\validate-env.js` - 验证脚本
- `C:\Users\yushu\Desktop\我的会员体系\apps\web\.env.example` - Web应用模板
- `C:\Users\yushu\Desktop\我的会员体系\apps\bk\.env.example` - BK应用模板
- `C:\Users\yushu\Desktop\我的会员体系\apps\fuplan\.env.example` - Fuplan应用模板
- `C:\Users\yushu\Desktop\我的会员体系\apps\xinli\.env.example` - Xinli应用模板
- `C:\Users\yushu\Desktop\我的会员体系\package.json` - 包含验证命令

## 技术细节

### 脚本特性

- **解析 .env 文件**: 支持注释、空行、引号
- **占位符检测**: 识别 `your_*`, `your-*`, `change_me` 等模式
- **敏感信息隐藏**: 自动隐藏包含 PASSWORD、SECRET、TOKEN 的值
- **彩色输出**: 使用 ANSI 颜色代码提高可读性
- **详细报告**: 提供缺失、为空、占位符的详细列表

### 依赖

脚本使用 Node.js 内置模块，无需额外依赖:
- `fs` - 文件系统操作
- `path` - 路径处理

## 更新日志

### 2026-02-06
- 创建环境变量验证脚本
- 为所有应用创建/更新 .env.example 文件
- 在 package.json 中添加验证命令
- 创建完整的使用文档
