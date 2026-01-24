/**
 * 用户登出API
 * POST /api/auth/logout
 */

import { NextRequest } from 'next/server';
import { verifyUserToken, createDeleteCookie } from '@repo/auth';
import { errorResponse, successResponse } from '@repo/auth';
import { errorResponse, successResponse, generateActivationCode, isValidEmail, isValidUsername, isValidPassword, formatDateTime } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    // 验证用户Token（可选，登出可以不验证）
    const { isValid, user } = verifyUserToken(request);

    // 创建响应
    const response = successResponse(
      null,
      isValid ? `${user?.username} 已登出` : '已登出'
    );

    // 删除认证Cookie
    response.headers.set('Set-Cookie', createDeleteCookie('auth_token'));

    return response;

  } catch (error) {
    console.error('[登出API] 登出失败:', error);
    return errorResponse('登出失败', 500);
  }
}
