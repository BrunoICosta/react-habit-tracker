import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { App } from './App'

describe('App', () => {
  beforeEach(() => {
    window.location.hash = ''
  })

  it('renders the navigation and applies the resolved theme', () => {
    render(<App />)
    const nav = screen.getByRole('navigation', { name: 'Navegação principal' })
    expect(nav).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Hoje' })).toHaveAttribute('aria-current', 'page')
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(document.title).toBe('Hoje · Hábitos')
  })

  it('renders the not found page for unknown hashes', () => {
    window.location.hash = '#/nada-aqui'
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Página não encontrada' })).toBeInTheDocument()
  })
})
