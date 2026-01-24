# 宇硕会员体系 - Monorepo共享包

本目录包含所有可复用的共享包，用于在多个应用之间共享代码。

## 📦 包列表

### 1. @yushuo/ui - UI组件库

**位置**: `packages/ui`

**描述**: 共享的React UI组件库，包含Toast、ProductCard等可复用组件。

**主要组件**:
- `Toast` - 通知提示组件
- `ProductCard` - 产品卡片组件

**使用**:
```typescript
import { Toast, ProductCard } from '@yushuo/ui';
```

**文档**: [packages/ui/README.md](./ui/README.md)

---

### 2. @yushuo/auth - JWT认证模块

**位置**: `packages/auth`

**描述**: JWT认证模块，提供Token生成、验证、密码哈希等功能。

**主要功能**:
- JWT Token生成和验证
- 用户和管理员认证中间件
- 密码哈希（基于bcryptjs）
- Cookie管理

**使用**:
```typescript
import { TokenManager, AuthMiddleware, passwordHasher } from '@yushuo/auth';
```

**文档**: [packages/auth/README.md](./auth/README.md)

---

### 3. @yushuo/database - MySQL连接池

**位置**: `packages/database`

**描述**: MySQL数据库连接池管理，提供单例连接池、查询封装、表初始化等功能。

**主要功能**:
- MySQL连接池管理（基于mysql2）
- 单例模式确保全局唯一连接池
- 自动表结构初始化（v3架构）
- 查询封装和错误处理

**使用**:
```typescript
import { MemberDatabase } from '@yushuo/database';

const db = MemberDatabase.getInstance();
await db.initializeTables();
```

**文档**: [packages/database/README.md](./database/README.md)

---

### 4. @yushuo/config - 共享配置

**位置**: `packages/config`

**描述**: 共享的Tailwind CSS、TypeScript、ESLint配置。

**包含配置**:
- `tailwind.config.js` - Tailwind CSS配置
- `tsconfig.json` - TypeScript配置
- `eslint.config.js` - ESLint配置

**使用**:
```js
// tailwind.config.js
const sharedConfig = require('@yushuo/config/tailwind.config.js');
module.exports = {
  ...sharedConfig,
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
};
```

**文档**: [packages/config/README.md](./config/README.md)

---

### 5. @yushuo/utils - 工具函数库

**位置**: `packages/utils`

**描述**: 常用工具函数库，包含剪贴板、验证、格式化等功能。

**主要功能**:
- 剪贴板操作（copyToClipboard）
- 数据验证（邮箱、手机号、密码强度）
- 格式化工具（价格、文本截断、脱敏）
- 字符串处理（随机字符串生成）

**使用**:
```typescript
import { copyToClipboard, isValidEmail, formatPrice } from '@yushuo/utils';
```

**文档**: [packages/utils/README.md](./utils/README.md)

---

## 🚀 快速开始

### 在应用中使用共享包

1. **安装依赖**（在workspace根目录）:
```bash
pnpm install
```

2. **在应用中引用包**:
```json
{
  "dependencies": {
    "@yushuo/ui": "workspace:*",
    "@yushuo/auth": "workspace:*",
    "@yushuo/database": "workspace:*",
    "@yushuo/config": "workspace:*",
    "@yushuo/utils": "workspace:*"
  }
}
```

3. **导入和使用**:
```typescript
// 使用UI组件
import { Toast } from '@yushuo/ui';

// 使用认证模块
import { tokenManager } from '@yushuo/auth';

// 使用数据库
import { MemberDatabase } from '@yushuo/database';

// 使用工具函数
import { copyToClipboard, formatPrice } from '@yushuo/utils';
```

---

## 📁 目录结构

```
packages/
├── ui/                     # UI组件库
│   ├── src/
│   │   ├── components/    # 组件目录
│   │   │   ├── Toast.tsx
│   │   │   └── ProductCard.tsx
│   │   └── index.ts       # 导出文件
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── auth/                   # 认证模块
│   ├── src/
│   │   ├── types.ts       # 类型定义
│   │   ├── token-manager.ts  # Token管理
│   │   ├── middleware.ts  # 认证中间件
│   │   ├── password.ts    # 密码哈希
│   │   └── index.ts       # 导出文件
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── database/              # 数据库模块
│   ├── src/
│   │   ├── database.ts    # 数据库连接池
│   │   └── index.ts       # 导出文件
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── config/                # 共享配置
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── eslint.config.js
│   ├── package.json
│   └── README.md
│
└── utils/                 # 工具函数库
    ├── src/
    │   ├── clipboard.ts   # 剪贴板工具
    │   ├── validation.ts  # 验证工具
    │   ├── format.ts      # 格式化工具
    │   └── index.ts       # 导出文件
    ├── package.json
    ├── tsconfig.json
    └── README.md
```

---

## 🛠️ 开发指南

### 添加新的共享包

1. 在`packages/`目录下创建新包目录
2. 创建`package.json`并设置正确的包名（如`@yushuo/new-package`）
3. 创建`tsconfig.json`（可以继承共享配置）
4. 编写代码并在`src/index.ts`中导出
5. 编写`README.md`文档

### 包命名规范

- 所有包使用`@yushuo/`作为scope
- 包名使用小写字母和连字符（如`@yushuo/my-package`）
- 导出的类和函数使用PascalCase或camelCase

### TypeScript配置

所有包都支持TypeScript，并提供类型定义文件。可以继承`@yushuo/config`的基础配置:

```json
{
  "extends": "@yushuo/config/tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

---

## 📄 License

MIT
