/**
 * Zod运行时验证模式
 * 为API请求提供类型安全的输入验证
 */

import { z } from 'zod';

// 用户注册验证
export const registerSchema = z.object({
  username: z.string()
    .min(3, '用户名至少3个字符')
    .max(20, '用户名最多20个字符')
    .regex(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线'),
  email: z.string()
    .email('邮箱格式无效')
    .max(100, '邮箱最多100个字符'),
  password: z.string()
    .min(8, '密码至少8个字符')
    .max(50, '密码最多50个字符')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, '密码必须包含大小写字母和数字')
});

// 用户登录验证
export const loginSchema = z.object({
  email: z.string().email('邮箱格式无效'),
  password: z.string().min(1, '密码不能为空')
});

// 管理员登录验证
export const adminLoginSchema = z.object({
  email: z.string().email('邮箱格式无效'),
  password: z.string().min(1, '密码不能为空')
});

// 激活码使用验证
export const activateCodeSchema = z.object({
  code: z.string()
    .min(10, '激活码格式无效')
    .max(50, '激活码格式无效')
    .regex(/^[A-Z0-9-]+$/, '激活码只能包含大写字母、数字和短横线')
});

// 激活码生成验证
export const generateCodesSchema = z.object({
  membershipLevel: z.enum(['monthly', 'quarterly', 'yearly', 'lifetime'], {
    errorMap: () => ({ message: '无效的会员等级' })
  }),
  quantity: z.number()
    .int('数量必须为整数')
    .min(1, '数量至少为1')
    .max(100, '数量最多为100'),
  expiresInDays: z.number()
    .int('过期天数必须为整数')
    .min(0, '过期天数不能为负数')
    .optional()
});

// 会员调整验证
export const adjustMembershipSchema = z.object({
  membershipLevel: z.enum(['none', 'monthly', 'quarterly', 'yearly', 'lifetime'], {
    errorMap: () => ({ message: '无效的会员等级' })
  }),
  customExpiry: z.string().optional() // ISO格式日期字符串
});

// 分页查询验证
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  level: z.string().optional()
});

/**
 * 验证助手函数
 * 返回验证结果和格式化的错误消息
 */
export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors = result.error.errors.map(err => {
    const path = err.path.length > 0 ? `${err.path.join('.')}: ` : '';
    return `${path}${err.message}`;
  });

  return { success: false, errors };
}
