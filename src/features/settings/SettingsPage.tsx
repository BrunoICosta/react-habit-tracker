import { useTranslation } from 'react-i18next'
import { Icon, type IconName } from '../../shared/components/Icon'
import { LanguageSwitcher } from '../../shared/components/LanguageSwitcher'
import { PageHeader } from '../../shared/components/PageHeader'
import { useSettingsStore, type ThemePreference } from '../../store/settingsStore'
import { DataSection } from './DataSection'
import './SettingsPage.css'

const THEME_OPTIONS: { value: ThemePreference; icon: IconName }[] = [
  { value: 'system', icon: 'monitor' },
  { value: 'light', icon: 'sun' },
  { value: 'dark', icon: 'moon' },
]

export function SettingsPage() {
  const { t } = useTranslation(['settings', 'common'])
  const theme = useSettingsStore((state) => state.theme)
  const setTheme = useSettingsStore((state) => state.setTheme)

  return (
    <>
      <PageHeader title={t('title')} subtitle={t('subtitle')} />

      <section className="card" aria-labelledby="theme-title">
        <h2 id="theme-title" className="section__title">
          {t('theme.title')}
        </h2>
        <div className="segmented" role="radiogroup" aria-labelledby="theme-title">
          {THEME_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={theme === option.value}
              className="segmented__option"
              onClick={() => setTheme(option.value)}
            >
              <Icon name={option.icon} size={18} />
              {t(`theme.${option.value}`)}
            </button>
          ))}
        </div>
      </section>

      <section className="card section" aria-labelledby="language-title">
        <h2 id="language-title" className="section__title">
          {t('common:language.label')}
        </h2>
        <LanguageSwitcher showLabels />
      </section>

      <DataSection />
    </>
  )
}
