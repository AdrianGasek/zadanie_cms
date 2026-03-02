export {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_LABELS,
  LOCALE_CODES,
  isValidLocale,
  normalizeLocale,
} from './config'
export type { Locale } from './config'

export { pathWithLocale, getPathnameFromSegments } from './routes'

export { getTranslations } from './translations'
export type { TranslationKeys } from './translations'
