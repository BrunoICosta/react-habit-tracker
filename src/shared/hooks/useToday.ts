import { useSyncExternalStore } from 'react'
import { todayKey, type DateKey } from '../../core/dates'

const CHECK_INTERVAL_MS = 60_000

function subscribe(callback: () => void): () => void {
  // The app often stays open overnight (installed PWA): re-check the date periodically
  // and whenever the tab becomes visible again.
  const interval = window.setInterval(callback, CHECK_INTERVAL_MS)
  document.addEventListener('visibilitychange', callback)
  window.addEventListener('focus', callback)
  return () => {
    window.clearInterval(interval)
    document.removeEventListener('visibilitychange', callback)
    window.removeEventListener('focus', callback)
  }
}

/** Current local day as a date key; re-renders when the day changes. */
export function useToday(): DateKey {
  return useSyncExternalStore(
    subscribe,
    () => todayKey(),
    () => todayKey(),
  )
}
