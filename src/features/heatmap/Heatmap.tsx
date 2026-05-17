import { useLayoutEffect, useRef } from 'react'
import type { HeatCell, HeatLevel, HeatmapData } from '../../core/heatmap'
import { describeCell } from './describeCell'
import './Heatmap.css'

const CELL = 13
const GAP = 3
const STEP = CELL + GAP
const LEFT = 30
const TOP = 20

const LEVEL_OPACITY: Record<HeatLevel, number> = { 0: 1, 1: 0.35, 2: 0.55, 3: 0.78, 4: 1 }
const WEEKDAY_LABELS: [number, string][] = [
  [1, 'Seg'],
  [3, 'Qua'],
  [5, 'Sex'],
]

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
  const width = LEFT + data.weeks * STEP
  const height = TOP + 7 * STEP

  // Start scrolled to the most recent weeks on narrow screens.
  useLayoutEffect(() => {
    const element = scrollRef.current
    if (element) element.scrollLeft = element.scrollWidth
  }, [data.end])

  return (
    <figure className="heatmap">
      <div className="heatmap__scroll" ref={scrollRef}>
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={label}
          className="heatmap__svg"
        >
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
          {data.cells.map((cell) => {
            const { fill, opacity } = cellFill(cell, color)
            return (
              <rect
                key={cell.date}
                x={LEFT + cell.column * STEP}
                y={TOP + cell.row * STEP}
                width={CELL}
                height={CELL}
                rx={3}
                fill={fill}
                fillOpacity={opacity}
              >
                <title>{describeCell(cell, variant)}</title>
              </rect>
            )
          })}
        </svg>
      </div>
      <figcaption className="heatmap__legend">
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
