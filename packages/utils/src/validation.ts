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
 * 验证手机号格式 (中国大陆)
 * @param phone 手机号
 * @returns 是否有效
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
}

/**
 * 验证密码强度
 * @param password 密码
 * @returns 强度等级 (0: 弱, 1: 中, 2: 强)
 */
export function checkPasswordStrength(password: string): number {
  if (password.length < 6) return 0;
  
  let strength = 0;
  
  // 包含小写字母
  if (/[a-z]/.test(password)) strength++;
  
  // 包含大写字母
  if (/[A-Z]/.test(password)) strength++;
  
  // 包含数字
  if (/\d/.test(password)) strength++;
  
  // 包含特殊字符
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
  
  // 长度超过8位
  if (password.length >= 8) strength++;
  
  if (strength <= 2) return 0;
  if (strength <= 3) return 1;
  return 2;
}

/**
 * 验证用户名格式 (4-20位字母数字下划线)
 * @param username 用户名
 * @returns 是否有效
 */
export function isValidUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_]{4,20}$/;
  return usernameRegex.test(username);
}
