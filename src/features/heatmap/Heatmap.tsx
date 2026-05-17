import { useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react'
import type { HeatCell, HeatLevel, HeatmapData } from '../../core/heatmap'
import { describeCell, describeCellValue, formatCellDate } from './describeCell'
import './Heatmap.css'

const CELL = 13
const GAP = 3
const STEP = CELL + GAP
const LEFT = 30
const TOP = 20
const TOOLTIP_WIDTH = 210

const LEVEL_OPACITY: Record<HeatLevel, number> = { 0: 1, 1: 0.35, 2: 0.55, 3: 0.78, 4: 1 }
const WEEKDAY_LABELS: [number, string][] = [
  [1, 'Seg'],
  [3, 'Qua'],
  [5, 'Sex'],
]
const ROWS = [0, 1, 2, 3, 4, 5, 6]

/** Arrow keys move by day (up/down) and by week (left/right), like the visual layout. */
const KEY_OFFSETS: Record<string, number> = {
  ArrowUp: -1,
  ArrowDown: 1,
  ArrowLeft: -7,
  ArrowRight: 7,
  PageUp: -28,
  PageDown: 28,
}

interface HeatmapProps {
  data: HeatmapData
  color: string
  label: string
  /** "habit" describes check-ins, "overall" describes habits completed. */
  variant: 'habit' | 'overall'
}

function cellFill(cell: HeatCell, color: string) {
  if (cell.level === 0) return { fill: 'var(--heat-empty)', opacity: cell.scheduled ? 1 : 0.4 }
  return { fill: color, opacity: LEVEL_OPACITY[cell.level] }
}

export function Heatmap({ data, color, label, variant }: HeatmapProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [hovered, setHovered] = useState<number | null>(null)
  const [focused, setFocused] = useState<number | null>(null)

  const lastIndex = data.cells.length - 1
  // Roving tabindex: only one cell is tabbable; default to the most recent day.
  const tabbable = activeIndex !== null && activeIndex <= lastIndex ? activeIndex : lastIndex
  const tooltipIndex = hovered ?? focused
  const tooltipCell = tooltipIndex !== null ? data.cells[tooltipIndex] : undefined

  const width = LEFT + data.weeks * STEP
  const height = TOP + 7 * STEP

  // Start scrolled to the most recent weeks on narrow screens.
  useLayoutEffect(() => {
    const element = scrollRef.current
    if (element) element.scrollLeft = element.scrollWidth
  }, [data.end])

  const focusCell = (index: number) => {
    setActiveIndex(index)
    svgRef.current?.querySelector<SVGRectElement>(`[data-index="${index}"]`)?.focus()
  }

  const onKeyDown = (event: KeyboardEvent<SVGSVGElement>) => {
    const current = tabbable
    let next: number | null = null
    const offset = KEY_OFFSETS[event.key]
    if (offset !== undefined) next = Math.min(lastIndex, Math.max(0, current + offset))
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = lastIndex
    else if (event.key === 'Escape') {
      setFocused(null)
      setHovered(null)
      return
    }
    if (next === null) return
    event.preventDefault()
    focusCell(next)
  }

  const tooltipStyle = (() => {
    if (!tooltipCell) return undefined
    const cellX = LEFT + tooltipCell.column * STEP + CELL / 2
    const left = Math.min(Math.max(cellX - TOOLTIP_WIDTH / 2, 0), width - TOOLTIP_WIDTH)
    const below = tooltipCell.row < 3
    const top = below ? TOP + (tooltipCell.row + 1) * STEP + 6 : TOP + tooltipCell.row * STEP - 8
    return {
      left,
      top,
      width: TOOLTIP_WIDTH,
      transform: below ? undefined : 'translateY(-100%)',
    }
  })()

  return (
    <figure className="heatmap">
      <div className="heatmap__scroll" ref={scrollRef}>
        <div className="heatmap__canvas" style={{ width, height }}>
          <svg
            ref={svgRef}
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            role="grid"
            aria-label={label}
            aria-rowcount={7}
            aria-colcount={data.weeks}
            className="heatmap__svg"
            onKeyDown={onKeyDown}
            onPointerLeave={() => setHovered(null)}
          >
            <g aria-hidden="true">
              {data.months.map((month) => (
                <text
                  key={`${month.label}-${month.column}`}
                  x={LEFT + month.column * STEP}
                  y={12}
                  className="heatmap__label"
                >
                  {month.label}
                </text>
              ))}
              {WEEKDAY_LABELS.map(([row, text]) => (
                <text key={row} x={0} y={TOP + row * STEP + CELL - 2} className="heatmap__label">
                  {text}
                </text>
              ))}
            </g>
            {ROWS.map((row) => (
              <g key={row} role="row" aria-rowindex={row + 1}>
                {data.cells.map((cell, index) => {
                  if (cell.row !== row) return null
                  const { fill, opacity } = cellFill(cell, color)
                  return (
                    <rect
                      key={cell.date}
                      data-index={index}
                      role="gridcell"
                      aria-colindex={cell.column + 1}
                      aria-label={describeCell(cell, variant)}
                      tabIndex={index === tabbable ? 0 : -1}
                      x={LEFT + cell.column * STEP}
                      y={TOP + cell.row * STEP}
                      width={CELL}
                      height={CELL}
                      rx={3}
                      fill={fill}
                      fillOpacity={opacity}
                      className="heatmap__cell"
                      data-today={index === lastIndex || undefined}
                      onPointerEnter={() => setHovered(index)}
                      onFocus={() => {
                        setActiveIndex(index)
                        setFocused(index)
                      }}
                      onBlur={() => setFocused((value) => (value === index ? null : value))}
                    />
                  )
                })}
              </g>
            ))}
          </svg>

          {tooltipCell && (
            <div className="heatmap__tooltip" style={tooltipStyle} aria-hidden="true">
              <strong>{describeCellValue(tooltipCell, variant)}</strong>
              <span>{formatCellDate(tooltipCell)}</span>
            </div>
          )}
        </div>
      </div>
      <figcaption className="heatmap__legend">
        <span className="heatmap__hint">Use as setas para navegar pelos dias</span>
        <span>Menos</span>
        {([0, 1, 2, 3, 4] as const).map((level) => (
          <svg key={level} width={CELL} height={CELL} aria-hidden="true">
            <rect
              width={CELL}
              height={CELL}
              rx={3}
              fill={level === 0 ? 'var(--heat-empty)' : color}
              fillOpacity={LEVEL_OPACITY[level]}
            />
          </svg>
        ))}
        <span>Mais</span>
      </figcaption>
    </figure>
  )
}
