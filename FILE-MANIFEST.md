# 会员系统文件清单

## 生成时间
2026-01-04

## 文件统计
- **类型定义文件**: 3个
- **核心库文件**: 5个
- **API路由文件**: 10个
- **配置文件**: 5个
- **文档文件**: 3个
- **总计**: 26个文件

---

## 📁 目录结构

```
C:\Users\yushu\Desktop\member-system\
│
├── src/
│   ├── types/                          # TypeScript类型定义
│   │   ├── user.ts                     # 用户相关类型
│   │   ├── membership.ts               # 会员相关类型
│   │   └── product.ts                  # 产品相关类型
│   │
│   ├── lib/                            # 核心库文件
│   │   ├── database.ts                 # MySQL连接池管理（单例）
│   │   ├── auth-middleware.ts          # JWT认证中间件
│   │   ├── membership-levels.ts        # 会员等级定义
│   │   ├── rate-limiter.ts             # IP限流器（防暴力破解）
│   │   └── utils.ts                    # 工具函数集合
│   │
│   └── app/api/                        # API路由
│       ├── auth/
│       │   ├── register/route.ts       # POST - 用户注册
│       │   ├── login/route.ts          # POST - 用户登录
│       │   └── logout/route.ts         # POST - 用户登出
│       │
│       ├── activation/
│       │   ├── generate/route.ts       # POST - 生成激活码（管理员）
│       │   └── activate/route.ts       # POST - 激活会员等级
│       │
│       ├── products/
│       │   └── access/[slug]/route.ts  # GET - 产品访问控制
│       │
│       └── admin/
│           ├── auth/
│           │   └── login/route.ts      # POST - 管理员登录
│           │
│           ├── members/
│           │   ├── route.ts            # GET - 会员列表（分页）
│           │   └── [id]/adjust/route.ts # PUT - 调整会员等级
│           │
│           └── dashboard/
│               └── stats/route.ts      # GET - 统计数据
│
├── .env.example                        # 环境变量示例
├── database-init.sql                   # 数据库初始化脚本
├── package-dependencies.json           # NPM依赖清单
├── tsconfig.paths.json                 # TypeScript路径配置
├── api-test-examples.js                # API测试示例脚本
├── README.md                           # 项目文档
├── SECURITY-CHECKLIST.md               # 安全检查清单
└── FILE-MANIFEST.md                    # 本文件清单
```

---

## 📄 文件详细说明

### 类型定义（src/types/）

| 文件 | 说明 | 主要类型 |
|------|------|----------|
| `user.ts` | 用户相关类型 | User, UserSession, JWTPayload, RegisterRequest, LoginRequest |
| `membership.ts` | 会员相关类型 | MembershipLevel, MembershipConfig, ActivationCode |
| `product.ts` | 产品相关类型 | Product, ProductResponse, ProductAccessResponse |

### 核心库（src/lib/）

| 文件 | 说明 | 主要功能 |
|------|------|----------|
| `database.ts` | 数据库管理 | 连接池、表初始化、查询封装 |
| `auth-middleware.ts` | JWT认证 | Token生成/验证、Cookie管理 |
| `membership-levels.ts` | 会员系统 | 等级配置、权限检查、过期计算 |
| `rate-limiter.ts` | 限流保护 | IP限流、防暴力破解 |
| `utils.ts` | 工具函数 | 密码加密、输入验证、响应封装 |

### API路由（src/app/api/）

#### 用户认证（auth/）
| 路由 | 方法 | 说明 | 限流 |
|------|------|------|------|
| `/api/auth/register` | POST | 用户注册 | 3次/60分钟 |
| `/api/auth/login` | POST | 用户登录 | 5次/15分钟 |
| `/api/auth/logout` | POST | 用户登出 | 无 |

#### 激活码（activation/）
| 路由 | 方法 | 说明 | 权限 |
|------|------|------|------|
| `/api/activation/generate` | POST | 生成激活码 | 管理员 |
| `/api/activation/activate` | POST | 激活会员 | 用户（限流10次/15分钟） |

#### 产品访问（products/）
| 路由 | 方法 | 说明 | 权限 |
|------|------|------|------|
| `/api/products/access/[slug]` | GET | 产品访问控制 | 用户 |

#### 管理员接口（admin/）
| 路由 | 方法 | 说明 | 权限 |
|------|------|------|------|
| `/api/admin/auth/login` | POST | 管理员登录 | 公开（限流） |
| `/api/admin/members` | GET | 会员列表 | 管理员 |
| `/api/admin/members/[id]/adjust` | PUT | 调整会员等级 | 管理员 |
| `/api/admin/dashboard/stats` | GET | 统计数据 | 管理员 |

### 配置和文档

| 文件 | 说明 |
|------|------|
| `.env.example` | 环境变量模板（数据库、JWT配置） |
| `database-init.sql` | 数据库表结构和示例数据 |
| `package-dependencies.json` | NPM依赖清单 |
| `tsconfig.paths.json` | TypeScript路径别名配置 |
| `api-test-examples.js` | API接口测试脚本 |
| `README.md` | 完整项目文档 |
| `SECURITY-CHECKLIST.md` | 安全检查清单 |

---

## 🗄️ 数据库表结构

| 表名 | 说明 | 主要字段 |
|------|------|----------|
| `users` | 用户表 | id, username, email, membership_level, membership_expiry |
| `admins` | 管理员表 | id, username, email, role |
| `activation_codes` | 激活码表 | id, code, membership_level, is_used, expires_at |
| `products` | 产品表 | id, slug, name, required_level, content |
| `login_logs` | 登录日志表 | id, user_id, ip_address, success, created_at |
| `rate_limits` | 限流表 | id, ip_address, action_type, attempt_count, blocked_until |

---

## 🔐 安全特性

1. **SQL注入防护**: 所有查询使用参数化
2. **密码安全**: bcrypt加密，10轮加盐
3. **JWT安全**: HttpOnly Cookie，SameSite=Strict
4. **限流保护**: IP限流，防暴力破解
5. **输入验证**: 严格的格式验证
6. **日志审计**: 完整的登录日志

---

## 📦 依赖包

### 生产依赖
- `mysql2`: MySQL客户端（连接池支持）
- `jsonwebtoken`: JWT Token生成和验证
- `bcryptjs`: 密码加密

### 开发依赖
- `@types/jsonwebtoken`: JWT类型定义
- `@types/bcryptjs`: bcryptjs类型定义

---

## 🚀 快速开始

### 1. 安装依赖
```bash
npm install mysql2 jsonwebtoken bcryptjs
npm install -D @types/jsonwebtoken @types/bcryptjs
```

### 2. 配置环境变量
```bash
cp .env.example .env.local
# 编辑 .env.local，填入数据库配置和JWT密钥
```

### 3. 初始化数据库
```bash
mysql -u root -p < database-init.sql
```

### 4. 启动开发服务器
```bash
npm run dev
```

### 5. 测试API
```bash
node api-test-examples.js
```

---

## 📞 技术支持

如有问题，请检查：
1. `README.md` - 完整文档
2. `SECURITY-CHECKLIST.md` - 安全检查清单
3. `api-test-examples.js` - API使用示例

---

## 📝 许可证
MIT License

---

**生成工具**: Claude Sonnet 4.5
**生成日期**: 2026-01-04
**版本**: 1.0.0
