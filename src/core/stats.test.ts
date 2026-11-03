import { describe, expect, it } from 'vitest'
import type { Habit } from './habit'
import {
  formatPercent,
  habitCompletionRate,
  overallCompletionRate,
  perfectDays,
  rankHabits,
  weekStart,
  weeklyBreakdown,
} from './stats'

const TODAY = '2026-05-20' // Wednesday

function habit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: 'h1',
    name: 'Ler',
    emoji: '📚',
    color: '#4f8cff',
    frequency: { kind: 'daily' },
    target: 1,
    createdAt: '2026-05-18',
    archived: false,
    archivedAt: null,
    ...overrides,
  }
}

describe('habitCompletionRate', () => {
  it('does not penalize a pending today', () => {
    const rate = habitCompletionRate(habit(), { '2026-05-18': 1 }, '2026-05-01', TODAY, TODAY)
    expect(rate).toEqual({ done: 1, scheduled: 2, rate: 0.5 })
  })

  it('counts today once it is done', () => {
    const log = { '2026-05-18': 1, '2026-05-19': 1, '2026-05-20': 1 }
    expect(habitCompletionRate(habit(), log, '2026-05-01', TODAY, TODAY).rate).toBe(1)
  })

  it('only considers scheduled days within the tracked period', () => {
    const mwf = habit({ frequency: { kind: 'weekdays', days: [1, 3, 5] }, createdAt: '2026-05-11' })
    // Scheduled: 11, 13, 15, 18 (20 is today, pending)
    const rate = habitCompletionRate(
      mwf,
      { '2026-05-13': 1, '2026-05-18': 1 },
      '2026-05-01',
      TODAY,
      TODAY,
    )
    expect(rate).toEqual({ done: 2, scheduled: 4, rate: 0.5 })
  })

  it('returns null rate when nothing was scheduled', () => {
    expect(
      habitCompletionRate(habit({ createdAt: '2026-06-01' }), {}, '2026-05-01', TODAY, TODAY),
    ).toEqual({
      done: 0,
      scheduled: 0,
      rate: null,
    })
  })
})

describe('weekly stats', () => {
  it('finds the Monday of the week', () => {
    expect(weekStart('2026-05-20')).toBe('2026-05-18')
    expect(weekStart('2026-05-24')).toBe('2026-05-18') // Sunday belongs to the same week
  })

  it('breaks the week down per day', () => {
    const habits = [
      habit({ id: 'a' }),
      habit({ id: 'b', frequency: { kind: 'weekdays', days: [2] } }),
    ]
    const logs = { a: { '2026-05-18': 1, '2026-05-19': 1 }, b: { '2026-05-19': 1 } }
    const week = weeklyBreakdown(habits, logs, TODAY, TODAY)
    expect(week).toHaveLength(7)
    expect(week[0]).toEqual({ date: '2026-05-18', done: 1, scheduled: 1, future: false })
    expect(week[1]).toEqual({ date: '2026-05-19', done: 2, scheduled: 2, future: false })
    expect(week[6]).toMatchObject({ date: '2026-05-24', future: true, scheduled: 1 })
  })

  it('aggregates rates and perfect days', () => {
    const habits = [habit({ id: 'a' }), habit({ id: 'b' })]
    const logs = { a: { '2026-05-18': 1, '2026-05-19': 1 }, b: { '2026-05-18': 1 } }
    expect(overallCompletionRate(habits, logs, '2026-05-18', TODAY, TODAY)).toEqual({
      done: 3,
      scheduled: 4,
      rate: 0.75,
    })
    expect(perfectDays(habits, logs, '2026-05-18', TODAY)).toBe(1)
  })
})

describe('rankHabits', () => {
  it('sorts by completion rate', () => {
    const habits = [habit({ id: 'a', name: 'A' }), habit({ id: 'b', name: 'B' })]
    const logs = { a: { '2026-05-18': 1 }, b: { '2026-05-18': 1, '2026-05-19': 1 } }
    const ranking = rankHabits(habits, logs, '2026-05-01', TODAY)
    expect(ranking.map((item) => item.habit.name)).toEqual(['B', 'A'])
    expect(ranking[0]).toMatchObject({ current: 2, best: 2 })
  })

  it('formats percentages', () => {
    expect(formatPercent(0.666)).toBe('67%')
    expect(formatPercent(null)).toBe('-')
    expect(formatPercent(0.5, 'en')).toBe('50%')
  })
})
