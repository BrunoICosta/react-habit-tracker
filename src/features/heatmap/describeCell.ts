import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { fromDateKey } from '../../core/dates'
import type { HeatCell } from '../../core/heatmap'

export function formatCellDate(cell: HeatCell): string {
  return format(fromDateKey(cell.date), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })
}

export function describeCellValue(cell: HeatCell, variant: 'habit' | 'overall'): string {
  if (!cell.scheduled) {
    if (variant === 'habit' && cell.done > 0) return 'feito fora da agenda'
    return variant === 'habit' ? 'não programado' : 'nenhum hábito programado'
  }
  if (variant === 'overall') {
    return `${cell.done} de ${cell.total} ${cell.total === 1 ? 'hábito' : 'hábitos'}`
  }
  if (cell.total > 1) return `${cell.done} de ${cell.total} registros`
  return cell.done > 0 ? 'feito' : 'não feito'
}

export function describeCell(cell: HeatCell, variant: 'habit' | 'overall'): string {
  return `${formatCellDate(cell)}: ${describeCellValue(cell, variant)}`
}
