/** Couleurs proposées pour les matières. */
export const SUBJECT_COLORS = [
  '#6366f1',
  '#f97316',
  '#0ea5e9',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#a855f7',
  '#14b8a6',
  '#ec4899',
  '#84cc16',
]

/** Matières proposées à la création d'un compte (aucune donnée scolaire). */
export const DEFAULT_SUBJECTS = [
  { id: 'maths', name: 'Mathématiques', coefficient: 4, teacher: '', color: '#6366f1' },
  { id: 'francais', name: 'Français', coefficient: 3, teacher: '', color: '#f97316' },
  { id: 'anglais', name: 'Anglais', coefficient: 2, teacher: '', color: '#0ea5e9' },
]

export const defaultSubjects = () => DEFAULT_SUBJECTS.map((subject) => ({ ...subject }))

export const defaultSettings = () => ({
  studentName: 'Élève',
  className: '',
  dailyMinutes: 90,
  startTime: '17:00',
  theme: 'light',
  goal: 14,
  revealAverage: false,
})
