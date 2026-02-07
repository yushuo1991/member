/**
 * JWT Authentication Middleware Tests
 * Tests for token generation, verification, and middleware functions
 */

import { NextRequest } from 'next/server';
import {
  generateToken,
  verifyToken,
  extractToken,
  verifyUserToken,
  verifyAdminToken,
  createAuthCookie,
  createDeleteCookie,
} from '../auth-middleware';
import { JWTPayload } from '../types';

// Mock NextRequest helper
function createMockRequest(options: {
  cookies?: Record<string, string>;
  authHeader?: string;
} = {}): NextRequest {
  const url = 'http://localhost:3000/api/test';
  const request = new NextRequest(url);

  // Mock cookies
  if (options.cookies) {
    Object.entries(options.cookies).forEach(([name, value]) => {
      (request.cookies as any).set(name, value);
    });
  }

  // Mock authorization header
  if (options.authHeader) {
    (request.headers as any).set('Authorization', options.authHeader);
  }

  return request;
}

describe('JWT Authentication Middleware', () => {
  describe('generateToken', () => {
    it('should generate a valid JWT token for user', () => {
      const payload = {
        userId: 1,
        username: 'testuser',
        type: 'user' as const,
      };

      const token = generateToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT format: header.payload.signature
    });

    it('should generate a valid JWT token for admin', () => {
      const payload = {
        userId: 1,
        username: 'admin',
        type: 'admin' as const,
      };

      const token = generateToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    it('should generate different tokens for different users', () => {
      const payload1 = { userId: 1, username: 'user1', type: 'user' as const };
      const payload2 = { userId: 2, username: 'user2', type: 'user' as const };

      const token1 = generateToken(payload1);
      const token2 = generateToken(payload2);

      expect(token1).not.toBe(token2);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const payload = {
        userId: 1,
        username: 'testuser',
        type: 'user' as const,
      };

      const token = generateToken(payload);
      const decoded = verifyToken(token);

      expect(decoded).not.toBeNull();
      expect(decoded?.userId).toBe(payload.userId);
      expect(decoded?.username).toBe(payload.username);
      expect(decoded?.type).toBe(payload.type);
    });

    it('should reject an invalid token', () => {
      const invalidToken = 'invalid.token.here';
      const decoded = verifyToken(invalidToken);

      expect(decoded).toBeNull();
    });

    it('should reject a malformed token', () => {
      const malformedToken = 'not-a-jwt-token';
      const decoded = verifyToken(malformedToken);

      expect(decoded).toBeNull();
    });

    it('should reject an empty token', () => {
      const decoded = verifyToken('');

      expect(decoded).toBeNull();
    });

    it('should include iat and exp in decoded token', () => {
      const payload = {
        userId: 1,
        username: 'testuser',
        type: 'user' as const,
      };

      const token = generateToken(payload);
      const decoded = verifyToken(token);

      expect(decoded).not.toBeNull();
      expect(decoded?.iat).toBeDefined();
      expect(decoded?.exp).toBeDefined();
      expect(typeof decoded?.iat).toBe('number');
      expect(typeof decoded?.exp).toBe('number');
    });
  });

  describe('extractToken', () => {
    it('should extract token from cookie', () => {
      const testToken = 'test-token-from-cookie';
      const request = createMockRequest({
        cookies: { auth_token: testToken },
      });

      const token = extractToken(request, 'auth_token');

      expect(token).toBe(testToken);
    });

    it('should extract token from Authorization header', () => {
      const testToken = 'test-token-from-header';
      const request = createMockRequest({
        authHeader: `Bearer ${testToken}`,
      });

      const token = extractToken(request, 'auth_token');

      expect(token).toBe(testToken);
    });

    it('should prioritize cookie over Authorization header', () => {
      const cookieToken = 'cookie-token';
      const headerToken = 'header-token';
      const request = createMockRequest({
        cookies: { auth_token: cookieToken },
        authHeader: `Bearer ${headerToken}`,
      });

      const token = extractToken(request, 'auth_token');

      expect(token).toBe(cookieToken);
    });

    it('should return null when no token is present', () => {
      const request = createMockRequest();

      const token = extractToken(request, 'auth_token');

      expect(token).toBeNull();
    });

    it('should handle custom cookie name', () => {
      const testToken = 'custom-token';
      const request = createMockRequest({
        cookies: { custom_token: testToken },
      });

      const token = extractToken(request, 'custom_token');

      expect(token).toBe(testToken);
    });
  });

  describe('verifyUserToken', () => {
    it('should verify valid user token', () => {
      const payload = {
        userId: 1,
        username: 'testuser',
        type: 'user' as const,
      };

      const token = generateToken(payload);
      const request = createMockRequest({
        cookies: { auth_token: token },
      });

      const result = verifyUserToken(request);

      expect(result.isValid).toBe(true);
      expect(result.user).not.toBeNull();
      expect(result.user?.userId).toBe(payload.userId);
      expect(result.user?.username).toBe(payload.username);
      expect(result.error).toBeUndefined();
    });

    it('should reject when no token is provided', () => {
      const request = createMockRequest();

      const result = verifyUserToken(request);

      expect(result.isValid).toBe(false);
      expect(result.user).toBeNull();
      expect(result.error).toBe('未提供认证Token');
    });

    it('should reject invalid token', () => {
      const request = createMockRequest({
        cookies: { auth_token: 'invalid-token' },
      });

      const result = verifyUserToken(request);

      expect(result.isValid).toBe(false);
      expect(result.user).toBeNull();
      expect(result.error).toBe('Token无效或已过期');
    });

    it('should reject admin token for user verification', () => {
      const payload = {
        userId: 1,
        username: 'admin',
        type: 'admin' as const,
      };

      const token = generateToken(payload);
      const request = createMockRequest({
        cookies: { auth_token: token },
      });

      const result = verifyUserToken(request);

      expect(result.isValid).toBe(false);
      expect(result.user).toBeNull();
      expect(result.error).toBe('Token类型错误');
    });
  });

  describe('verifyAdminToken', () => {
    it('should verify valid admin token', () => {
      const payload = {
        userId: 1,
        username: 'admin',
        type: 'admin' as const,
      };

      const token = generateToken(payload);
      const request = createMockRequest({
        cookies: { admin_token: token },
      });

      const result = verifyAdminToken(request);

      expect(result.isValid).toBe(true);
      expect(result.admin).not.toBeNull();
      expect(result.admin?.userId).toBe(payload.userId);
      expect(result.admin?.username).toBe(payload.username);
      expect(result.error).toBeUndefined();
    });

    it('should reject when no token is provided', () => {
      const request = createMockRequest();

      const result = verifyAdminToken(request);

      expect(result.isValid).toBe(false);
      expect(result.admin).toBeNull();
      expect(result.error).toBe('未提供管理员认证Token');
    });

    it('should reject user token for admin verification', () => {
      const payload = {
        userId: 1,
        username: 'testuser',
        type: 'user' as const,
      };

      const token = generateToken(payload);
      const request = createMockRequest({
        cookies: { admin_token: token },
      });

      const result = verifyAdminToken(request);

      expect(result.isValid).toBe(false);
      expect(result.admin).toBeNull();
      expect(result.error).toBe('Token类型错误');
    });
  });

  describe('createAuthCookie', () => {
    it('should create a valid cookie string', () => {
      const token = 'test-token';
      const cookie = createAuthCookie(token);

      expect(cookie).toContain('auth_token=test-token');
      expect(cookie).toContain('HttpOnly');
      expect(cookie).toContain('SameSite=Lax');
      expect(cookie).toContain('Path=/');
      expect(cookie).toContain('Max-Age=');
    });

    it('should support custom cookie name', () => {
      const token = 'test-token';
      const cookie = createAuthCookie(token, 'custom_token');

      expect(cookie).toContain('custom_token=test-token');
    });

    it('should set Max-Age to 7 days', () => {
      const token = 'test-token';
      const cookie = createAuthCookie(token);
      const sevenDaysInSeconds = 7 * 24 * 60 * 60;

      expect(cookie).toContain(`Max-Age=${sevenDaysInSeconds}`);
    });
  });

  describe('createDeleteCookie', () => {
    it('should create a cookie deletion string', () => {
      const cookie = createDeleteCookie();

      expect(cookie).toContain('auth_token=');
      expect(cookie).toContain('HttpOnly');
      expect(cookie).toContain('SameSite=Lax');
      expect(cookie).toContain('Path=/');
      expect(cookie).toContain('Max-Age=0');
    });

    it('should support custom cookie name', () => {
      const cookie = createDeleteCookie('custom_token');

      expect(cookie).toContain('custom_token=');
      expect(cookie).toContain('Max-Age=0');
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete authentication flow', () => {
      // 1. Generate token for user login
      const userPayload = {
        userId: 123,
        username: 'testuser',
        type: 'user' as const,
      };
      const token = generateToken(userPayload);

      // 2. Create cookie
      const cookie = createAuthCookie(token);
      expect(cookie).toContain('auth_token=');

      // 3. Verify token in request
      const request = createMockRequest({
        cookies: { auth_token: token },
      });
      const verification = verifyUserToken(request);

      expect(verification.isValid).toBe(true);
      expect(verification.user?.userId).toBe(123);
      expect(verification.user?.username).toBe('testuser');

      // 4. Logout - delete cookie
      const deleteCookie = createDeleteCookie();
      expect(deleteCookie).toContain('Max-Age=0');
    });

    it('should handle admin authentication flow', () => {
      const adminPayload = {
        userId: 1,
        username: 'admin',
        type: 'admin' as const,
      };
      const token = generateToken(adminPayload);

      const request = createMockRequest({
        cookies: { admin_token: token },
      });
      const verification = verifyAdminToken(request);

      expect(verification.isValid).toBe(true);
      expect(verification.admin?.type).toBe('admin');
    });
  });
});
