/**
 * JWT认证中间件
 * 提供用户和管理员Token验证功能
 */

import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { JWTPayload } from '@/types/user';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d'; // Token有效期7天

/**
 * 生成JWT Token
 * @param payload Token载荷
 * @returns JWT字符串
 */
export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
}

/**
 * 验证JWT Token
 * @param token JWT字符串
 * @returns 解码后的载荷或null
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('[JWT] Token验证失败:', error);
    return null;
  }
}

/**
 * 从请求中提取Token（从Cookie或Authorization头）
 * @param request Next.js请求对象
 * @param tokenName Cookie中的Token名称
 * @returns Token字符串或null
 */
export function extractToken(request: NextRequest, tokenName: string = 'auth_token'): string | null {
  // 优先从Cookie提取
  const cookieToken = request.cookies.get(tokenName)?.value;
  if (cookieToken) {
    return cookieToken;
  }

  // 从Authorization头提取（支持Bearer格式）
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
}

/**
 * 验证用户Token中间件
 * @param request Next.js请求对象
 * @returns 验证结果对象
 */
export function verifyUserToken(request: NextRequest): {
  isValid: boolean;
  user: JWTPayload | null;
  error?: string;
} {
  const token = extractToken(request, 'auth_token');

  if (!token) {
    return {
      isValid: false,
      user: null,
      error: '未提供认证Token'
    };
  }

  const payload = verifyToken(token);

  if (!payload) {
    return {
      isValid: false,
      user: null,
      error: 'Token无效或已过期'
    };
  }

  // 检查Token类型
  if (payload.type !== 'user') {
    return {
      isValid: false,
      user: null,
      error: 'Token类型错误'
    };
  }

  return {
    isValid: true,
    user: payload
  };
}

/**
 * 验证管理员Token中间件
 * @param request Next.js请求对象
 * @returns 验证结果对象
 */
export function verifyAdminToken(request: NextRequest): {
  isValid: boolean;
  admin: JWTPayload | null;
  error?: string;
} {
  const token = extractToken(request, 'admin_token');

  if (!token) {
    return {
      isValid: false,
      admin: null,
      error: '未提供管理员认证Token'
    };
  }

  const payload = verifyToken(token);

  if (!payload) {
    return {
      isValid: false,
      admin: null,
      error: 'Token无效或已过期'
    };
  }

  // 检查Token类型
  if (payload.type !== 'admin') {
    return {
      isValid: false,
      admin: null,
      error: 'Token类型错误'
    };
  }

  return {
    isValid: true,
    admin: payload
  };
}

/**
 * 创建认证Cookie配置（HttpOnly安全配置）
 * @param token JWT字符串
 * @param name Cookie名称
 * @returns Cookie字符串
 */
export function createAuthCookie(token: string, name: string = 'auth_token'): string {
  const maxAge = 7 * 24 * 60 * 60; // 7天（秒）
  const secure =
    process.env.COOKIE_SECURE === 'true' || (process.env.APP_URL || '').startsWith('https://')
      ? 'Secure; '
      : '';

  const domain = process.env.COOKIE_DOMAIN ? `Domain=${process.env.COOKIE_DOMAIN}; ` : '';
  return `${name}=${token}; HttpOnly; ${secure}SameSite=Strict; Path=/; ${domain}Max-Age=${maxAge}`;
}

/**
 * 创建删除Cookie配置
 * @param name Cookie名称
 * @returns Cookie字符串
 */
export function createDeleteCookie(name: string = 'auth_token'): string {
  const domain = process.env.COOKIE_DOMAIN ? `Domain=${process.env.COOKIE_DOMAIN}; ` : '';
  return `${name}=; HttpOnly; SameSite=Strict; Path=/; ${domain}Max-Age=0`;
}
