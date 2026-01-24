/**
 * 认证相关类型定义
 */

export interface JWTPayload {
  userId: number;
  username: string;
  email: string;
  type: 'user' | 'admin';
  iat?: number;
  exp?: number;
}

export interface AuthResult {
  authenticated: boolean;
  user?: JWTPayload;
  error?: string;
}
