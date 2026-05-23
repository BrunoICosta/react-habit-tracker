import { useRef, useState, type ChangeEvent } from 'react'
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
import { plural } from '../../shared/lib/plural'
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
  const today = useToday()
  const habits = useHabitStore((state) => state.habits)
  const logs = useHabitStore((state) => state.logs)
  const replaceAll = useHabitStore((state) => state.replaceAll)
  const fileRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<Status>(null)
  const [pending, setPending] = useState<Pending>(null)

  const onExport = () => {
    const backup = createBackup({ habits, logs })
    downloadText(backupFileName(today), serializeBackup(backup))
    setStatus({ tone: 'success', message: 'Backup exportado.' })
  }

  const onFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const result = parseBackup(await file.text())
    if (!result.ok) {
      setStatus({ tone: 'error', message: result.error })
      return
    }
    if (habits.length === 0) {
      replaceAll(result.data)
      setStatus({
        tone: 'success',
        message: `${plural(result.data.habits.length, 'hábito importado', 'hábitos importados')}.`,
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
    replaceAll(createSampleData(today))
    setStatus({ tone: 'success', message: 'Dados de exemplo carregados.' })
  }

  const confirm = () => {
    if (!pending) return
    if (pending.kind === 'import') {
      replaceAll(pending.data)
      setStatus({
        tone: 'success',
        message: `${plural(pending.data.habits.length, 'hábito importado', 'hábitos importados')}.`,
      })
    } else if (pending.kind === 'sample') {
      replaceAll(createSampleData(today))
      setStatus({ tone: 'success', message: 'Dados de exemplo carregados.' })
    } else {
      replaceAll({ habits: [], logs: {} })
      setStatus({ tone: 'success', message: 'Todos os dados foram apagados.' })
    }
    setPending(null)
  }

  const dialog = (() => {
    switch (pending?.kind) {
      case 'import':
        return {
          title: 'Substituir seus dados?',
          description: `"${pending.fileName}" tem ${plural(pending.data.habits.length, 'hábito', 'hábitos')} e ${plural(countCheckIns(pending.data), 'registro', 'registros')}. Seus dados atuais serão substituídos.`,
          confirmLabel: 'Importar',
          tone: 'default' as const,
        }
      case 'sample':
        return {
          title: 'Carregar dados de exemplo?',
          description: 'Seus hábitos atuais serão substituídos por um conjunto de exemplo.',
          confirmLabel: 'Carregar',
          tone: 'default' as const,
        }
      case 'clear':
        return {
          title: 'Apagar todos os dados?',
          description: 'Todos os hábitos e o histórico serão removidos deste dispositivo.',
          confirmLabel: 'Apagar tudo',
          tone: 'danger' as const,
        }
      default:
        return null
    }
  })()

  return (
    <section className="card section" aria-labelledby="data-title">
      <h2 id="data-title" className="section__title">
        Seus dados
      </h2>
      <p className="section__hint">
        Tudo fica salvo apenas neste dispositivo. Exporte um backup para não perder nada ou para
        levar seus hábitos para outro aparelho.
      </p>

      <div className="settings-actions">
        <button type="button" className="btn" onClick={onExport} disabled={habits.length === 0}>
          <Icon name="download" size={18} />
          Exportar backup
        </button>
        <button type="button" className="btn" onClick={() => fileRef.current?.click()}>
          <Icon name="upload" size={18} />
          Importar backup
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="visually-hidden"
          tabIndex={-1}
          aria-label="Arquivo de backup"
          onChange={onFileChange}
        />
        <button type="button" className="btn btn--ghost" onClick={onSample}>
          <Icon name="sparkles" size={18} />
          Carregar exemplo
        </button>
        <button
          type="button"
          className="btn btn--danger"
          disabled={habits.length === 0}
          onClick={() => setPending({ kind: 'clear' })}
        >
          <Icon name="trash" size={18} />
          Apagar tudo
        </button>
      </div>

      <p className="settings-status" role="status" data-tone={status?.tone}>
        {status?.message}
      </p>

      <ConfirmDialog
        open={dialog !== null}
        title={dialog?.title ?? ''}
        description={dialog?.description}
        confirmLabel={dialog?.confirmLabel ?? 'Confirmar'}
        tone={dialog?.tone}
        onCancel={() => setPending(null)}
        onConfirm={confirm}
      />
    </section>
  )
}
