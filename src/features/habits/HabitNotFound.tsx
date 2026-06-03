import { useTranslation } from 'react-i18next'
import { routeToHash } from '../../app/router'
import { EmptyState } from '../../shared/components/EmptyState'

export function HabitNotFound() {
  const { t } = useTranslation()
  return (
    <EmptyState
      emoji="🔍"
      title={t('habitNotFound.title')}
      description={t('habitNotFound.description')}
    >
      <a className="btn btn--primary" href={routeToHash({ name: 'habits' })}>
        {t('actions.seeHabits')}
      </a>
    </EmptyState>
  )
}
