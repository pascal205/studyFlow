import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { StudyProvider } from './store/StudyStore'
import './styles.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <StudyProvider>
      <App />
    </StudyProvider>
  </React.StrictMode>,
)
