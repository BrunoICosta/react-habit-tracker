import { describe, expect, it } from 'vitest'
import { parseBackup } from './backup'
import { createSampleData } from './sample'
import { computeStreaks } from './streaks'

describe('createSampleData', () => {
  it('is deterministic and valid as a backup', () => {
    const first = createSampleData('2026-05-23')
    expect(createSampleData('2026-05-23')).toEqual(first)
    const result = parseBackup(JSON.stringify({ app: 'habitos', version: 1, ...first }))
    expect(result.ok).toBe(true)
  })

  it('creates habits with ongoing streaks', () => {
    const today = '2026-05-23'
    const { habits, logs } = createSampleData(today)
    expect(habits.length).toBeGreaterThanOrEqual(4)
    for (const habit of habits) {
      expect(computeStreaks(habit, logs[habit.id] ?? {}, today).current).toBeGreaterThan(0)
    }
  })
})
