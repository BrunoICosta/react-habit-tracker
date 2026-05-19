import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { routeToHash } from '../../app/router'
import { fromDateKey, shiftDateKey } from '../../core/dates'
import { buildOverallHeatmap } from '../../core/heatmap'
import {
  formatPercent,
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

function formatWeekRange(monday: string): string {
  const sunday = shiftDateKey(monday, 6)
  const start = fromDateKey(monday)
  const end = fromDateKey(sunday)
  const sameMonth = start.getMonth() === end.getMonth()
  return sameMonth
    ? `${format(start, 'd')}–${format(end, "d 'de' MMM", { locale: ptBR })}`
    : `${format(start, "d 'de' MMM", { locale: ptBR })} – ${format(end, "d 'de' MMM", { locale: ptBR })}`
}

export function StatsPage() {
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
        <PageHeader title="Estatísticas" subtitle="Sua consistência ao longo do tempo" />
        <EmptyState
          emoji="📈"
          title="Sem dados ainda"
          description="As estatísticas aparecem assim que você criar e marcar seus hábitos."
        >
          <a className="btn btn--primary" href={routeToHash({ name: 'habit-new' })}>
            Criar hábito
          </a>
        </EmptyState>
      </>
    )
  }

  const maxScheduled = Math.max(1, ...stats.week.map((day) => day.scheduled))

  return (
    <>
      <PageHeader title="Estatísticas" subtitle="Sua consistência ao longo do tempo" />

      <div className="stat-grid">
        <StatTile
          icon="calendar"
          label={weekOffset === 0 ? 'Esta semana' : 'Semana selecionada'}
          value={formatPercent(stats.weekRate.rate)}
          hint={`${stats.weekRate.done} de ${stats.weekRate.scheduled} concluídos`}
        />
        <StatTile
          icon="target"
          label="Últimos 30 dias"
          value={formatPercent(stats.monthRate.rate)}
          hint="Taxa de conclusão"
        />
        <StatTile
          icon="trophy"
          label="Melhor sequência"
          value={`${stats.bestStreak.value} ${stats.bestStreak.value === 1 ? 'dia' : 'dias'}`}
          hint={stats.bestStreak.name || undefined}
        />
        <StatTile
          icon="sparkles"
          label="Dias perfeitos"
          value={String(stats.perfect)}
          hint="Nos últimos 30 dias"
        />
      </div>

      <section className="card section" aria-labelledby="week-title">
        <div className="week-header">
          <div>
            <h2 id="week-title" className="section__title">
              Semana
            </h2>
            <p className="week-header__range">{formatWeekRange(selectedMonday)}</p>
          </div>
          <div className="week-header__nav">
            <button
              type="button"
              className="icon-button"
              aria-label="Semana anterior"
              onClick={() => setWeekOffset((value) => value - 1)}
            >
              <Icon name="back" size={18} />
            </button>
            <button
              type="button"
              className="icon-button"
              aria-label="Próxima semana"
              disabled={weekOffset >= 0}
              onClick={() => setWeekOffset((value) => Math.min(0, value + 1))}
            >
              <Icon name="chevron" size={18} />
            </button>
          </div>
        </div>

        <ol className="week-chart" aria-label="Hábitos concluídos por dia">
          {stats.week.map((day, index) => {
            const date = fromDateKey(day.date)
            const weekday = format(date, 'EEEEEE', { locale: ptBR })
            const fullDay = format(date, "EEEE, d 'de' MMMM", { locale: ptBR })
            const ratio = day.scheduled > 0 ? day.done / day.scheduled : 0
            const description = day.future
              ? `${fullDay}: ainda não chegou`
              : `${fullDay}: ${day.done} de ${day.scheduled} hábitos`
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
            Por hábito
          </h2>
          <p className="section__hint">Taxa de conclusão nos últimos 30 dias.</p>
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
                      <span className="ranking__rate">{formatPercent(rate.rate)}</span>
                    </span>
                    <span
                      className="ranking__bar"
                      role="progressbar"
                      aria-label={`Conclusão de ${habit.name}`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round((rate.rate ?? 0) * 100)}
                    >
                      <span style={{ width: `${(rate.rate ?? 0) * 100}%` }} />
                    </span>
                    <span className="ranking__meta">
                      {rate.done} de {rate.scheduled} dias · sequência atual: {current}
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
          Últimos 12 meses
        </h2>
        <Heatmap
          data={stats.heatmap}
          color="var(--accent)"
          variant="overall"
          label="Mapa de calor anual de todos os hábitos"
        />
      </section>
    </>
  )
}
