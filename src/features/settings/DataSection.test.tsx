import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { useHabitStore } from '../../store/habitStore'
import { DataSection } from './DataSection'

function backupFile(content: unknown, name = 'backup.json') {
  return new File([JSON.stringify(content)], name, { type: 'application/json' })
}

const backup = {
  app: 'habitos',
  version: 1,
  exportedAt: '2026-05-23T12:00:00.000Z',
  habits: [
    {
      id: 'x',
      name: 'Correr',
      emoji: '🏃',
      color: '#ff8a3d',
      frequency: { kind: 'daily' },
      target: 1,
      createdAt: '2026-05-01',
      archived: false,
      archivedAt: null,
    },
  ],
  logs: { x: { '2026-05-02': 1 } },
}

describe('DataSection', () => {
  beforeEach(() => {
    useHabitStore.setState({ habits: [], logs: {} })
  })

  it('imports a valid backup when there is no data', async () => {
    const user = userEvent.setup()
    render(<DataSection />)
    await user.upload(screen.getByLabelText('Arquivo de backup'), backupFile(backup))
    expect(await screen.findByText('1 hábito importado.')).toBeInTheDocument()
    expect(useHabitStore.getState().habits[0]?.name).toBe('Correr')
  })

  it('reports invalid files', async () => {
    const user = userEvent.setup()
    render(<DataSection />)
    await user.upload(screen.getByLabelText('Arquivo de backup'), backupFile({ app: 'nope' }))
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Esse arquivo não parece ser um backup do Hábitos.',
    )
  })

  it('asks before replacing existing data', async () => {
    const user = userEvent.setup()
    render(<DataSection />)
    await user.click(screen.getByRole('button', { name: /carregar exemplo/i }))
    expect(useHabitStore.getState().habits.length).toBeGreaterThan(0)

    await user.upload(screen.getByLabelText('Arquivo de backup'), backupFile(backup, 'meu.json'))
    const dialog = await screen.findByRole('alertdialog')
    expect(dialog).toHaveTextContent('"meu.json" tem 1 hábito e 1 registro.')
    await user.click(within(dialog).getByRole('button', { name: 'Importar' }))
    expect(useHabitStore.getState().habits).toHaveLength(1)
  })
})
