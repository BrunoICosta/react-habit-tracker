import { useSyncExternalStore } from 'react'

/**
 * Tiny hash router. Hash URLs work on any static host without server rewrites and keep the
 * PWA navigation fully offline, so a routing library would add weight without benefits here.
 */
export type Route =
  | { name: 'today' }
  | { name: 'habits' }
  | { name: 'habit-new' }
  | { name: 'habit-detail'; id: string }
  | { name: 'habit-edit'; id: string }
  | { name: 'stats' }
  | { name: 'settings' }
  | { name: 'not-found' }

export type TabName = 'today' | 'habits' | 'stats' | 'settings'

export function parseHash(hash: string): Route {
  const path = hash.replace(/^#/, '').replace(/\/+$/, '') || '/'
  const segments = path.split('/').filter(Boolean).map(decodeURIComponent)

  if (segments.length === 0) return { name: 'today' }
  const [first, second, third] = segments

  if (first === 'habitos') {
    if (!second) return { name: 'habits' }
    if (second === 'novo' && !third) return { name: 'habit-new' }
    if (!third) return { name: 'habit-detail', id: second }
    if (third === 'editar' && segments.length === 3) return { name: 'habit-edit', id: second }
  }
  if (first === 'estatisticas' && !second) return { name: 'stats' }
  if (first === 'ajustes' && !second) return { name: 'settings' }

  return { name: 'not-found' }
}

export function routeToHash(route: Route): string {
  switch (route.name) {
    case 'today':
    case 'not-found':
      return '#/'
    case 'habits':
      return '#/habitos'
    case 'habit-new':
      return '#/habitos/novo'
    case 'habit-detail':
      return `#/habitos/${encodeURIComponent(route.id)}`
    case 'habit-edit':
      return `#/habitos/${encodeURIComponent(route.id)}/editar`
    case 'stats':
      return '#/estatisticas'
    case 'settings':
      return '#/ajustes'
  }
}

/** Which bottom tab is highlighted for a route. */
export function tabOf(route: Route): TabName {
  switch (route.name) {
    case 'habits':
    case 'habit-new':
    case 'habit-detail':
    case 'habit-edit':
      return 'habits'
    case 'stats':
      return 'stats'
    case 'settings':
      return 'settings'
    default:
      return 'today'
  }
}

/** Translation key (namespace "common") of the page title for a route. */
export function titleKeyOf(route: Route): `routes.${Route['name']}` {
  return `routes.${route.name}`
}

export function navigate(route: Route, options: { replace?: boolean } = {}): void {
  const hash = routeToHash(route)
  if (options.replace) {
    window.history.replaceState(null, '', hash)
    window.dispatchEvent(new HashChangeEvent('hashchange'))
  } else {
    window.location.hash = hash
  }
  window.scrollTo({ top: 0 })
}

function subscribe(callback: () => void): () => void {
  window.addEventListener('hashchange', callback)
  return () => window.removeEventListener('hashchange', callback)
}

const getHash = () => window.location.hash

export function useRoute(): Route {
  const hash = useSyncExternalStore(subscribe, getHash, () => '')
  return parseHash(hash)
}
