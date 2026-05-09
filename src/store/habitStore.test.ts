import { beforeEach, describe, expect, it } from 'vitest'
import type { HabitDraft } from '../core/habit'
import {
  HABIT_STORAGE_KEY,
  selectActiveHabits,
  selectArchivedHabits,
  useHabitStore,
} from './habitStore'

const DAY = '2026-05-09'

const draft: HabitDraft = {
  name: '  Beber água  ',
  emoji: '💧',
  color: '#38bdf8',
  frequency: { kind: 'daily' },
  target: 3,
}

describe('habit store', () => {
  beforeEach(() => {
    localStorage.clear()
    useHabitStore.setState({ habits: [], logs: {} })
  })

  it('adds a sanitized habit', () => {
    const habit = useHabitStore.getState().addHabit(draft, DAY)
    expect(habit).toMatchObject({ name: 'Beber água', createdAt: DAY, archived: false })
    expect(useHabitStore.getState().habits).toHaveLength(1)
    expect(useHabitStore.getState().logs[habit.id]).toEqual({})
  })

  it('clamps check-ins between zero and the target', () => {
    const { id } = useHabitStore.getState().addHabit(draft, DAY)
    const { increment, decrement } = useHabitStore.getState()
    increment(id, DAY)
    increment(id, DAY)
    increment(id, DAY)
    increment(id, DAY)
    expect(useHabitStore.getState().logs[id]?.[DAY]).toBe(3)
    decrement(id, DAY)
    decrement(id, DAY)
    decrement(id, DAY)
    decrement(id, DAY)
    expect(useHabitStore.getState().logs[id]?.[DAY]).toBeUndefined()
  })

  it('toggles a day between done and empty', () => {
    const { id } = useHabitStore.getState().addHabit(draft, DAY)
    useHabitStore.getState().toggle(id, DAY)
    expect(useHabitStore.getState().logs[id]?.[DAY]).toBe(3)
    useHabitStore.getState().toggle(id, DAY)
    expect(useHabitStore.getState().logs[id]?.[DAY]).toBeUndefined()
  })

  it('archives and restores habits', () => {
    const { id } = useHabitStore.getState().addHabit(draft, DAY)
    useHabitStore.getState().setArchived(id, true, '2026-05-10')
    expect(selectArchivedHabits(useHabitStore.getState())[0]?.archivedAt).toBe('2026-05-10')
    expect(selectActiveHabits(useHabitStore.getState())).toHaveLength(0)
    useHabitStore.getState().setArchived(id, false)
    expect(selectActiveHabits(useHabitStore.getState())[0]?.archivedAt).toBeNull()
  })

  it('updates and deletes habits with their logs', () => {
    const { id } = useHabitStore.getState().addHabit(draft, DAY)
    useHabitStore.getState().updateHabit(id, { ...draft, name: 'Água', target: 99 })
    expect(useHabitStore.getState().habits[0]).toMatchObject({ name: 'Água', target: 20 })
    useHabitStore.getState().deleteHabit(id)
    expect(useHabitStore.getState().habits).toEqual([])
    expect(useHabitStore.getState().logs).toEqual({})
  })

  it('persists data to localStorage', () => {
    useHabitStore.getState().addHabit(draft, DAY)
    const raw = localStorage.getItem(HABIT_STORAGE_KEY)
    expect(raw).toContain('Beber água')
  })
})
