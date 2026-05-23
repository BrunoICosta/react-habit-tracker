import { shiftDateKey, type DateKey } from './dates'
import { isScheduledOn, type CompletionLog, type Habit, type HabitDraft } from './habit'
import type { BackupData } from './backup'

/** Small deterministic PRNG so the demo data looks the same on every load. */
function mulberry32(seed: number): () => number {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface SampleHabit extends HabitDraft {
  /** Probability of completing a scheduled day. */
  consistency: number
  daysAgo: number
}

const SAMPLES: SampleHabit[] = [
  {
    name: 'Beber 2L de água',
    emoji: '💧',
    color: '#22b8cf',
    frequency: { kind: 'daily' },
    target: 4,
    consistency: 0.82,
    daysAgo: 220,
  },
  {
    name: 'Ler 10 páginas',
    emoji: '📚',
    color: '#8b7bff',
    frequency: { kind: 'daily' },
    target: 1,
    consistency: 0.7,
    daysAgo: 300,
  },
  {
    name: 'Treinar',
    emoji: '💪',
    color: '#ff8a3d',
    frequency: { kind: 'weekdays', days: [1, 3, 5] },
    target: 1,
    consistency: 0.78,
    daysAgo: 160,
  },
  {
    name: 'Meditar',
    emoji: '🧘',
    color: '#20c997',
    frequency: { kind: 'daily' },
    target: 1,
    consistency: 0.6,
    daysAgo: 90,
  },
  {
    name: 'Faxina rápida',
    emoji: '🧹',
    color: '#f5b82e',
    frequency: { kind: 'weekdays', days: [6] },
    target: 1,
    consistency: 0.85,
    daysAgo: 120,
  },
]

export function createSampleData(today: DateKey, seed = 42): BackupData {
  const random = mulberry32(seed)
  const habits: Habit[] = []
  const logs: CompletionLog = {}

  SAMPLES.forEach(({ consistency, daysAgo, ...draft }, index) => {
    const habit: Habit = {
      ...draft,
      id: `sample-${index + 1}`,
      createdAt: shiftDateKey(today, -daysAgo),
      archived: false,
      archivedAt: null,
    }
    const log: Record<DateKey, number> = {}
    // Consistency improves over time, and recent days are always done so streaks show up.
    for (let offset = daysAgo; offset >= 1; offset--) {
      const day = shiftDateKey(today, -offset)
      if (!isScheduledOn(habit.frequency, day)) continue
      const progress = 1 - offset / daysAgo
      const chance = offset <= 6 ? 1 : consistency * (0.75 + progress * 0.35)
      if (random() < chance) log[day] = habit.target
      else if (habit.target > 1 && random() < 0.5)
        log[day] = Math.ceil(random() * (habit.target - 1))
    }
    habits.push(habit)
    logs[habit.id] = log
  })

  return { habits, logs }
}
