import type { TFunction } from 'i18next'
import type { HeatCell } from '../../core/heatmap'

export type HeatmapVariant = 'habit' | 'overall'

/** Value part of a cell description ("3 of 4 habits", "done"...), in the active language. */
export function describeCellValue(
  cell: HeatCell,
  variant: HeatmapVariant,
  t: TFunction<'heatmap'>,
): string {
  if (!cell.scheduled) {
    if (variant === 'habit' && cell.done > 0) return t('values.offScheduleDone')
    return variant === 'habit' ? t('values.notScheduled') : t('values.nothingScheduled')
  }
  if (variant === 'overall') return t('values.habits', { done: cell.done, count: cell.total })
  if (cell.total > 1) return t('values.checkIns', { done: cell.done, count: cell.total })
  return cell.done > 0 ? t('values.done') : t('values.notDone')
}
