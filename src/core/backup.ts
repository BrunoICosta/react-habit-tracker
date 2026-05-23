import { isDateKey, type DateKey } from './dates'
import { MAX_TARGET, isWeekday, type CompletionLog, type Frequency, type Habit } from './habit'
import { isHexColor } from './palette'

export const BACKUP_APP = 'habitos'
export const BACKUP_VERSION = 1

export interface BackupData {
  habits: Habit[]
  logs: CompletionLog
}

export interface Backup extends BackupData {
  app: typeof BACKUP_APP
  version: typeof BACKUP_VERSION
  exportedAt: string
}

export type ParseResult = { ok: true; data: BackupData } | { ok: false; error: string }

export function createBackup(data: BackupData, now: Date = new Date()): Backup {
  return {
    app: BACKUP_APP,
    version: BACKUP_VERSION,
    exportedAt: now.toISOString(),
    habits: data.habits,
    logs: data.logs,
  }
}

export function serializeBackup(backup: Backup): string {
  return JSON.stringify(backup, null, 2)
}

export function backupFileName(today: DateKey): string {
  return `habitos-backup-${today}.json`
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseFrequency(value: unknown): Frequency | null {
  if (!isRecord(value)) return null
  if (value.kind === 'daily') return { kind: 'daily' }
  if (value.kind === 'weekdays' && Array.isArray(value.days) && value.days.every(isWeekday)) {
    return { kind: 'weekdays', days: [...new Set(value.days)].sort((a, b) => a - b) }
  }
  return null
}

function parseHabit(value: unknown): Habit | null {
  if (!isRecord(value)) return null
  const { id, name, emoji, color, target, createdAt, archived, archivedAt } = value
  const frequency = parseFrequency(value.frequency)
  if (typeof id !== 'string' || !id) return null
  if (typeof name !== 'string' || !name.trim()) return null
  if (typeof emoji !== 'string' || !emoji) return null
  if (!isHexColor(color) || !frequency) return null
  if (typeof target !== 'number' || !Number.isInteger(target) || target < 1 || target > MAX_TARGET)
    return null
  if (!isDateKey(createdAt)) return null
  if (archivedAt !== null && archivedAt !== undefined && !isDateKey(archivedAt)) return null
  return {
    id,
    name: name.trim(),
    emoji,
    color,
    frequency,
    target,
    createdAt,
    archived: archived === true,
    archivedAt: archived === true && isDateKey(archivedAt) ? archivedAt : null,
  }
}

function parseLogs(value: unknown, habits: Habit[]): CompletionLog | null {
  if (!isRecord(value)) return null
  const logs: CompletionLog = {}
  for (const habit of habits) {
    const raw = value[habit.id]
    const habitLog: Record<DateKey, number> = {}
    logs[habit.id] = habitLog
    if (raw === undefined) continue
    if (!isRecord(raw)) return null
    for (const [day, count] of Object.entries(raw)) {
      if (!isDateKey(day) || typeof count !== 'number' || !Number.isFinite(count) || count < 0)
        return null
      const clamped = Math.min(habit.target, Math.round(count))
      if (clamped > 0) habitLog[day] = clamped
    }
  }
  return logs
}

/** Validates an untrusted backup file. Never throws. */
export function parseBackup(text: string): ParseResult {
  let json: unknown
  try {
    json = JSON.parse(text)
  } catch {
    return { ok: false, error: 'O arquivo não é um JSON válido.' }
  }
  if (!isRecord(json) || json.app !== BACKUP_APP) {
    return { ok: false, error: 'Esse arquivo não parece ser um backup do Hábitos.' }
  }
  if (json.version !== BACKUP_VERSION) {
    return { ok: false, error: 'Versão de backup não suportada.' }
  }
  if (!Array.isArray(json.habits)) {
    return { ok: false, error: 'O backup não contém a lista de hábitos.' }
  }
  const habits: Habit[] = []
  for (const item of json.habits) {
    const habit = parseHabit(item)
    if (!habit) return { ok: false, error: 'O backup contém um hábito inválido.' }
    if (habits.some((existing) => existing.id === habit.id))
      return { ok: false, error: 'O backup contém hábitos duplicados.' }
    habits.push(habit)
  }
  const logs = parseLogs(json.logs ?? {}, habits)
  if (!logs) return { ok: false, error: 'O histórico do backup está corrompido.' }
  return { ok: true, data: { habits, logs } }
}
