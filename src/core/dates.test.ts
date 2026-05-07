import { describe, expect, it } from 'vitest'
import { daysBetween, eachDateKey, fromDateKey, isDateKey, shiftDateKey, toDateKey } from './dates'

describe('date keys', () => {
  it('round-trips local dates', () => {
    expect(toDateKey(new Date(2026, 4, 4))).toBe('2026-05-04')
    expect(fromDateKey('2026-05-04').getDate()).toBe(4)
    expect(fromDateKey('2026-05-04').getHours()).toBe(0)
  })

  it('shifts across month and year boundaries', () => {
    expect(shiftDateKey('2026-05-31', 1)).toBe('2026-06-01')
    expect(shiftDateKey('2026-01-01', -1)).toBe('2025-12-31')
    expect(shiftDateKey('2028-02-28', 1)).toBe('2028-02-29')
  })

  it('lists inclusive ranges', () => {
    expect(eachDateKey('2026-05-30', '2026-06-02')).toEqual([
      '2026-05-30',
      '2026-05-31',
      '2026-06-01',
      '2026-06-02',
    ])
    expect(eachDateKey('2026-05-03', '2026-05-01')).toEqual([])
    expect(daysBetween('2026-05-01', '2026-05-08')).toBe(7)
  })

  it('validates keys', () => {
    expect(isDateKey('2026-05-04')).toBe(true)
    expect(isDateKey('2026-13-01')).toBe(false)
    expect(isDateKey('04/05/2026')).toBe(false)
    expect(isDateKey(20260504)).toBe(false)
  })
})
