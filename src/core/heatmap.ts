import { format, startOfWeek } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { fromDateKey, shiftDateKey, toDateKey, type DateKey } from './dates'
import { isDayDone, isScheduledOn, type CompletionLog, type Habit, type HabitLog } from './habit'
import { trackingStart } from './streaks'

export type HeatLevel = 0 | 1 | 2 | 3 | 4

export interface HeatCell {
  date: DateKey
  /** Weekday row, 0 = Sunday. */
  row: number
  /** Week column, 0 = oldest. */
  column: number
  /** Completed amount (check-ins for one habit, habits done for the overview). */
  done: number
  /** Expected amount (daily target, or habits scheduled that day). */
  total: number
  /** 0..1 */
  ratio: number
  level: HeatLevel
  /** Whether anything was expected on this day. */
  scheduled: boolean
}

export interface MonthLabel {
  label: string
  column: number
}

export interface HeatmapData {
  cells: HeatCell[]
  weeks: number
  months: MonthLabel[]
  start: DateKey
  end: DateKey
}

export const DEFAULT_WEEKS = 53

export function levelFor(ratio: number): HeatLevel {
  if (ratio <= 0) return 0
  if (ratio >= 1) return 4
  return Math.min(3, Math.max(1, Math.ceil(ratio * 3))) as HeatLevel
}

/** Sunday-aligned range of `weeks` columns ending in the week of `end`. */
export function heatmapRange(
  end: DateKey,
  weeks = DEFAULT_WEEKS,
): { start: DateKey; end: DateKey } {
  const lastWeekStart = toDateKey(startOfWeek(fromDateKey(end), { weekStartsOn: 0 }))
  return { start: shiftDateKey(lastWeekStart, -7 * (weeks - 1)), end }
}

function monthName(date: DateKey): string {
  const raw = format(fromDateKey(date), 'MMM', { locale: ptBR }).replace('.', '')
  return raw.charAt(0).toUpperCase() + raw.slice(1)
}

/** GitHub-style labels: a month is labelled on the first column whose Sunday falls in it. */
function monthLabels(cells: HeatCell[]): MonthLabel[] {
  const labels: MonthLabel[] = []
  let previousMonth = ''
  for (const cell of cells) {
    if (cell.row !== 0) continue
    const month = cell.date.slice(0, 7)
    if (month === previousMonth) continue
    previousMonth = month
    labels.push({ label: monthName(cell.date), column: cell.column })
  }
  // Drop the partial first month when it would collide with the next label.
  const [first, second] = labels
  if (first && second && second.column - first.column < 3) labels.shift()
  return labels
}

function buildGrid(
  end: DateKey,
  weeks: number,
  measure: (date: DateKey) => Pick<HeatCell, 'done' | 'total' | 'scheduled'>,
): HeatmapData {
  const range = heatmapRange(end, weeks)
  const cells: HeatCell[] = []
  let date = range.start
  let index = 0
  while (date <= range.end) {
    const { done, total, scheduled } = measure(date)
    const ratio = total > 0 ? Math.min(1, done / total) : 0
    cells.push({
      date,
      row: index % 7,
      column: Math.floor(index / 7),
      done,
      total,
      ratio,
      level: levelFor(ratio),
      scheduled,
    })
    date = shiftDateKey(date, 1)
    index += 1
  }
  return { cells, weeks, months: monthLabels(cells), start: range.start, end: range.end }
}

function isTracked(habit: Habit, start: DateKey, date: DateKey): boolean {
  if (date < start) return false
  return !(habit.archivedAt && date > habit.archivedAt)
}

export function buildHabitHeatmap(
  habit: Habit,
  log: HabitLog,
  end: DateKey,
  weeks = DEFAULT_WEEKS,
): HeatmapData {
  const start = trackingStart(habit, log)
  return buildGrid(end, weeks, (date) => {
    const done = Math.min(log[date] ?? 0, habit.target)
    return {
      done,
      total: habit.target,
      scheduled: isTracked(habit, start, date) && isScheduledOn(habit.frequency, date),
    }
  })
}

/** Daily share of scheduled habits that were completed, across every habit (archived included). */
export function buildOverallHeatmap(
  habits: Habit[],
  logs: CompletionLog,
  end: DateKey,
  weeks = DEFAULT_WEEKS,
): HeatmapData {
  const tracked = habits.map((habit) => ({
    habit,
    log: logs[habit.id] ?? {},
    start: trackingStart(habit, logs[habit.id] ?? {}),
  }))

  return buildGrid(end, weeks, (date) => {
    let total = 0
    let done = 0
    for (const { habit, log, start } of tracked) {
      if (!isTracked(habit, start, date) || !isScheduledOn(habit.frequency, date)) continue
      total += 1
      if (isDayDone(log[date], habit.target)) done += 1
    }
    return { done, total, scheduled: total > 0 }
  })
}
