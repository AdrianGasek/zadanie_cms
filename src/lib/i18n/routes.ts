import { DEFAULT_LOCALE, type Locale } from './config'

/**
 * Buduje ścieżkę z uwzględnieniem locale.
 * Dla domyślnego (pl) nie dodajemy query – dla en/de dodajemy ?locale=...
 */
export function pathWithLocale(pathname: string, locale: Locale): string {
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`
  if (locale === DEFAULT_LOCALE) return path
  const separator = path.includes('?') ? '&' : '?'
  return `${path}${separator}locale=${locale}`
}

/**
 * Wyciąga ścieżkę bez query (segmenty strony). Nie zmienia samego query.
 */
export function getPathnameFromSegments(segments: string[] | undefined): string {
  if (!segments?.length) return '/'
  return '/' + segments.join('/')
}
