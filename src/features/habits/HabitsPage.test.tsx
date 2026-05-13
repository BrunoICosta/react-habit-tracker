import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { useHabitStore } from '../../store/habitStore'
import { HabitsPage } from './HabitsPage'

describe('HabitsPage', () => {
  beforeEach(() => {
    useHabitStore.setState({ habits: [], logs: {} })
  })

  it('shows an empty state without habits', () => {
    render(<HabitsPage />)
    expect(screen.getByRole('heading', { name: 'Nenhum hábito ativo' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /criar hábito/i })).toHaveAttribute(
      'href',
      '#/habitos/novo',
    )
  })

  it('archives, restores and deletes a habit', async () => {
    const user = userEvent.setup()
    useHabitStore.getState().addHabit({
      name: 'Ler',
      emoji: '📚',
      color: '#4f8cff',
      frequency: { kind: 'daily' },
      target: 1,
    })
    render(<HabitsPage />)

    await user.click(screen.getByRole('button', { name: 'Arquivar Ler' }))
    const archived = screen.getByRole('list', { name: 'Arquivados' })
    expect(within(archived).getByText('Ler')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Excluir Ler' }))
    const dialog = screen.getByRole('alertdialog')
    expect(dialog).toHaveTextContent('Excluir “Ler”?')
    await user.click(within(dialog).getByRole('button', { name: 'Excluir' }))

    expect(useHabitStore.getState().habits).toHaveLength(0)
  })
})
