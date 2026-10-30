import { seedState } from '../data/seed'

/** Clés de stockage : un espace de données isolé par compte. */
export const LEGACY_STATE_KEY = 'studyflow.state.v1'
export const stateKey = (userId) => `studyflow.state.v1.${userId}`
export const backupsKey = (userId) => `studyflow.backups.v1.${userId}`
export const THEME_KEY = 'studyflow.theme'

export const emptyState = (studentName = 'Élève') => ({
  subjects: [],
  tasks: [],
  grades: [],
  settings: { ...seedState().settings, studentName },
  version: 1,
})

/** État de démonstration (dates relatives à aujourd'hui). */
export const demoState = (name) => {
  const state = seedState()
  return { ...state, settings: { ...state.settings, studentName: name }, version: 1 }
}

/** État initial d'un nouveau compte (avec ou sans données d'exemple). */
export const initialUserState = (name, withDemo) =>
  withDemo ? demoState(name) : emptyState(name)

export function loadUserState(userId) {
  try {
    const raw = localStorage.getItem(stateKey(userId))
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || !Array.isArray(parsed.subjects)) return null
    return parsed
  } catch {
    return null
  }
}

export function saveUserState(userId, state) {
  try {
    localStorage.setItem(stateKey(userId), JSON.stringify(state))
  } catch {
    /* quota dépassé : l'app continue en mémoire */
  }
}

export function clearUserState(userId) {
  try {
    localStorage.removeItem(stateKey(userId))
    localStorage.removeItem(backupsKey(userId))
  } catch {
    /* ignore */
  }
}

export const readTheme = () => {
  try {
    return localStorage.getItem(THEME_KEY) || 'light'
  } catch {
    return 'light'
  }
}

export const persistTheme = (theme) => {
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch {
    /* ignore */
  }
}
