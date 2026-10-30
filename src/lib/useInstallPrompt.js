import { useEffect, useState } from 'react'

const isStandalone = () => {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  )
}

/** Expose l'invite d'installation PWA (Chromium) et détecte iOS / mode installé. */
export function useInstallPrompt() {
  const [deferred, setDeferred] = useState(null)
  const [installed, setInstalled] = useState(isStandalone)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    const onPrompt = (event) => {
      event.preventDefault()
      setDeferred(event)
    }
    const onInstalled = () => {
      setInstalled(true)
      setDeferred(null)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)

    const ua = window.navigator.userAgent || ''
    setIsIOS(/iphone|ipad|ipod/i.test(ua) && !window.MSStream)
    setInstalled(isStandalone())

    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const install = async () => {
    if (!deferred) return false
    deferred.prompt()
    const choice = await deferred.userChoice
    if (choice.outcome === 'accepted') {
      setInstalled(true)
      setDeferred(null)
      return true
    }
    return false
  }

  return { canInstall: Boolean(deferred), installed, isIOS, install }
}
