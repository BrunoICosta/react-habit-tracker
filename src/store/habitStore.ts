import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { todayKey, type DateKey } from '../core/dates'
import {
  MAX_TARGET,
  isDayDone,
  normalizeFrequency,
  type CompletionLog,
  type Habit,
  type HabitDraft,
} from '../core/habit'
import { createId } from '../shared/lib/id'

export interface HabitData {
  habits: Habit[]
  logs: CompletionLog
}

export interface HabitActions {
  addHabit: (draft: HabitDraft, today?: DateKey) => Habit
  updateHabit: (id: string, draft: HabitDraft) => void
  deleteHabit: (id: string) => void
  setArchived: (id: string, archived: boolean, today?: DateKey) => void
  /** Sets the check-in count for a day, clamped between 0 and the habit target. */
  setCount: (id: string, day: DateKey, count: number) => void
  increment: (id: string, day: DateKey) => void
  decrement: (id: string, day: DateKey) => void
  /** Marks the day as fully done, or clears it when it already was. */
  toggle: (id: string, day: DateKey) => void
  replaceAll: (data: HabitData) => void
}

export type HabitStore = HabitData & HabitActions

export const HABIT_STORAGE_KEY = 'habitos:data'

function clampTarget(target: number): number {
  return Math.min(MAX_TARGET, Math.max(1, Math.round(target)))
}

function sanitizeDraft(draft: HabitDraft): HabitDraft {
  return {
    name: draft.name.trim(),
    emoji: draft.emoji,
    color: draft.color,
    frequency: normalizeFrequency(draft.frequency),
    target: clampTarget(draft.target),
  }
}

export const useHabitStore = create<HabitStore>()(
  persist(
    (set, get) => {
      const writeCount = (id: string, day: DateKey, count: number) => {
        const habit = get().habits.find((item) => item.id === id)
        if (!habit) return
        const next = Math.min(habit.target, Math.max(0, Math.round(count)))
        set((state) => {
          const habitLog = { ...state.logs[id] }
          if (next === 0) delete habitLog[day]
          else habitLog[day] = next
          return { logs: { ...state.logs, [id]: habitLog } }
        })
      }

      return {
        habits: [],
        logs: {},

        addHabit: (draft, today = todayKey()) => {
          const habit: Habit = {
            ...sanitizeDraft(draft),
            id: createId(),
            createdAt: today,
            archived: false,
            archivedAt: null,
          }
          set((state) => ({
            habits: [...state.habits, habit],
            logs: { ...state.logs, [habit.id]: {} },
          }))
          return habit
        },

        updateHabit: (id, draft) => {
          const clean = sanitizeDraft(draft)
          set((state) => ({
            habits: state.habits.map((habit) => (habit.id === id ? { ...habit, ...clean } : habit)),
          }))
        },

        deleteHabit: (id) => {
          set((state) => {
            const logs = { ...state.logs }
            delete logs[id]
            return { habits: state.habits.filter((habit) => habit.id !== id), logs }
          })
        },

        setArchived: (id, archived, today = todayKey()) => {
          set((state) => ({
            habits: state.habits.map((habit) =>
              habit.id === id ? { ...habit, archived, archivedAt: archived ? today : null } : habit,
            ),
          }))
        },

        setCount: writeCount,

        increment: (id, day) => writeCount(id, day, (get().logs[id]?.[day] ?? 0) + 1),

        decrement: (id, day) => writeCount(id, day, (get().logs[id]?.[day] ?? 0) - 1),

        toggle: (id, day) => {
          const habit = get().habits.find((item) => item.id === id)
          if (!habit) return
          const done = isDayDone(get().logs[id]?.[day], habit.target)
          writeCount(id, day, done ? 0 : habit.target)
        },

        replaceAll: (data) => set({ habits: data.habits, logs: data.logs }),
      }
    },
    {
      name: HABIT_STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state): HabitData => ({ habits: state.habits, logs: state.logs }),
    },
  ),
)

export const selectActiveHabits = (state: HabitData): Habit[] =>
  state.habits.filter((habit) => !habit.archived)

export const selectArchivedHabits = (state: HabitData): Habit[] =>
  state.habits.filter((habit) => habit.archived)
