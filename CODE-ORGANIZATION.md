# Monorepo代码组织最佳实践

**版本：** v1.0
**适用项目：** 宇硕会员体系Monorepo

---

## 目录结构规范

### 完整目录树

```
member-system-monorepo/
│
├── apps/                           # 应用层（独立部署的应用）
│   ├── web/                        # 会员系统主应用
│   │   ├── src/
│   │   │   ├── app/                # Next.js 14 App Router
│   │   │   │   ├── (auth)/         # 路由组：认证相关
│   │   │   │   │   ├── login/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── register/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── layout.tsx
│   │   │   │   ├── (member)/       # 路由组：会员功能
│   │   │   │   │   ├── member/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── upgrade/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── layout.tsx
│   │   │   │   ├── admin/          # 管理后台
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── codes/
│   │   │   │   │   └── members/
│   │   │   │   ├── api/            # API路由
│   │   │   │   │   ├── auth/
│   │   │   │   │   │   ├── login/route.ts
│   │   │   │   │   │   ├── register/route.ts
│   │   │   │   │   │   └── me/route.ts
│   │   │   │   │   ├── gate/
│   │   │   │   │   │   └── [slug]/route.ts
│   │   │   │   │   └── activation/
│   │   │   │   ├── page.tsx        # 首页
│   │   │   │   ├── layout.tsx      # 根布局
│   │   │   │   └── globals.css     # 全局样式
│   │   │   ├── components/         # Web专属组件
│   │   │   │   ├── MemberCard.tsx
│   │   │   │   ├── ProductGrid.tsx
│   │   │   │   └── UpgradeModal.tsx
│   │   │   └── lib/                # Web专属工具函数
│   │   │       ├── membership-levels.ts
│   │   │       └── trial-service.ts
│   │   ├── public/                 # 静态资源
│   │   │   ├── images/
│   │   │   └── favicon.ico
│   │   ├── .env.example
│   │   ├── next.config.js
│   │   ├── package.json
│   │   ├── tailwind.config.js
│   │   └── tsconfig.json
│   │
│   ├── bk/                         # 板块节奏系统
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── page.tsx        # 主页面（涨停板追踪）
│   │   │   │   ├── status/         # 系统状态页
│   │   │   │   ├── api/
│   │   │   │   │   ├── stocks/route.ts
│   │   │   │   │   ├── cron/route.ts
│   │   │   │   │   └── minute-snapshot/route.ts
│   │   │   │   └── layout.tsx
│   │   │   ├── components/
│   │   │   │   ├── StockTracker.tsx    # 主组件（3000+行）
│   │   │   │   ├── StockPremiumChart.tsx
│   │   │   │   └── MinuteChart.tsx
│   │   │   ├── lib/
│   │   │   │   ├── database.ts         # BK专用数据库（股票数据）
│   │   │   │   ├── enhanced-trading-calendar.ts
│   │   │   │   └── unified-data-processor.ts
│   │   │   └── types/
│   │   │       └── stock.ts            # 股票相关类型定义
│   │   ├── next.config.js
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── fuplan/                     # 复盘系统
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── page.tsx        # 复盘列表
│   │   │   │   ├── create/         # 创建复盘
│   │   │   │   ├── [id]/           # 复盘详情
│   │   │   │   ├── api/
│   │   │   │   │   ├── reviews/route.ts
│   │   │   │   │   └── trades/route.ts
│   │   │   │   └── layout.tsx
│   │   │   ├── components/
│   │   │   │   ├── ReviewForm.tsx
│   │   │   │   ├── TradeTable.tsx
│   │   │   │   └── EmotionChart.tsx
│   │   │   └── lib/
│   │   │       └── emotion-calculator.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── xinli/                      # 心理测评系统
│       ├── src/
│       │   ├── app/
│       │   │   ├── page.tsx        # 问卷主页面
│       │   │   ├── guide/          # 使用说明
│       │   │   ├── api/
│       │   │   │   └── export/route.ts
│       │   │   └── layout.tsx
│       │   ├── components/
│       │   │   ├── ScenarioCard.tsx
│       │   │   ├── ProgressBar.tsx
│       │   │   └── NavigationSidebar.tsx
│       │   └── data/
│       │       └── scenarios.ts    # 80个场景数据
│       ├── package.json
│       └── tsconfig.json
│
├── packages/                       # 共享包（内部依赖）
│   ├── ui/                         # UI组件库
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Button/
│   │   │   │   │   ├── Button.tsx
│   │   │   │   │   ├── Button.test.tsx
│   │   │   │   │   ├── Button.stories.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── Card/
│   │   │   │   │   ├── Card.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── Modal/
│   │   │   │   ├── Input/
│   │   │   │   ├── Select/
│   │   │   │   ├── Table/
│   │   │   │   └── index.ts        # 导出所有组件
│   │   │   ├── hooks/              # 共享React Hooks
│   │   │   │   ├── useLocalStorage.ts
│   │   │   │   ├── useDebounce.ts
│   │   │   │   └── index.ts
│   │   │   ├── styles/
│   │   │   │   └── globals.css     # 共享基础样式
│   │   │   └── index.ts            # 包入口
│   │   ├── package.json
│   │   ├── tailwind.config.js      # UI库专用配置
│   │   └── tsconfig.json
│   │
│   ├── auth/                       # 认证模块
│   │   ├── src/
│   │   │   ├── jwt.ts              # JWT工具函数
│   │   │   ├── middleware.ts       # Next.js中间件
│   │   │   ├── bcrypt.ts           # 密码加密
│   │   │   ├── rate-limiter.ts     # 限流器
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── database/                   # 数据库连接
│   │   ├── src/
│   │   │   ├── connection.ts       # 连接池单例
│   │   │   ├── migrations/         # 数据库迁移脚本
│   │   │   │   ├── 001_init.sql
│   │   │   │   ├── 002_add_trials.sql
│   │   │   │   └── run.ts
│   │   │   ├── repositories/       # 数据访问层
│   │   │   │   ├── UserRepository.ts
│   │   │   │   ├── ProductRepository.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── config/                     # 共享配置
│   │   ├── eslint.config.js        # ESLint配置
│   │   ├── tailwind.config.js      # Tailwind基础配置
│   │   ├── tsconfig.base.json      # TypeScript基础配置
│   │   └── package.json
│   │
│   └── utils/                      # 工具函数库
│       ├── src/
│       │   ├── date.ts             # 日期处理
│       │   ├── format.ts           # 格式化函数
│       │   ├── validation.ts       # 数据验证
│       │   ├── constants.ts        # 常量定义
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
│
├── .github/
│   ├── workflows/
│   │   ├── deploy-monorepo.yml     # 主部署流程
│   │   ├── lint.yml                # 代码检查
│   │   └── test.yml                # 自动化测试
│   └── ISSUE_TEMPLATE/
│
├── scripts/                        # 根级脚本
│   ├── setup.sh                    # 初始化脚本
│   ├── deploy.js                   # 部署脚本
│   ├── migrate-data.js             # 数据迁移
│   └── generate-component.js       # 组件生成器
│
├── docs/                           # 文档
│   ├── ARCHITECTURE.md             # 架构说明
│   ├── API.md                      # API文档
│   ├── DEPLOYMENT.md               # 部署指南
│   └── CONTRIBUTING.md             # 贡献指南
│
├── .env.example                    # 环境变量模板
├── .gitignore
├── package.json                    # 根package.json (workspaces配置)
├── pnpm-workspace.yaml             # pnpm workspaces配置
├── turbo.json                      # Turborepo配置
├── README.md
└── CHANGELOG.md
```

