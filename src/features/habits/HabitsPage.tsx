import { AnimatePresence, motion } from 'motion/react'
import { useMemo, useState, type ReactNode } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { routeToHash } from '../../app/router'
import { describeFrequency, type Habit } from '../../core/habit'
import { computeStreaks } from '../../core/streaks'
import { ConfirmDialog } from '../../shared/components/ConfirmDialog'
import { EmptyState } from '../../shared/components/EmptyState'
import { Icon } from '../../shared/components/Icon'
import { PageHeader } from '../../shared/components/PageHeader'
import { useToday } from '../../shared/hooks/useToday'
import { selectActiveHabits, selectArchivedHabits, useHabitStore } from '../../store/habitStore'
import './HabitsPage.css'

function HabitRow({ habit, children }: { habit: Habit; children: ReactNode }) {
  const today = useToday()
  const log = useHabitStore((state) => state.logs[habit.id])
  const streak = useMemo(() => computeStreaks(habit, log ?? {}, today), [habit, log, today])

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -24 }}
      className="habit-row"
      style={{ '--habit-color': habit.color }}
    >
      <a className="habit-row__link" href={routeToHash({ name: 'habit-detail', id: habit.id })}>
        <span className="habit-row__emoji" aria-hidden="true">
          {habit.emoji}
        </span>
        <span className="habit-row__text">
          <span className="habit-row__name">{habit.name}</span>
          <span className="habit-row__meta">
            {describeFrequency(habit.frequency)}
            {habit.target > 1 && ` · ${habit.target}× por dia`}
          </span>
        </span>
        {streak.current > 0 && (
          <span className="habit-row__streak" title="Sequência atual">
            <Icon name="flame" size={16} />
            {streak.current}
            <span className="visually-hidden"> dias de sequência</span>
          </span>
        )}
      </a>
      <div className="habit-row__actions">{children}</div>
    </motion.li>
  )
}

export function HabitsPage() {
  const active = useHabitStore(useShallow(selectActiveHabits))
  const archived = useHabitStore(useShallow(selectArchivedHabits))
  const setArchived = useHabitStore((state) => state.setArchived)
  const deleteHabit = useHabitStore((state) => state.deleteHabit)
  const [pendingDelete, setPendingDelete] = useState<Habit | null>(null)

  const newHabitHref = routeToHash({ name: 'habit-new' })

  return (
    <>
      <PageHeader
        title="Hábitos"
        subtitle={active.length === 1 ? '1 hábito ativo' : `${active.length} hábitos ativos`}
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

      {active.length === 0 ? (
        <EmptyState
          emoji="🌱"
          title="Nenhum hábito ativo"
          description="Crie um hábito para começar a acompanhar sua rotina."
        >
          <a className="btn btn--primary" href={newHabitHref}>
            <Icon name="plus" size={18} />
            Criar hábito
          </a>
        </EmptyState>
      ) : (
        <ul className="habit-list" aria-label="Hábitos ativos">
          <AnimatePresence initial={false}>
            {active.map((habit) => (
              <HabitRow key={habit.id} habit={habit}>
                <button
                  type="button"
                  className="icon-button"
                  aria-label={`Arquivar ${habit.name}`}
                  title="Arquivar"
                  onClick={() => setArchived(habit.id, true)}
                >
                  <Icon name="archive" size={19} />
                </button>
              </HabitRow>
            ))}
          </AnimatePresence>
        </ul>
      )}

      {archived.length > 0 && (
        <section className="section" aria-labelledby="archived-title">
          <h2 id="archived-title" className="section__title">
            Arquivados
          </h2>
          <p className="section__hint">
            Hábitos arquivados saem da tela Hoje, mas o histórico é mantido.
          </p>
          <ul className="habit-list habit-list--archived" aria-labelledby="archived-title">
            <AnimatePresence initial={false}>
              {archived.map((habit) => (
                <HabitRow key={habit.id} habit={habit}>
                  <button
                    type="button"
                    className="icon-button"
                    aria-label={`Restaurar ${habit.name}`}
                    title="Restaurar"
                    onClick={() => setArchived(habit.id, false)}
                  >
                    <Icon name="restore" size={19} />
                  </button>
                  <button
                    type="button"
                    className="icon-button"
                    aria-label={`Excluir ${habit.name}`}
                    title="Excluir"
                    onClick={() => setPendingDelete(habit)}
                  >
                    <Icon name="trash" size={19} />
                  </button>
                </HabitRow>
              ))}
            </AnimatePresence>
          </ul>
        </section>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title={`Excluir “${pendingDelete?.name ?? ''}”?`}
        description="O hábito e todo o histórico dele serão apagados. Essa ação não pode ser desfeita."
        confirmLabel="Excluir"
        tone="danger"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) deleteHabit(pendingDelete.id)
          setPendingDelete(null)
        }}
      />
    </>
  )
}
