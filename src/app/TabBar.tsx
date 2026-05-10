import { motion } from 'motion/react'
import { Icon, type IconName } from '../shared/components/Icon'
import { routeToHash, type Route, type TabName } from './router'
import './TabBar.css'

interface Tab {
  name: TabName
  label: string
  icon: IconName
  route: Route
}

const TABS: Tab[] = [
  { name: 'today', label: 'Hoje', icon: 'today', route: { name: 'today' } },
  { name: 'habits', label: 'Hábitos', icon: 'habits', route: { name: 'habits' } },
  { name: 'stats', label: 'Estatísticas', icon: 'stats', route: { name: 'stats' } },
  { name: 'settings', label: 'Ajustes', icon: 'settings', route: { name: 'settings' } },
]

export function TabBar({ active }: { active: TabName }) {
  return (
    <nav className="tab-bar" aria-label="Navegação principal">
      <div className="tab-bar__brand" aria-hidden="true">
        <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" width={32} height={32} />
        <span>Hábitos</span>
      </div>
      <ul className="tab-bar__list">
        {TABS.map((tab) => {
          const isActive = tab.name === active
          return (
            <li key={tab.name}>
              <a
                className="tab-bar__link"
                href={routeToHash(tab.route)}
                aria-current={isActive ? 'page' : undefined}
              >
                {isActive && (
                  <motion.span
                    layoutId="tab-indicator"
                    className="tab-bar__indicator"
                    transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                  />
                )}
                <Icon name={tab.icon} />
                <span className="tab-bar__label">{tab.label}</span>
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
