import { useMemo } from 'react'
import { buildOverallHeatmap } from '../../core/heatmap'
import { EmptyState } from '../../shared/components/EmptyState'
import { PageHeader } from '../../shared/components/PageHeader'
import { useToday } from '../../shared/hooks/useToday'
import { useHabitStore } from '../../store/habitStore'
import { Heatmap } from '../heatmap/Heatmap'

export function StatsPage() {
  const today = useToday()
  const habits = useHabitStore((state) => state.habits)
  const logs = useHabitStore((state) => state.logs)
  const heatmap = useMemo(() => buildOverallHeatmap(habits, logs, today), [habits, logs, today])

  return (
    <>
      <PageHeader title="Estatísticas" subtitle="Sua consistência ao longo do tempo" />

      {habits.length === 0 ? (
        <EmptyState
          emoji="📈"
          title="Sem dados ainda"
          description="As estatísticas aparecem assim que você criar e marcar seus hábitos."
        />
      ) : (
        <section className="card" aria-labelledby="overall-heatmap-title">
          <h2 id="overall-heatmap-title" className="section__title">
            Últimos 12 meses
          </h2>
          <Heatmap
            data={heatmap}
            color="var(--accent)"
            variant="overall"
            label="Mapa de calor anual de todos os hábitos"
          />
        </section>
      )}
    </>
  )
}
