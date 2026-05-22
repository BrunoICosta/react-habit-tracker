import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { fromDateKey, shiftDateKey, todayKey } from '../../core/dates'
import { useHabitStore } from '../../store/habitStore'
import { HabitDetailPage } from './HabitDetailPage'

describe('HabitDetailPage', () => {
  beforeEach(() => {
    useHabitStore.setState({ habits: [], logs: {} })
  })

  it('shows a not found state for unknown ids', () => {
    render(<HabitDetailPage id="nope" />)
    expect(screen.getByRole('heading', { name: 'Hábito não encontrado' })).toBeInTheDocument()
  })

  it('shows streaks and lets the user fix a past day', async () => {
    const user = userEvent.setup()
    const today = todayKey()
    const habit = useHabitStore
      .getState()
      .addHabit(
        { name: 'Meditar', emoji: '🧘', color: '#8b7bff', frequency: { kind: 'daily' }, target: 1 },
        shiftDateKey(today, -10),
      )
    useHabitStore.getState().setCount(habit.id, shiftDateKey(today, -1), 1)
    useHabitStore.getState().setCount(habit.id, shiftDateKey(today, -2), 1)

    render(<HabitDetailPage id={habit.id} />)

    expect(screen.getByRole('heading', { level: 1, name: 'Meditar' })).toBeInTheDocument()
    expect(screen.getByText('Sequência atual').nextElementSibling).toHaveTextContent('2')
    expect(screen.getByRole('status')).toHaveTextContent('manter sua sequência de 2 dias')

    const label = format(fromDateKey(shiftDateKey(today, -3)), "EEEE, d 'de' MMMM", {
      locale: ptBR,
    })
    await user.click(screen.getByRole('button', { name: label }))

    expect(screen.getByText('Melhor sequência').nextElementSibling).toHaveTextContent('3')
  })
})
