# Zod 输入验证系统

本文档介绍如何在宇硕会员体系中使用 Zod 进行输入验证。

## 概述

Zod 是一个 TypeScript-first 的模式验证库，提供：
- 类型安全的输入验证
- 自动类型推断
- 详细的错误信息
- 数据转换功能

## 安装

Zod 已安装在 `@repo/utils` 包中：

```bash
pnpm add zod --filter @repo/utils
```

## 可用的验证 Schemas

所有验证 schemas 都在 `packages/utils/src/validation-schemas.ts` 中定义。

### 1. LoginSchema - 用户登录验证

```typescript
import { LoginSchema, validateRequest } from '@repo/utils';

const body = await request.json();
const validation = validateRequest(LoginSchema, body);

if (!validation.success) {
  return errorResponse(validation.error, 400);
}

const { username, identifier, email, password } = validation.data;
```

**验证规则：**
- 必须提供 `username`、`identifier` 或 `email` 之一
- `password`: 6-128个字符

### 2. RegisterSchema - 用户注册验证

```typescript
import { RegisterSchema, validateRequest } from '@repo/utils';

const validation = validateRequest(RegisterSchema, body);

if (!validation.success) {
  return errorResponse(validation.error, 400);
}

const { username, password, email } = validation.data;
```

**验证规则：**
- `username`: 2-50个字符，支持中文、英文、数字、下划线
- `password`: 6-128个字符
- `email`: 可选，必须是有效的邮箱格式

### 3. ActivationCodeSchema - 激活码验证

```typescript
import { ActivationCodeSchema, validateRequest } from '@repo/utils';

const validation = validateRequest(ActivationCodeSchema, body);

if (!validation.success) {
  return errorResponse(validation.error, 400);
}

const { code } = validation.data; // 自动转换为大写
```

**验证规则：**
- 格式: `YS-{M|Q|Y|T|P}-XXXX`
- 自动转换为大写
- 不区分大小写输入

### 4. MemberAdjustSchema - 会员等级调整验证（管理员）

```typescript
import { MemberAdjustSchema, validateRequest } from '@repo/utils';

const validation = validateRequest(MemberAdjustSchema, body);

if (!validation.success) {
  return errorResponse(validation.error, 400);
}

const { membershipLevel, customExpiry } = validation.data;
```

**验证规则：**
- `membershipLevel`: 必须是 `none`、`monthly`、`quarterly`、`yearly` 或 `lifetime`
- `customExpiry`: 可选，必须是 ISO 8601 格式或 YYYY-MM-DD 格式

### 5. AdminLoginSchema - 管理员登录验证

```typescript
import { AdminLoginSchema, validateRequest } from '@repo/utils';

const validation = validateRequest(AdminLoginSchema, body);

if (!validation.success) {
  return errorResponse(validation.error, 400);
}

const { username, password } = validation.data;
```

**验证规则：**
- `username`: 1-50个字符，不能为空
- `password`: 6-128个字符

### 6. GenerateCodeSchema - 生成激活码验证

```typescript
import { GenerateCodeSchema, validateRequest } from '@repo/utils';

const validation = validateRequest(GenerateCodeSchema, body);

if (!validation.success) {
  return errorResponse(validation.error, 400);
}

const { codeType, level, durationDays, productSlug, quantity } = validation.data;
```

**验证规则：**
- `codeType`: 必须是 `membership` 或 `product`
- 会员激活码需要提供 `level` 和 `durationDays`
- 产品激活码需要提供 `productSlug` 和 `productDuration`
- `quantity`: 1-1000，默认为 1
- `notes`: 最多 500 个字符

### 7. UpdateUserStatusSchema - 用户状态更新验证

```typescript
import { UpdateUserStatusSchema, validateRequest } from '@repo/utils';

const validation = validateRequest(UpdateUserStatusSchema, body);

if (!validation.success) {
  return errorResponse(validation.error, 400);
}

const { action } = validation.data;
```

**验证规则：**
- `action`: 必须是 `activate`、`deactivate` 或 `delete`

### 8. ResetTrialsSchema - 试用次数重置验证

```typescript
import { ResetTrialsSchema, validateRequest } from '@repo/utils';

const validation = validateRequest(ResetTrialsSchema, body);

if (!validation.success) {
  return errorResponse(validation.error, 400);
}

const { userId, resetAll, trialType, resetValue } = validation.data;
```

**验证规则：**
- 必须提供 `userId` 或设置 `resetAll` 为 `true`
- `trialType`: `bk`、`xinli`、`fuplan` 或 `all`，默认为 `all`
- `resetValue`: 0-100，默认为 5

## 使用方法

### 方法 1: validateRequest（推荐）

最简单的验证方法，返回友好的错误信息：

