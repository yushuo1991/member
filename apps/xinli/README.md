# 心理测评系统 (apps/xinli)

龙头与跟风交易心理问卷系统 - Next.js 14版本

## 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **数据库**: MySQL (共享连接池)
- **认证**: JWT (@repo/auth)
- **部署**: Standalone模式

## 运行

```bash
# 开发模式 (http://localhost:3004)
npm run dev

# 生产构建
npm run build

# 启动生产服务
npm start
```

## 功能特性

### 核心功能

1. **80场景问卷** - 9大类别，全面评估交易心理
2. **实时保存** - 每30秒自动保存到数据库
3. **进度追踪** - 实时显示完成进度
4. **历史记录** - 查看所有测评历史
5. **导出功能** - Markdown格式导出

### 权限控制

- **年度会员** - 无限制访问
- **免费用户** - 5次试用机会
- **试用追踪** - 自动记录试用次数

### 数据持久化

数据保存在MySQL数据库：

- `user_psychology_tests` - 测评记录表
- `user_psychology_answers` - 答案表
- `user_psychology_reports` - 报告表（可选）

## API路由

```
GET  /api/gate/xinli          # 权限检查
POST /api/gate/xinli          # 使用试用次数
GET  /api/psychology/load     # 加载测评数据
POST /api/psychology/save     # 保存测评数据
GET  /api/psychology/history  # 获取历史记录
GET  /api/psychology/export   # 导出Markdown
```

## 页面路由

```
/             # 首页（欢迎页）
/xinli        # 测评主页面
/xinli/guide  # 使用说明
/xinli/history # 历史记录
```

## 环境变量

参考 `.env.example`:

```env
# 数据库配置（共享）
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=member_system

# JWT配置（共享）
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d

# 应用配置
NODE_ENV=development
APP_URL=http://localhost:3004
PORT=3004
```

## 数据库初始化

运行SQL脚本：

```bash
mysql -u root -p member_system < database-psychology.sql
```

## 开发指南

### 添加新场景

编辑 `src/lib/scenarios.ts`:

```typescript
export const scenarios: Scenario[] = [
  {
    id: 81,
    section: 10,
    title: '新场景标题',
    category: '新场景分类',
    important: false,
  },
  // ...
];
```

### 修改自动保存间隔

编辑 `src/app/xinli/page.tsx`:

```typescript
const timer = setInterval(() => {
  saveData();
}, 30000); // 修改这里的时间（毫秒）
```

## 部署

### Standalone构建

```bash
npm run build
```

构建产物在 `.next/standalone/` 目录。

### PM2配置

添加到 `ecosystem.config.monorepo.js`:

```javascript
{
  name: 'xinli',
  script: '.next/standalone/apps/xinli/server.js',
  cwd: '/path/to/apps/xinli',
  env: {
    PORT: 3004,
    NODE_ENV: 'production',
  },
}
```

### Nginx配置

```nginx
location /xinli {
  proxy_pass http://localhost:3004;
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection 'upgrade';
  proxy_set_header Host $host;
  proxy_cache_bypass $http_upgrade;
}
```

## 快捷键

- `←` - 上一个场景
- `→` - 下一个场景
- `Ctrl+S` / `Cmd+S` - 手动保存

## 依赖包

### 共享包

- `@repo/ui` - UI组件库
- `@repo/auth` - 认证中间件
- `@repo/database` - 数据库连接池
- `@repo/utils` - 工具函数

### 本地依赖

- `next` - Next.js框架
- `react` - React库
- `zod` - 数据验证

## 常见问题

### Q: 数据丢失怎么办？

A: 系统每30秒自动保存，但建议定期导出备份。

### Q: 如何修改试用次数？

A: 编辑 `src/app/api/gate/xinli/route.ts` 中的 `maxTrials` 变量。

### Q: 如何自定义样式？

A: 编辑 `tailwind.config.js` 或在组件中直接修改样式。

## 许可证

MIT
