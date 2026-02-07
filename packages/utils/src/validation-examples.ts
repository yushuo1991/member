/**
 * Zod Validation Examples
 * 演示如何在API路由中使用验证schemas
 *
 * 注意：此文件仅用于示例演示，不会在实际运行时使用
 */

import type { NextRequest, NextResponse } from 'next/server';
import {
  LoginSchema,
  RegisterSchema,
  ActivationCodeSchema,
  MemberAdjustSchema,
  validateRequest,
  safeValidateRequest,
} from './validation-schemas';

// 类型定义（仅用于示例）
type NextResponseType = any;

// ============================================
// 示例 1: 使用 validateRequest (推荐)
// ============================================

/**
 * 使用 validateRequest 进行验证
 * - 返回 { success: true, data } 或 { success: false, error }
 * - 适合大多数场景
 */
export async function exampleLoginHandler(request: NextRequest) {
  const body = await request.json();

  // 验证请求体
  const validation = validateRequest(LoginSchema, body);

  if (!validation.success) {
    // 验证失败，返回错误
    return NextResponse.json(
      { success: false, message: validation.error },
      { status: 400 }
    );
  }

  // 验证成功，使用类型安全的数据
  const { username, identifier, email, password } = validation.data;

  // 继续处理登录逻辑...
  return NextResponse.json({ success: true });
}

// ============================================
// 示例 2: 使用 safeValidateRequest
// ============================================

/**
 * 使用 safeValidateRequest 进行验证
 * - 返回 Zod 的 SafeParseReturnType
 * - 适合需要访问详细错误信息的场景
 */
export async function exampleRegisterHandler(request: any) {
  const body = await request.json();

  // 安全验证请求体
  const result = safeValidateRequest(RegisterSchema, body);

  if (!result.success) {
    // 访问详细的验证错误
    const errors = result.error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));

    return {
      success: false,
      message: '输入验证失败',
      errors,
      status: 400,
    };
  }

  // 验证成功，使用类型安全的数据
  const { username, password, email } = result.data;

  // 继续处理注册逻辑...
  return { success: true };
}

// ============================================
// 示例 3: 直接使用 Schema.parse()
// ============================================

/**
 * 直接使用 Schema.parse() 进行验证
 * - 验证失败会抛出 ZodError 异常
 * - 适合在 try-catch 块中使用
 */
export async function exampleActivateHandler(request: any) {
  try {
    const body = await request.json();

    // 直接解析和验证（会抛出异常）
    const { code } = ActivationCodeSchema.parse(body);

    // 验证成功，继续处理激活逻辑...
    return { success: true, code };
  } catch (error) {
    // 捕获验证错误
    if (error instanceof Error) {
      return {
        success: false,
        message: error.message,
        status: 400,
      };
    }
    throw error;
  }
}

// ============================================
// 示例 4: 在现有API路由中集成
// ============================================

/**
 * 完整的API路由示例
 * 展示如何在实际的Next.js API路由中使用验证
 */
export async function POST(request: any) {
  try {
    // 1. 解析请求体
    const body = await request.json();

    // 2. 验证输入
    const validation = validateRequest(MemberAdjustSchema, body);

    if (!validation.success) {
      return {
        success: false,
        message: validation.error,
        status: 400,
      };
    }

    // 3. 使用验证后的数据（类型安全）
    const { membershipLevel, customExpiry } = validation.data;

    // 4. 执行业务逻辑
    // ... 数据库操作等 ...

    // 5. 返回成功响应
    return {
      success: true,
      data: { membershipLevel, customExpiry },
    };
  } catch (error) {
    // 捕获错误
    return {
      success: false,
      message: '服务器错误',
      status: 500,
    };
  }
}

// ============================================
// 示例 5: 验证查询参数
// ============================================

/**
 * 验证 URL 查询参数
 */
import { z } from 'zod';

const QuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number),
  limit: z.string().regex(/^\d+$/).transform(Number),
  search: z.string().optional(),
});

export async function GET(request: any) {
  // 模拟 URL 解析
  const url = request.url || '';
  const params = { page: '1', limit: '10', search: '' };

  // 验证查询参数
  const validation = validateRequest(QuerySchema, params);

  if (!validation.success) {
    return {
      success: false,
      message: validation.error,
      status: 400,
    };
  }

  const { page, limit, search } = validation.data;

  // 使用验证后的参数...
  return { success: true, page, limit, search };
}

// ============================================
// 示例 6: 自定义验证规则
// ============================================

/**
 * 创建自定义验证规则
 */
const CustomSchema = z.object({
  email: z.string().email(),
  age: z.number().int().min(18, '必须年满18岁'),
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'], // 错误将显示在 confirmPassword 字段
  }
);

// ============================================
// 示例 7: 条件验证
// ============================================

/**
 * 根据条件进行不同的验证
 */
const ConditionalSchema = z.object({
  type: z.enum(['individual', 'company']),
  name: z.string(),
  // 如果是公司，需要提供公司名称
  companyName: z.string().optional(),
  // 如果是个人，需要提供身份证号
  idNumber: z.string().optional(),
}).refine(
  (data) => {
    if (data.type === 'company') {
      return !!data.companyName;
    }
    if (data.type === 'individual') {
      return !!data.idNumber;
    }
    return true;
  },
  {
    message: '请提供必要的信息',
  }
);
