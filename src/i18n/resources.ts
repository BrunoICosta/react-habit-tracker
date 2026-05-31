import enCommon from './locales/en/common'
import ptCommon from './locales/pt-BR/common'

export const SUPPORTED_LANGUAGES = ['pt-BR', 'en'] as const
export type Language = (typeof SUPPORTED_LANGUAGES)[number]
export const DEFAULT_LANGUAGE: Language = 'pt-BR'

/**
 * Resources are bundled TS modules (not fetched JSON): they ship inside the precached JS chunk,
 * so every language works offline without extra service worker routes, and keys are type-checked.
 */
export const resources = {
  'pt-BR': { common: ptCommon },
  en: { common: enCommon },
} as const

export const NAMESPACES = ['common'] as const
