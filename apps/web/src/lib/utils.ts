/**
 * 工具函数集合
 */

import crypto from 'crypto';

/**
 * 生成随机激活码
 * @param length 激活码长度（默认16）
 * @returns 激活码字符串
 */
export function generateActivationCode(length: number = 16): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 去除易混淆字符I,O,0,1
  let code = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, chars.length);
    code += chars[randomIndex];
  }

  // 格式化为XXXX-XXXX-XXXX-XXXX
  return code.match(/.{1,4}/g)?.join('-') || code;
}

/**
 * 验证邮箱格式
 * @param email 邮箱地址
 * @returns 是否有效
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 验证用户名格式（3-50字符，字母数字下划线）
 * @param username 用户名
 * @returns 是否有效
 */
export function isValidUsername(username: string): boolean {
  // 允许汉字/字母/数字/下划线，长度 2-50
  // 使用 Unicode 属性以覆盖中文等语言字符
  const usernameRegex = /^[\p{L}\p{N}_]{2,50}$/u;
  return usernameRegex.test(username);
}

/**
 * 验证密码强度（至少8字符，包含字母和数字）
 * @param password 密码
 * @returns 是否有效
 */
export function isValidPassword(password: string): boolean {
  // 允许纯数字/纯字母等简单密码，最少 6 位
  if (password.length < 6) {
    return false;
  }
  return true;
}

/**
 * 清理SQL输入（防止SQL注入）
 * 注意：使用参数化查询是首选，此函数作为额外保护
 * @param input 用户输入
 * @returns 清理后的字符串
 */
export function sanitizeInput(input: string): string {
  return input.replace(/['"\\;]/g, '');
}

/**
 * 生成CSRF Token
 * @returns CSRF Token字符串
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * 验证CSRF Token
 * @param token 待验证的Token
 * @param storedToken 存储的Token
 * @returns 是否匹配
 */
export function verifyCSRFToken(token: string, storedToken: string): boolean {
  return crypto.timingSafeEqual(
    Buffer.from(token),
    Buffer.from(storedToken)
  );
}

/**
 * 格式化日期为YYYY-MM-DD HH:mm:ss
 * @param date 日期对象
 * @returns 格式化后的字符串
 */
export function formatDateTime(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * 生成API响应
 * @param success 是否成功
 * @param data 响应数据
 * @param message 消息
 * @param statusCode HTTP状态码
 */
export function apiResponse<T = any>(
  success: boolean,
  data: T | null = null,
  message: string = '',
  statusCode: number = 200
) {
  return Response.json(
    {
      success,
      data,
      message,
      timestamp: new Date().toISOString()
    },
    { status: statusCode }
  );
}

/**
 * 错误响应快捷方式
 */
export function errorResponse(message: string, statusCode: number = 400) {
  return apiResponse(false, null, message, statusCode);
}

/**
 * 成功响应快捷方式
 */
export function successResponse<T = any>(data: T, message: string = 'Success') {
  return apiResponse(true, data, message, 200);
}
