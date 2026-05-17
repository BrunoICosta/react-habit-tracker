import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { buildHabitHeatmap } from '../../core/heatmap'
import type { Habit } from '../../core/habit'
import { Heatmap } from './Heatmap'

const habit: Habit = {
  id: 'h1',
  name: 'Ler',
  emoji: '📚',
  color: '#4f8cff',
  frequency: { kind: 'daily' },
  target: 1,
  createdAt: '2026-05-01',
  archived: false,
  archivedAt: null,
}

function renderHeatmap() {
  // Range: Sun 2026-05-03 .. Fri 2026-05-15
  const data = buildHabitHeatmap(habit, { '2026-05-14': 1 }, '2026-05-15', 2)
  render(<Heatmap data={data} color={habit.color} variant="habit" label="Histórico de Ler" />)
}

describe('Heatmap', () => {
  it('exposes an accessible grid with one tabbable cell (today)', () => {
    renderHeatmap()
    expect(screen.getByRole('grid', { name: 'Histórico de Ler' })).toBeInTheDocument()
    const cells = screen.getAllByRole('gridcell')
    expect(cells).toHaveLength(13)
    const tabbable = cells.filter((cell) => cell.getAttribute('tabindex') === '0')
    expect(tabbable).toHaveLength(1)
    expect(tabbable[0]).toHaveAccessibleName('sexta-feira, 15 de maio de 2026: não feito')
  })

  it('moves focus with arrow keys and shows a tooltip', async () => {
    const user = userEvent.setup()
    renderHeatmap()

    await user.tab()
    expect(document.activeElement).toHaveAccessibleName(/15 de maio/)

    await user.keyboard('{ArrowUp}')
    expect(document.activeElement).toHaveAccessibleName('quinta-feira, 14 de maio de 2026: feito')
    expect(screen.getByText('feito', { selector: 'strong' })).toBeInTheDocument()

    await user.keyboard('{ArrowLeft}')
    expect(document.activeElement).toHaveAccessibleName(/7 de maio/)

    await user.keyboard('{Home}')
    expect(document.activeElement).toHaveAccessibleName(/domingo, 3 de maio/)
    expect(document.activeElement).toHaveAttribute('tabindex', '0')
  })

  it('shows a tooltip on hover', () => {
    renderHeatmap()
    const cell = screen.getByRole('gridcell', { name: /14 de maio/ })
    fireEvent.pointerEnter(cell)
    expect(screen.getByText('quinta-feira, 14 de maio de 2026')).toBeInTheDocument()
  })
})
