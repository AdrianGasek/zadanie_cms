import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ADMIN_PATH = '/admin'
const COOKIE_NAME = 'payload-lng'
const SUPPORTED_LANGS = ['pl', 'en', 'de']

/**
 * Sync admin UI language with URL ?locale= param so field labels translate.
 * getRequestLanguage() in Payload reads this cookie and sets i18n language.
 */
export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  if (!pathname.startsWith(ADMIN_PATH)) {
    return NextResponse.next()
  }

  const localeFromUrl = searchParams.get('locale')
  if (!localeFromUrl || !SUPPORTED_LANGS.includes(localeFromUrl)) {
    return NextResponse.next()
  }

  const currentLng = request.cookies.get(COOKIE_NAME)?.value
  if (currentLng === localeFromUrl) {
    return NextResponse.next()
  }

  const response = NextResponse.redirect(request.url)
  response.cookies.set(COOKIE_NAME, localeFromUrl, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  })
  return response
}

export const config = {
  matcher: ['/admin/:path*'],
}
