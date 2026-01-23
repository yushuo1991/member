/**
 * 管理员退出登录API
 * POST /api/admin/auth/logout
 */

import { NextRequest } from 'next/server'
import { createDeleteCookie } from '@/lib/auth-middleware'
import { successResponse } from '@/lib/utils'

export async function POST(_request: NextRequest) {
  const response = successResponse(null, '管理员已退出登录')
  response.headers.set('Set-Cookie', createDeleteCookie('admin_token'))
  return response
}
