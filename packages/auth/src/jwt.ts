import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_change_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface JWTPayload {
  userId: number;
  username: string;
  email: string;
  membershipLevel: string;
  membershipExpiry?: string | null;
}

/**
 * 生成JWT Token
 * @param payload 用户信息
 * @param expiresIn 过期时间 (默认7天)
 * @returns JWT token字符串
 */
export function signToken(payload: JWTPayload, expiresIn: string = JWT_EXPIRES_IN): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * 验证JWT Token
 * @param token JWT token字符串
 * @returns 解析后的payload，验证失败返回null
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

/**
 * 刷新Token (验证旧token并生成新token)
 * @param token 旧的JWT token
 * @returns 新的JWT token，验证失败返回null
 */
export function refreshToken(token: string): string | null {
  const payload = verifyToken(token);
  if (!payload) {
    return null;
  }
  
  // 移除过期时间字段，重新生成token
  const { iat, exp, ...userPayload } = payload as any;
  return signToken(userPayload as JWTPayload);
}
