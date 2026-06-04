import { useTranslation } from 'react-i18next'
import { SUPPORTED_LANGUAGES, type Language } from '../../i18n/resources'
import { useLocale } from '../../i18n/useLocale'
import { Icon } from './Icon'
import './LanguageSwitcher.css'

const SHORT_LABELS: Record<Language, string> = { 'pt-BR': 'PT', en: 'EN' }

/**
 * Compact header control. With two languages a single toggle is the fastest interaction;
 * the accessible name states the current language and the one it switches to.
 */
export function LanguageSwitcher() {
  const { t, i18n } = useTranslation()
  const { language } = useLocale()
  const next =
    SUPPORTED_LANGUAGES[(SUPPORTED_LANGUAGES.indexOf(language) + 1) % SUPPORTED_LANGUAGES.length] ??
    'pt-BR'

  return (
    <button
      type="button"
      className="language-switcher"
      aria-label={`${t('language.label')}: ${t(`language.${language}`)}. ${t('language.switchTo', {
        language: t(`language.${next}`),
      })}`}
      title={t(`language.${next}`)}
      lang={language}
      onClick={() => void i18n.changeLanguage(next)}
    >
      <Icon name="globe" size={18} />
      <span aria-hidden="true">{SHORT_LABELS[language]}</span>
    </button>
  )
}
