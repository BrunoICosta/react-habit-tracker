import { AnimatePresence, motion } from 'motion/react'
import { SettingsPage } from '../features/settings/SettingsPage'
import { EmptyState } from '../shared/components/EmptyState'
import { PageHeader } from '../shared/components/PageHeader'
import { useTheme } from '../shared/hooks/useTheme'
import { routeToHash, tabOf, useRoute, type Route } from './router'
import { TabBar } from './TabBar'
import './App.css'

function renderRoute(route: Route) {
  switch (route.name) {
    case 'settings':
      return <SettingsPage />
    case 'today':
      return <PageHeader title="Hoje" />
    case 'habits':
    case 'habit-new':
    case 'habit-detail':
    case 'habit-edit':
      return <PageHeader title="Hábitos" />
    case 'stats':
      return <PageHeader title="Estatísticas" />
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

  return (
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
      <main className="app-main" id="conteudo" tabIndex={-1}>
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
    </div>
  )
}
