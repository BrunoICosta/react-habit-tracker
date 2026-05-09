import { useTheme } from '../shared/hooks/useTheme'
import './App.css'

export function App() {
  useTheme()

  return (
    <div className="app-shell">
      <main className="app-main" id="conteudo">
        <h1 className="app-title">Hábitos</h1>
        <p className="app-subtitle">Pequenos passos, todos os dias.</p>
      </main>
    </div>
  )
}