---

## 命名约定

### 文件命名

| 类型 | 约定 | 示例 |
|------|------|------|
| React组件 | PascalCase | `Button.tsx`, `UserProfile.tsx` |
| 工具函数 | camelCase | `formatDate.ts`, `validateEmail.ts` |
| 类型定义 | PascalCase | `User.ts`, `ApiResponse.ts` |
| 常量 | UPPER_SNAKE_CASE | `API_BASE_URL.ts` |
| 配置文件 | kebab-case | `next.config.js`, `ecosystem.config.js` |
| 测试文件 | `*.test.tsx` | `Button.test.tsx` |
| Storybook | `*.stories.tsx` | `Button.stories.tsx` |

### 变量命名

```typescript
// ✅ 好的命名
const userList = await fetchUsers();
const isAuthenticated = checkAuth();
const handleSubmit = () => { };

// ❌ 不好的命名
const data = await fetchUsers();      // 太模糊
const flag = checkAuth();             // 含义不明
const onClick = () => { };            // 不够具体
```

### 函数命名

```typescript
// ✅ 动词开头，清晰表达意图
function getUserById(id: number) { }
function validateEmail(email: string) { }
function calculateTotalPrice(items: Item[]) { }

// ❌ 名词开头，不够明确
function user(id: number) { }
function email(value: string) { }
```

