import { useRef, useState, type ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import {
  backupFileName,
  createBackup,
  parseBackup,
  serializeBackup,
  type BackupData,
} from '../../core/backup'
import { createSampleData } from '../../core/sample'
import { ConfirmDialog } from '../../shared/components/ConfirmDialog'
import { Icon } from '../../shared/components/Icon'
import { downloadText } from '../../shared/lib/download'
import { useToday } from '../../shared/hooks/useToday'
import { useHabitStore } from '../../store/habitStore'

type Status = { tone: 'success' | 'error'; message: string } | null

type Pending =
  | { kind: 'import'; data: BackupData; fileName: string }
  | { kind: 'sample' }
  | { kind: 'clear' }
  | null

function countCheckIns(data: BackupData): number {
  return Object.values(data.logs).reduce((sum, log) => sum + Object.keys(log).length, 0)
}

export function DataSection() {
  const { t } = useTranslation(['settings', 'common'])
  const today = useToday()
  const sample = () => createSampleData(today, t('sampleNames', { returnObjects: true }))
  const habits = useHabitStore((state) => state.habits)
  const logs = useHabitStore((state) => state.logs)
  const replaceAll = useHabitStore((state) => state.replaceAll)
  const fileRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<Status>(null)
  const [pending, setPending] = useState<Pending>(null)

  const onExport = () => {
    const backup = createBackup({ habits, logs })
    downloadText(backupFileName(today), serializeBackup(backup))
    setStatus({ tone: 'success', message: t('data.exported') })
  }

  const onFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const result = parseBackup(await file.text())
    if (!result.ok) {
      setStatus({ tone: 'error', message: t(`data.errors.${result.error}`) })
      return
    }
    if (habits.length === 0) {
      replaceAll(result.data)
      setStatus({
        tone: 'success',
        message: t('data.imported', { count: result.data.habits.length }),
      })
      return
    }
    setPending({ kind: 'import', data: result.data, fileName: file.name })
  }

  const onSample = () => {
    if (habits.length > 0) {
      setPending({ kind: 'sample' })
      return
    }
    replaceAll(sample())
    setStatus({ tone: 'success', message: t('data.sampleLoaded') })
  }

  const confirm = () => {
    if (!pending) return
    if (pending.kind === 'import') {
      replaceAll(pending.data)
      setStatus({
        tone: 'success',
        message: t('data.imported', { count: pending.data.habits.length }),
      })
    } else if (pending.kind === 'sample') {
      replaceAll(sample())
      setStatus({ tone: 'success', message: t('data.sampleLoaded') })
    } else {
      replaceAll({ habits: [], logs: {} })
      setStatus({ tone: 'success', message: t('data.cleared') })
    }
    setPending(null)
  }

  const dialog = (() => {
    switch (pending?.kind) {
      case 'import':
        return {
          title: t('data.dialogs.importTitle'),
          description: t('data.dialogs.importDescription', {
            file: pending.fileName,
            habits: t('common:units.habit', { count: pending.data.habits.length }),
            checkIns: t('data.checkIn', { count: countCheckIns(pending.data) }),
          }),
          confirmLabel: t('data.dialogs.importConfirm'),
          tone: 'default' as const,
        }
      case 'sample':
        return {
          title: t('data.dialogs.sampleTitle'),
          description: t('data.dialogs.sampleDescription'),
          confirmLabel: t('data.dialogs.sampleConfirm'),
          tone: 'default' as const,
        }
      case 'clear':
        return {
          title: t('data.dialogs.clearTitle'),
          description: t('data.dialogs.clearDescription'),
          confirmLabel: t('data.dialogs.clearConfirm'),
          tone: 'danger' as const,
        }
      default:
        return null
    }
  })()

  return (
    <section className="card section" aria-labelledby="data-title">
      <h2 id="data-title" className="section__title">
        {t('data.title')}
      </h2>
      <p className="section__hint">{t('data.hint')}</p>

      <div className="settings-actions">
        <button type="button" className="btn" onClick={onExport} disabled={habits.length === 0}>
          <Icon name="download" size={18} />
          {t('data.export')}
        </button>
        <button type="button" className="btn" onClick={() => fileRef.current?.click()}>
          <Icon name="upload" size={18} />
          {t('data.import')}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="visually-hidden"
          tabIndex={-1}
          aria-label={t('data.file')}
          onChange={onFileChange}
        />
        <button type="button" className="btn btn--ghost" onClick={onSample}>
          <Icon name="sparkles" size={18} />
          {t('data.sample')}
        </button>
        <button
          type="button"
          className="btn btn--danger"
          disabled={habits.length === 0}
          onClick={() => setPending({ kind: 'clear' })}
        >
          <Icon name="trash" size={18} />
          {t('data.clear')}
        </button>
      </div>

      <p className="settings-status" role="status" data-tone={status?.tone}>
        {status?.message}
      </p>

      <ConfirmDialog
        open={dialog !== null}
        title={dialog?.title ?? ''}
        description={dialog?.description}
        confirmLabel={dialog?.confirmLabel ?? t('common:actions.confirm')}
        tone={dialog?.tone}
        onCancel={() => setPending(null)}
        onConfirm={confirm}
      />
    </section>
  )
}
