import { AnimatePresence } from 'motion/react'
import { useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'
import { routeToHash } from '../../app/router'
import { isDayDone, isScheduledOn } from '../../core/habit'
import { createSampleData } from '../../core/sample'
import { useFormat } from '../../i18n/useFormat'
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

type ProgressMessage = 'nothing' | 'start' | 'complete' | 'half' | 'progress'

function progressMessage(done: number, total: number): ProgressMessage {
  if (total === 0) return 'nothing'
  if (done === 0) return 'start'
  if (done === total) return 'complete'
  if (done / total >= 0.5) return 'half'
  return 'progress'
}

export function TodayPage() {
  const { t } = useTranslation(['today', 'common', 'settings'])
  const fmt = useFormat()
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

  const subtitle = fmt.date(today, 'weekdayLong')
  const newHabitHref = routeToHash({ name: 'habit-new' })

  return (
    <>
      <PageHeader
        title={t('title')}
        subtitle={subtitle}
        actions={
          <a
            className="icon-button icon-button--accent"
            href={newHabitHref}
            aria-label={t('common:actions.newHabit')}
          >
            <Icon name="plus" />
          </a>
        }
      />

      {habits.length === 0 ? (
        <EmptyState emoji="✨" title={t('emptyTitle')} description={t('emptyDescription')}>
          <a className="btn btn--primary" href={newHabitHref}>
            <Icon name="plus" size={18} />
            {t('common:actions.createHabit')}
          </a>
          {totalHabits === 0 && (
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() =>
                replaceAll(
                  createSampleData(today, t('settings:sampleNames', { returnObjects: true })),
                )
              }
            >
              <Icon name="sparkles" size={18} />
              {t('loadSample')}
            </button>
          )}
        </EmptyState>
      ) : (
        <>
          <section
            className="today-summary card"
            data-complete={total > 0 && doneCount === total}
            aria-label={t('summaryLabel')}
          >
            <Confetti burstKey={burst?.key ?? null} particles={burst?.particles ?? []} />
            <ProgressRing value={ratio} size={76} stroke={8}>
              <span className="today-summary__percent">{fmt.percent(ratio)}</span>
            </ProgressRing>
            <div>
              <p className="today-summary__count" aria-live="polite">
                <Trans
                  t={t}
                  i18nKey="summaryCount"
                  count={total}
                  values={{ done: doneCount }}
                  components={{ strong: <strong /> }}
                />
              </p>
              <p className="today-summary__message">
                {t(`messages.${progressMessage(doneCount, total)}`)}
              </p>
            </div>
          </section>

          {total === 0 ? (
            <EmptyState
              emoji="🌤️"
              title={t('freeDayTitle')}
              description={t('freeDayDescription')}
            />
          ) : (
            <ul className="today-list" aria-label={t('listLabel')}>
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

          {offToday > 0 && <p className="today-off">{t('offToday', { count: offToday })}</p>}
        </>
      )}
    </>
  )
}
