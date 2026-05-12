export interface HabitColor {
  value: string
  label: string
}

/** Saturated mid-tones that read well on both themes and keep white text legible. */
export const HABIT_COLORS: readonly HabitColor[] = [
  { value: '#8b7bff', label: 'Lavanda' },
  { value: '#4f8cff', label: 'Azul' },
  { value: '#22b8cf', label: 'Ciano' },
  { value: '#20c997', label: 'Menta' },
  { value: '#7ccf3c', label: 'Verde' },
  { value: '#f5b82e', label: 'Amarelo' },
  { value: '#ff8a3d', label: 'Laranja' },
  { value: '#ff5c6c', label: 'Vermelho' },
  { value: '#f06bc4', label: 'Rosa' },
  { value: '#a78b6f', label: 'Areia' },
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
