import { useEffect, useSyncExternalStore } from 'react'
import { useSettingsStore } from '../../store/settingsStore'

export type ResolvedTheme = 'light' | 'dark'

const DARK_QUERY = '(prefers-color-scheme: dark)'

const THEME_COLORS: Record<ResolvedTheme, string> = {
  dark: '#0e0f13',
  light: '#f5f4f0',
}

function subscribe(callback: () => void): () => void {
  const media = window.matchMedia(DARK_QUERY)
  media.addEventListener('change', callback)
  return () => media.removeEventListener('change', callback)
}

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light'
}

/** Resolves the theme preference and mirrors it on `<html data-theme>` and the PWA theme color. */
export function useTheme(): ResolvedTheme {
  const preference = useSettingsStore((state) => state.theme)
  const systemTheme = useSyncExternalStore(subscribe, getSystemTheme, () => 'dark' as const)
  const resolved = preference === 'system' ? systemTheme : preference

  useEffect(() => {
    document.documentElement.dataset.theme = resolved
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', THEME_COLORS[resolved])
  }, [resolved])

  return resolved
}
