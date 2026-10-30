import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { AuthScreen } from './pages/AuthScreen'
import { AuthProvider, useAuth } from './store/AuthStore'
import { StudyProvider } from './store/StudyStore'
import { readTheme } from './lib/storage'
import './styles.css'

document.documentElement.dataset.theme = readTheme()

function Root() {
  const { user } = useAuth()
  if (!user) return <AuthScreen />
  return (
    <StudyProvider key={user.id} userId={user.id}>
      <App />
    </StudyProvider>
  )
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <Root />
    </AuthProvider>
  </React.StrictMode>,
)

// PWA : enregistrement du service worker (production uniquement)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`)
      .catch(() => {
        /* mode hors ligne indisponible, l'app fonctionne quand même */
      })
  })
}
