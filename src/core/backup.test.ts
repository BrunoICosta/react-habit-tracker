import { describe, expect, it } from 'vitest'
import { backupFileName, createBackup, parseBackup, serializeBackup } from './backup'
import type { Habit } from './habit'

const habit: Habit = {
  id: 'h1',
  name: 'Ler',
  emoji: '📚',
  color: '#4f8cff',
  frequency: { kind: 'weekdays', days: [1, 3] },
  target: 2,
  createdAt: '2026-05-01',
  archived: false,
  archivedAt: null,
}

function withHabit(patch: Record<string, unknown>) {
  return JSON.stringify({ app: 'habitos', version: 1, habits: [{ ...habit, ...patch }], logs: {} })
}

describe('backup', () => {
  it('round-trips data', () => {
    const backup = createBackup(
      { habits: [habit], logs: { h1: { '2026-05-04': 2 } } },
      new Date('2026-05-23T12:00:00Z'),
    )
    expect(backup.exportedAt).toBe('2026-05-23T12:00:00.000Z')
    expect(parseBackup(serializeBackup(backup))).toEqual({
      ok: true,
      data: { habits: [habit], logs: { h1: { '2026-05-04': 2 } } },
    })
  })

  it('names files by date', () => {
    expect(backupFileName('2026-05-23')).toBe('habitos-backup-2026-05-23.json')
  })

  it('rejects invalid files with friendly messages', () => {
    expect(parseBackup('{oops')).toEqual({ ok: false, error: 'O arquivo não é um JSON válido.' })
    expect(parseBackup('{"app":"other"}')).toMatchObject({ ok: false })
    expect(parseBackup('{"app":"habitos","version":99,"habits":[]}')).toEqual({
      ok: false,
      error: 'Versão de backup não suportada.',
    })
  })

  it.each([
    { name: '' },
    { color: 'red' },
    { target: 0 },
    { target: 1.5 },
    { createdAt: '23/05/2026' },
    { frequency: { kind: 'weekdays', days: [9] } },
    { frequency: { kind: 'monthly' } },
  ])('rejects habit with %o', (patch) => {
    expect(parseBackup(withHabit(patch))).toEqual({
      ok: false,
      error: 'O backup contém um hábito inválido.',
    })
  })

  it('rejects corrupted logs and duplicated ids', () => {
    const badLog = JSON.stringify({
      app: 'habitos',
      version: 1,
      habits: [habit],
      logs: { h1: { 'not-a-date': 1 } },
    })
    expect(parseBackup(badLog)).toEqual({
      ok: false,
      error: 'O histórico do backup está corrompido.',
    })
    const duplicated = JSON.stringify({ app: 'habitos', version: 1, habits: [habit, habit] })
    expect(parseBackup(duplicated)).toMatchObject({ ok: false })
  })

  it('normalizes values and drops logs of unknown habits', () => {
    const text = JSON.stringify({
      app: 'habitos',
      version: 1,
      habits: [{ ...habit, name: '  Ler  ', frequency: { kind: 'weekdays', days: [3, 1, 3] } }],
      logs: { h1: { '2026-05-04': 9, '2026-05-06': 0 }, ghost: { '2026-05-04': 1 } },
    })
    const result = parseBackup(text)
    expect(result).toEqual({
      ok: true,
      data: {
        habits: [{ ...habit, name: 'Ler' }],
        logs: { h1: { '2026-05-04': 2 } },
      },
    })
  })
})