---

## 导入导出规范

### 包导入顺序

```typescript
// 1. 外部依赖（第三方库）
import React, { useState, useEffect } from 'react';
import { NextRequest, NextResponse } from 'next/server';

// 2. 内部workspace包
import { Button, Card } from '@yushuo/ui';
import { authMiddleware } from '@yushuo/auth';
import { Database } from '@yushuo/database';

// 3. 相对路径导入（同一app内）
import { MemberCard } from '@/components/MemberCard';
import { formatDate } from '@/lib/utils';
import type { User } from '@/types/user';

// 4. 样式和资源
import './styles.css';
```

### 导出规范

**命名导出（推荐）：**

```typescript
// ✅ 组件库包 - 使用命名导出
// packages/ui/src/components/Button/Button.tsx
export function Button({ ... }) { }

// packages/ui/src/components/Button/index.ts
export { Button } from './Button';
export type { ButtonProps } from './Button';

// packages/ui/src/index.ts
export { Button } from './components/Button';
export { Card } from './components/Card';
```

**默认导出（仅用于页面组件）：**

```typescript
// ✅ Next.js页面 - 使用默认导出
// apps/web/src/app/page.tsx
export default function HomePage() { }

// ❌ 不要在packages中使用默认导出
export default { Button, Card };  // 不推荐
```

---

## 组件组织规范

### 组件文件结构

```typescript
// Button/Button.tsx

// 1. 导入
import React from 'react';
import { clsx } from 'clsx';

// 2. 类型定义
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

// 3. 私有组件（如果有）
const LoadingSpinner = () => (
  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
    {/* ... */}
  </svg>
);

// 4. 主组件
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className,
  ...props
}) => {
  const variantClasses = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    danger: 'bg-red-500 hover:bg-red-600 text-white'
  };

  const sizeClasses = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={clsx(
        'rounded-lg font-medium transition-colors',
        variantClasses[variant],
        sizeClasses[size],
        loading && 'opacity-70 cursor-not-allowed',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <LoadingSpinner />}
      {children}
    </button>
  );
};

// 5. 显示名称（便于调试）
Button.displayName = 'Button';
```

### 页面组件结构

```typescript
// apps/web/src/app/member/page.tsx

'use client';  // 如果需要客户端功能

// 1. 导入
import { useState, useEffect } from 'react';
import { Button, Card } from '@yushuo/ui';
import { MemberCard } from '@/components/MemberCard';

// 2. 类型定义
interface MemberData {
  username: string;
  membershipLevel: string;
  expiry: Date | null;
}

// 3. 页面组件
export default function MemberPage() {
  // 3.1 状态
  const [memberData, setMemberData] = useState<MemberData | null>(null);
  const [loading, setLoading] = useState(true);

  // 3.2 副作用
  useEffect(() => {
    fetchMemberData();
  }, []);

  // 3.3 事件处理器
  const fetchMemberData = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      setMemberData(data);
    } catch (error) {
      console.error('Failed to fetch member data:', error);
    } finally {
      setLoading(false);
    }
  };

  // 3.4 渲染逻辑
  if (loading) {
    return <div>Loading...</div>;
  }

  if (!memberData) {
    return <div>Error loading member data</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6">会员中心</h1>
      <MemberCard data={memberData} />
    </div>
  );
}
```

---

## API路由规范

### RESTful API约定

| HTTP方法 | 路径 | 功能 | 示例 |
|---------|------|------|------|
| GET | `/api/users` | 获取列表 | 获取所有用户 |
| GET | `/api/users/:id` | 获取详情 | 获取ID为1的用户 |
| POST | `/api/users` | 创建资源 | 创建新用户 |
| PUT | `/api/users/:id` | 完整更新 | 更新用户所有字段 |
| PATCH | `/api/users/:id` | 部分更新 | 更新用户部分字段 |
| DELETE | `/api/users/:id` | 删除资源 | 删除用户 |

### API路由文件结构

