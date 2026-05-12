import { useId, useRef, useState, type FormEvent } from 'react'
import {
  MAX_TARGET,
  WEEKDAYS_FROM_MONDAY,
  WEEKDAY_LONG_LABELS,
  WEEKDAY_SHORT_LABELS,
  describeFrequency,
  type HabitDraft,
  type Weekday,
} from '../../core/habit'
import { DEFAULT_COLOR, DEFAULT_EMOJI, HABIT_COLORS, HABIT_EMOJIS } from '../../core/palette'
import { Icon } from '../../shared/components/Icon'
import './HabitForm.css'

export const NAME_MAX_LENGTH = 40

const EMPTY_DRAFT: HabitDraft = {
  name: '',
  emoji: DEFAULT_EMOJI,
  color: DEFAULT_COLOR,
  frequency: { kind: 'daily' },
  target: 1,
}

interface HabitFormProps {
  initial?: HabitDraft
  submitLabel: string
  onSubmit: (draft: HabitDraft) => void
  onCancel?: () => void
}

type Errors = Partial<Record<'name' | 'days', string>>

function validate(draft: HabitDraft): Errors {
  const errors: Errors = {}
  if (!draft.name.trim()) errors.name = 'Dê um nome ao hábito.'
  else if (draft.name.trim().length > NAME_MAX_LENGTH)
    errors.name = `Use no máximo ${NAME_MAX_LENGTH} caracteres.`
  if (draft.frequency.kind === 'weekdays' && draft.frequency.days.length === 0)
    errors.days = 'Escolha pelo menos um dia da semana.'
  return errors
}

export function HabitForm({
  initial = EMPTY_DRAFT,
  submitLabel,
  onSubmit,
  onCancel,
}: HabitFormProps) {
  const id = useId()
  const nameRef = useRef<HTMLInputElement>(null)
  const daysRef = useRef<HTMLDivElement>(null)
  const [draft, setDraft] = useState<HabitDraft>(initial)
  const [errors, setErrors] = useState<Errors>({})
  const [submitted, setSubmitted] = useState(false)

  const update = (patch: Partial<HabitDraft>) => {
    const next = { ...draft, ...patch }
    setDraft(next)
    if (submitted) setErrors(validate(next))
  }

  const selectedDays = draft.frequency.kind === 'weekdays' ? draft.frequency.days : []

  const toggleDay = (day: Weekday) => {
    const days = selectedDays.includes(day)
      ? selectedDays.filter((item) => item !== day)
      : [...selectedDays, day]
    update({ frequency: { kind: 'weekdays', days } })
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)
    const found = validate(draft)
    setErrors(found)
    if (Object.keys(found).length > 0) {
      if (found.name) nameRef.current?.focus()
      else daysRef.current?.querySelector('button')?.focus()
      return
    }
    onSubmit({ ...draft, name: draft.name.trim() })
  }

  return (
    <form className="habit-form" onSubmit={handleSubmit} noValidate>
      <div
        className="habit-form__preview"
        style={{ '--habit-color': draft.color }}
        aria-hidden="true"
      >
        <span className="habit-form__preview-emoji">{draft.emoji}</span>
        <div>
          <strong>{draft.name.trim() || 'Novo hábito'}</strong>
          <span>
            {describeFrequency(draft.frequency)}
            {draft.target > 1 && ` · ${draft.target}× por dia`}
          </span>
        </div>
      </div>

      <div className="field">
        <label className="field__label" htmlFor={`${id}-name`}>
          Nome
        </label>
        <input
          ref={nameRef}
          id={`${id}-name`}
          className="field__input"
          value={draft.name}
          maxLength={NAME_MAX_LENGTH + 10}
          placeholder="Ex.: Beber água, Ler 10 páginas"
          autoComplete="off"
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? `${id}-name-error` : undefined}
          onChange={(event) => update({ name: event.target.value })}
        />
        {errors.name && (
          <p id={`${id}-name-error`} className="field__error" role="alert">
            {errors.name}
          </p>
        )}
      </div>

      <fieldset className="field">
        <legend className="field__label">Ícone</legend>
        <div className="emoji-grid">
          {HABIT_EMOJIS.map((emoji) => (
            <label key={emoji} className="emoji-grid__item">
              <input
                type="radio"
                name={`${id}-emoji`}
                value={emoji}
                checked={draft.emoji === emoji}
                onChange={() => update({ emoji })}
                className="visually-hidden"
                aria-label={`Ícone ${emoji}`}
              />
              <span aria-hidden="true">{emoji}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="field">
        <legend className="field__label">Cor</legend>
        <div className="color-grid">
          {HABIT_COLORS.map((color) => (
            <label
              key={color.value}
              className="color-grid__item"
              style={{ '--swatch': color.value }}
            >
              <input
                type="radio"
                name={`${id}-color`}
                value={color.value}
                checked={draft.color === color.value}
                onChange={() => update({ color: color.value })}
                className="visually-hidden"
                aria-label={color.label}
              />
              <Icon name="check" size={18} className="color-grid__check" />
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="field">
        <legend className="field__label">Frequência</legend>
        <div className="segmented">
          <button
            type="button"
            className="segmented__option"
            aria-pressed={draft.frequency.kind === 'daily'}
            onClick={() => update({ frequency: { kind: 'daily' } })}
          >
            Todos os dias
          </button>
          <button
            type="button"
            className="segmented__option"
            aria-pressed={draft.frequency.kind === 'weekdays'}
            onClick={() =>
              draft.frequency.kind === 'daily' &&
              update({ frequency: { kind: 'weekdays', days: [1, 2, 3, 4, 5] } })
            }
          >
            Dias específicos
          </button>
        </div>

        {draft.frequency.kind === 'weekdays' && (
          <div
            ref={daysRef}
            className="weekday-picker"
            role="group"
            aria-label="Dias da semana"
            aria-describedby={errors.days ? `${id}-days-error` : undefined}
          >
            {WEEKDAYS_FROM_MONDAY.map((day) => (
              <button
                key={day}
                type="button"
                className="weekday-picker__day"
                aria-pressed={selectedDays.includes(day)}
                aria-label={WEEKDAY_LONG_LABELS[day]}
                aria-invalid={errors.days ? true : undefined}
                onClick={() => toggleDay(day)}
              >
                {WEEKDAY_SHORT_LABELS[day].charAt(0)}
              </button>
            ))}
          </div>
        )}
        {errors.days && (
          <p id={`${id}-days-error`} className="field__error" role="alert">
            {errors.days}
          </p>
        )}
      </fieldset>

      <div className="field">
        <span className="field__label" id={`${id}-target-label`}>
          Meta diária
        </span>
        <div className="stepper" role="group" aria-labelledby={`${id}-target-label`}>
          <button
            type="button"
            className="icon-button"
            aria-label="Diminuir meta"
            disabled={draft.target <= 1}
            onClick={() => update({ target: draft.target - 1 })}
          >
            <Icon name="minus" />
          </button>
          <output className="stepper__value" aria-live="polite">
            {draft.target}× por dia
          </output>
          <button
            type="button"
            className="icon-button"
            aria-label="Aumentar meta"
            disabled={draft.target >= MAX_TARGET}
            onClick={() => update({ target: draft.target + 1 })}
          >
            <Icon name="plus" />
          </button>
        </div>
        <p className="field__hint">Quantas vezes por dia o hábito precisa ser feito para contar.</p>
      </div>

      <div className="habit-form__actions">
        {onCancel && (
          <button type="button" className="btn btn--ghost" onClick={onCancel}>
            Cancelar
          </button>
        )}
        <button type="submit" className="btn btn--primary">
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
