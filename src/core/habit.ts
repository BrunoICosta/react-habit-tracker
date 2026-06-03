import { fromDateKey, type DateKey } from './dates'

/** 0 = Sunday ... 6 = Saturday, matching `Date#getDay`. */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6

export type Frequency = { kind: 'daily' } | { kind: 'weekdays'; days: Weekday[] }

export interface Habit {
  id: string
  name: string
  emoji: string
  color: string
  frequency: Frequency
  /** How many check-ins are needed for the day to count as done. */
  target: number
  createdAt: DateKey
  archived: boolean
  archivedAt: DateKey | null
}

/** Check-in count per day for a single habit. Days without entries are zero. */
export type HabitLog = Record<DateKey, number>

/** Logs for every habit, keyed by habit id. */
export type CompletionLog = Record<string, HabitLog>

export type HabitDraft = Pick<Habit, 'name' | 'emoji' | 'color' | 'frequency' | 'target'>

export const WEEKDAYS: readonly Weekday[] = [0, 1, 2, 3, 4, 5, 6]

/** Display order starting on Monday, as is customary in Brazil. */
export const WEEKDAYS_FROM_MONDAY: readonly Weekday[] = [1, 2, 3, 4, 5, 6, 0]

export const MAX_TARGET = 20

export function isWeekday(value: unknown): value is Weekday {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 6
}

export function weekdayOf(key: DateKey): Weekday {
  return fromDateKey(key).getDay() as Weekday
}

export function isScheduledOn(frequency: Frequency, key: DateKey): boolean {
  if (frequency.kind === 'daily') return true
  return frequency.days.includes(weekdayOf(key))
}

export function isDayDone(count: number | undefined, target: number): boolean {
  return (count ?? 0) >= Math.max(1, target)
}

function sortedUniqueDays(days: readonly Weekday[]): Weekday[] {
  return [...new Set(days)].filter(isWeekday).sort((a, b) => a - b)
}

export type FrequencyPattern = 'daily' | 'workdays' | 'weekends' | 'none' | 'custom'

/** Classifies a frequency so the UI can pick a localized label ('Every day', 'Weekdays'...). */
export function frequencyPattern(frequency: Frequency): FrequencyPattern {
  if (frequency.kind === 'daily') return 'daily'
  const days = sortedUniqueDays(frequency.days)
  const signature = days.join(',')
  if (days.length === 7) return 'daily'
  if (days.length === 0) return 'none'
  if (signature === '1,2,3,4,5') return 'workdays'
  if (signature === '0,6') return 'weekends'
  return 'custom'
}

/** Scheduled weekdays in display order (Monday first). */
export function scheduledDays(frequency: Frequency): Weekday[] {
  if (frequency.kind === 'daily') return [...WEEKDAYS_FROM_MONDAY]
  return WEEKDAYS_FROM_MONDAY.filter((day) => frequency.days.includes(day))
}

/** Dedupes and sorts days, collapsing "all seven days" into `daily`. */
export function normalizeFrequency(frequency: Frequency): Frequency {
  if (frequency.kind === 'daily') return frequency
  const days = sortedUniqueDays(frequency.days)
  return days.length === 7 ? { kind: 'daily' } : { kind: 'weekdays', days }
}
