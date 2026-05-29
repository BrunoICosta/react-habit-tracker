import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { useEffect, useRef } from 'react'
import { HabitDetailPage } from '../features/habits/HabitDetailPage'
import { EditHabitPage, NewHabitPage } from '../features/habits/HabitFormPage'
import { HabitsPage } from '../features/habits/HabitsPage'
import { SettingsPage } from '../features/settings/SettingsPage'
import { StatsPage } from '../features/stats/StatsPage'
import { TodayPage } from '../features/today/TodayPage'
import { EmptyState } from '../shared/components/EmptyState'
import { useTheme } from '../shared/hooks/useTheme'
import { routeToHash, tabOf, titleOf, useRoute, type Route } from './router'
import { StatusToast } from './StatusToast'
import { TabBar } from './TabBar'
import './App.css'

/** Pages with yearly heatmaps get more room on large screens so the full year fits. */
const WIDE_ROUTES = new Set<Route['name']>(['stats', 'habit-detail'])

function renderRoute(route: Route) {
  switch (route.name) {
    case 'settings':
      return <SettingsPage />
    case 'today':
      return <TodayPage />
    case 'habit-new':
      return <NewHabitPage />
    case 'habit-edit':
      return <EditHabitPage id={route.id} />
    case 'habits':
      return <HabitsPage />
    case 'habit-detail':
      return <HabitDetailPage id={route.id} />
    case 'stats':
      return <StatsPage />
    case 'not-found':
      return (
        <EmptyState
          emoji="🧭"
          title="Página não encontrada"
          description="Esse endereço não existe."
        >
          <a className="btn btn--primary" href={routeToHash({ name: 'today' })}>
            Ir para Hoje
          </a>
        </EmptyState>
      )
  }
}

export function App() {
  useTheme()
  const route = useRoute()
  const pageKey = routeToHash(route)
  const title = titleOf(route)
  const mainRef = useRef<HTMLElement>(null)
  const firstRender = useRef(true)

  useEffect(() => {
    document.title = `${title} · Hábitos`
  }, [title])

  // Move focus to the new page so screen readers announce navigation (skipped on first load).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    mainRef.current?.focus({ preventScroll: true })
  }, [pageKey])

  return (
    <MotionConfig reducedMotion="user">
      <div className="app-shell">
        <a
          className="skip-link"
          href="#conteudo"
          onClick={(event) => {
            // Hash links are routes here, so move focus manually instead of changing the hash.
            event.preventDefault()
            document.getElementById('conteudo')?.focus()
          }}
        >
          Pular para o conteúdo
        </a>
        <TabBar active={tabOf(route)} />
        <main
          ref={mainRef}
          className="app-main"
          id="conteudo"
          tabIndex={-1}
          data-wide={WIDE_ROUTES.has(route.name) || undefined}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pageKey}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              {renderRoute(route)}
            </motion.div>
          </AnimatePresence>
        </main>
        <StatusToast />
      </div>
    </MotionConfig>
  )
}
