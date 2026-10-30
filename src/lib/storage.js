import { defaultSettings, defaultSubjects } from '../data/seed'

/** Clés de stockage : un espace de données isolé par compte. */
export const LEGACY_STATE_KEY = 'studyflow.state.v1'
export const stateKey = (userId) => `studyflow.state.v1.${userId}`
export const backupsKey = (userId) => `studyflow.backups.v1.${userId}`
export const THEME_KEY = 'studyflow.theme'
export const STATE_VERSION = 2

/** Espace vierge : matières par défaut, aucun travail, aucune note. */
export const emptyState = (studentName = 'Élève', settingsOverride = {}) => ({
  subjects: defaultSubjects(),
  tasks: [],
  grades: [],
  settings: { ...defaultSettings(), studentName, ...settingsOverride },
  version: STATE_VERSION,
})

/**
 * Détecte un espace resté sur les anciennes données de démonstration
 * (9 travaux, 10 notes, 7 matières, inchangés) pour le remettre à zéro.
 */
const DEMO_TASK_IDS = ['t1', 't2', 't3', 't4', 't5', 't6', 't7', 't8', 't9']
const DEMO_GRADE_IDS = ['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8', 'g9', 'g10']
const DEMO_SUBJECT_IDS = ['maths', 'francais', 'histoire', 'anglais', 'physique', 'svt', 'nsi']

export const isLegacyDemoState = (state) => {
  if (!state) return false
  const tasks = state.tasks || []
  const grades = state.grades || []
  const subjects = state.subjects || []
  return (
    tasks.length === DEMO_TASK_IDS.length &&
    grades.length === DEMO_GRADE_IDS.length &&
    subjects.length === DEMO_SUBJECT_IDS.length &&
    DEMO_TASK_IDS.every((id) => tasks.some((task) => task.id === id)) &&
    DEMO_GRADE_IDS.every((id) => grades.some((grade) => grade.id === id)) &&
    DEMO_SUBJECT_IDS.every((id) => subjects.some((subject) => subject.id === id))
  )
}

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
