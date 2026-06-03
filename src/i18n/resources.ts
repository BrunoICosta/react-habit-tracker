import enCommon from './locales/en/common'
import enHabits from './locales/en/habits'
import enHeatmap from './locales/en/heatmap'
import enSettings from './locales/en/settings'
import enStats from './locales/en/stats'
import enToday from './locales/en/today'
import ptCommon from './locales/pt-BR/common'
import ptHabits from './locales/pt-BR/habits'
import ptHeatmap from './locales/pt-BR/heatmap'
import ptSettings from './locales/pt-BR/settings'
import ptStats from './locales/pt-BR/stats'
import ptToday from './locales/pt-BR/today'

export const SUPPORTED_LANGUAGES = ['pt-BR', 'en'] as const
export type Language = (typeof SUPPORTED_LANGUAGES)[number]
export const DEFAULT_LANGUAGE: Language = 'pt-BR'

/**
 * One namespace per feature. Resources are bundled TS modules (not fetched JSON): they ship inside
 * the precached JS, so every language works offline with no extra service worker routes, and the
 * English files are typed against pt-BR (`typeof`), so a missing key fails the build.
 */
export const resources = {
  'pt-BR': {
    common: ptCommon,
    today: ptToday,
    habits: ptHabits,
    stats: ptStats,
    settings: ptSettings,
    heatmap: ptHeatmap,
  },
  en: {
    common: enCommon,
    today: enToday,
    habits: enHabits,
    stats: enStats,
    settings: enSettings,
    heatmap: enHeatmap,
  },
} as const

export const NAMESPACES = ['common', 'today', 'habits', 'stats', 'settings', 'heatmap'] as const