```typescript
// apps/web/src/app/api/users/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@yushuo/auth';
import { Database } from '@yushuo/database';

// GET /api/users/:id - 获取用户详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. 验证认证
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. 参数验证
    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // 3. 业务逻辑
    const user = await Database.query(
      'SELECT id, username, email, membership_level FROM users WHERE id = ?',
      [userId]
    );

    if (user.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // 4. 返回响应
    return NextResponse.json({ data: user[0] });

  } catch (error) {
    console.error('GET /api/users/:id error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/users/:id - 更新用户
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(params.id);
    const body = await request.json();

    // 参数校验
    const allowedFields = ['username', 'email'];
    const updates: any = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // 构建SQL
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), userId];

    await Database.query(
      `UPDATE users SET ${fields} WHERE id = ?`,
      values
    );

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('PATCH /api/users/:id error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/users/:id - 删除用户
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // 实现删除逻辑
}
```

---

## TypeScript规范

### 类型定义位置

```typescript
// ✅ 在shared types包中定义跨应用类型
// packages/utils/src/types/user.ts
export interface User {
  id: number;
  username: string;
  email: string;
  membershipLevel: 'none' | 'monthly' | 'quarterly' | 'yearly' | 'lifetime';
  membershipExpiry: Date | null;
  createdAt: Date;
}

// ✅ 在app内定义该应用特有类型
// apps/bk/src/types/stock.ts
export interface Stock {
  stockCode: string;
  stockName: string;
  limitUpTime: string;
  amount: number;
}

// ❌ 不要在组件文件中定义可复用类型
```

### 类型导入导出

```typescript
// ✅ 使用 type 关键字导入类型（性能更好）
import type { User } from '@yushuo/utils/types';
import type { Stock } from '@/types/stock';

// ✅ 同时导入值和类型
import { Button, type ButtonProps } from '@yushuo/ui';

// ❌ 不推荐：混合导入
import { User, fetchUser } from './api';  // User是类型，fetchUser是函数
```

### 避免使用 any

```typescript
// ❌ 不好
function processData(data: any) {
  return data.map((item: any) => item.id);
}

// ✅ 好 - 使用泛型
function processData<T extends { id: number }>(data: T[]) {
  return data.map(item => item.id);
}

// ✅ 好 - 使用 unknown（如果真的不知道类型）
function parseJson(json: string): unknown {
  return JSON.parse(json);
}
```

---

## 环境变量管理

### 环境变量命名

```bash
# ✅ 好的命名（大写字母+下划线）
DB_HOST=localhost
DB_PORT=3306
JWT_SECRET=your_secret_key
NEXT_PUBLIC_API_URL=https://api.example.com

# ❌ 不好的命名
dbHost=localhost
next-public-api-url=https://api.example.com
```

### 环境变量文件

```
.env.local           # 本地开发（不提交）
.env.example         # 示例配置（提交到Git）
.env.production      # 生产环境（服务器）
```

### 访问环境变量

```typescript
// ✅ 后端API路由中访问（安全）
const dbHost = process.env.DB_HOST;
const jwtSecret = process.env.JWT_SECRET;

// ✅ 客户端访问（必须以 NEXT_PUBLIC_ 开头）
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// ❌ 不要在客户端访问私密变量
const jwtSecret = process.env.JWT_SECRET;  // 客户端无法访问
```

---

## 样式规范

### Tailwind CSS约定

```typescript
// ✅ 使用工具类，按类别排序
<div className="
  flex items-center justify-between    /* 布局 */
  px-4 py-2                             /* 间距 */
  bg-white rounded-lg shadow-md         /* 背景和装饰 */
  text-gray-800 font-medium             /* 文本 */
  hover:bg-gray-50 transition-colors    /* 交互 */
">

// ❌ 不要使用内联样式（除非动态值）
<div style={{ display: 'flex', padding: '1rem' }}>

// ✅ 动态样式使用 clsx/classnames
import clsx from 'clsx';

<button className={clsx(
  'px-4 py-2 rounded-lg',
  variant === 'primary' && 'bg-blue-500 text-white',
  variant === 'secondary' && 'bg-gray-200 text-gray-800',
  disabled && 'opacity-50 cursor-not-allowed'
)}>
```

### 全局样式

```css
/* apps/web/src/app/globals.css */

/* 1. Tailwind指令 */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* 2. 自定义基础样式 */
@layer base {
  html {
    @apply scroll-smooth;
  }

  body {
    @apply bg-gray-50 text-gray-900;
  }
}

/* 3. 自定义组件样式 */
@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600;
  }
}

/* 4. 自定义工具类 */
@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}
```

---

