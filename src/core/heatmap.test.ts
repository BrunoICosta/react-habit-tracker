import { describe, expect, it } from 'vitest'
import type { Habit } from './habit'
import { buildHabitHeatmap, buildOverallHeatmap, heatmapRange, levelFor } from './heatmap'

const END = '2026-05-17' // Sunday

function habit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: 'h1',
    name: 'Ler',
    emoji: '📚',
    color: '#4f8cff',
    frequency: { kind: 'daily' },
    target: 1,
    createdAt: '2026-05-01',
    archived: false,
    archivedAt: null,
    ...overrides,
  }
}

describe('heatmapRange', () => {
  it('starts on a Sunday and covers the requested weeks', () => {
    expect(heatmapRange(END, 53)).toEqual({ start: '2025-05-18', end: END })
    expect(heatmapRange('2026-05-16', 2)).toEqual({ start: '2026-05-03', end: '2026-05-16' })
  })
})

describe('levelFor', () => {
  it('maps ratios to five intensity levels', () => {
    expect([0, 0.2, 0.34, 0.5, 0.67, 0.9, 1].map(levelFor)).toEqual([0, 1, 2, 2, 3, 3, 4])
  })
})

describe('buildHabitHeatmap', () => {
  it('lays cells out by week column and weekday row', () => {
    const data = buildHabitHeatmap(habit(), {}, '2026-05-13', 2)
    expect(data.cells).toHaveLength(11) // Sun 3 .. Wed 13
    expect(data.cells[0]).toMatchObject({ date: '2026-05-03', row: 0, column: 0 })
    expect(data.cells.at(-1)).toMatchObject({ date: '2026-05-13', row: 3, column: 1 })
  })

  it('uses the daily target for partial progress', () => {
    const data = buildHabitHeatmap(
      habit({ target: 3 }),
      { '2026-05-12': 1, '2026-05-13': 5 },
      END,
      2,
    )
    const byDate = Object.fromEntries(data.cells.map((cell) => [cell.date, cell]))
    expect(byDate['2026-05-12']).toMatchObject({ done: 1, total: 3, level: 1 })
    expect(byDate['2026-05-13']).toMatchObject({ done: 3, ratio: 1, level: 4 })
  })

  it('marks unscheduled and pre-creation days', () => {
    const weekdays = habit({
      frequency: { kind: 'weekdays', days: [1, 3] },
      createdAt: '2026-05-06',
    })
    const data = buildHabitHeatmap(weekdays, {}, END, 3)
    const scheduled = data.cells.filter((cell) => cell.scheduled).map((cell) => cell.date)
    expect(scheduled).toEqual(['2026-05-06', '2026-05-11', '2026-05-13'])
  })

  it('labels months on their first Sunday column', () => {
    const data = buildHabitHeatmap(habit(), {}, END, 53)
    // Range starts on Sun 2025-05-18; June 1st 2025 is a Sunday, so the partial May is dropped.
    expect(data.months[0]).toEqual({ label: 'Jun', column: 2 })
    expect(data.months.find((month) => month.label === 'Jul')?.column).toBe(7)
    expect(data.months.at(-1)?.label).toBe('Mai')
  })
})

describe('buildOverallHeatmap', () => {
  it('computes the share of scheduled habits completed per day', () => {
    const habits = [
      habit({ id: 'a' }),
      habit({ id: 'b', frequency: { kind: 'weekdays', days: [1] } }),
      habit({ id: 'c', archived: true, archivedAt: '2026-05-10' }),
    ]
    const logs = {
      a: { '2026-05-11': 1, '2026-05-12': 1 },
      b: { '2026-05-11': 1 },
      c: { '2026-05-09': 1 },
    }
    const data = buildOverallHeatmap(habits, logs, END, 3)
    const byDate = Object.fromEntries(data.cells.map((cell) => [cell.date, cell]))

    expect(byDate['2026-05-09']).toMatchObject({ done: 1, total: 2 }) // a + c (archived later)
    expect(byDate['2026-05-11']).toMatchObject({ done: 2, total: 2, level: 4 }) // Monday: a + b
    expect(byDate['2026-05-12']).toMatchObject({ done: 1, total: 1 }) // c archived, b not scheduled
    expect(byDate['2026-05-13']).toMatchObject({ done: 0, total: 1, level: 0 })
  })

  it('has no scheduled days before any habit exists', () => {
    const data = buildOverallHeatmap([habit({ createdAt: '2026-05-15' })], {}, END, 2)
    expect(data.cells.filter((cell) => cell.scheduled).map((cell) => cell.date)).toEqual([
      '2026-05-15',
      '2026-05-16',
      '2026-05-17',
    ])
  })
})
