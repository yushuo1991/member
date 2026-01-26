import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // /admin 是登录页面，允许访问
  if (pathname === '/admin') {
    return NextResponse.next()
  }

  // 其他admin页面需要验证token
  const adminToken = request.cookies.get('admin_token')?.value
  if (!adminToken) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}

