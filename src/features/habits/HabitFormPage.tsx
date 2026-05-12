import { navigate, routeToHash } from '../../app/router'
import type { Habit } from '../../core/habit'
import { EmptyState } from '../../shared/components/EmptyState'
import { PageHeader } from '../../shared/components/PageHeader'
import { useHabitStore } from '../../store/habitStore'
import { HabitForm } from './HabitForm'

export function NewHabitPage() {
  const addHabit = useHabitStore((state) => state.addHabit)

  return (
    <>
      <PageHeader title="Novo hábito" backHref={routeToHash({ name: 'habits' })} />
      <HabitForm
        submitLabel="Criar hábito"
        onSubmit={(draft) => {
          addHabit(draft)
          navigate({ name: 'today' })
        }}
        onCancel={() => navigate({ name: 'habits' })}
      />
    </>
  )
}

export function EditHabitPage({ id }: { id: string }) {
  const habit = useHabitStore((state) => state.habits.find((item: Habit) => item.id === id))
  const updateHabit = useHabitStore((state) => state.updateHabit)

  if (!habit) {
    return (
      <EmptyState
        emoji="🔍"
        title="Hábito não encontrado"
        description="Ele pode ter sido excluído."
      >
        <a className="btn btn--primary" href={routeToHash({ name: 'habits' })}>
          Ver hábitos
        </a>
      </EmptyState>
    )
  }

  const detail = { name: 'habit-detail', id } as const

  return (
    <>
      <PageHeader title="Editar hábito" backHref={routeToHash(detail)} />
      <HabitForm
        initial={{
          name: habit.name,
          emoji: habit.emoji,
          color: habit.color,
          frequency: habit.frequency,
          target: habit.target,
        }}
        submitLabel="Salvar alterações"
        onSubmit={(draft) => {
          updateHabit(id, draft)
          navigate(detail, { replace: true })
        }}
        onCancel={() => navigate(detail)}
      />
    </>
  )
}
