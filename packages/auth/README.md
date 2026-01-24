# @yushuo/auth

宇硕会员体系 - JWT认证模块

## 安装

```bash
npm install @yushuo/auth
```

## 功能

- JWT Token生成和验证
- 用户和管理员认证
- 密码哈希（基于bcryptjs）
- Cookie管理
- TypeScript类型支持

## 使用示例

### Token管理

```typescript
import { TokenManager } from '@yushuo/auth';

// 创建TokenManager实例
const tokenManager = new TokenManager('your-secret-key', '7d');

// 生成Token
const token = tokenManager.generateToken({
  userId: 1,
  email: 'user@example.com',
  username: 'user',
  type: 'user'
});

// 验证Token
const payload = tokenManager.verifyToken(token);
if (payload) {
  console.log('User:', payload.username);
}

// 从请求中提取Token
const token = tokenManager.extractTokenFromRequest(request, 'auth_token');

// 创建认证Cookie
const cookieString = tokenManager.createAuthCookie(token, 'auth_token');

// 创建删除Cookie
const deleteCookie = tokenManager.createDeleteCookie('auth_token');
```

### 认证中间件

```typescript
import { AuthMiddleware, tokenManager } from '@yushuo/auth';

const authMiddleware = new AuthMiddleware(tokenManager);

// 验证用户Token
const userResult = authMiddleware.verifyUserToken(request);
if (userResult.isValid) {
  console.log('User:', userResult.user);
} else {
  console.error('Error:', userResult.error);
}

// 验证管理员Token
const adminResult = authMiddleware.verifyAdminToken(request);
if (adminResult.isValid) {
  console.log('Admin:', adminResult.admin);
}
```

### 密码哈希

```typescript
import { PasswordHasher } from '@yushuo/auth';

const passwordHasher = new PasswordHasher(12); // 12 salt rounds

// 生成密码哈希
const hash = await passwordHasher.hash('mypassword');

// 验证密码
const isValid = await passwordHasher.verify('mypassword', hash);
console.log('Password valid:', isValid);
```

### Next.js API路由示例

```typescript
// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { tokenManager, passwordHasher } from '@yushuo/auth';

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  // 查询用户（示例）
  const user = await db.getUserByEmail(email);
  if (!user) {
    return NextResponse.json({ error: '用户不存在' }, { status: 404 });
  }

  // 验证密码
  const isValid = await passwordHasher.verify(password, user.password_hash);
  if (!isValid) {
    return NextResponse.json({ error: '密码错误' }, { status: 401 });
  }

  // 生成Token
  const token = tokenManager.generateToken({
    userId: user.id,
    email: user.email,
    username: user.username,
    type: 'user'
  });

  // 创建Cookie
  const cookie = tokenManager.createAuthCookie(token, 'auth_token');

  return new NextResponse(
    JSON.stringify({ success: true, user }),
    {
      status: 200,
      headers: {
        'Set-Cookie': cookie,
        'Content-Type': 'application/json'
      }
    }
  );
}
```

### 保护API路由

```typescript
// app/api/protected/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { AuthMiddleware, tokenManager } from '@yushuo/auth';

const authMiddleware = new AuthMiddleware(tokenManager);

export async function GET(request: NextRequest) {
  const authResult = authMiddleware.verifyUserToken(request);

  if (!authResult.isValid) {
    return NextResponse.json({ error: authResult.error }, { status: 401 });
  }

  return NextResponse.json({
    message: 'Protected data',
    user: authResult.user
  });
}
```

## API参考

### TokenManager

**构造函数:**
```typescript
constructor(secret?: string, expiresIn?: string)
```

**方法:**
- `generateToken(payload)` - 生成JWT Token
- `verifyToken(token)` - 验证JWT Token
- `extractTokenFromRequest(request, tokenName?)` - 从请求中提取Token
- `createAuthCookie(token, name?, options?)` - 创建认证Cookie
- `createDeleteCookie(name?, domain?)` - 创建删除Cookie
- `updateSecret(newSecret)` - 更新JWT密钥
- `updateExpiresIn(newExpiresIn)` - 更新Token过期时间

### AuthMiddleware

**构造函数:**
```typescript
constructor(tokenManager: TokenManager)
```

**方法:**
- `verifyUserToken(request)` - 验证用户Token
- `verifyAdminToken(request)` - 验证管理员Token
- `verifyToken(request, tokenName?)` - 通用Token验证

### PasswordHasher

**构造函数:**
```typescript
constructor(saltRounds?: number)
```

**方法:**
- `hash(password)` - 生成密码哈希
- `verify(password, hash)` - 验证密码
- `updateSaltRounds(rounds)` - 更新Salt轮数

## 类型定义

```typescript
export type UserType = 'user' | 'admin';

export interface JWTPayload {
  userId: number;
  email: string;
  username: string;
  type: UserType;
  iat?: number;
  exp?: number;
}

export interface AuthResult<T = JWTPayload> {
  isValid: boolean;
  user?: T;
  admin?: T;
  error?: string;
}

export interface CookieOptions {
  secure?: boolean;
  domain?: string;
  maxAge?: number;
}
```

## 环境变量

```env
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
COOKIE_SECURE=true
COOKIE_DOMAIN=yourdomain.com
APP_URL=https://yourdomain.com
```

## License

MIT
