# Sentry 错误监控集成指南

本文档详细说明了如何在宇硕会员体系 Monorepo 中配置和使用 Sentry 错误监控。

## 目录

- [概述](#概述)
- [前置要求](#前置要求)
- [安装](#安装)
- [配置](#配置)
- [环境变量](#环境变量)
- [使用方法](#使用方法)
- [高级配置](#高级配置)
- [故障排除](#故障排除)
- [最佳实践](#最佳实践)

## 概述

Sentry 是一个实时错误追踪和性能监控平台，已集成到所有四个应用中：

| 应用 | 端口 | Sentry 项目名 |
|------|------|--------------|
| **web** | 3000 | web |
| **bk** | 3001 | bk |
| **fuplan** | 3002 | fuplan |
| **xinli** | 3003 | xinli |

### 集成功能

- ✅ 客户端错误追踪（浏览器）
- ✅ 服务端错误追踪（Node.js）
- ✅ Edge Runtime 错误追踪（中间件）
- ✅ Session Replay（会话重放）
- ✅ 性能监控（Performance Monitoring）
- ✅ 源码映射上传（Source Maps）
- ✅ 敏感数据过滤
- ✅ Release 追踪

## 前置要求

### 1. 创建 Sentry 账号

访问 [https://sentry.io](https://sentry.io) 并注册账号。

### 2. 创建组织和项目

1. 登录 Sentry 后，创建一个新组织（Organization）
2. 为每个应用创建独立的项目：
   - `web` - 会员管理系统
   - `bk` - 板块节奏系统
   - `fuplan` - 复盘系统
   - `xinli` - 心理测评系统

### 3. 获取必要的凭证

对于每个项目，你需要获取：

- **DSN (Data Source Name)**: 项目设置 → Client Keys (DSN)
- **Auth Token**: 设置 → Account → API → Auth Tokens → Create New Token
  - 权限需要：`project:read`, `project:releases`, `org:read`
- **Organization Slug**: 组织设置中的 URL slug
- **Project Slug**: 项目设置中的项目名称

## 安装

依赖已通过以下命令安装：

```bash
# 为所有应用安装 Sentry
pnpm add @sentry/nextjs --filter web
pnpm add @sentry/nextjs --filter bk
pnpm add @sentry/nextjs --filter fuplan
pnpm add @sentry/nextjs --filter xinli
```

## 配置

### 配置文件结构

每个应用都包含三个 Sentry 配置文件：

```
apps/[app-name]/
├── sentry.client.config.ts    # 客户端配置（浏览器）
├── sentry.server.config.ts    # 服务端配置（Node.js）
└── sentry.edge.config.ts      # Edge Runtime 配置（中间件）
```

### 配置文件说明

#### 1. `sentry.client.config.ts` - 客户端配置

用于浏览器端的错误追踪和会话重放。

**关键配置：**
- `dsn`: 使用 `NEXT_PUBLIC_SENTRY_DSN`（公开环境变量）
- `replaysSessionSampleRate`: 会话重放采样率（默认 10%）
- `replaysOnErrorSampleRate`: 错误时重放采样率（默认 100%）
- `beforeSend`: 过滤敏感数据（cookies、headers）
- `ignoreErrors`: 忽略浏览器扩展和网络错误

#### 2. `sentry.server.config.ts` - 服务端配置

用于 Node.js 服务端的错误追踪。

**关键配置：**
- `dsn`: 使用 `SENTRY_DSN`（私有环境变量）
- `beforeSend`: 过滤敏感数据（数据库密码、JWT密钥等）
- `ignoreErrors`: 忽略常见的网络错误

#### 3. `sentry.edge.config.ts` - Edge Runtime 配置

用于 Next.js 中间件和 Edge Runtime 的错误追踪。

**关键配置：**
- `dsn`: 使用 `SENTRY_DSN`
- 轻量级配置，适合 Edge Runtime 环境

### Next.js 配置

每个应用的 `next.config.js` 已更新，包含 Sentry webpack 插件：

```javascript
const { withSentryConfig } = require("@sentry/nextjs");

const nextConfig = {
  // ... 你的 Next.js 配置
};

const sentryWebpackPluginOptions = {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  reactComponentAnnotation: { enabled: true },
  tunnelRoute: "/monitoring",
  hideSourceMaps: true,
  disableLogger: true,
  automaticVercelMonitors: true,
};

module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions);
```

## 环境变量

### 必需的环境变量

每个应用的 `.env` 文件需要包含以下变量：

```bash
# Sentry 错误监控配置
SENTRY_DSN=https://your-sentry-dsn@sentry.io/your-project-id
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/your-project-id
SENTRY_ORG=your-organization-slug
SENTRY_PROJECT=web  # 或 bk, fuplan, xinli
SENTRY_AUTH_TOKEN=your-auth-token-here
SENTRY_RELEASE=web@1.0.0  # 或 bk@1.0.0, fuplan@1.0.0, xinli@1.0.0
NEXT_PUBLIC_SENTRY_RELEASE=web@1.0.0
```

### 环境变量说明

| 变量 | 用途 | 公开/私有 |
|------|------|----------|
| `SENTRY_DSN` | 服务端和 Edge Runtime 使用的 DSN | 私有 |
| `NEXT_PUBLIC_SENTRY_DSN` | 客户端使用的 DSN | 公开 |
| `SENTRY_ORG` | Sentry 组织 slug | 私有 |
| `SENTRY_PROJECT` | Sentry 项目名称 | 私有 |
| `SENTRY_AUTH_TOKEN` | 用于上传源码映射的认证令牌 | 私有 |
| `SENTRY_RELEASE` | 服务端 Release 版本标识 | 私有 |
| `NEXT_PUBLIC_SENTRY_RELEASE` | 客户端 Release 版本标识 | 公开 |

### 配置步骤

1. 复制 `.env.example` 到 `.env`：
   ```bash
   cp apps/web/.env.example apps/web/.env
   cp apps/bk/.env.example apps/bk/.env
   cp apps/fuplan/.env.example apps/fuplan/.env
   cp apps/xinli/.env.example apps/xinli/.env
   ```

2. 在每个 `.env` 文件中填入对应的 Sentry 凭证

3. 验证配置：
   ```bash
   pnpm validate-env:web
   pnpm validate-env:bk
   pnpm validate-env:fuplan
   pnpm validate-env:xinli
   ```

## 使用方法

### 自动错误捕获

Sentry 会自动捕获未处理的错误和 Promise rejections。无需额外代码。

### 手动错误报告

在代码中手动报告错误：

```typescript
import * as Sentry from "@sentry/nextjs";

try {
  // 你的代码
  throw new Error("Something went wrong");
} catch (error) {
  Sentry.captureException(error);
}
```

### 添加上下文信息

```typescript
import * as Sentry from "@sentry/nextjs";

// 设置用户信息
Sentry.setUser({
  id: user.id,
  email: user.email,
  username: user.username,
});

// 添加标签
Sentry.setTag("page_locale", "zh-CN");

// 添加额外数据
Sentry.setContext("character", {
  name: "Mighty Fighter",
  age: 19,
  attack_type: "melee",
});

// 添加面包屑
Sentry.addBreadcrumb({
  category: "auth",
  message: "User logged in",
  level: "info",
});
```

### API 路由中使用

```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

export async function GET(request: NextRequest) {
  try {
    // 你的 API 逻辑
    const data = await fetchData();
    return NextResponse.json(data);
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        api_route: "/api/example",
      },
      extra: {
        request_url: request.url,
      },
    });

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
```

### 中间件中使用

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as Sentry from "@sentry/nextjs";

export function middleware(request: NextRequest) {
  try {
    // 你的中间件逻辑
    return NextResponse.next();
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.redirect(new URL("/error", request.url));
  }
}
```

### 性能监控

```typescript
import * as Sentry from "@sentry/nextjs";

// 创建事务
const transaction = Sentry.startTransaction({
  op: "task",
  name: "Process User Data",
});

// 创建 span
const span = transaction.startChild({
  op: "db",
  description: "Query database",
});

try {
  // 执行数据库查询
  await db.query("SELECT * FROM users");
} finally {
  span.finish();
}

transaction.finish();
```

## 高级配置

### 调整采样率

根据流量和预算调整采样率：

```typescript
// sentry.client.config.ts
Sentry.init({
  // 性能监控采样率（1.0 = 100%）
  tracesSampleRate: 0.1, // 生产环境建议 0.1-0.2

  // 会话重放采样率
  replaysSessionSampleRate: 0.1, // 正常会话 10%
  replaysOnErrorSampleRate: 1.0, // 错误会话 100%
});
```

### 自定义错误过滤

```typescript
// sentry.server.config.ts
Sentry.init({
  beforeSend(event, hint) {
    // 过滤特定错误
    if (event.exception) {
      const error = hint.originalException;
      if (error && error.message && error.message.includes("ECONNREFUSED")) {
        return null; // 不发送此错误
      }
    }

    // 过滤敏感数据
    if (event.request) {
      delete event.request.cookies;
      if (event.request.headers) {
        delete event.request.headers['authorization'];
      }
    }

    return event;
  },
});
```

### Release 追踪

在 CI/CD 中设置 Release：

```bash
# 在构建时设置 Release
export SENTRY_RELEASE="web@$(git rev-parse --short HEAD)"
pnpm build:web
```

### Source Maps 上传

Source Maps 会在构建时自动上传到 Sentry（需要 `SENTRY_AUTH_TOKEN`）。

禁用自动上传：

```javascript
// next.config.js
const sentryWebpackPluginOptions = {
  // ... 其他配置
  dryRun: true, // 不上传 source maps
};
```

## 故障排除

### 问题 1: Sentry 未捕获错误

**解决方案：**
1. 检查环境变量是否正确配置
2. 确认 DSN 是否有效
3. 检查浏览器控制台是否有 Sentry 初始化错误
4. 验证 `next.config.js` 是否正确包装

### 问题 2: Source Maps 未上传

**解决方案：**
1. 确认 `SENTRY_AUTH_TOKEN` 已设置
2. 检查 token 权限是否包含 `project:releases`
3. 查看构建日志中的 Sentry 上传信息
4. 手动上传：
   ```bash
   npx @sentry/cli releases files <release> upload-sourcemaps .next
   ```

### 问题 3: 构建时间过长

**解决方案：**
1. 在开发环境禁用 source maps 上传：
   ```javascript
   const sentryWebpackPluginOptions = {
     silent: !process.env.CI,
     dryRun: process.env.NODE_ENV === 'development',
   };
   ```

### 问题 4: 错误信息包含敏感数据

**解决方案：**
1. 检查 `beforeSend` 钩子是否正确配置
2. 添加更多敏感字段到过滤列表
3. 使用 Sentry 的数据清理功能（Data Scrubbing）

### 问题 5: 会话重放消耗过多带宽

**解决方案：**
1. 降低 `replaysSessionSampleRate`（建议 0.1 或更低）
2. 保持 `replaysOnErrorSampleRate` 为 1.0（只记录错误会话）
3. 使用 `maskAllText` 和 `blockAllMedia` 减少数据量

## 最佳实践

### 1. 环境分离

为不同环境使用不同的 Sentry 项目或环境标签：

```typescript
Sentry.init({
  environment: process.env.NODE_ENV, // 'development', 'production'
});
```

### 2. 用户隐私

- 始终过滤敏感数据（密码、token、个人信息）
- 使用 `maskAllText` 在会话重放中隐藏文本
- 不要在错误消息中包含敏感信息

### 3. 错误分组

使用 fingerprinting 改善错误分组：

```typescript
Sentry.init({
  beforeSend(event) {
    // 自定义错误分组
    if (event.exception) {
      event.fingerprint = ['{{ default }}', event.exception.values[0].type];
    }
    return event;
  },
});
```

### 4. 性能优化

- 在生产环境降低采样率
- 使用 `tunnelRoute` 避免广告拦截器
- 启用 `hideSourceMaps` 保护源码

### 5. 告警配置

在 Sentry 中配置告警规则：
- 错误率突增
- 新错误出现
- 性能下降
- 特定错误类型

### 6. 定期审查

- 每周审查 Sentry 错误报告
- 修复高频错误
- 优化性能瓶颈
- 更新忽略规则

## 监控端点

每个应用都配置了 `/monitoring` 端点作为 Sentry 隧道，用于绕过广告拦截器：

- `http://localhost:3000/monitoring` (web)
- `http://localhost:3001/monitoring` (bk)
- `http://localhost:3002/monitoring` (fuplan)
- `http://localhost:3003/monitoring` (xinli)

## 相关资源

- [Sentry Next.js 官方文档](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry 最佳实践](https://docs.sentry.io/product/best-practices/)
- [Source Maps 配置](https://docs.sentry.io/platforms/javascript/sourcemaps/)
- [Session Replay](https://docs.sentry.io/product/session-replay/)
- [Performance Monitoring](https://docs.sentry.io/product/performance/)

## 支持

如有问题，请：
1. 查看本文档的故障排除部分
2. 查阅 [Sentry 官方文档](https://docs.sentry.io/)
3. 联系团队技术负责人

---

**最后更新**: 2026-02-07
**版本**: 1.0.0
