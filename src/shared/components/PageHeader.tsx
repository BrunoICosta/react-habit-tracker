import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from './Icon'
import { LanguageSwitcher } from './LanguageSwitcher'
import './PageHeader.css'

interface PageHeaderProps {
  title: string
  subtitle?: ReactNode
  /** When set, renders a back link to this hash. */
  backHref?: string
  actions?: ReactNode
}

export function PageHeader({ title, subtitle, backHref, actions }: PageHeaderProps) {
  const { t } = useTranslation()
  return (
    <header className="page-header">
      {backHref && (
        <a className="icon-button" href={backHref} aria-label={t('actions.back')}>
          <Icon name="back" />
        </a>
      )}
      <div className="page-header__text">
        <h1 className="page-header__title">{title}</h1>
        {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
      </div>
      <div className="page-header__actions">
        <LanguageSwitcher />
        {actions}
      </div>
    </header>
  )
}
