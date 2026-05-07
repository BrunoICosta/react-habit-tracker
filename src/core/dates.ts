import { addDays, differenceInCalendarDays, format, isValid, parse } from 'date-fns'

/** Calendar day in local time, formatted as `yyyy-MM-dd`. Used as storage key for logs. */
export type DateKey = string

const DATE_KEY_FORMAT = 'yyyy-MM-dd'
const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export function toDateKey(date: Date): DateKey {
  return format(date, DATE_KEY_FORMAT)
}

/** Parses a date key as local midnight (never UTC, so the weekday is stable across timezones). */
export function fromDateKey(key: DateKey): Date {
  return parse(key, DATE_KEY_FORMAT, new Date(2000, 0, 1))
}

export function isDateKey(value: unknown): value is DateKey {
  return typeof value === 'string' && DATE_KEY_PATTERN.test(value) && isValid(fromDateKey(value))
}

export function todayKey(now: Date = new Date()): DateKey {
  return toDateKey(now)
}

export function shiftDateKey(key: DateKey, days: number): DateKey {
  return toDateKey(addDays(fromDateKey(key), days))
}

export function daysBetween(from: DateKey, to: DateKey): number {
  return differenceInCalendarDays(fromDateKey(to), fromDateKey(from))
}

/** Inclusive list of keys from `start` to `end`. Returns an empty list when `start > end`. */
export function eachDateKey(start: DateKey, end: DateKey): DateKey[] {
  const total = daysBetween(start, end)
  const keys: DateKey[] = []
  for (let offset = 0; offset <= total; offset++) {
    keys.push(shiftDateKey(start, offset))
  }
  return keys
}

export function minDateKey(a: DateKey, b: DateKey): DateKey {
  return a < b ? a : b
}

export function maxDateKey(a: DateKey, b: DateKey): DateKey {
  return a > b ? a : b
}
