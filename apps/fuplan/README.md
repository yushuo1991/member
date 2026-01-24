# 宇硕复盘系统 (Fuplan)

基于市场情绪周期理论的股票交易复盘分析系统，从React+Vite+Supabase迁移到Next.js 14 App Router + MySQL。

## 🚀 快速开始

### 开发环境

```bash
# 从项目根目录运行
npm run dev:fuplan

# 或者进入应用目录
cd apps/fuplan
npm run dev
```

访问：http://localhost:3002

### 构建生产版本

```bash
npm run build
npm run start
```

## 📁 项目结构

```
apps/fuplan/
├── src/
│   ├── app/              # Next.js 14 App Router
│   │   ├── dashboard/    # 用户仪表盘
│   │   ├── review/       # 复盘系统主页面
│   │   ├── api/          # API路由
│   │   │   └── reviews/  # 复盘记录API
│   │   ├── layout.tsx    # 根布局
│   │   ├── page.tsx      # 首页（重定向到dashboard）
│   │   └── globals.css   # 全局样式
│   ├── components/       # React组件
│   │   └── EmotionStageSelector.tsx  # 情绪阶段选择器（含音效）
│   ├── lib/              # 工具函数
│   ├── types/            # TypeScript类型定义
│   │   └── review.ts     # 复盘系统类型
│   └── ...
├── public/
│   └── audio/            # 音效文件
│       ├── 混沌期.mp3
│       ├── 主升期.mp3
│       ├── 盘顶期.mp3
│       └── 退潮期.mp3
├── database-migration.sql  # 数据库迁移SQL
├── package.json
├── next.config.js
├── tsconfig.json
└── tailwind.config.js
```

## 🔄 迁移说明

### 从Supabase迁移到MySQL

原系统使用Supabase作为后端（PostgreSQL + Edge Functions + Auth），新系统迁移到：

- **数据库**: MySQL（复用主系统的member_system数据库）
- **认证**: @repo/auth（JWT认证，替代Supabase Auth）
- **API**: Next.js API Routes（替代Supabase Edge Functions）

### 数据库迁移

执行`database-migration.sql`创建以下表：

1. **review_records** - 复盘记录主表
2. **trading_records** - 交易记录子表

关键变更：
- Supabase UUID → MySQL VARCHAR(36)
- Supabase user_id (uuid) → MySQL user_id (int)
- JSONB → JSON
- RLS策略 → 应用层权限控制

### 架构变更

| 功能 | 原系统 (React+Vite) | 新系统 (Next.js 14) |
|------|---------------------|---------------------|
| 路由 | React Router | Next.js App Router |
| 认证 | Supabase Auth (昵称转伪邮箱) | JWT (@repo/auth) |
| 数据库 | Supabase PostgreSQL | MySQL 8.0 |
| 状态管理 | React Context | React Server Components + Client Components |
| 音效播放 | HTML5 Audio | HTML5 Audio (保留) |
| 样式 | Tailwind CSS | Tailwind CSS (保留) |

## 🎨 核心功能

### 1. 情绪周期判断

四个阶段的市场情绪分析：

- **混沌期** - 市场方向不明，个股分化（橙色主题，风声音效）
- **主升期** - 情绪高涨，赚钱效应扩散（红色主题，火焰音效）
- **盘顶期** - 情绪亢奋，分歧加剧（蓝色主题，波纹音效）
- **退潮期** - 情绪退潮，赚钱效应消失（绿色主题，雨滴音效）

每个阶段选择时会：
- 播放对应音效
- 切换主题颜色
- 显示阶段说明

### 2. 复盘表单

六大模块：
1. 市场多空判断
2. 情绪阶段选择
3. 板块节奏分析
4. 策略方法记录
5. 执行计划制定
6. 交易记录回顾

### 3. 数据可视化

- 泳道图展示板块轮动
- 情绪周期曲线
- 交易统计图表

## 🔌 集成共享包

### @repo/auth

```typescript
import { verifyAuth } from '@repo/auth';

// 在API路由中验证用户
export async function GET(request: NextRequest) {
  const authResult = await verifyAuth(request);
  if (!authResult.authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // ...
}
```

### @repo/database

```typescript
import { MemberDatabase } from '@repo/database';

const db = MemberDatabase.getInstance();
const [reviews] = await db.pool.execute(
  'SELECT * FROM review_records WHERE user_id = ?',
  [userId]
);
```

### @repo/ui

复用主系统的UI组件（按钮、卡片、表单等）。

## 🎯 下一步开发

### 待完成功能

- [ ] 实现完整的表单状态管理
- [ ] 连接MySQL数据库API
- [ ] 实现自动保存功能
- [ ] 添加历史记录查看页面
- [ ] 实现导出为图片功能（html2canvas）
- [ ] 添加数据可视化图表
- [ ] 实现管理员查看所有用户复盘的功能

### API端点设计

```
GET    /api/reviews          # 获取当前用户的复盘列表
GET    /api/reviews/[id]     # 获取单条复盘记录
POST   /api/reviews          # 创建新复盘
PUT    /api/reviews/[id]     # 更新复盘
DELETE /api/reviews/[id]     # 删除复盘

GET    /api/admin/reviews    # 管理员查看所有复盘
```

## 🔧 配置

### 环境变量

复制`.env.example`到`.env.local`：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=member_system

JWT_SECRET=your_jwt_secret
APP_PORT=3002
```

### 端口配置

- 开发端口：3002（避免与其他应用冲突）
- 主系统web：3000
- bk系统：3001
- xinli系统：3003

## 📝 开发注意事项

1. **音效文件**：音效文件位于`public/audio/`，由HTML5 Audio API播放
2. **情绪主题色**：四个阶段的颜色定义在`tailwind.config.js`和`globals.css`
3. **类型定义**：所有复盘相关类型定义在`src/types/review.ts`
4. **数据库Schema**：查看`database-migration.sql`了解表结构

## 🎨 设计系统

沿用Apple风格设计：
- 大圆角卡片（rounded-3xl）
- 毛玻璃效果（backdrop-blur）
- 柔和阴影（shadow-[0_2px_20px_rgba(0,0,0,0.04)]）
- 流畅过渡动画（transition-all duration-300）

## 📦 依赖说明

核心依赖：
- `next` - Next.js框架
- `react` - React库
- `html2canvas` - 导出图片功能
- `date-fns` - 日期处理
- `zod` - 表单验证

## 🚢 部署

Fuplan作为Monorepo的一部分，与其他应用一起部署：

```bash
# 从根目录构建所有应用
npm run build

# PM2管理（参考ecosystem.config.monorepo.js）
pm2 start ecosystem.config.monorepo.js
```

## 📄 许可证

Private - 宇硕短线会员系统内部应用
