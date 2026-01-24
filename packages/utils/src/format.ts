/**
 * 格式化价格
 * @param price 价格
 * @param currency 货币符号 (默认: ¥)
 * @returns 格式化后的价格字符串
 */
export function formatPrice(price: number, currency: string = '¥'): string {
  const fixed = price.toFixed(2);
  return currency + fixed;
}

/**
 * 截断文本
 * @param text 文本
 * @param maxLength 最大长度
 * @param ellipsis 省略符 (默认: ...)
 * @returns 截断后的文本
 */
export function truncate(text: string, maxLength: number, ellipsis: string = '...'): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - ellipsis.length) + ellipsis;
}

/**
 * 生成随机字符串
 * @param length 长度
 * @returns 随机字符串
 */
export function randomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 脱敏手机号
 * @param phone 手机号
 * @returns 脱敏后的手机号
 */
export function maskPhone(phone: string): string {
  if (phone.length !== 11) return phone;
  return phone.slice(0, 3) + '****' + phone.slice(7);
}

/**
 * 脱敏邮箱
 * @param email 邮箱
 * @returns 脱敏后的邮箱
 */
export function maskEmail(email: string): string {
  const parts = email.split('@');
  if (parts.length !== 2) return email;
  
  const username = parts[0];
  const domain = parts[1];
  
  if (username.length <= 2) return email;
  
  const visibleChars = Math.min(3, Math.floor(username.length / 2));
  const masked = username.slice(0, visibleChars) + '***';
  
  return masked + '@' + domain;
}
