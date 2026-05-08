import { minDateKey, shiftDateKey, type DateKey } from './dates'
import { isDayDone, isScheduledOn, type Habit, type HabitLog } from './habit'

export type StreakHabit = Pick<Habit, 'frequency' | 'target' | 'createdAt' | 'archivedAt'>

export interface StreakSummary {
  /** Consecutive scheduled days completed, ending today (or the archive date). */
  current: number
  /** Longest run of consecutive scheduled days completed. */
  best: number
  /** True when the last day is scheduled, not completed yet and a streak is on the line. */
  atRisk: boolean
}

const EMPTY: StreakSummary = { current: 0, best: 0, atRisk: false }

/** Earliest day we should consider: creation date or the oldest check-in (imported history). */
export function trackingStart(habit: Pick<Habit, 'createdAt'>, log: HabitLog): DateKey {
  let start = habit.createdAt
  for (const [key, count] of Object.entries(log)) {
    if (count > 0) start = minDateKey(start, key)
  }
  return start
}

/**
 * Walks every scheduled day between the tracking start and `today`.
 *
 * Rules:
 * - Days outside the habit frequency are skipped: they neither extend nor break a streak.
 * - A scheduled day breaks the streak when its count is below the target.
 * - The last day (today) never breaks a streak while it is still pending: you still have time.
 * - Archived habits are frozen at their archive date.
 */
export function computeStreaks(habit: StreakHabit, log: HabitLog, today: DateKey): StreakSummary {
  const end = habit.archivedAt ? minDateKey(habit.archivedAt, today) : today
  const start = trackingStart(habit, log)
  if (start > end) return EMPTY

  let run = 0
  let best = 0
  let atRisk = false

  for (let day = start; day <= end; day = shiftDateKey(day, 1)) {
    if (!isScheduledOn(habit.frequency, day)) continue

    if (isDayDone(log[day], habit.target)) {
      run += 1
      best = Math.max(best, run)
    } else if (day === end) {
      atRisk = run > 0 && !habit.archivedAt
    } else {
      run = 0
    }
  }

  return { current: run, best, atRisk }
}
