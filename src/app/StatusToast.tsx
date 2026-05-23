import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { Icon } from '../shared/components/Icon'
import { useOnlineStatus } from '../shared/hooks/useOnlineStatus'
import { OFFLINE_READY_EVENT } from './pwaEvents'
import './StatusToast.css'

const TOAST_DURATION_MS = 4000

/** Connectivity and PWA notices. Data is local, so offline is informative, never an error. */
export function StatusToast() {
  const online = useOnlineStatus()
  const [offlineReady, setOfflineReady] = useState(false)

  useEffect(() => {
    let timeout: number | undefined
    const onReady = () => {
      setOfflineReady(true)
      timeout = window.setTimeout(() => setOfflineReady(false), TOAST_DURATION_MS)
    }
    window.addEventListener(OFFLINE_READY_EVENT, onReady)
    return () => {
      window.removeEventListener(OFFLINE_READY_EVENT, onReady)
      window.clearTimeout(timeout)
    }
  }, [])

  const message = !online
    ? 'Você está offline. Tudo continua funcionando.'
    : offlineReady
      ? 'Pronto! O app agora funciona offline.'
      : null

  return (
    <div className="status-toast-region" role="status" aria-live="polite">
      <AnimatePresence>
        {message && (
          <motion.div
            key={message}
            className="status-toast"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16 }}
          >
            <Icon name={online ? 'check' : 'offline'} size={18} />
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
