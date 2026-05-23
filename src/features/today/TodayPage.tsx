import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { AnimatePresence } from 'motion/react'
import { useMemo, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { routeToHash } from '../../app/router'
import { fromDateKey } from '../../core/dates'
import { isDayDone, isScheduledOn } from '../../core/habit'
import { createSampleData } from '../../core/sample'
import { Confetti } from '../../shared/components/Confetti'
import { EmptyState } from '../../shared/components/EmptyState'
import { Icon } from '../../shared/components/Icon'
import { PageHeader } from '../../shared/components/PageHeader'
import { ProgressRing } from '../../shared/components/ProgressRing'
import { useToday } from '../../shared/hooks/useToday'
import { createBurst, type Particle } from '../../shared/lib/confetti'
import { selectActiveHabits, useHabitStore } from '../../store/habitStore'
import { HabitCheckCard } from './HabitCheckCard'
import './TodayPage.css'

function progressMessage(done: number, total: number): string {
  if (total === 0) return 'Nada programado para hoje.'
  if (done === 0) return 'Bora começar? Um hábito de cada vez.'
  if (done === total) return 'Tudo feito! Dia completo. 🎉'
  if (done / total >= 0.5) return 'Mais da metade. Continue assim!'
  return 'Bom começo, siga em frente.'
}

export function TodayPage() {
  const today = useToday()
  const habits = useHabitStore(useShallow(selectActiveHabits))
  const logs = useHabitStore((state) => state.logs)
  const totalHabits = useHabitStore((state) => state.habits.length)
  const replaceAll = useHabitStore((state) => state.replaceAll)
  const [burst, setBurst] = useState<{ key: number; particles: Particle[] } | null>(null)

  const scheduled = useMemo(
    () => habits.filter((habit) => isScheduledOn(habit.frequency, today)),
    [habits, today],
  )
  const offToday = habits.length - scheduled.length
  const doneCount = scheduled.filter((habit) =>
    isDayDone(logs[habit.id]?.[today], habit.target),
  ).length
  const total = scheduled.length
  const ratio = total === 0 ? 0 : doneCount / total

  // Event-driven (not an effect): only celebrate when a user action completes the day.
  const handleChange = () => {
    const { logs: nextLogs } = useHabitStore.getState()
    const nowDone = scheduled.every((habit) => isDayDone(nextLogs[habit.id]?.[today], habit.target))
    if (nowDone && doneCount < total) {
      setBurst((current) => ({ key: (current?.key ?? 0) + 1, particles: createBurst() }))
    }
  }

  const subtitle = format(fromDateKey(today), "EEEE, d 'de' MMMM", { locale: ptBR })
  const newHabitHref = routeToHash({ name: 'habit-new' })

  return (
    <>
      <PageHeader
        title="Hoje"
        subtitle={subtitle}
        actions={
          <a
            className="icon-button icon-button--accent"
            href={newHabitHref}
            aria-label="Novo hábito"
          >
            <Icon name="plus" />
          </a>
        }
      />

      {habits.length === 0 ? (
        <EmptyState
          emoji="✨"
          title="Seu primeiro hábito"
          description="Crie hábitos pequenos e marque aqui todos os dias. A consistência faz o resto."
        >
          <a className="btn btn--primary" href={newHabitHref}>
            <Icon name="plus" size={18} />
            Criar hábito
          </a>
          {totalHabits === 0 && (
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => replaceAll(createSampleData(today))}
            >
              <Icon name="sparkles" size={18} />
              Ver com dados de exemplo
            </button>
          )}
        </EmptyState>
      ) : (
        <>
          <section
            className="today-summary card"
            data-complete={total > 0 && doneCount === total}
            aria-label="Progresso de hoje"
          >
            <Confetti burstKey={burst?.key ?? null} particles={burst?.particles ?? []} />
            <ProgressRing value={ratio} size={76} stroke={8}>
              <span className="today-summary__percent">{Math.round(ratio * 100)}%</span>
            </ProgressRing>
            <div>
              <p className="today-summary__count" aria-live="polite">
                <strong>{doneCount}</strong> de {total} {total === 1 ? 'hábito' : 'hábitos'}
              </p>
              <p className="today-summary__message">{progressMessage(doneCount, total)}</p>
            </div>
          </section>

          {total === 0 ? (
            <EmptyState
              emoji="🌤️"
              title="Dia livre"
              description="Nenhum hábito está programado para hoje. Aproveite para descansar."
            />
          ) : (
            <ul className="today-list" aria-label="Hábitos de hoje">
              <AnimatePresence initial={false}>
                {scheduled.map((habit) => (
                  <HabitCheckCard
                    key={habit.id}
                    habit={habit}
                    day={today}
                    onChange={handleChange}
                  />
                ))}
              </AnimatePresence>
            </ul>
          )}

          {offToday > 0 && (
            <p className="today-off">
              {offToday === 1
                ? '1 hábito não está programado para hoje.'
                : `${offToday} hábitos não estão programados para hoje.`}
            </p>
          )}
        </>
      )}
    </>
  )
}
