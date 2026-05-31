import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'
import i18n from '../i18n'

// jsdom does not implement matchMedia; default to a dark, motion-friendly environment.
if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn((query: string) => ({
      matches: query.includes('dark'),
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(() => false),
    })),
  })
}

// Tests assert pt-BR copy by default; English is covered explicitly in i18n tests.
beforeEach(async () => {
  await i18n.changeLanguage('pt-BR')
})

afterEach(() => {
  cleanup()
  localStorage.clear()
})
