# 会员制个人主页系统

> 基于 Next.js 14 + MySQL 8.0 的现代化会员管理平台

## 🚀 快速开始

### 前置要求

- Node.js 18+
- MySQL 8.0
- PM2（生产环境）
- Nginx（生产环境）

### 本地开发

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local，填写数据库配置

# 3. 初始化数据库
mysql -u root -p < scripts/init-database.sql

# 4. 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

### 生产部署

详细部署步骤请参考：[部署指南](docs/DEPLOY.md)

```bash
# 快速部署（新服务器）
ssh root@8.153.110.212
cd /www/wwwroot
git clone <your-repo-url> member-system
cd member-system
bash scripts/server-setup.sh
bash scripts/deploy.sh
```

## 📁 项目结构

```
member-system/
├── src/
│   ├── app/                 # Next.js App Router 页面
│   │   ├── api/            # API 路由
│   │   ├── login/          # 登录页
│   │   ├── register/       # 注册页
│   │   ├── member/         # 会员中心
│   │   └── admin/          # 后台管理
│   ├── components/         # React 组件
│   ├── lib/                # 核心库
│   └── types/              # TypeScript 类型
├── scripts/                # 部署脚本
├── docs/                   # 文档
└── .github/workflows/      # CI/CD
```

## 🎯 核心功能

### 用户端

- ✅ 邮箱注册/登录
- ✅ 激活码激活会员
- ✅ 会员等级管理（4个等级）
- ✅ 产品访问控制
- ✅ 会员中心

### 管理端

- ✅ 管理员登录
- ✅ 激活码批量生成
- ✅ 会员列表和搜索
- ✅ 手动调整会员等级
- ✅ 数据统计看板

## 🔐 会员等级

| 等级 | 时长 | 可访问产品 |
|------|------|-----------|
| 月度会员 | 30天 | 板块节奏、心理评估 |
| 季度会员 | 90天 | 所有月度权限 + 复盘系统 |
| 年度会员 | 365天 | 所有季度权限 + 优先支持 |
| 终身会员 | 永久 | 所有功能 + VIP支持 |

## 🛠️ 技术栈

- **前端**: Next.js 14、React 18、TypeScript 5、Tailwind CSS 3
- **后端**: Next.js API Routes、MySQL 8.0、JWT认证
- **部署**: PM2、Nginx、Docker
- **CI/CD**: GitHub Actions

## 📝 环境变量

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=member_system

# JWT密钥
JWT_SECRET=your-super-secret-jwt-key

# 应用配置
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 🔒 安全特性

- ✅ SQL注入防护（参数化查询）
- ✅ XSS防护（Content-Security-Policy）
- ✅ CSRF防护（Origin验证）
- ✅ 密码加密（bcrypt，10轮）
- ✅ JWT签名验证
- ✅ HttpOnly Cookie
- ✅ 激活码限流（15分钟5次）

## 📊 数据库设计

7张核心表：
- `users` - 用户表
- `memberships` - 会员等级表
- `activation_codes` - 激活码表
- `products` - 产品表
- `access_logs` - 访问日志表
- `admins` - 管理员表
- `member_operation_logs` - 操作日志表

详细Schema请查看：[scripts/init-database.sql](scripts/init-database.sql)

## 🎨 设计风格

采用苹果公司设计语言：
- 纯白背景 + 蓝色主题（#007AFF）
- 大圆角（16px-24px）
- 柔和阴影
- 流畅动画（300ms ease）
- 大留白设计

## 📖 文档

- [快速开始](docs/QUICK-START.md)
- [部署指南](docs/DEPLOY.md)
- [API文档](docs/API-DOCS.md)
- [管理员手册](docs/ADMIN-GUIDE.md)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

---

**部署服务器**: 8.153.110.212
**域名**: yushuofupan.com（备案中）
**访问方式**: http://8.153.110.212:3000（备案前）
# GitHub Actions 自动部署已配置
✅ GitHub Actions自动部署已配置成功 - 2026年01月 4日 13:16:52
