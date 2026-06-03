import { startOfWeek } from 'date-fns'
import { fromDateKey, maxDateKey, minDateKey, shiftDateKey, toDateKey, type DateKey } from './dates'
import { isDayDone, isScheduledOn, type CompletionLog, type Habit, type HabitLog } from './habit'
import { computeStreaks, trackingStart } from './streaks'

export interface RateSummary {
  done: number
  scheduled: number
  /** 0..1, or null when nothing was scheduled in the period. */
  rate: number | null
}

const EMPTY_RATE: RateSummary = { done: 0, scheduled: 0, rate: null }

function toRate(done: number, scheduled: number): RateSummary {
  return { done, scheduled, rate: scheduled > 0 ? done / scheduled : null }
}

/**
 * Completion rate of a habit between `from` and `to` (inclusive).
 * Today only counts once it is done, so a pending day never lowers the rate.
 */
export function habitCompletionRate(
  habit: Habit,
  log: HabitLog,
  from: DateKey,
  to: DateKey,
  today: DateKey,
): RateSummary {
  let start = maxDateKey(from, trackingStart(habit, log))
  let end = minDateKey(to, today)
  if (habit.archivedAt) end = minDateKey(end, habit.archivedAt)
  if (start > end) return EMPTY_RATE

  let done = 0
  let scheduled = 0
  for (; start <= end; start = shiftDateKey(start, 1)) {
    if (!isScheduledOn(habit.frequency, start)) continue
    const completed = isDayDone(log[start], habit.target)
    if (start === today && !completed) continue
    scheduled += 1
    if (completed) done += 1
  }
  return toRate(done, scheduled)
}

export function overallCompletionRate(
  habits: Habit[],
  logs: CompletionLog,
  from: DateKey,
  to: DateKey,
  today: DateKey,
): RateSummary {
  let done = 0
  let scheduled = 0
  for (const habit of habits) {
    const rate = habitCompletionRate(habit, logs[habit.id] ?? {}, from, to, today)
    done += rate.done
    scheduled += rate.scheduled
  }
  return toRate(done, scheduled)
}

export interface DayStat {
  date: DateKey
  done: number
  scheduled: number
  future: boolean
}

/** Monday of the week containing `day` (weeks start on Monday in pt-BR). */
export function weekStart(day: DateKey): DateKey {
  return toDateKey(startOfWeek(fromDateKey(day), { weekStartsOn: 1 }))
}

function isTrackedOn(habit: Habit, log: HabitLog, day: DateKey): boolean {
  if (day < trackingStart(habit, log)) return false
  return !(habit.archivedAt && day > habit.archivedAt)
}

/** Per-day totals for the Monday-Sunday week containing `day`. */
export function weeklyBreakdown(
  habits: Habit[],
  logs: CompletionLog,
  day: DateKey,
  today: DateKey,
): DayStat[] {
  const monday = weekStart(day)
  return Array.from({ length: 7 }, (_, offset) => {
    const date = shiftDateKey(monday, offset)
    let done = 0
    let scheduled = 0
    for (const habit of habits) {
      const log = logs[habit.id] ?? {}
      if (!isScheduledOn(habit.frequency, date) || !isTrackedOn(habit, log, date)) continue
      scheduled += 1
      if (isDayDone(log[date], habit.target)) done += 1
    }
    return { date, done, scheduled, future: date > today }
  })
}

/** Days in the period where every scheduled habit was completed. */
export function perfectDays(
  habits: Habit[],
  logs: CompletionLog,
  from: DateKey,
  to: DateKey,
): number {
  let count = 0
  for (let day = from; day <= to; day = shiftDateKey(day, 1)) {
    let scheduled = 0
    let done = 0
    for (const habit of habits) {
      const log = logs[habit.id] ?? {}
      if (!isScheduledOn(habit.frequency, day) || !isTrackedOn(habit, log, day)) continue
      scheduled += 1
      if (isDayDone(log[day], habit.target)) done += 1
    }
    if (scheduled > 0 && done === scheduled) count += 1
  }
  return count
}

export interface HabitRanking {
  habit: Habit
  rate: RateSummary
  current: number
  best: number
}

export function rankHabits(
  habits: Habit[],
  logs: CompletionLog,
  from: DateKey,
  today: DateKey,
): HabitRanking[] {
  return habits
    .map((habit) => {
      const log = logs[habit.id] ?? {}
      const streaks = computeStreaks(habit, log, today)
      return {
        habit,
        rate: habitCompletionRate(habit, log, from, today, today),
        current: streaks.current,
        best: streaks.best,
      }
    })
    .sort((a, b) => (b.rate.rate ?? -1) - (a.rate.rate ?? -1) || b.current - a.current)
}

export function formatPercent(rate: number | null, locale = 'pt-BR'): string {
  if (rate === null) return '—'
  return new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 0 }).format(rate)
}
