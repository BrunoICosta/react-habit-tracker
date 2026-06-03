import { motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { routeToHash } from '../../app/router'
import { shiftDateKey } from '../../core/dates'
import { weekdayOf } from '../../core/habit'
import { buildOverallHeatmap } from '../../core/heatmap'
import {
  overallCompletionRate,
  perfectDays,
  rankHabits,
  weekStart,
  weeklyBreakdown,
} from '../../core/stats'
import { EmptyState } from '../../shared/components/EmptyState'
import { Icon, type IconName } from '../../shared/components/Icon'
import { PageHeader } from '../../shared/components/PageHeader'
import { useToday } from '../../shared/hooks/useToday'
import { useFormat } from '../../i18n/useFormat'
import { useHabitStore } from '../../store/habitStore'
import { Heatmap } from '../heatmap/Heatmap'
import './StatsPage.css'

function StatTile({
  icon,
  label,
  value,
  hint,
}: {
  icon: IconName
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className="stat-tile">
      <span className="stat-tile__icon">
        <Icon name={icon} size={18} />
      </span>
      <span className="stat-tile__value">{value}</span>
      <span className="stat-tile__label">{label}</span>
      {hint && <span className="stat-tile__hint">{hint}</span>}
    </div>
  )
}

export function StatsPage() {
  const { t } = useTranslation(['stats', 'common'])
  const fmt = useFormat()
  const today = useToday()
  const habits = useHabitStore((state) => state.habits)
  const logs = useHabitStore((state) => state.logs)
  const [weekOffset, setWeekOffset] = useState(0)

  const thisMonday = weekStart(today)
  const selectedMonday = shiftDateKey(thisMonday, weekOffset * 7)
  const last30 = shiftDateKey(today, -29)

  const stats = useMemo(() => {
    const week = weeklyBreakdown(habits, logs, selectedMonday, today)
    const weekRate = overallCompletionRate(
      habits,
      logs,
      selectedMonday,
      shiftDateKey(selectedMonday, 6),
      today,
    )
    const monthRate = overallCompletionRate(habits, logs, last30, today, today)
    const ranking = rankHabits(
      habits.filter((habit) => !habit.archived),
      logs,
      last30,
      today,
    )
    const bestStreak = rankHabits(habits, logs, last30, today).reduce(
      (best, item) => (item.best > best.value ? { value: item.best, name: item.habit.name } : best),
      { value: 0, name: '' },
    )
    return {
      week,
      weekRate,
      monthRate,
      ranking,
      bestStreak,
      perfect: perfectDays(habits, logs, last30, today),
      heatmap: buildOverallHeatmap(habits, logs, today),
    }
  }, [habits, logs, selectedMonday, last30, today])

  if (habits.length === 0) {
    return (
      <>
        <PageHeader title={t('title')} subtitle={t('subtitle')} />
        <EmptyState emoji="📈" title={t('emptyTitle')} description={t('emptyDescription')}>
          <a className="btn btn--primary" href={routeToHash({ name: 'habit-new' })}>
            {t('common:actions.createHabit')}
          </a>
        </EmptyState>
      </>
    )
  }

  const maxScheduled = Math.max(1, ...stats.week.map((day) => day.scheduled))

  return (
    <>
      <PageHeader title={t('title')} subtitle={t('subtitle')} />

      <div className="stat-grid">
        <StatTile
          icon="calendar"
          label={weekOffset === 0 ? t('tiles.thisWeek') : t('tiles.selectedWeek')}
          value={fmt.percent(stats.weekRate.rate)}
          hint={t('tiles.weekHint', {
            done: stats.weekRate.done,
            scheduled: stats.weekRate.scheduled,
          })}
        />
        <StatTile
          icon="target"
          label={t('tiles.last30')}
          value={fmt.percent(stats.monthRate.rate)}
          hint={t('tiles.last30Hint')}
        />
        <StatTile
          icon="trophy"
          label={t('tiles.bestStreak')}
          value={t('common:units.day', { count: stats.bestStreak.value })}
          hint={stats.bestStreak.name || undefined}
        />
        <StatTile
          icon="sparkles"
          label={t('tiles.perfectDays')}
          value={String(stats.perfect)}
          hint={t('tiles.perfectDaysHint')}
        />
      </div>

      <section className="card section" aria-labelledby="week-title">
        <div className="week-header">
          <div>
            <h2 id="week-title" className="section__title">
              {t('week.title')}
            </h2>
            <p className="week-header__range">
              {fmt.range(selectedMonday, shiftDateKey(selectedMonday, 6))}
            </p>
          </div>
          <div className="week-header__nav">
            <button
              type="button"
              className="icon-button"
              aria-label={t('week.previous')}
              onClick={() => setWeekOffset((value) => value - 1)}
            >
              <Icon name="back" size={18} />
            </button>
            <button
              type="button"
              className="icon-button"
              aria-label={t('week.next')}
              disabled={weekOffset >= 0}
              onClick={() => setWeekOffset((value) => Math.min(0, value + 1))}
            >
              <Icon name="chevron" size={18} />
            </button>
          </div>
        </div>

        <ol className="week-chart" aria-label={t('week.chartLabel')}>
          {stats.week.map((day, index) => {
            const weekday = fmt.weekday(weekdayOf(day.date))
            const fullDay = fmt.date(day.date, 'weekdayLong')
            const ratio = day.scheduled > 0 ? day.done / day.scheduled : 0
            const description = day.future
              ? t('week.future', { day: fullDay })
              : t('week.day', { day: fullDay, done: day.done, scheduled: day.scheduled })
            return (
              <li
                key={day.date}
                className="week-chart__day"
                data-today={day.date === today || undefined}
                data-future={day.future || undefined}
                aria-label={description}
              >
                <span className="week-chart__value" aria-hidden="true">
                  {day.future || day.scheduled === 0 ? '' : `${day.done}/${day.scheduled}`}
                </span>
                <span className="week-chart__track" aria-hidden="true">
                  <span
                    className="week-chart__capacity"
                    style={{ height: `${(day.scheduled / maxScheduled) * 100}%` }}
                  >
                    <motion.span
                      className="week-chart__bar"
                      data-perfect={ratio === 1 || undefined}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: day.future ? 0 : ratio }}
                      transition={{
                        type: 'spring',
                        stiffness: 160,
                        damping: 22,
                        delay: index * 0.03,
                      }}
                    />
                  </span>
                </span>
                <span className="week-chart__label" aria-hidden="true">
                  {weekday}
                </span>
              </li>
            )
          })}
        </ol>
      </section>

      {stats.ranking.length > 0 && (
        <section className="card section" aria-labelledby="ranking-title">
          <h2 id="ranking-title" className="section__title">
            {t('ranking.title')}
          </h2>
          <p className="section__hint">{t('ranking.hint')}</p>
          <ul className="ranking">
            {stats.ranking.map(({ habit, rate, current }) => (
              <li key={habit.id} className="ranking__item" style={{ '--habit-color': habit.color }}>
                <a
                  className="ranking__link"
                  href={routeToHash({ name: 'habit-detail', id: habit.id })}
                >
                  <span className="ranking__emoji" aria-hidden="true">
                    {habit.emoji}
                  </span>
                  <span className="ranking__body">
                    <span className="ranking__row">
                      <span className="ranking__name">{habit.name}</span>
                      <span className="ranking__rate">{fmt.percent(rate.rate)}</span>
                    </span>
                    <span
                      className="ranking__bar"
                      role="progressbar"
                      aria-label={t('ranking.progressLabel', { name: habit.name })}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round((rate.rate ?? 0) * 100)}
                    >
                      <span style={{ width: `${(rate.rate ?? 0) * 100}%` }} />
                    </span>
                    <span className="ranking__meta">
                      {t('ranking.meta', { done: rate.done, scheduled: rate.scheduled, current })}
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="card section" aria-labelledby="overall-heatmap-title">
        <h2 id="overall-heatmap-title" className="section__title">
          {t('heatmap.title')}
        </h2>
        <Heatmap
          data={stats.heatmap}
          color="var(--accent)"
          variant="overall"
          label={t('heatmap.label')}
        />
      </section>
    </>
  )
}
