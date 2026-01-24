# BK板块节奏系统

宇硕短线板块节奏系统 - 涨停板追踪与板块轮动分析

## 功能特性

- **涨停板追踪** - 实时追踪涨停板股票，按板块分类展示
- **7日数据统计** - 展示近7个交易日的涨停板数据和统计
- **板块轮动分析** - 分析板块资金流向和轮动趋势
- **连板个股梯队** - 显示2板以上的连板股票梯队
- **K线图和分时图** - 提供个股K线图和分时图查看
- **移动端适配** - 完整的移动端响应式设计

## 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **UI**: React 18, Tailwind CSS
- **图表**: Recharts
- **数据库**: MySQL 8.0
- **API**: Tushare API (交易日历和行情数据)

## 开发命令

```bash
# 安装依赖
pnpm install

# 开发服务器 (端口3002)
pnpm dev

# 生产构建
pnpm build

# 启动生产服务器
pnpm start

# 类型检查
pnpm type-check

# 代码检查
pnpm lint
```

## 环境配置

复制 `.env.example` 到 `.env` 并配置:

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=stock_tracker

# Tushare API Token
TUSHARE_TOKEN=your_tushare_token

# 定时任务认证
SCHEDULER_TOKEN=your_secure_token

# 应用配置
PORT=3002
```

## 数据库初始化

```bash
mysql -u root -p < database-init.sql
```

## 核心架构

### 数据流程

1. **数据获取** - 从外部API获取涨停板数据
2. **交易日历** - 使用Tushare API获取实际交易日
3. **性能计算** - 计算后续5个交易日的表现
4. **7日聚合** - 统一数据处理器处理7天数据
5. **三层缓存** - MySQL表缓存、内存缓存、交易日历缓存
6. **前端展示** - 交互式图表和模态框展示

### 关键文件

- `src/lib/database.ts` - 数据库连接池（使用@repo/database）
- `src/lib/enhanced-trading-calendar.ts` - 交易日历管理
- `src/lib/unified-data-processor.ts` - 统一数据处理器
- `src/components/StockTracker.tsx` - 主UI组件
- `src/app/api/stocks/route.ts` - 主数据API

### API路由

- `GET /api/stocks?mode=7days` - 获取7天数据
- `GET /api/data-status` - 数据可用性状态
- `POST /api/cron` - 触发数据缓存任务
- `GET /api/clear-cache` - 清除数据库缓存
- `GET/POST /api/minute-snapshot` - 分时图快照

## 共享包依赖

- `@repo/database` - 共享MySQL连接池
- `@repo/utils` - 通用工具函数
- `@repo/ui` - 共享UI组件（可选）

## 时区注意事项

- 所有日期使用北京时间 (+08:00)
- 交易时间: 09:30-15:00
- 数据更新时间: 16:00后（市场数据处理需要约1小时）

## 股票代码格式

- 使用6位代码格式: `600000`, `000001`
- 不要使用7位格式: `SH600000`, `SZ000001`

## 部署

作为Monorepo的一部分，通过根目录的GitHub Actions自动部署:

```bash
# 在根目录
git add .
git commit -m "feat(bk): update features"
git push origin main
```

## 许可证

专有软件 - 宇硕短线
