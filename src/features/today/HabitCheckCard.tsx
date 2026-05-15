import { motion } from 'motion/react'
import { routeToHash } from '../../app/router'
import type { DateKey } from '../../core/dates'
import { isDayDone, type Habit } from '../../core/habit'
import { computeStreaks } from '../../core/streaks'
import { Icon } from '../../shared/components/Icon'
import { useHabitStore } from '../../store/habitStore'
import './HabitCheckCard.css'

interface HabitCheckCardProps {
  habit: Habit
  day: DateKey
}

function vibrate() {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate?.(12)
}

export function HabitCheckCard({ habit, day }: HabitCheckCardProps) {
  const log = useHabitStore((state) => state.logs[habit.id])
  const toggle = useHabitStore((state) => state.toggle)
  const count = log?.[day] ?? 0
  const done = isDayDone(count, habit.target)
  const streak = computeStreaks(habit, log ?? {}, day)

  const onToggle = () => {
    toggle(habit.id, day)
    if (!done) vibrate()
  }

  return (
    <motion.li
      layout
      className="check-card"
      data-done={done}
      style={{ '--habit-color': habit.color }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
    >
      <motion.span
        className="check-card__fill"
        aria-hidden="true"
        initial={false}
        animate={{ scaleX: done ? 1 : 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 30 }}
      />

      <a className="check-card__body" href={routeToHash({ name: 'habit-edit', id: habit.id })}>
        <span className="check-card__emoji" aria-hidden="true">
          {habit.emoji}
        </span>
        <span className="check-card__text">
          <span className="check-card__name">{habit.name}</span>
          <span className="check-card__meta">
            {streak.current > 0 ? (
              <>
                <Icon name="flame" size={14} />
                {streak.current} {streak.current === 1 ? 'dia' : 'dias'} seguidos
              </>
            ) : (
              'Comece uma sequência hoje'
            )}
          </span>
        </span>
      </a>

      <motion.button
        type="button"
        className="check-button"
        aria-pressed={done}
        aria-label={done ? `Desmarcar ${habit.name}` : `Marcar ${habit.name} como feito`}
        onClick={onToggle}
        whileTap={{ scale: 0.86 }}
        animate={done ? { scale: [1, 1.18, 1] } : { scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <svg viewBox="0 0 24 24" width={26} height={26} aria-hidden="true">
          <motion.path
            d="m5 12.5 4.5 4.5L19 7.5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={false}
            animate={{ pathLength: done ? 1 : 0, opacity: done ? 1 : 0 }}
            transition={{ duration: 0.3, ease: 'easeOut', delay: done ? 0.05 : 0 }}
          />
        </svg>
      </motion.button>
    </motion.li>
  )
}
