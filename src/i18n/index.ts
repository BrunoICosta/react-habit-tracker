import i18n, { type InitOptions } from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import {
  DEFAULT_LANGUAGE,
  NAMESPACES,
  SUPPORTED_LANGUAGES,
  resources,
  type Language,
} from './resources'

export const LANGUAGE_STORAGE_KEY = 'habitos:lang'

/** Maps any detected tag to a supported language: pt* → pt-BR, anything else → en. */
export function toSupportedLanguage(tag: string | undefined | null): Language {
  if (!tag) return DEFAULT_LANGUAGE
  return tag.toLowerCase().startsWith('pt') ? 'pt-BR' : 'en'
}

export function isLanguage(value: unknown): value is Language {
  return SUPPORTED_LANGUAGES.includes(value as Language)
}

function syncDocumentLanguage(language: string) {
  if (typeof document !== 'undefined') document.documentElement.lang = toSupportedLanguage(language)
}

i18n.on('languageChanged', syncDocumentLanguage)

/** Shared options (exported so tests can boot isolated instances with the same detection). */
export const i18nOptions: InitOptions = {
  resources,
  ns: NAMESPACES,
  defaultNS: 'common',
  fallbackLng: DEFAULT_LANGUAGE,
  supportedLngs: [...SUPPORTED_LANGUAGES],
  // Order: saved choice > browser language > fallback (pt-BR).
  detection: {
    order: ['localStorage', 'navigator'],
    lookupLocalStorage: LANGUAGE_STORAGE_KEY,
    caches: ['localStorage'],
    convertDetectedLanguage: toSupportedLanguage,
  },
  interpolation: { escapeValue: false },
}

void i18n.use(LanguageDetector).use(initReactI18next).init(i18nOptions)

export default i18n
