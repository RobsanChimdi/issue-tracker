// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')

  // Protect all routes starting with /issues
  if (request.nextUrl.pathname.startsWith('/issues')) {
    if (!token) {
      const loginUrl = new URL('/Auth/Login', request.url)
      loginUrl.searchParams.set('returnUrl', request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Continue normally
  return NextResponse.next()
}

export const config = {
  matcher: ['/issues/:path*'], 
}
