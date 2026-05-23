/** `plural(1, 'hábito', 'hábitos')` → "1 hábito". */
export function plural(count: number, singular: string, pluralForm: string): string {
  return `${count} ${count === 1 ? singular : pluralForm}`
}
