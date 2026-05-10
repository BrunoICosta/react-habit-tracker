import type { ReactNode } from 'react'
import './EmptyState.css'

interface EmptyStateProps {
  emoji: string
  title: string
  description?: ReactNode
  children?: ReactNode
}

export function EmptyState({ emoji, title, description, children }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <span className="empty-state__emoji" aria-hidden="true">
        {emoji}
      </span>
      <h2 className="empty-state__title">{title}</h2>
      {description && <p className="empty-state__description">{description}</p>}
      {children && <div className="empty-state__actions">{children}</div>}
    </div>
  )
}
