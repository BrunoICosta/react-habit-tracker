import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { routeToHash } from '../../app/router'
import type { DateKey } from '../../core/dates'
import { isDayDone, type Habit } from '../../core/habit'
import { computeStreaks } from '../../core/streaks'
import { Icon } from '../../shared/components/Icon'
import { ProgressRing } from '../../shared/components/ProgressRing'
import { useHabitStore } from '../../store/habitStore'
import './HabitCheckCard.css'

interface HabitCheckCardProps {
  habit: Habit
  day: DateKey
  /** Called after any check-in change, so the parent can react (e.g. celebrate). */
  onChange?: () => void
}

const POP_DOTS = 8

function vibrate() {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate?.(12)
}

export function HabitCheckCard({ habit, day, onChange }: HabitCheckCardProps) {
  const log = useHabitStore((state) => state.logs[habit.id])
  const toggle = useHabitStore((state) => state.toggle)
  const increment = useHabitStore((state) => state.increment)
  const decrement = useHabitStore((state) => state.decrement)
  const [popKey, setPopKey] = useState(0)

  const count = log?.[day] ?? 0
  const done = isDayDone(count, habit.target)
  const multi = habit.target > 1
  const streak = computeStreaks(habit, log ?? {}, day)

  const onPrimary = () => {
    const completes = multi ? count + 1 >= habit.target && !done : !done
    if (multi && !done) increment(habit.id, day)
    else toggle(habit.id, day)
    if (completes) {
      vibrate()
      setPopKey((key) => key + 1)
    }
    onChange?.()
  }

  const onUndo = () => {
    decrement(habit.id, day)
    onChange?.()
  }

  const primaryLabel = done
    ? `Desmarcar ${habit.name}`
    : multi
      ? `Registrar ${habit.name} (${count} de ${habit.target})`
      : `Marcar ${habit.name} como feito`

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
        animate={{ scaleX: done ? 1 : multi ? count / habit.target : 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 30 }}
      />

      <a className="check-card__body" href={routeToHash({ name: 'habit-edit', id: habit.id })}>
        <span className="check-card__emoji" aria-hidden="true">
          {habit.emoji}
        </span>
        <span className="check-card__text">
          <span className="check-card__name">{habit.name}</span>
          <span className="check-card__meta">
            {multi && (
              <span className="check-card__count">
                {count}/{habit.target}
              </span>
            )}
            {streak.current > 0 ? (
              <>
                <Icon name="flame" size={14} />
                {streak.current} {streak.current === 1 ? 'dia' : 'dias'}
              </>
            ) : (
              !multi && 'Comece uma sequência hoje'
            )}
          </span>
        </span>
      </a>

      <AnimatePresence initial={false}>
        {multi && count > 0 && (
          <motion.button
            type="button"
            className="check-card__undo"
            aria-label={`Remover um registro de ${habit.name}`}
            onClick={onUndo}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            whileTap={{ scale: 0.85 }}
          >
            <Icon name="minus" size={16} />
          </motion.button>
        )}
      </AnimatePresence>

      <div className="check-card__action">
        <span className="check-card__pop" aria-hidden="true">
          {popKey > 0 &&
            Array.from({ length: POP_DOTS }, (_, index) => {
              const angle = (Math.PI * 2 * index) / POP_DOTS
              return (
                <motion.span
                  key={`${popKey}-${index}`}
                  className="check-card__pop-dot"
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{
                    x: Math.cos(angle) * 38,
                    y: Math.sin(angle) * 38,
                    opacity: 0,
                    scale: 0.4,
                  }}
                  transition={{ duration: 0.55, ease: 'easeOut' }}
                />
              )
            })}
        </span>

        <motion.button
          type="button"
          className="check-button"
          data-multi={multi}
          aria-pressed={done}
          aria-label={primaryLabel}
          onClick={onPrimary}
          whileTap={{ scale: 0.86 }}
          animate={done ? { scale: [1, 1.18, 1] } : { scale: 1 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          {multi && !done && (
            <span className="check-button__ring">
              <ProgressRing
                value={count / habit.target}
                size={52}
                stroke={4}
                color={habit.color}
                trackColor="transparent"
              />
            </span>
          )}
          {multi && !done ? (
            <span className="check-button__plus">
              <Icon name="plus" size={22} />
            </span>
          ) : (
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
          )}
        </motion.button>
      </div>
    </motion.li>
  )
}
