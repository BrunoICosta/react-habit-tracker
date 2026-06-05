import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import i18n, { LANGUAGE_STORAGE_KEY } from '../../i18n'
import { PageHeader } from './PageHeader'

describe('LanguageSwitcher', () => {
  it('shows the current language and toggles it', async () => {
    const user = userEvent.setup()
    render(<PageHeader title="Hoje" backHref="#/habitos" />)

    const button = screen.getByRole('button', { name: /^Idioma: Português/ })
    expect(button).toHaveTextContent('PT')
    expect(button).toHaveAccessibleName('Idioma: Português. Mudar para English')

    await user.click(button)

    expect(i18n.language).toBe('en')
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('en')
    expect(document.documentElement.lang).toBe('en')
    expect(screen.getByRole('button', { name: /^Language: English/ })).toHaveTextContent('EN')
    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute('href', '#/habitos')
  })
})
