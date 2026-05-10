import { describe, expect, it } from 'vitest'
import { parseHash, routeToHash, tabOf, type Route } from './router'

describe('hash router', () => {
  it.each<[string, Route]>([
    ['', { name: 'today' }],
    ['#/', { name: 'today' }],
    ['#/habitos', { name: 'habits' }],
    ['#/habitos/', { name: 'habits' }],
    ['#/habitos/novo', { name: 'habit-new' }],
    ['#/habitos/abc', { name: 'habit-detail', id: 'abc' }],
    ['#/habitos/abc/editar', { name: 'habit-edit', id: 'abc' }],
    ['#/estatisticas', { name: 'stats' }],
    ['#/ajustes', { name: 'settings' }],
    ['#/qualquer', { name: 'not-found' }],
    ['#/habitos/abc/xyz', { name: 'not-found' }],
  ])('parses %s', (hash, route) => {
    expect(parseHash(hash)).toEqual(route)
  })

  it('round-trips routes', () => {
    const routes: Route[] = [
      { name: 'habits' },
      { name: 'habit-new' },
      { name: 'habit-detail', id: 'a b' },
      { name: 'habit-edit', id: 'x' },
      { name: 'stats' },
      { name: 'settings' },
    ]
    for (const route of routes) expect(parseHash(routeToHash(route))).toEqual(route)
  })

  it('maps nested routes to their tab', () => {
    expect(tabOf({ name: 'habit-edit', id: 'x' })).toBe('habits')
    expect(tabOf({ name: 'not-found' })).toBe('today')
  })
})
