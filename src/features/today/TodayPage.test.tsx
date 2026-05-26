import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { todayKey } from '../../core/dates'
import type { HabitDraft } from '../../core/habit'
import { useHabitStore } from '../../store/habitStore'
import { TodayPage } from './TodayPage'

const base: HabitDraft = {
  name: 'Ler',
  emoji: '📚',
  color: '#8b7bff',
  frequency: { kind: 'daily' },
  target: 1,
}

function summary() {
  return screen.getByRole('region', { name: 'Progresso de hoje' })
}

describe('TodayPage', () => {
  beforeEach(() => {
    useHabitStore.setState({ habits: [], logs: {} })
  })

  it('offers to create a habit or load sample data when empty', async () => {
    const user = userEvent.setup()
    render(<TodayPage />)
    expect(screen.getByRole('heading', { name: 'Seu primeiro hábito' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /dados de exemplo/i }))
    expect(await screen.findByRole('list', { name: 'Hábitos de hoje' })).toBeInTheDocument()
  })

  it('checks a habit off and updates the progress', async () => {
    const user = userEvent.setup()
    useHabitStore.getState().addHabit(base)
    useHabitStore.getState().addHabit({ ...base, name: 'Correr', emoji: '🏃' })
    render(<TodayPage />)

    expect(within(summary()).getByText('0%')).toBeInTheDocument()
    const button = screen.getByRole('button', { name: 'Marcar Ler como feito' })
    await user.click(button)

    expect(screen.getByRole('button', { name: 'Desmarcar Ler' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(within(summary()).getByText('50%')).toBeInTheDocument()
    expect(summary()).toHaveAttribute('data-complete', 'false')

    await user.click(screen.getByRole('button', { name: 'Marcar Correr como feito' }))
    expect(within(summary()).getByText('100%')).toBeInTheDocument()
    expect(summary()).toHaveAttribute('data-complete', 'true')
    expect(screen.getByText('Tudo feito! Dia completo. 🎉')).toBeInTheDocument()
  })

  it('counts check-ins up to the daily target', async () => {
    const user = userEvent.setup()
    const habit = useHabitStore.getState().addHabit({ ...base, name: 'Água', target: 3 })
    render(<TodayPage />)

    await user.click(screen.getByRole('button', { name: 'Registrar Água (0 de 3)' }))
    await user.click(screen.getByRole('button', { name: 'Registrar Água (1 de 3)' }))
    expect(screen.getByText('2/3')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Remover um registro de Água' }))
    expect(useHabitStore.getState().logs[habit.id]?.[todayKey()]).toBe(1)

    await user.click(screen.getByRole('button', { name: 'Registrar Água (1 de 3)' }))
    await user.click(screen.getByRole('button', { name: 'Registrar Água (2 de 3)' }))
    expect(screen.getByRole('button', { name: 'Desmarcar Água' })).toBeInTheDocument()
  })

  it('only lists habits scheduled for today', () => {
    const weekday = new Date().getDay()
    const otherDay = ((weekday + 1) % 7) as 0 | 1 | 2 | 3 | 4 | 5 | 6
    useHabitStore.getState().addHabit(base)
    useHabitStore
      .getState()
      .addHabit({ ...base, name: 'Faxina', frequency: { kind: 'weekdays', days: [otherDay] } })
    render(<TodayPage />)

    const list = screen.getByRole('list', { name: 'Hábitos de hoje' })
    expect(within(list).getAllByRole('listitem')).toHaveLength(1)
    expect(screen.getByText('1 hábito não está programado para hoje.')).toBeInTheDocument()
  })
})
