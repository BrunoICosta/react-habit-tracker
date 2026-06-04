import { format } from 'date-fns'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { fromDateKey, type DateKey } from '../core/dates'
import { frequencyPattern, scheduledDays, type Frequency, type Weekday } from '../core/habit'
import { formatPercent } from '../core/stats'
import { useLocale } from './useLocale'

export type DatePattern = 'weekdayLong' | 'full' | 'date'

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/** Locale-aware formatters for dates, weekdays, percentages and frequencies. */
export function useFormat() {
  const { t } = useTranslation(['common', 'habits'])
  const { language, dateLocale } = useLocale()

  return useMemo(() => {
    // Intl gives proper short names in both languages ("seg", "sáb" / "Mon", "Sat");
    // date-fns pt-BR "abbreviated" names are full words. 2026-05-03 is a Sunday.
    const weekdayShort = new Intl.DateTimeFormat(language, { weekday: 'short' })
    const weekdayWide = new Intl.DateTimeFormat(language, { weekday: 'long' })
    const sundayBased = (day: Weekday) => new Date(2026, 4, 3 + day)
    const weekday = (day: Weekday) =>
      capitalize(weekdayShort.format(sundayBased(day)).replace('.', ''))

    return {
      language,
      dateLocale,
      /** Formats a date key with one of the translated patterns. */
      date: (key: DateKey, pattern: DatePattern) =>
        format(fromDateKey(key), t(`common:dates.${pattern}`), { locale: dateLocale }),
      /** Raw date-fns pattern (for short, language-neutral tokens such as `d` or `EEE`). */
      pattern: (key: DateKey, tokens: string) =>
        format(fromDateKey(key), tokens, { locale: dateLocale }),
      /** Short month name for a `yyyy-MM` key, e.g. "Mai" / "May". */
      month: (month: string) =>
        capitalize(
          format(fromDateKey(`${month}-01`), 'MMM', { locale: dateLocale }).replace('.', ''),
        ),
      weekday,
      weekdayLong: (day: Weekday) => weekdayWide.format(sundayBased(day)),
      percent: (rate: number | null) => formatPercent(rate, language),
      /** "2–8 de nov." / "Nov 2 – 8", via Intl range formatting. */
      range: (start: DateKey, end: DateKey) =>
        new Intl.DateTimeFormat(language, { day: 'numeric', month: 'short' }).formatRange(
          fromDateKey(start),
          fromDateKey(end),
        ),
      frequency: (frequency: Frequency) => {
        const kind = frequencyPattern(frequency)
        if (kind !== 'custom') return t(`habits:frequency.${kind}`)
        return scheduledDays(frequency)
          .map((day) => weekday(day))
          .join(', ')
      },
      perDay: (target: number) => t('common:units.perDay', { count: target }),
    }
  }, [t, language, dateLocale])
}
