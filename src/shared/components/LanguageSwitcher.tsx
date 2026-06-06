import { useRef, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { LANGUAGE_NATIVE_NAMES, SUPPORTED_LANGUAGES, type Language } from '../../i18n/resources'
import { useLocale } from '../../i18n/useLocale'
import { Flag } from './Flag'
import './LanguageSwitcher.css'

interface LanguageSwitcherProps {
  /** Show the language name next to each flag (used on the Settings page). */
  showLabels?: boolean
}

/**
 * Flag radio group (a native select cannot render SVG). Arrow keys move and select, like any
 * radio group; only the checked option is in the tab order.
 */
export function LanguageSwitcher({ showLabels = false }: LanguageSwitcherProps) {
  const { t, i18n } = useTranslation()
  const { language } = useLocale()
  const groupRef = useRef<HTMLDivElement>(null)

  const select = (next: Language) => {
    if (next !== language) void i18n.changeLanguage(next)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key]
    if (step === undefined) return
    event.preventDefault()
    const count = SUPPORTED_LANGUAGES.length
    const index = (SUPPORTED_LANGUAGES.indexOf(language) + step + count) % count
    const next = SUPPORTED_LANGUAGES[index] ?? language
    select(next)
    groupRef.current?.querySelector<HTMLButtonElement>(`[lang="${next}"]`)?.focus()
  }

  return (
    <div
      ref={groupRef}
      className="language-switcher"
      data-labels={showLabels || undefined}
      role="radiogroup"
      aria-label={t('language.label')}
      onKeyDown={onKeyDown}
    >
      {SUPPORTED_LANGUAGES.map((option) => {
        const checked = option === language
        const name = LANGUAGE_NATIVE_NAMES[option]
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={showLabels ? undefined : name}
            title={name}
            lang={option}
            tabIndex={checked ? 0 : -1}
            className="language-switcher__option"
            onClick={() => select(option)}
          >
            <Flag language={option} width={showLabels ? 28 : 24} />
            {showLabels && <span>{name}</span>}
          </button>
        )
      })}
    </div>
  )
}
