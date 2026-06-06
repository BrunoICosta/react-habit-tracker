import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import i18n, { LANGUAGE_STORAGE_KEY } from '../../i18n'
import { LanguageSwitcher } from './LanguageSwitcher'
import { PageHeader } from './PageHeader'

describe('LanguageSwitcher', () => {
  it('renders flag radios named in their own language', () => {
    render(<PageHeader title="Hoje" backHref="#/habitos" />)

    const group = screen.getByRole('radiogroup', { name: 'Idioma' })
    const portuguese = within(group).getByRole('radio', { name: 'Português (Brasil)' })
    const english = within(group).getByRole('radio', { name: 'English' })

    expect(portuguese).toHaveAttribute('aria-checked', 'true')
    expect(portuguese).toHaveAttribute('lang', 'pt-BR')
    expect(portuguese).toHaveAttribute('title', 'Português (Brasil)')
    expect(english).toHaveAttribute('aria-checked', 'false')
    expect(english).toHaveAttribute('lang', 'en')
    // Only the checked option is tabbable (roving tabindex).
    expect(portuguese).toHaveAttribute('tabindex', '0')
    expect(english).toHaveAttribute('tabindex', '-1')
  })

  it('switches language on click and persists it', async () => {
    const user = userEvent.setup()
    render(<PageHeader title="Hoje" backHref="#/habitos" />)

    await user.click(screen.getByRole('radio', { name: 'English' }))

    expect(i18n.language).toBe('en')
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('en')
    expect(document.documentElement.lang).toBe('en')
    expect(screen.getByRole('radiogroup', { name: 'Language' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'English' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute('href', '#/habitos')
  })

  it('moves between languages with the arrow keys', async () => {
    const user = userEvent.setup()
    render(<LanguageSwitcher showLabels />)

    await user.tab()
    expect(screen.getByRole('radio', { name: 'Português (Brasil)' })).toHaveFocus()

    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('radio', { name: 'English' })).toHaveFocus()
    expect(i18n.language).toBe('en')

    await user.keyboard('{ArrowLeft}')
    expect(screen.getByRole('radio', { name: 'Português (Brasil)' })).toHaveFocus()
    expect(i18n.language).toBe('pt-BR')
  })
})
