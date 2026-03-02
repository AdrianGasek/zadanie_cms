'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'

const ADMIN_PATH = '/admin'
const COOKIE_NAME = 'payload-lng'
const SUPPORTED = ['pl', 'en', 'de'] as const

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=([^;]*)'))
  return match ? decodeURIComponent(match[1]) : null
}

/**
 * Gdy użytkownik trafi na /admin?locale=... (np. po nawigacji SPA), ciasteczko
 * payload-lng może być nieustawione lub inne. Wymuszenie pełnego przeładowania
 * strony powoduje, że proxy ustawi ciasteczko i Payload załaduje UI w wybranym języku.
 */
export function AdminLocaleReload() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const didReload = useRef(false)

  useEffect(() => {
    if (didReload.current || !pathname?.startsWith(ADMIN_PATH)) return

    const locale = searchParams.get('locale')
    if (!locale || !SUPPORTED.includes(locale as (typeof SUPPORTED)[number])) return

    const currentLng = getCookie(COOKIE_NAME)
    if (currentLng === locale) return

    didReload.current = true
    const url = pathname + (searchParams.toString() ? '?' + searchParams.toString() : '')
    window.location.href = url
  }, [pathname, searchParams])

  return null
}
