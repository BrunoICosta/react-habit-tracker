import { describe, expect, it } from 'vitest'
import {
  frequencyPattern,
  isDayDone,
  isScheduledOn,
  normalizeFrequency,
  scheduledDays,
  weekdayOf,
} from './habit'

describe('habit frequency', () => {
  it('resolves weekdays from date keys', () => {
    expect(weekdayOf('2026-05-04')).toBe(1) // Monday
    expect(weekdayOf('2026-05-10')).toBe(0) // Sunday
  })

  it('checks if a day is scheduled', () => {
    expect(isScheduledOn({ kind: 'daily' }, '2026-05-10')).toBe(true)
    expect(isScheduledOn({ kind: 'weekdays', days: [1, 3, 5] }, '2026-05-04')).toBe(true)
    expect(isScheduledOn({ kind: 'weekdays', days: [1, 3, 5] }, '2026-05-05')).toBe(false)
  })

  it('classifies frequency patterns', () => {
    expect(frequencyPattern({ kind: 'daily' })).toBe('daily')
    expect(frequencyPattern({ kind: 'weekdays', days: [1, 2, 3, 4, 5] })).toBe('workdays')
    expect(frequencyPattern({ kind: 'weekdays', days: [6, 0] })).toBe('weekends')
    expect(frequencyPattern({ kind: 'weekdays', days: [] })).toBe('none')
    expect(frequencyPattern({ kind: 'weekdays', days: [0, 3, 1] })).toBe('custom')
  })

  it('lists scheduled days starting on Monday', () => {
    expect(scheduledDays({ kind: 'weekdays', days: [0, 3, 1] })).toEqual([1, 3, 0])
    expect(scheduledDays({ kind: 'daily' })).toHaveLength(7)
  })

  it('normalizes frequencies', () => {
    expect(normalizeFrequency({ kind: 'weekdays', days: [0, 1, 2, 3, 4, 5, 6] })).toEqual({
      kind: 'daily',
    })
    expect(normalizeFrequency({ kind: 'weekdays', days: [5, 1, 5] })).toEqual({
      kind: 'weekdays',
      days: [1, 5],
    })
  })

  it('compares count with target', () => {
    expect(isDayDone(undefined, 1)).toBe(false)
    expect(isDayDone(1, 1)).toBe(true)
    expect(isDayDone(2, 3)).toBe(false)
    expect(isDayDone(1, 0)).toBe(true)
  })
})
