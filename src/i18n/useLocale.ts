import type { Locale } from 'date-fns'
import { enUS, ptBR } from 'date-fns/locale'
import { useTranslation } from 'react-i18next'
import { toSupportedLanguage } from './index'
import type { Language } from './resources'

const DATE_LOCALES: Record<Language, Locale> = { 'pt-BR': ptBR, en: enUS }

export interface ActiveLocale {
  language: Language
  /** date-fns locale for `format`. */
  dateLocale: Locale
}

export function dateLocaleFor(language: string): Locale {
  return DATE_LOCALES[toSupportedLanguage(language)]
}

/** Active language plus the matching date-fns locale; re-renders on language change. */
export function useLocale(): ActiveLocale {
  const { i18n } = useTranslation()
  const language = toSupportedLanguage(i18n.resolvedLanguage ?? i18n.language)
  return { language, dateLocale: DATE_LOCALES[language] }
}
