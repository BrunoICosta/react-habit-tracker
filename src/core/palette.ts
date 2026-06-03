export type HabitColorKey =
  | 'lavender'
  | 'blue'
  | 'cyan'
  | 'mint'
  | 'green'
  | 'yellow'
  | 'orange'
  | 'red'
  | 'pink'
  | 'sand'

export interface HabitColor {
  value: string
  /** Translation key under `habits:colors`. */
  key: HabitColorKey
}

/** Saturated mid-tones that read well on both themes and keep white text legible. */
export const HABIT_COLORS: readonly HabitColor[] = [
  { value: '#8b7bff', key: 'lavender' },
  { value: '#4f8cff', key: 'blue' },
  { value: '#22b8cf', key: 'cyan' },
  { value: '#20c997', key: 'mint' },
  { value: '#7ccf3c', key: 'green' },
  { value: '#f5b82e', key: 'yellow' },
  { value: '#ff8a3d', key: 'orange' },
  { value: '#ff5c6c', key: 'red' },
  { value: '#f06bc4', key: 'pink' },
  { value: '#a78b6f', key: 'sand' },
]

export const DEFAULT_COLOR = HABIT_COLORS[0]?.value ?? '#8b7bff'

export const HABIT_EMOJIS: readonly string[] = [
  '💧',
  '🏃',
  '📚',
  '🧘',
  '💪',
  '🥗',
  '😴',
  '✍️',
  '🎸',
  '🧹',
  '💊',
  '🌱',
  '🧠',
  '🦷',
  '🚶',
  '🍎',
  '💻',
  '🙏',
  '🎯',
  '📵',
  '🚴',
  '☀️',
  '🎨',
  '💰',
]

export const DEFAULT_EMOJI = '🎯'

export function isHexColor(value: unknown): value is string {
  return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value)
}
