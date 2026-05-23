import { registerSW } from 'virtual:pwa-register'
import { OFFLINE_READY_EVENT } from './pwaEvents'

/** Registers the service worker (production only) and announces when the app works offline. */
export function registerServiceWorker(): void {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return
  registerSW({
    immediate: true,
    onOfflineReady() {
      window.dispatchEvent(new Event(OFFLINE_READY_EVENT))
    },
  })
}
