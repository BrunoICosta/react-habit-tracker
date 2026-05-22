import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { navigate, routeToHash } from '../../app/router'
import { fromDateKey, shiftDateKey } from '../../core/dates'
import { describeFrequency, isDayDone, isScheduledOn } from '../../core/habit'
import { buildHabitHeatmap } from '../../core/heatmap'
import { formatPercent, habitCompletionRate } from '../../core/stats'
import { computeStreaks } from '../../core/streaks'
import { ConfirmDialog } from '../../shared/components/ConfirmDialog'
import { EmptyState } from '../../shared/components/EmptyState'
import { Icon } from '../../shared/components/Icon'
import { PageHeader } from '../../shared/components/PageHeader'
import { useToday } from '../../shared/hooks/useToday'
import { useHabitStore } from '../../store/habitStore'
import { Heatmap } from '../heatmap/Heatmap'
import './HabitDetailPage.css'

const RECENT_DAYS = 7

export function HabitDetailPage({ id }: { id: string }) {
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

  if (!habit || !details) {
    return (
      <EmptyState
        emoji="🔍"
        title="Hábito não encontrado"
        description="Ele pode ter sido excluído ou o link está incorreto."
      >
        <a className="btn btn--primary" href={routeToHash({ name: 'habits' })}>
          Ver hábitos
        </a>
      </EmptyState>
    )
  }

  const recent = Array.from({ length: RECENT_DAYS }, (_, index) =>
    shiftDateKey(today, index - RECENT_DAYS + 1),
  )
  const since = format(fromDateKey(habit.createdAt), "d 'de' MMMM 'de' yyyy", { locale: ptBR })

  return (
    <div style={{ '--habit-color': habit.color }}>
      <PageHeader
        title={habit.name}
        subtitle={`${describeFrequency(habit.frequency)}${habit.target > 1 ? ` · ${habit.target}× por dia` : ''}`}
        backHref={routeToHash({ name: 'habits' })}
        actions={
          <a
            className="icon-button"
            href={routeToHash({ name: 'habit-edit', id })}
            aria-label={`Editar ${habit.name}`}
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
            <dt>Sequência atual</dt>
            <dd>
              <Icon name="flame" size={18} />
              {details.streaks.current}
            </dd>
          </div>
          <div>
            <dt>Melhor sequência</dt>
            <dd>
              <Icon name="trophy" size={18} />
              {details.streaks.best}
            </dd>
          </div>
          <div>
            <dt>30 dias</dt>
            <dd>{formatPercent(details.rate.rate)}</dd>
          </div>
          <div>
            <dt>Registros</dt>
            <dd>{details.checkIns}</dd>
          </div>
        </dl>
      </div>

      {details.streaks.atRisk && (
        <p className="detail-alert" role="status">
          <Icon name="flame" size={18} />
          Marque hoje para manter sua sequência de {details.streaks.current}{' '}
          {details.streaks.current === 1 ? 'dia' : 'dias'}.
        </p>
      )}

      {habit.archived && (
        <p className="detail-alert detail-alert--muted" role="status">
          <Icon name="archive" size={18} />
          Hábito arquivado. O histórico continua disponível.
        </p>
      )}

      <section className="card section" aria-labelledby="recent-title">
        <h2 id="recent-title" className="section__title">
          Últimos 7 dias
        </h2>
        <p className="section__hint">Esqueceu de marcar? Toque em um dia para corrigir.</p>
        <ul className="recent-days">
          {recent.map((day) => {
            const date = fromDateKey(day)
            const count = log?.[day] ?? 0
            const done = isDayDone(count, habit.target)
            const scheduled = isScheduledOn(habit.frequency, day)
            const fullDay = format(date, "EEEE, d 'de' MMMM", { locale: ptBR })
            return (
              <li key={day}>
                <button
                  type="button"
                  className="recent-days__day"
                  aria-pressed={done}
                  data-scheduled={scheduled}
                  disabled={habit.archived}
                  aria-label={`${fullDay}${scheduled ? '' : ' (fora da agenda)'}${
                    habit.target > 1 ? `, ${count} de ${habit.target}` : ''
                  }`}
                  onClick={() => toggle(habit.id, day)}
                >
                  <span className="recent-days__weekday">
                    {format(date, 'EEEEEE', { locale: ptBR })}
                  </span>
                  <span className="recent-days__dot">
                    {done ? <Icon name="check" size={16} /> : format(date, 'd')}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="card section" aria-labelledby="habit-heatmap-title">
        <h2 id="habit-heatmap-title" className="section__title">
          Histórico
        </h2>
        <p className="section__hint">Acompanhando desde {since}.</p>
        <Heatmap
          data={details.heatmap}
          color={habit.color}
          variant="habit"
          label={`Mapa de calor anual de ${habit.name}`}
        />
      </section>

      <div className="detail-actions">
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => setArchived(habit.id, !habit.archived)}
        >
          <Icon name={habit.archived ? 'restore' : 'archive'} size={18} />
          {habit.archived ? 'Restaurar' : 'Arquivar'}
        </button>
        <button type="button" className="btn btn--danger" onClick={() => setConfirmDelete(true)}>
          <Icon name="trash" size={18} />
          Excluir
        </button>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title={`Excluir “${habit.name}”?`}
        description="O hábito e todo o histórico dele serão apagados. Prefira arquivar se quiser manter os dados."
        confirmLabel="Excluir"
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
