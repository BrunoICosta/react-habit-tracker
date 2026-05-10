import type { ReactNode } from 'react'
import { Icon } from './Icon'
import './PageHeader.css'

interface PageHeaderProps {
  title: string
  subtitle?: ReactNode
  /** When set, renders a back link to this hash. */
  backHref?: string
  actions?: ReactNode
}

export function PageHeader({ title, subtitle, backHref, actions }: PageHeaderProps) {
  return (
    <header className="page-header">
      {backHref && (
        <a className="icon-button" href={backHref} aria-label="Voltar">
          <Icon name="back" />
        </a>
      )}
      <div className="page-header__text">
        <h1 className="page-header__title">{title}</h1>
        {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
    </header>
  )
}
