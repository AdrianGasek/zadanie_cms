export const DEFAULT_LOCALE = 'pl' as const
export const LOCALES = ['pl', 'en', 'de'] as const
export type Locale = (typeof LOCALES)[number]

export const LOCALE_LABELS: Record<Locale, string> = {
  pl: 'Polski',
  en: 'English',
  de: 'Deutsch',
}

export const LOCALE_CODES: Record<Locale, string> = {
  pl: 'pl-PL',
  en: 'en-US',
  de: 'de-DE',
}

/** Sprawdza, czy string jest poprawnym locale. */
export function isValidLocale(value: string): value is Locale {
  return LOCALES.includes(value as Locale)
}

/** Normalizuje wartość do locale (fallback na domyślny Polski). */
export function normalizeLocale(value: string | undefined | null): Locale {
  if (value && isValidLocale(value)) return value
  return DEFAULT_LOCALE
}
