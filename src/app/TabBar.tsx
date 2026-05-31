import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { Icon, type IconName } from '../shared/components/Icon'
import { routeToHash, type Route, type TabName } from './router'
import './TabBar.css'

interface Tab {
  name: TabName
  icon: IconName
  route: Route
}

const TABS: Tab[] = [
  { name: 'today', icon: 'today', route: { name: 'today' } },
  { name: 'habits', icon: 'habits', route: { name: 'habits' } },
  { name: 'stats', icon: 'stats', route: { name: 'stats' } },
  { name: 'settings', icon: 'settings', route: { name: 'settings' } },
]

export function TabBar({ active }: { active: TabName }) {
  const { t } = useTranslation()
  return (
    <nav className="tab-bar" aria-label={t('nav.label')}>
      <div className="tab-bar__brand" aria-hidden="true">
        <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" width={32} height={32} />
        <span>{t('appName')}</span>
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
                <span className="tab-bar__label">{t(`nav.${tab.name}`)}</span>
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
