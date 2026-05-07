import { describe, expect, it } from 'vitest'
import { describeFrequency, isDayDone, isScheduledOn, normalizeFrequency, weekdayOf } from './habit'

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

  it('describes frequencies in Portuguese', () => {
    expect(describeFrequency({ kind: 'daily' })).toBe('Todos os dias')
    expect(describeFrequency({ kind: 'weekdays', days: [1, 2, 3, 4, 5] })).toBe('Dias úteis')
    expect(describeFrequency({ kind: 'weekdays', days: [6, 0] })).toBe('Fins de semana')
    expect(describeFrequency({ kind: 'weekdays', days: [0, 3, 1] })).toBe('Seg, Qua, Dom')
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
