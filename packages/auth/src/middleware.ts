import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, JWTPayload } from './jwt';

export interface AuthResult {
  authenticated: boolean;
  user?: JWTPayload;
  error?: string;
}

/**
 * 验证请求中的JWT Token
 * @param request Next.js请求对象
 * @returns 认证结果
 */
export async function verifyAuth(request: NextRequest): Promise<AuthResult> {
  const token = request.cookies.get('auth_token')?.value;

  if (!token) {
    return {
      authenticated: false,
      error: 'No token provided'
    };
  }

  const payload = verifyToken(token);

  if (!payload) {
    return {
      authenticated: false,
      error: 'Invalid or expired token'
    };
  }

  return {
    authenticated: true,
    user: payload
  };
}

/**
 * Next.js认证中间件
 * 用于保护需要登录的路由
 */
export async function authMiddleware(request: NextRequest) {
  const authResult = await verifyAuth(request);

  if (!authResult.authenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 将用户信息注入到headers中，供后续路由使用
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', authResult.user!.userId.toString());
  requestHeaders.set('x-user-username', authResult.user!.username);
  requestHeaders.set('x-user-membership', authResult.user!.membershipLevel);
  
  if (authResult.user!.membershipExpiry) {
    requestHeaders.set('x-user-membership-expiry', authResult.user!.membershipExpiry);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders
    }
  });
}

/**
 * 从请求headers中获取用户信息
 * @param request Next.js请求对象
 * @returns 用户信息或null
 */
export function getUserFromHeaders(request: NextRequest): JWTPayload | null {
  const userId = request.headers.get('x-user-id');
  const username = request.headers.get('x-user-username');
  const membershipLevel = request.headers.get('x-user-membership');
  const membershipExpiry = request.headers.get('x-user-membership-expiry');
  
  if (!userId || !username || !membershipLevel) {
    return null;
  }

  return {
    userId: Number(userId),
    username,
    email: '',
    membershipLevel,
    membershipExpiry: membershipExpiry || null
  };
}
