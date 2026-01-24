# BK板块节奏系统 - 快速启动指南

## 快速开始

### 1. 安装依赖

```bash
# 在项目根目录
cd C:\Users\yushu\Desktop\我的会员体系
pnpm install
```

### 2. 配置环境变量

```bash
# 复制环境变量模板
cd apps/bk
copy .env.example .env

# 编辑.env文件，配置数据库和Tushare API
```

### 3. 初始化数据库

```bash
# 使用MySQL命令行
mysql -u root -p

# 创建数据库
CREATE DATABASE IF NOT EXISTS stock_tracker DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 执行初始化脚本
USE stock_tracker;
source apps/bk/database-init.sql;
```

### 4. 启动开发服务器

```bash
# 在apps/bk目录
cd apps/bk
pnpm dev

# 或在根目录使用turbo
cd ../..
turbo dev --filter=bk
```

### 5. 访问应用

打开浏览器访问: **http://localhost:3002**

## 常用命令

### 开发

```bash
pnpm dev          # 启动开发服务器（端口3002）
pnpm build        # 生产构建
pnpm start        # 启动生产服务器
pnpm lint         # 代码检查
pnpm type-check   # 类型检查
```

### 数据库管理

```bash
# 清除缓存（通过API）
curl -X POST http://localhost:3002/api/clear-cache?type=all

# 触发定时任务
curl -X POST http://localhost:3002/api/cron \
  -H "Authorization: Bearer your_scheduler_token"

# 查看数据状态
curl http://localhost:3002/api/data-status
```

## 目录结构

```
apps/bk/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/          # API路由
│   │   ├── layout.tsx    # 根布局
│   │   └── page.tsx      # 主页
│   ├── components/       # UI组件
│   ├── lib/              # 工具库
│   ├── types/            # 类型定义
│   └── hooks/            # React Hooks
├── public/               # 静态资源
├── scripts/              # 构建脚本
└── database-init.sql     # 数据库初始化
```

## 环境变量说明

```env
# 数据库配置（必需）
DB_HOST=localhost          # 数据库主机
DB_PORT=3306               # 数据库端口
DB_USER=root               # 数据库用户
DB_PASSWORD=your_password  # 数据库密码
DB_NAME=stock_tracker      # 数据库名称

# Tushare API（必需）
TUSHARE_TOKEN=your_token   # Tushare API Token

# 定时任务认证（可选）
SCHEDULER_TOKEN=secure_token

# 应用配置
PORT=3002                  # 应用端口
```

## 核心功能

1. **涨停板追踪** - 追踪每日涨停板股票
2. **7日数据统计** - 展示近7个交易日的数据
3. **板块轮动分析** - 分析板块资金流向
4. **连板个股梯队** - 显示连板股票
5. **K线图** - 个股K线图查看
6. **分时图** - 实时和历史分时图

## API端点

- `GET /api/stocks?mode=7days` - 获取7天数据
- `POST /api/cron` - 触发缓存任务
- `POST /api/clear-cache` - 清除缓存
- `GET /api/data-status` - 数据状态
- `GET /api/minute-snapshot` - 分时图快照

## 故障排除

### 数据库连接失败

检查：
1. MySQL服务是否运行
2. .env中的数据库配置是否正确
3. stock_tracker数据库是否存在

### 页面加载失败

检查：
1. 开发服务器是否正常运行
2. 端口3002是否被占用
3. 浏览器控制台是否有错误

### API返回错误

检查：
1. Tushare Token是否配置正确
2. 数据库表是否初始化完成
3. 查看服务器日志

## 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **UI**: React 18, Tailwind CSS
- **图表**: Recharts
- **数据库**: MySQL 8.0
- **API**: Tushare API

## 共享包

- `@repo/database` - MySQL连接池
- `@repo/ui` - UI组件库（可选）
- `@repo/auth` - 认证模块（可选）

## 相关文档

- 详细文档: `README.md`
- 迁移报告: `MIGRATION-REPORT.md`
- 原始文档: `../../temp_bk_repo/CLAUDE.md`

## 获取帮助

如有问题，请查看：
1. `MIGRATION-REPORT.md` - 已知问题列表
2. `README.md` - 完整文档
3. 原始项目文档

---

**端口**: 3002
**数据库**: stock_tracker
**访问**: http://localhost:3002
