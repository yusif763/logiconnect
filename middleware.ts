import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { auth } from './lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const intlMiddleware = createMiddleware(routing)

const publicRoutes = ['/login', '/register/supplier', '/register/logistics', '/']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if it's an API route
  if (pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // Strip locale prefix for route checking
  const pathnameWithoutLocale = pathname.replace(/^\/(az|en)/, '') || '/'

  const isPublicRoute = publicRoutes.some(
    (route) => pathnameWithoutLocale === route || pathnameWithoutLocale.startsWith(route + '/')
  )

  if (!isPublicRoute) {
    const session = await auth()
    if (!session) {
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
