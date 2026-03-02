import type { Locale } from '../config'
import { DEFAULT_LOCALE, normalizeLocale } from '../config'

import pl from './pl.json'
import en from './en.json'
import de from './de.json'

export type TranslationKeys = typeof pl

const messages: Record<Locale, TranslationKeys> = {
  pl,
  en,
  de,
}

/**
 * Zwraca obiekt tłumaczeń dla danego locale.
 * Użycie: getTranslations(locale).common.more, getTranslations(locale).sections.integrations
 */
export function getTranslations(locale: string): TranslationKeys {
  const normalized = normalizeLocale(locale)
  return messages[normalized] ?? messages[DEFAULT_LOCALE]
}

export { pl, en, de }
