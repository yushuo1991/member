/**
 * Zod Validation Schemas
 * 提供统一的输入验证规则
 */

import { z } from 'zod';

// ============================================
// 基础验证规则
// ============================================

/**
 * 用户名验证规则
 * - 2-50个字符
 * - 支持中文、英文、数字、下划线
 */
const usernameSchema = z
  .string()
  .min(2, '用户名至少需要2个字符')
  .max(50, '用户名不能超过50个字符')
  .regex(/^[\u4e00-\u9fa5a-zA-Z0-9_]+$/, '用户名只能包含中文、英文、数字和下划线');

/**
 * 邮箱验证规则
 */
const emailSchema = z
  .string()
  .email('邮箱格式不正确')
  .max(255, '邮箱长度不能超过255个字符');

/**
 * 密码验证规则
 * - 至少6个字符
 * - 最多128个字符
 */
const passwordSchema = z
  .string()
  .min(6, '密码至少需要6个字符')
  .max(128, '密码不能超过128个字符');

/**
 * 激活码验证规则
 * - 格式: YS-{M|Q|Y|T|P}-XXXX
 * - 不区分大小写
 */
const activationCodeSchema = z
  .string()
  .min(1, '激活码不能为空')
  .max(50, '激活码格式不正确')
  .regex(/^YS-[A-Z]-[A-Z0-9]{4,}$/i, '激活码格式不正确，应为 YS-X-XXXX 格式')
  .transform((val) => val.toUpperCase());

/**
 * 会员等级验证规则
 */
const membershipLevelSchema = z.enum(['none', 'monthly', 'quarterly', 'yearly', 'lifetime'], {
  errorMap: () => ({ message: '无效的会员等级' }),
});

/**
 * 日期字符串验证规则（ISO 8601格式）
 */
const isoDateSchema = z
  .string()
  .datetime({ message: '日期格式不正确，应为ISO 8601格式' })
  .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式不正确，应为YYYY-MM-DD格式'));

// ============================================
// API请求验证 Schemas
// ============================================

/**
 * 登录请求验证
 * POST /api/auth/login
 */
export const LoginSchema = z.object({
  // 支持多种登录方式：username, identifier, email
  username: z.string().optional(),
  identifier: z.string().optional(),
  email: z.string().optional(),
  password: passwordSchema,
}).refine(
  (data) => data.username || data.identifier || data.email,
  {
    message: '请提供用户名、账号或邮箱',
    path: ['username'],
  }
);

export type LoginInput = z.infer<typeof LoginSchema>;

/**
 * 注册请求验证
 * POST /api/auth/register
 */
export const RegisterSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
  email: emailSchema.optional(), // 邮箱可选，如果不提供会自动生成占位邮箱
});

export type RegisterInput = z.infer<typeof RegisterSchema>;

/**
 * 激活码激活请求验证
 * POST /api/activation/activate
 */
export const ActivationCodeSchema = z.object({
  code: activationCodeSchema,
});

export type ActivationCodeInput = z.infer<typeof ActivationCodeSchema>;

/**
 * 会员等级调整请求验证（管理员）
 * PUT /api/admin/members/[id]/adjust
 */
export const MemberAdjustSchema = z.object({
  membershipLevel: membershipLevelSchema,
  customExpiry: isoDateSchema.optional().nullable(),
});

export type MemberAdjustInput = z.infer<typeof MemberAdjustSchema>;

/**
 * 管理员登录请求验证
 * POST /api/admin/auth/login
 */
export const AdminLoginSchema = z.object({
  username: z.string().min(1, '用户名不能为空').max(50, '用户名不能超过50个字符'),
  password: passwordSchema,
});

export type AdminLoginInput = z.infer<typeof AdminLoginSchema>;

/**
 * 生成激活码请求验证
 * POST /api/admin/codes/generate
 */
export const GenerateCodeSchema = z.object({
  codeType: z.enum(['membership', 'product'], {
    errorMap: () => ({ message: '激活码类型必须是 membership 或 product' }),
  }),
  level: membershipLevelSchema.optional(),
  durationDays: z.number().int().positive('时长必须是正整数').optional(),
  productSlug: z.string().optional(),
  productDuration: z.enum(['monthly', 'yearly', 'lifetime']).optional(),
  quantity: z.number().int().min(1, '数量至少为1').max(1000, '单次最多生成1000个激活码').default(1),
  expiresAt: isoDateSchema.optional().nullable(),
  notes: z.string().max(500, '备注不能超过500个字符').optional(),
}).refine(
  (data) => {
    // 如果是会员激活码，必须提供 level 和 durationDays
    if (data.codeType === 'membership') {
      return data.level && data.durationDays;
    }
    // 如果是产品激活码，必须提供 productSlug 和 productDuration
    if (data.codeType === 'product') {
      return data.productSlug && data.productDuration;
    }
    return true;
  },
  {
    message: '会员激活码需要提供 level 和 durationDays，产品激活码需要提供 productSlug 和 productDuration',
  }
);

export type GenerateCodeInput = z.infer<typeof GenerateCodeSchema>;

/**
 * 用户状态更新请求验证
 * PUT /api/admin/members/[id]/status
 */
export const UpdateUserStatusSchema = z.object({
  action: z.enum(['activate', 'deactivate', 'delete'], {
    errorMap: () => ({ message: '操作类型必须是 activate、deactivate 或 delete' }),
  }),
});

export type UpdateUserStatusInput = z.infer<typeof UpdateUserStatusSchema>;

/**
 * 试用次数重置请求验证
 * POST /api/admin/trials/reset
 */
export const ResetTrialsSchema = z.object({
  userId: z.number().int().positive('用户ID必须是正整数').optional(),
  resetAll: z.boolean().optional().default(false),
  trialType: z.enum(['bk', 'xinli', 'fuplan', 'all'], {
    errorMap: () => ({ message: '试用类型必须是 bk、xinli、fuplan 或 all' }),
  }).optional().default('all'),
  resetValue: z.number().int().min(0, '重置值不能为负数').max(100, '重置值不能超过100').optional().default(5),
}).refine(
  (data) => data.userId || data.resetAll,
  {
    message: '必须提供 userId 或设置 resetAll 为 true',
    path: ['userId'],
  }
);

export type ResetTrialsInput = z.infer<typeof ResetTrialsSchema>;

// ============================================
// 验证辅助函数
// ============================================

/**
 * 验证并解析请求体
 * @param schema Zod schema
 * @param data 待验证的数据
 * @returns 验证结果
 */
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string; errors?: z.ZodError } {
  try {
    const parsed = schema.parse(data);
    return { success: true, data: parsed };
  } catch (error) {
    if (error instanceof z.ZodError) {
      // 提取第一个错误信息
      const firstError = error.errors[0];
      const errorMessage = firstError?.message || '输入验证失败';
      return { success: false, error: errorMessage, errors: error };
    }
    return { success: false, error: '输入验证失败' };
  }
}

/**
 * 安全解析请求体（不抛出异常）
 * @param schema Zod schema
 * @param data 待验证的数据
 * @returns SafeParseReturnType
 */
export function safeValidateRequest<T>(schema: z.ZodSchema<T>, data: unknown) {
  return schema.safeParse(data);
}
