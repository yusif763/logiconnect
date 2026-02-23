import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const intlMiddleware = createMiddleware(routing)

const publicRoutes = ['/login', '/register/supplier', '/register/logistics', '/']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if it's an API route - let API routes handle their own auth
  if (pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // Strip locale prefix for route checking
  const pathnameWithoutLocale = pathname.replace(/^\/(az|en)/, '') || '/'

  const isPublicRoute = publicRoutes.some(
    (route) => pathnameWithoutLocale === route || pathnameWithoutLocale.startsWith(route + '/')
  )

  // For protected routes, check for session cookie
  // NextAuth session cookie name is determined by: useSecureCookies ? '__Secure-' : '' + 'authjs.session-token'
  if (!isPublicRoute) {
    const hasSessionCookie = request.cookies.has('authjs.session-token') ||
                             request.cookies.has('__Secure-authjs.session-token')

    if (!hasSessionCookie) {
      const locale = pathname.split('/')[1]
      const validLocales = ['az', 'en']
      const localePrefix = validLocales.includes(locale) ? `/${locale}` : ''
      return NextResponse.redirect(new URL(`${localePrefix}/login`, request.url))
    }
  }

  return intlMiddleware(request)
}

export const config = {
  matcher: ['/((?!_next|_vercel|.*\\..*).*)'],
}
