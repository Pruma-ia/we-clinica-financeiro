import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const path = req.nextUrl.pathname
  const isAuthPage = path === '/login' || path.startsWith('/acesso-negado')

  if (!isLoggedIn && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  if (isLoggedIn && path === '/login') {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
  }
})

export const config = {
  matcher: ['/((?!api/auth|acesso-negado|_next/static|_next/image|favicon.ico).*)'],
}
