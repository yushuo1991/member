/**
 * 管理员登录API
 * POST /api/admin/auth/login
 */

import { NextRequest } from 'next/server';
import { memberDatabase } from '@/lib/database';
import { verifyPassword, errorResponse, successResponse } from '@/lib/utils';
import { generateToken, createAuthCookie } from '@/lib/auth-middleware';
import { checkRateLimit, recordAttempt, resetRateLimit, getClientIP } from '@/lib/rate-limiter';
import { LoginRequest } from '@/types/user';

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);

  try {
    // 限流检查（管理员登录更严格）
    const rateLimitCheck = await checkRateLimit(clientIP, 'login');
    if (!rateLimitCheck.isAllowed) {
      return errorResponse(
        `登录尝试次数过多，请在${rateLimitCheck.blockedUntil?.toLocaleTimeString('zh-CN')}后重试`,
        429
      );
    }

    // 解析请求体
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    // 输入验证
    if (!email || !password) {
      await recordAttempt(clientIP, 'login', false);
      return errorResponse('邮箱和密码不能为空', 400);
    }

    const db = memberDatabase.getPool();

    // 查询管理员
    const [admins] = await db.execute<any[]>(
      `SELECT id, username, email, password_hash, role
       FROM admins
       WHERE email = ?`,
      [email]
    );

    if (admins.length === 0) {
      await recordAttempt(clientIP, 'login', false);
      return errorResponse('邮箱或密码错误', 401);
    }

    const admin = admins[0];

    // 验证密码
    const isPasswordValid = await verifyPassword(password, admin.password_hash);

    if (!isPasswordValid) {
      await recordAttempt(clientIP, 'login', false);
      return errorResponse('邮箱或密码错误', 401);
    }

    // 生成JWT Token（管理员类型）
    const token = generateToken({
      userId: admin.id,
      username: admin.username,
      email: admin.email,
      membershipLevel: admin.role, // 使用role字段
      type: 'admin'
    });

    // 重置限流记录（登录成功）
    await resetRateLimit(clientIP, 'login');

    // 创建响应并设置HttpOnly Cookie
    const response = successResponse(
      {
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          role: admin.role
        },
        token
      },
      '管理员登录成功'
    );

    // 设置管理员认证Cookie
    response.headers.set('Set-Cookie', createAuthCookie(token, 'admin_token'));

    return response;

  } catch (error) {
    console.error('[管理员登录API] 登录失败:', error);
    await recordAttempt(clientIP, 'login', false);
    return errorResponse('登录失败，请稍后重试', 500);
  }
}
