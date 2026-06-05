import { createInstance } from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { afterEach, describe, expect, it, vi } from 'vitest'
import i18n, { LANGUAGE_STORAGE_KEY, i18nOptions, toSupportedLanguage } from './index'
import { resources } from './resources'

async function bootWith(navigatorLanguages: string[]) {
  vi.spyOn(window.navigator, 'languages', 'get').mockReturnValue(navigatorLanguages)
  vi.spyOn(window.navigator, 'language', 'get').mockReturnValue(navigatorLanguages[0] ?? '')
  const instance = createInstance()
  await instance.use(LanguageDetector).init(i18nOptions)
  return instance
}

/** Flattens nested resource objects into dotted key paths. */
function keysOf(value: unknown, prefix = ''): string[] {
  if (typeof value !== 'object' || value === null) return [prefix]
  return Object.entries(value).flatMap(([key, child]) =>
    keysOf(child, prefix ? `${prefix}.${key}` : key),
  )
}

describe('language detection', () => {
  afterEach(() => {
    localStorage.clear()
  })

  it.each([
    ['pt', 'pt-BR'],
    ['pt-PT', 'pt-BR'],
    ['PT-br', 'pt-BR'],
    ['en-US', 'en'],
    ['es-AR', 'en'],
    [undefined, 'pt-BR'],
  ])('maps %s to %s', (tag, expected) => {
    expect(toSupportedLanguage(tag)).toBe(expected)
  })

  it('uses the browser language on first visit', async () => {
    // The global test setup selects pt-BR (which is cached), so start from a clean slate.
    localStorage.clear()
    expect((await bootWith(['en-GB', 'pt-BR'])).language).toBe('en')
    localStorage.clear()
    expect((await bootWith(['pt-PT'])).language).toBe('pt-BR')
  })

  it('prefers the saved choice over the browser language', async () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'en')
    expect((await bootWith(['pt-BR'])).language).toBe('en')
  })

  it('persists changes and updates <html lang>', async () => {
    await i18n.changeLanguage('en')
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('en')
    expect(document.documentElement.lang).toBe('en')
    await i18n.changeLanguage('pt-BR')
    expect(document.documentElement.lang).toBe('pt-BR')
  })
})

describe('resources', () => {
  it('has the same keys in every language', () => {
    for (const namespace of Object.keys(
      resources['pt-BR'],
    ) as (keyof (typeof resources)['pt-BR'])[]) {
      expect(keysOf(resources.en[namespace]).sort()).toEqual(
        keysOf(resources['pt-BR'][namespace]).sort(),
      )
    }
  })
})
