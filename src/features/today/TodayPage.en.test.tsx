import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import i18n from '../../i18n'
import { useHabitStore } from '../../store/habitStore'
import { TodayPage } from './TodayPage'

describe('TodayPage in English', () => {
  beforeEach(async () => {
    useHabitStore.setState({ habits: [], logs: {} })
    await i18n.changeLanguage('en')
  })

  it('renders the empty state and sample data in English', async () => {
    const user = userEvent.setup()
    render(<TodayPage />)

    expect(screen.getByRole('heading', { level: 1, name: 'Today' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Your first habit' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Try it with sample data' }))

    const list = await screen.findByRole('list', { name: "Today's habits" })
    expect(within(list).getAllByRole('listitem').length).toBeGreaterThan(0)
    // Sample habit names follow the active language.
    expect(useHabitStore.getState().habits.map((habit) => habit.name)).toContain('Read 10 pages')
  })

  it('formats the date and progress with the English locale', async () => {
    const user = userEvent.setup()
    useHabitStore.getState().addHabit({
      name: 'Stretch',
      emoji: '🧘',
      color: '#20c997',
      frequency: { kind: 'daily' },
      target: 1,
    })
    render(<TodayPage />)

    const weekday = new Intl.DateTimeFormat('en', { weekday: 'long' }).format(new Date())
    expect(screen.getByText(new RegExp(`^${weekday}, `))).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Mark Stretch as done' }))
    const summary = screen.getByRole('region', { name: "Today's progress" })
    expect(within(summary).getByText('100%')).toBeInTheDocument()
    expect(summary).toHaveTextContent('1 of 1 habit')
    expect(summary).toHaveTextContent('All done! Day complete.')
  })
})
