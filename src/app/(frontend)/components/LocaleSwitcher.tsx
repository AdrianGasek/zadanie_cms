'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { LOCALES, LOCALE_LABELS, type Locale } from '@/lib/i18n/config'
import { pathWithLocale } from '@/lib/i18n/routes'

type Props = {
  currentLocale: Locale
  /** Opcjonalna ścieżka bazowa (np. segment strony). Jeśli brak, używany jest pathname. */
  basePath?: string
  /** Etykieta dla aria-label (np. z tłumaczeń). */
  ariaLabel?: string
}

export function LocaleSwitcher({ currentLocale, basePath, ariaLabel }: Props) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const path = basePath ?? pathname
  const pathWithQuery = searchParams.toString() ? `${path}?${searchParams.toString()}` : path
  const pathWithoutLocaleQuery = pathWithQuery.replace(/\blocale=[^&]+&?/g, '').replace(/\?$/, '')

  return (
    <nav aria-label={ariaLabel ?? 'Wybierz język'} className="locale-switcher flex items-center gap-2">
      {LOCALES.map((locale) => {
        const href = pathWithLocale(pathWithoutLocaleQuery, locale)
        const isActive = locale === currentLocale
        return (
          <Link
            key={locale}
            href={href}
            lang={locale === 'pl' ? 'pl' : locale === 'de' ? 'de' : 'en'}
            aria-current={isActive ? 'true' : undefined}
            className={
              isActive
                ? 'font-semibold text-neutral-900 dark:text-neutral-100 underline'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
            }
          >
            {LOCALE_LABELS[locale]}
          </Link>
        )
      })}
    </nav>
  )
}
