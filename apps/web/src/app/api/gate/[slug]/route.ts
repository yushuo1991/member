import { NextRequest, NextResponse } from 'next/server'
import { memberDatabase } from '@repo/database'
import { verifyUserToken } from '@repo/auth'
import { canAccessProductByMembership, getProductBySlug } from '@/lib/membership-levels'
import type { MembershipLevel } from '@/types/membership'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const product = getProductBySlug(slug)
  if (!product) {
    return new NextResponse('Not Found', { status: 404 })
  }

  const { isValid, user } = verifyUserToken(request)
  if (!isValid || !user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const db = memberDatabase.getPool()
  const [rows] = await db.execute<any[]>(
    `SELECT m.level as membership_level, m.expires_at as membership_expiry
     FROM users u
     LEFT JOIN memberships m ON u.id = m.user_id
     WHERE u.id = ?
     LIMIT 1`,
    [user.userId]
  )

  if (!rows || rows.length === 0) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const userLevel: MembershipLevel = rows[0].membership_level || 'none'
  const expiry: Date | null = rows[0].membership_expiry || null

  const allowed = canAccessProductByMembership(userLevel, slug, expiry)
  if (!allowed) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  return new NextResponse(null, { status: 204 })
}

