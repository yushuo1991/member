/**
 * 密码加密和验证工具
 */

import bcrypt from 'bcryptjs';

/**
 * 密码加密（使用bcrypt，12轮加盐）
 * @param password 明文密码
 * @returns 加密后的密码哈希
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
  return await bcrypt.hash(password, saltRounds);
}

/**
 * 验证密码
 * @param password 明文密码
 * @param hash 密码哈希
 * @returns 是否匹配
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}
