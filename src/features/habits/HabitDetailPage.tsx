import { motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { navigate, routeToHash } from '../../app/router'
import { shiftDateKey } from '../../core/dates'
import { isDayDone, isScheduledOn, weekdayOf } from '../../core/habit'
import { buildHabitHeatmap } from '../../core/heatmap'
import { habitCompletionRate } from '../../core/stats'
import { computeStreaks } from '../../core/streaks'
import { ConfirmDialog } from '../../shared/components/ConfirmDialog'
import { Icon } from '../../shared/components/Icon'
import { PageHeader } from '../../shared/components/PageHeader'
import { useToday } from '../../shared/hooks/useToday'
import { useFormat } from '../../i18n/useFormat'
import { useHabitStore } from '../../store/habitStore'
import { Heatmap } from '../heatmap/Heatmap'
import { HabitNotFound } from './HabitNotFound'
import './HabitDetailPage.css'

const RECENT_DAYS = 7

export function HabitDetailPage({ id }: { id: string }) {
  const { t } = useTranslation('habits')
  const fmt = useFormat()
  const today = useToday()
  const habit = useHabitStore((state) => state.habits.find((item) => item.id === id))
  const log = useHabitStore((state) => state.logs[id])
  const toggle = useHabitStore((state) => state.toggle)
  const setArchived = useHabitStore((state) => state.setArchived)
  const deleteHabit = useHabitStore((state) => state.deleteHabit)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const details = useMemo(() => {
    if (!habit) return null
    const safeLog = log ?? {}
    const checkIns = Object.values(safeLog).reduce((sum, count) => sum + count, 0)
    return {
      streaks: computeStreaks(habit, safeLog, today),
      rate: habitCompletionRate(habit, safeLog, shiftDateKey(today, -29), today, today),
      heatmap: buildHabitHeatmap(habit, safeLog, today),
      checkIns,
    }
  }, [habit, log, today])

  if (!habit || !details) return <HabitNotFound />

  const recent = Array.from({ length: RECENT_DAYS }, (_, index) =>
    shiftDateKey(today, index - RECENT_DAYS + 1),
  )
  const since = fmt.date(habit.createdAt, 'date')

  return (
    <div style={{ '--habit-color': habit.color }}>
      <PageHeader
        title={habit.name}
        subtitle={`${fmt.frequency(habit.frequency)}${habit.target > 1 ? ` · ${fmt.perDay(habit.target)}` : ''}`}
        backHref={routeToHash({ name: 'habits' })}
        actions={
          <a
            className="icon-button"
            href={routeToHash({ name: 'habit-edit', id })}
            aria-label={t('detail.edit', { name: habit.name })}
          >
            <Icon name="edit" size={19} />
          </a>
        }
      />

      <div className="detail-hero">
        <motion.span
          className="detail-hero__emoji"
          aria-hidden="true"
          initial={{ scale: 0.6, rotate: -12 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 16 }}
        >
          {habit.emoji}
        </motion.span>
        <dl className="detail-stats">
          <div>
            <dt>{t('detail.currentStreak')}</dt>
            <dd>
              <Icon name="flame" size={18} />
              {details.streaks.current}
            </dd>
          </div>
          <div>
            <dt>{t('detail.bestStreak')}</dt>
            <dd>
              <Icon name="trophy" size={18} />
              {details.streaks.best}
            </dd>
          </div>
          <div>
            <dt>{t('detail.last30')}</dt>
            <dd>{fmt.percent(details.rate.rate)}</dd>
          </div>
          <div>
            <dt>{t('detail.checkIns')}</dt>
            <dd>{details.checkIns}</dd>
          </div>
        </dl>
      </div>

      {details.streaks.atRisk && (
        <p className="detail-alert" role="status">
          <Icon name="flame" size={18} />
          {t('detail.atRisk', { count: details.streaks.current })}
        </p>
      )}

      {habit.archived && (
        <p className="detail-alert detail-alert--muted" role="status">
          <Icon name="archive" size={18} />
          {t('detail.archived')}
        </p>
      )}

      <section className="card section" aria-labelledby="recent-title">
        <h2 id="recent-title" className="section__title">
          {t('detail.recentTitle')}
        </h2>
        <p className="section__hint">{t('detail.recentHint')}</p>
        <ul className="recent-days">
          {recent.map((day) => {
            const count = log?.[day] ?? 0
            const done = isDayDone(count, habit.target)
            const scheduled = isScheduledOn(habit.frequency, day)
            const fullDay = fmt.date(day, 'weekdayLong')
            return (
              <li key={day}>
                <button
                  type="button"
                  className="recent-days__day"
                  aria-pressed={done}
                  data-scheduled={scheduled}
                  disabled={habit.archived}
                  aria-label={`${fullDay}${scheduled ? '' : t('detail.offSchedule')}${
                    habit.target > 1 ? t('detail.progress', { count, target: habit.target }) : ''
                  }`}
                  onClick={() => toggle(habit.id, day)}
                >
                  <span className="recent-days__weekday">{fmt.weekday(weekdayOf(day))}</span>
                  <span className="recent-days__dot">
                    {done ? <Icon name="check" size={16} /> : fmt.pattern(day, 'd')}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="card section" aria-labelledby="habit-heatmap-title">
        <h2 id="habit-heatmap-title" className="section__title">
          {t('detail.historyTitle')}
        </h2>
        <p className="section__hint">{t('detail.since', { date: since })}</p>
        <Heatmap
          data={details.heatmap}
          color={habit.color}
          variant="habit"
          label={t('detail.heatmapLabel', { name: habit.name })}
        />
      </section>

      <div className="detail-actions">
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => setArchived(habit.id, !habit.archived)}
        >
          <Icon name={habit.archived ? 'restore' : 'archive'} size={18} />
          {habit.archived ? t('list.restore') : t('list.archive')}
        </button>
        <button type="button" className="btn btn--danger" onClick={() => setConfirmDelete(true)}>
          <Icon name="trash" size={18} />
          {t('list.delete')}
        </button>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title={t('deleteDialog.title', { name: habit.name })}
        description={t('deleteDialog.descriptionArchiveHint')}
        confirmLabel={t('deleteDialog.confirm')}
        tone="danger"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          setConfirmDelete(false)
          deleteHabit(habit.id)
          navigate({ name: 'habits' }, { replace: true })
        }}
      />
    </div>
  )
}
