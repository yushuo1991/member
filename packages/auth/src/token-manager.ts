/**
 * JWT Token管理模块
 * 提供Token生成、验证、提取功能
 */

import jwt from 'jsonwebtoken';
import type { JWTPayload, CookieOptions } from './types';

export class TokenManager {
  private jwtSecret: string;
  private jwtExpiresIn: string;

  constructor(secret?: string, expiresIn: string = '7d') {
    this.jwtSecret = secret || process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    this.jwtExpiresIn = expiresIn;
  }

  /**
   * 生成JWT Token
   */
  generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn
    });
  }

  /**
   * 验证JWT Token
   */
  verifyToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as JWTPayload;
      return decoded;
    } catch (error) {
      console.error('[JWT] Token验证失败:', error);
      return null;
    }
  }

  /**
   * 从请求对象中提取Token（支持Cookie和Authorization头）
   */
  extractTokenFromRequest(request: any, tokenName: string = 'auth_token'): string | null {
    // 优先从Cookie提取
    if (request.cookies?.get) {
      const cookieToken = request.cookies.get(tokenName)?.value;
      if (cookieToken) {
        return cookieToken;
      }
    }

    // 从Authorization头提取（支持Bearer格式）
    const authHeader = request.headers?.get?.('Authorization') || request.headers?.authorization;
    if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    return null;
  }

  /**
   * 创建认证Cookie字符串（HttpOnly安全配置）
   */
  createAuthCookie(token: string, name: string = 'auth_token', options: CookieOptions = {}): string {
    const maxAge = options.maxAge || 7 * 24 * 60 * 60; // 7天（秒）
    const secure = options.secure !== undefined
      ? options.secure
      : (process.env.COOKIE_SECURE === 'true' || (process.env.APP_URL || '').startsWith('https://'));

    const securePart = secure ? 'Secure; ' : '';
    const domainPart = options.domain ? `Domain=${options.domain}; ` : '';

    return `${name}=${token}; HttpOnly; ${securePart}SameSite=Strict; Path=/; ${domainPart}Max-Age=${maxAge}`;
  }

  /**
   * 创建删除Cookie字符串
   */
  createDeleteCookie(name: string = 'auth_token', domain?: string): string {
    const domainPart = domain ? `Domain=${domain}; ` : '';
    return `${name}=; HttpOnly; SameSite=Strict; Path=/; ${domainPart}Max-Age=0`;
  }

  /**
   * 更新JWT密钥
   */
  updateSecret(newSecret: string): void {
    this.jwtSecret = newSecret;
  }

  /**
   * 更新Token过期时间
   */
  updateExpiresIn(newExpiresIn: string): void {
    this.jwtExpiresIn = newExpiresIn;
  }
}

// 导出默认实例
export const tokenManager = new TokenManager();
