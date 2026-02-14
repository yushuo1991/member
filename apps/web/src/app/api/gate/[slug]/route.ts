import { NextRequest, NextResponse } from 'next/server'
import { memberDatabase } from '@repo/database'
import { verifyUserToken } from '@repo/auth'
import { canAccessProductByMembership, getProductBySlug } from '@/lib/membership-levels'
import { getTrialFieldName } from '@/lib/trial-service'
import type { MembershipLevel } from '@/types/membership'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const product = getProductBySlug(slug)
  if (!product) {
    console.log(`[Gate] Product not found: ${slug}`)
    return new NextResponse('Not Found', { status: 404 })
  }

  const { isValid, user } = verifyUserToken(request)
  if (!isValid || !user) {
    console.log(`[Gate] Token invalid for ${slug}`)
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const db = memberDatabase.getPool()
  const [rows] = await db.execute<any[]>(
    `SELECT u.*, m.level as membership_level, m.expires_at as membership_expiry
     FROM users u
     LEFT JOIN memberships m ON u.id = m.user_id
     WHERE u.id = ?
     LIMIT 1`,
    [user.userId]
  )

  if (!rows || rows.length === 0) {
    console.log(`[Gate] User not found: ${user.userId}`)
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const userInfo = rows[0]
  const userLevel: MembershipLevel = userInfo.membership_level || 'none'
  const expiry: Date | null = userInfo.membership_expiry || null

  // 1. 检查会员权限
  if (canAccessProductByMembership(userLevel, slug, expiry)) {
    console.log(`[Gate] Access allowed (membership): user=${user.userId} product=${slug}`)
    return new NextResponse(null, { status: 204 })
  }

  // 2. 检查单独购买
  try {
    const [purchases] = await db.execute<any[]>(
      `SELECT id FROM user_product_purchases
       WHERE user_id = ? AND product_slug = ?
       AND (expires_at IS NULL OR expires_at > NOW())
       LIMIT 1`,
      [user.userId, slug]
    )
    if (purchases.length > 0) {
      console.log(`[Gate] Access allowed (purchased): user=${user.userId} product=${slug}`)
      return new NextResponse(null, { status: 204 })
    }
  } catch (e) {
    // 表可能不存在，忽略
  }

  // 3. 检查试用权限（最近2小时内有试用记录）
  try {
    const [trialLogs] = await db.execute<any[]>(
      `SELECT id FROM trial_logs
       WHERE user_id = ? AND product_slug = ?
       AND used_at > DATE_SUB(NOW(), INTERVAL 2 HOUR)
       LIMIT 1`,
      [user.userId, slug]
    )
    if (trialLogs.length > 0) {
      console.log(`[Gate] Access allowed (trial): user=${user.userId} product=${slug}`)
      return new NextResponse(null, { status: 204 })
    }
  } catch (e) {
    // 表可能不存在，忽略
  }

  console.log(`[Gate] Access denied: user=${user.userId} level=${userLevel} product=${slug} required=${product.requiredLevel}`)
  return new NextResponse('Forbidden', { status: 403 })
}

