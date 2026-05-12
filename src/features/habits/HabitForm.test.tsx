import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { HabitForm } from './HabitForm'

describe('HabitForm', () => {
  it('requires a name before submitting', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<HabitForm submitLabel="Criar hábito" onSubmit={onSubmit} />)

    await user.click(screen.getByRole('button', { name: 'Criar hábito' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Dê um nome ao hábito.')
    expect(screen.getByLabelText('Nome')).toHaveFocus()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits a weekly habit with a custom target', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<HabitForm submitLabel="Criar hábito" onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText('Nome'), '  Correr ')
    await user.click(screen.getByLabelText('Ícone 🏃'))
    await user.click(screen.getByLabelText('Menta'))
    await user.click(screen.getByRole('button', { name: 'Dias específicos' }))
    // Defaults to weekdays; drop Tuesday and Thursday.
    await user.click(screen.getByRole('button', { name: 'terça-feira' }))
    await user.click(screen.getByRole('button', { name: 'quinta-feira' }))
    await user.click(screen.getByRole('button', { name: 'Aumentar meta' }))
    await user.click(screen.getByRole('button', { name: 'Criar hábito' }))

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Correr',
      emoji: '🏃',
      color: '#20c997',
      frequency: { kind: 'weekdays', days: [1, 3, 5] },
      target: 2,
    })
  })

  it('asks for at least one weekday', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(
      <HabitForm
        submitLabel="Salvar"
        onSubmit={onSubmit}
        initial={{
          name: 'Yoga',
          emoji: '🧘',
          color: '#8b7bff',
          frequency: { kind: 'weekdays', days: [6] },
          target: 1,
        }}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'sábado' }))
    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Escolha pelo menos um dia da semana.')
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
