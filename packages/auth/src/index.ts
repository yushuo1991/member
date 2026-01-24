/**
 * @repo/auth
 * 认证共享包
 */

// 导出类型
export type { JWTPayload, AuthResult } from './types';

// 导出认证函数
export {
  generateToken,
  verifyToken,
  extractToken,
  verifyUserToken,
  verifyAdminToken,
  createAuthCookie,
  createDeleteCookie,
  verifyAuth,
  requireAdmin,
  errorResponse,
  successResponse
} from './auth-middleware';

// 导出密码函数
export { hashPassword, verifyPassword } from './password';
