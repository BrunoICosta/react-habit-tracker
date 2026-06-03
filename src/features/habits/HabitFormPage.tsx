import { useTranslation } from 'react-i18next'
import { navigate, routeToHash } from '../../app/router'
import type { Habit } from '../../core/habit'
import { PageHeader } from '../../shared/components/PageHeader'
import { useHabitStore } from '../../store/habitStore'
import { HabitForm } from './HabitForm'
import { HabitNotFound } from './HabitNotFound'

export function NewHabitPage() {
  const { t } = useTranslation('habits')
  const addHabit = useHabitStore((state) => state.addHabit)

  return (
    <>
      <PageHeader title={t('form.newTitle')} backHref={routeToHash({ name: 'habits' })} />
      <HabitForm
        submitLabel={t('form.create')}
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
  const { t } = useTranslation('habits')
  const habit = useHabitStore((state) => state.habits.find((item: Habit) => item.id === id))
  const updateHabit = useHabitStore((state) => state.updateHabit)

  if (!habit) return <HabitNotFound />

  const detail = { name: 'habit-detail', id } as const

  return (
    <>
      <PageHeader title={t('form.editTitle')} backHref={routeToHash(detail)} />
      <HabitForm
        initial={{
          name: habit.name,
          emoji: habit.emoji,
          color: habit.color,
          frequency: habit.frequency,
          target: habit.target,
        }}
        submitLabel={t('form.save')}
        onSubmit={(draft) => {
          updateHabit(id, draft)
          navigate(detail, { replace: true })
        }}
        onCancel={() => navigate(detail)}
      />
    </>
  )
}
