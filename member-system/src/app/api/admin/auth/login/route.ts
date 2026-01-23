/**
 * Admin login API
 * POST /api/admin/auth/login
 */

import { NextRequest } from 'next/server';
import { memberDatabase } from '@/lib/database';
import { verifyPassword, errorResponse, successResponse } from '@/lib/utils';
import { generateToken, createAuthCookie } from '@/lib/auth-middleware';
import { checkRateLimit, recordAttempt, resetRateLimit, getClientIP } from '@/lib/rate-limiter';
import { LoginRequest } from '@/types/user';

function tryEnvAdminLogin(identifier: string, password: string) {
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) return null;
  if (!adminUsername && !adminEmail) return null;

  const normalized = identifier.trim();
  const matched =
    (adminUsername && normalized === adminUsername) || (adminEmail && normalized === adminEmail);

  if (!matched || password !== adminPassword) return null;

  const username = adminUsername || 'admin';
  const email = adminEmail || `${username}@admin.local`;

  return { id: 0, username, email, role: 'super_admin' };
}

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);

  try {
    const rateLimitCheck = await checkRateLimit(clientIP, 'login');
    if (!rateLimitCheck.isAllowed) {
      return errorResponse('Too many login attempts, please try again later.', 429);
    }

    const body: LoginRequest = await request.json();
    const identifier = body.identifier || body.username || body.email || '';
    const { password } = body;

    if (!identifier || !password) {
      await recordAttempt(clientIP, 'login', false);
      return errorResponse('Email and password are required.', 400);
    }

    // Prefer env-based admin login when configured (useful for first-time setup).
    const envAdmin = tryEnvAdminLogin(identifier, password);
    if (envAdmin) {
      const token = generateToken({
        userId: envAdmin.id,
        username: envAdmin.username,
        email: envAdmin.email,
        type: 'admin',
      });

      await resetRateLimit(clientIP, 'login');

      const response = successResponse(
        {
          admin: envAdmin,
          token,
        },
        'Admin login success'
      );

      response.headers.set('Set-Cookie', createAuthCookie(token, 'admin_token'));
      return response;
    }

    const db = memberDatabase.getPool();
    let adminRow: any | null = null;

    try {
      const [admins] = await db.execute<any[]>(
        `SELECT id, username, email, password_hash, role
         FROM admins
         WHERE email = ? OR username = ?`,
        [identifier, identifier]
      );
      adminRow = admins?.[0] ?? null;
    } catch (dbError) {
      const envAdmin = tryEnvAdminLogin(identifier, password);
      if (envAdmin) {
        const token = generateToken({
          userId: envAdmin.id,
          username: envAdmin.username,
          email: envAdmin.email,
          type: 'admin',
        });

        await resetRateLimit(clientIP, 'login');

        const response = successResponse(
          {
            admin: envAdmin,
            token,
          },
          'Admin login success'
        );

        response.headers.set('Set-Cookie', createAuthCookie(token, 'admin_token'));
        return response;
      }

      console.error('[Admin Login API] DB error and no env admin configured:', dbError);
      await recordAttempt(clientIP, 'login', false);
      return errorResponse('Admin login failed (database unavailable).', 500);
    }

    if (!adminRow) {
      await recordAttempt(clientIP, 'login', false);
      return errorResponse('Invalid email or password.', 401);
    }

    const isPasswordValid = await verifyPassword(password, adminRow.password_hash);
    if (!isPasswordValid) {
      await recordAttempt(clientIP, 'login', false);
      return errorResponse('Invalid email or password.', 401);
    }

    const token = generateToken({
      userId: adminRow.id,
      username: adminRow.username,
      email: adminRow.email,
      type: 'admin',
    });

    await resetRateLimit(clientIP, 'login');

    const response = successResponse(
      {
        admin: {
          id: adminRow.id,
          username: adminRow.username,
          email: adminRow.email,
          role: adminRow.role,
        },
        token,
      },
      'Admin login success'
    );

    response.headers.set('Set-Cookie', createAuthCookie(token, 'admin_token'));
    return response;
  } catch (error) {
    console.error('[Admin Login API] Login failed:', error);
    await recordAttempt(clientIP, 'login', false);
    return errorResponse('Admin login failed.', 500);
  }
}
