import { describe, expect, it } from 'vitest'
import { eachDateKey } from './dates'
import type { HabitLog } from './habit'
import { computeStreaks, trackingStart, type StreakHabit } from './streaks'

// May 2026: the 4th is a Monday.
const TODAY = '2026-05-15' // Friday

function habit(overrides: Partial<StreakHabit> = {}): StreakHabit {
  return {
    frequency: { kind: 'daily' },
    target: 1,
    createdAt: '2026-05-01',
    archivedAt: null,
    ...overrides,
  }
}

function logOf(keys: string[], count = 1): HabitLog {
  return Object.fromEntries(keys.map((key) => [key, count]))
}

describe('trackingStart', () => {
  it('uses the creation date by default', () => {
    expect(trackingStart({ createdAt: '2026-05-10' }, {})).toBe('2026-05-10')
  })

  it('goes back to the oldest positive check-in (imported history)', () => {
    expect(trackingStart({ createdAt: '2026-05-10' }, { '2026-04-01': 1, '2026-03-01': 0 })).toBe(
      '2026-04-01',
    )
  })
})

describe('computeStreaks', () => {
  it('returns zeros for a habit without check-ins', () => {
    expect(computeStreaks(habit(), {}, TODAY)).toEqual({ current: 0, best: 0, atRisk: false })
  })

  it('counts consecutive daily completions including today', () => {
    const log = logOf(eachDateKey('2026-05-11', TODAY))
    expect(computeStreaks(habit(), log, TODAY)).toMatchObject({ current: 5, best: 5 })
  })

  it('keeps the streak alive while today is still pending', () => {
    const log = logOf(eachDateKey('2026-05-11', '2026-05-14'))
    expect(computeStreaks(habit(), log, TODAY)).toEqual({ current: 4, best: 4, atRisk: true })
  })

  it('breaks the streak when a past scheduled day was missed', () => {
    const log = logOf(['2026-05-10', '2026-05-11', '2026-05-12', '2026-05-14', '2026-05-15'])
    expect(computeStreaks(habit(), log, TODAY)).toMatchObject({ current: 2, best: 3 })
  })

  it('resets the current streak after missing yesterday', () => {
    const log = logOf(['2026-05-12', '2026-05-13'])
    expect(computeStreaks(habit(), log, TODAY)).toEqual({ current: 0, best: 2, atRisk: false })
  })

  it('ignores days outside the weekly frequency', () => {
    // Mon/Wed/Fri habit: 4, 6, 8, 11, 13, 15 of May are scheduled.
    const mwf = habit({ frequency: { kind: 'weekdays', days: [1, 3, 5] } })
    const log = logOf(['2026-05-04', '2026-05-06', '2026-05-08', '2026-05-11', '2026-05-13'])
    expect(computeStreaks(mwf, log, TODAY)).toEqual({ current: 5, best: 5, atRisk: true })
  })

  it('does not reward completions on unscheduled days', () => {
    const weekends = habit({ frequency: { kind: 'weekdays', days: [0, 6] } })
    // Only weekdays checked: no scheduled day was completed, and last weekend was missed.
    const log = logOf(['2026-05-11', '2026-05-12', '2026-05-13'])
    expect(computeStreaks(weekends, log, TODAY)).toEqual({ current: 0, best: 0, atRisk: false })
  })

  it('treats a weekly habit with a missed scheduled day as broken', () => {
    const tueThu = habit({ frequency: { kind: 'weekdays', days: [2, 4] } })
    // Tue 5, Thu 7, Tue 12 done; Thu 14 missed. Today (Fri) is not scheduled.
    const log = logOf(['2026-05-05', '2026-05-07', '2026-05-12'])
    expect(computeStreaks(tueThu, log, TODAY)).toEqual({ current: 0, best: 3, atRisk: false })
  })

  it('requires the daily target to be reached', () => {
    const water = habit({ target: 3 })
    const log: HabitLog = { '2026-05-13': 3, '2026-05-14': 4, '2026-05-15': 2 }
    expect(computeStreaks(water, log, TODAY)).toEqual({ current: 2, best: 2, atRisk: true })
  })

  it('counts partial progress as a miss on past days', () => {
    const water = habit({ target: 3 })
    const log: HabitLog = { '2026-05-12': 3, '2026-05-13': 1, '2026-05-14': 3 }
    expect(computeStreaks(water, log, TODAY)).toMatchObject({ current: 1, best: 1 })
  })

  it('tracks the best streak from history before the creation date', () => {
    const imported = habit({ createdAt: '2026-05-14' })
    const log = logOf(eachDateKey('2026-04-01', '2026-04-20'))
    expect(computeStreaks(imported, log, TODAY)).toMatchObject({ current: 0, best: 20 })
  })

  it('freezes archived habits at the archive date', () => {
    const archived = habit({ archivedAt: '2026-05-08' })
    const log = logOf(eachDateKey('2026-05-04', '2026-05-08'))
    expect(computeStreaks(archived, log, TODAY)).toEqual({ current: 5, best: 5, atRisk: false })
  })

  it('handles habits created in the future of the reference date', () => {
    expect(computeStreaks(habit({ createdAt: '2026-06-01' }), {}, TODAY)).toEqual({
      current: 0,
      best: 0,
      atRisk: false,
    })
  })

  it('never schedules a habit with no weekdays selected', () => {
    const none = habit({ frequency: { kind: 'weekdays', days: [] } })
    expect(computeStreaks(none, logOf(['2026-05-14', TODAY]), TODAY)).toMatchObject({
      current: 0,
      best: 0,
    })
  })

  it('crosses month boundaries', () => {
    const log = logOf(eachDateKey('2026-04-28', '2026-05-03'))
    expect(computeStreaks(habit({ createdAt: '2026-04-28' }), log, '2026-05-03')).toMatchObject({
      current: 6,
      best: 6,
    })
  })
})