```typescript
import { LoginSchema, validateRequest } from '@repo/utils';

const body = await request.json();
const validation = validateRequest(LoginSchema, body);

if (!validation.success) {
  return errorResponse(validation.error, 400);
}

// 使用验证后的数据（类型安全）
const { username, password } = validation.data;
```

### 方法 2: safeValidateRequest

需要访问详细错误信息时使用：

```typescript
import { RegisterSchema, safeValidateRequest } from '@repo/utils';

const body = await request.json();
const result = safeValidateRequest(RegisterSchema, body);

if (!result.success) {
  // 访问详细的验证错误
  const errors = result.error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }));

  return NextResponse.json(
    { success: false, message: '输入验证失败', errors },
    { status: 400 }
  );
}

const { username, password, email } = result.data;
```

### 方法 3: 直接使用 Schema.parse()

在 try-catch 块中使用：

```typescript
import { ActivationCodeSchema } from '@repo/utils';

try {
  const body = await request.json();
  const { code } = ActivationCodeSchema.parse(body);

  // 继续处理...
} catch (error) {
  if (error instanceof Error) {
    return errorResponse(error.message, 400);
  }
  throw error;
}
```

## 已更新的 API 路由

以下 API 路由已更新为使用 Zod 验证：

### 用户认证
- `apps/web/src/app/api/auth/login/route.ts` - 使用 `LoginSchema`
- `apps/web/src/app/api/auth/register/route.ts` - 使用 `RegisterSchema`

### 激活码
- `apps/web/src/app/api/activation/activate/route.ts` - 使用 `ActivationCodeSchema`

### 管理员
- `apps/web/src/app/api/admin/auth/login/route.ts` - 使用 `AdminLoginSchema`
- `apps/web/src/app/api/admin/members/[id]/adjust/route.ts` - 使用 `MemberAdjustSchema`

## 类型安全

所有验证 schemas 都导出了对应的 TypeScript 类型：

```typescript
import type {
  LoginInput,
  RegisterInput,
  ActivationCodeInput,
  MemberAdjustInput,
  AdminLoginInput,
  GenerateCodeInput,
  UpdateUserStatusInput,
  ResetTrialsInput,
} from '@repo/utils';

// 使用类型
function processLogin(data: LoginInput) {
  // data 是类型安全的
  const { username, password } = data;
}
```

## 自定义验证规则

如果需要创建自定义验证规则，可以在 `validation-schemas.ts` 中添加：

```typescript
import { z } from 'zod';

export const CustomSchema = z.object({
  field1: z.string().min(1),
  field2: z.number().positive(),
}).refine(
  (data) => {
    // 自定义验证逻辑
    return data.field1.length < data.field2;
  },
  {
    message: '自定义错误信息',
    path: ['field1'], // 错误显示在哪个字段
  }
);
```

## 数据转换

Zod 支持在验证时转换数据：

```typescript
const Schema = z.object({
  // 自动转换为大写
  code: z.string().transform((val) => val.toUpperCase()),

  // 字符串转数字
  age: z.string().transform(Number),

  // 日期字符串转 Date 对象
  date: z.string().transform((val) => new Date(val)),
});
```

## 错误处理

Zod 提供详细的错误信息：

```typescript
const result = safeValidateRequest(Schema, data);

if (!result.success) {
  result.error.errors.forEach((err) => {
    console.log(`字段: ${err.path.join('.')}`);
    console.log(`错误: ${err.message}`);
    console.log(`错误代码: ${err.code}`);
  });
}
```

## 最佳实践

1. **始终使用 validateRequest**：除非需要详细错误信息，否则使用 `validateRequest`
2. **在 API 路由开始时验证**：尽早验证输入，避免无效数据进入业务逻辑
3. **使用类型推断**：利用 Zod 的类型推断，避免手动定义类型
4. **提供清晰的错误信息**：在 schema 中使用自定义错误信息
5. **复用 schemas**：将常用的验证规则提取为可复用的 schemas

## 示例代码

完整的示例代码请参考：
- `packages/utils/src/validation-examples.ts` - 各种使用场景的示例
- 已更新的 API 路由文件（见上文）

## 测试

验证 schemas 可以轻松测试：

```typescript
import { LoginSchema } from '@repo/utils';

describe('LoginSchema', () => {
  it('should validate correct input', () => {
    const result = LoginSchema.safeParse({
      username: 'testuser',
      password: 'password123',
    });

    expect(result.success).toBe(true);
  });

  it('should reject invalid input', () => {
    const result = LoginSchema.safeParse({
      username: 'testuser',
      password: '123', // 太短
    });

    expect(result.success).toBe(false);
  });
});
```

## 参考资源

- [Zod 官方文档](https://zod.dev/)
- [Zod GitHub](https://github.com/colinhacks/zod)
- 项目文件: `packages/utils/src/validation-schemas.ts`
- 示例文件: `packages/utils/src/validation-examples.ts`