## 测试规范

### 测试文件位置

```
Button/
├── Button.tsx
├── Button.test.tsx        # 单元测试（放在组件旁边）
└── Button.stories.tsx     # Storybook故事
```

### 测试用例结构

```typescript
// Button.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  // 1. 基础渲染测试
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  // 2. Props测试
  it('applies variant classes', () => {
    render(<Button variant="primary">Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-blue-500');
  });

  // 3. 交互测试
  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  // 4. 边界情况测试
  it('disables button when loading', () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

---

## Git Commit规范

### Commit Message格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type类型

| Type | 说明 | 示例 |
|------|------|------|
| feat | 新功能 | `feat(auth): add JWT authentication` |
| fix | Bug修复 | `fix(ui): button hover state` |
| docs | 文档更新 | `docs: update README` |
| style | 代码格式 | `style: format code with prettier` |
| refactor | 重构 | `refactor(database): simplify query logic` |
| perf | 性能优化 | `perf(api): add caching layer` |
| test | 测试 | `test(ui): add Button tests` |
| chore | 构建/工具 | `chore: update dependencies` |

### 示例

```bash
# 单行简单提交
git commit -m "feat(web): add membership upgrade modal"

# 多行详细提交
git commit -m "fix(bk): resolve stock data caching issue

- Clear cache when data is older than 2 hours
- Add error handling for failed cache writes
- Update tests to cover new cache logic

Closes #123"
```

---

## 性能最佳实践

### 1. 代码分割

```typescript
// ✅ 动态导入大型组件
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <div>Loading chart...</div>,
  ssr: false  // 如果不需要SSR
});
```

### 2. 图片优化

```typescript
import Image from 'next/image';

// ✅ 使用Next.js Image组件
<Image
  src="/hero.jpg"
  width={1200}
  height={600}
  alt="Hero image"
  priority  // 首屏图片
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

### 3. 数据库查询优化

```typescript
// ❌ N+1查询问题
for (const user of users) {
  const orders = await db.query('SELECT * FROM orders WHERE user_id = ?', [user.id]);
}

// ✅ 使用JOIN一次查询
const usersWithOrders = await db.query(`
  SELECT users.*, orders.*
  FROM users
  LEFT JOIN orders ON orders.user_id = users.id
`);
```

### 4. API响应缓存

```typescript
export async function GET() {
  const data = await fetchStockData();

  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
    }
  });
}
```

---

## 常见陷阱与解决方案

### 陷阱1：循环依赖

```typescript
// ❌ 不好：packages/auth 依赖 packages/database
//         packages/database 依赖 packages/auth

// ✅ 好：创建 packages/types 存放共享类型
//        让 auth 和 database 都依赖 types
```

### 陷阱2：过度抽象

```typescript
// ❌ 不好：为一个简单按钮创建10个配置选项
interface ButtonProps {
  variant?: 'primary' | 'secondary' | ...;  // 10个选项
  size?: 'xs' | 'sm' | 'md' | ...;          // 8个选项
  // ... 更多配置
}

// ✅ 好：只提供真正需要的选项
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}
```

### 陷阱3：硬编码值

```typescript
// ❌ 不好
if (user.membershipLevel === 'yearly') { }

// ✅ 好：使用常量
const MEMBERSHIP_LEVELS = {
  NONE: 'none',
  MONTHLY: 'monthly',
  YEARLY: 'yearly'
} as const;

if (user.membershipLevel === MEMBERSHIP_LEVELS.YEARLY) { }
```

---

## 检查清单

提交代码前，请确认：

**代码质量：**
- [ ] TypeScript无类型错误（`pnpm type-check`）
- [ ] ESLint无警告（`pnpm lint`）
- [ ] 代码已格式化（Prettier）
- [ ] 无console.log残留（生产代码）
- [ ] 无hardcoded敏感信息（密码、Token等）

**功能完整性：**
- [ ] 功能正常工作
- [ ] 边界情况已处理
- [ ] 错误处理完善
- [ ] Loading状态已添加

**性能：**
- [ ] 无明显性能问题
- [ ] 大型组件已动态导入
- [ ] 图片已优化
- [ ] API已添加缓存（如适用）

**文档：**
- [ ] 复杂逻辑已添加注释
- [ ] 新增API已更新文档
- [ ] README已更新（如有新功能）

---

**遵循这些规范，让代码库保持整洁、高效、易维护！** 🎯
