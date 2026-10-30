import { addDays, todayISO } from '../lib/utils'

/** Données de démonstration (dates relatives à aujourd'hui, pour un rendu toujours frais). */
export const SUBJECT_COLORS = [
  '#6366f1',
  '#0ea5e9',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#a855f7',
  '#14b8a6',
  '#f97316',
  '#ec4899',
  '#84cc16',
]

const buildSubjects = () => [
  { id: 'maths', name: 'Mathématiques', coefficient: 4, teacher: 'Mme Diallo', color: '#6366f1' },
  { id: 'francais', name: 'Français', coefficient: 3, teacher: 'M. Lefèvre', color: '#f97316' },
  { id: 'histoire', name: 'Histoire-Géo', coefficient: 2, teacher: 'Mme Bernard', color: '#a855f7' },
  { id: 'anglais', name: 'Anglais', coefficient: 2, teacher: 'Ms Carter', color: '#0ea5e9' },
  { id: 'physique', name: 'Physique-Chimie', coefficient: 3, teacher: 'M. Traoré', color: '#10b981' },
  { id: 'svt', name: 'SVT', coefficient: 2, teacher: 'Mme Rossi', color: '#84cc16' },
  { id: 'nsi', name: 'NSI', coefficient: 2, teacher: 'M. Kim', color: '#ec4899' },
]

const buildTasks = () => {
  const today = todayISO()
  return [
    {
      id: 't1',
      title: 'Exercices sur les suites arithmétiques',
      subjectId: 'maths',
      type: 'devoir',
      dueDate: addDays(today, 0),
      estimatedMinutes: 45,
      difficulty: 5,
      status: 'todo',
      notes: 'Exercices 12 à 18 p. 84. Revoir la formule du terme général.',
    },
    {
      id: 't2',
      title: 'Interrogation : la Révolution française',
      subjectId: 'histoire',
      type: 'interrogation',
      dueDate: addDays(today, 2),
      estimatedMinutes: 40,
      difficulty: 3,
      status: 'doing',
      notes: 'Chronologie + acteurs clés. Faire des fiches de dates.',
    },
    {
      id: 't3',
      title: 'Commentaire de texte — Victor Hugo',
      subjectId: 'francais',
      type: 'devoir',
      dueDate: addDays(today, 4),
      estimatedMinutes: 60,
      difficulty: 4,
      status: 'todo',
      notes: 'Introduction + 2 axes. Relire la méthode du commentaire.',
    },
    {
      id: 't4',
      title: 'Contrôle : ondes et signaux',
      subjectId: 'physique',
      type: 'controle',
      dueDate: addDays(today, 6),
      estimatedMinutes: 90,
      difficulty: 5,
      status: 'todo',
      notes: 'Chapitres 4 et 5. Refaire les exercices du cours.',
    },
    {
      id: 't5',
      title: 'Vocabulaire unité 5',
      subjectId: 'anglais',
      type: 'interrogation',
      dueDate: addDays(today, 1),
      estimatedMinutes: 20,
      difficulty: 2,
      status: 'todo',
      notes: '40 mots + verbes irréguliers.',
    },
    {
      id: 't6',
      title: 'Compte rendu TP — photosynthèse',
      subjectId: 'svt',
      type: 'devoir',
      dueDate: addDays(today, -2),
      estimatedMinutes: 50,
      difficulty: 3,
      status: 'todo',
      notes: 'Schéma + conclusion. À rendre en main propre.',
    },
    {
      id: 't7',
      title: 'Projet mini-site web (binôme)',
      subjectId: 'nsi',
      type: 'projet',
      dueDate: addDays(today, 12),
      estimatedMinutes: 120,
      difficulty: 4,
      status: 'doing',
      notes: 'Maquette validée. Reste la page contact + responsive.',
    },
    {
      id: 't8',
      title: 'Oral : présentation d’un métier',
      subjectId: 'francais',
      type: 'oral',
      dueDate: addDays(today, 9),
      estimatedMinutes: 30,
      difficulty: 3,
      status: 'todo',
      notes: '5 min + questions. S’enregistrer pour s’entraîner.',
    },
    {
      id: 't9',
      title: 'Fiche de révision — fonctions dérivées',
      subjectId: 'maths',
      type: 'devoir',
      dueDate: addDays(today, 8),
      estimatedMinutes: 35,
      difficulty: 4,
      status: 'done',
      notes: 'Fiche terminée, à relire avant le DS.',
    },
  ]
}

const buildGrades = () => {
  const today = todayISO()
  return [
    { id: 'g1', subjectId: 'maths', title: 'DS n°2 — dérivées', score: 13, max: 20, coefficient: 2, date: addDays(today, -18) },
    { id: 'g2', subjectId: 'maths', title: 'Interrogation — limites', score: 8, max: 20, coefficient: 1, date: addDays(today, -4) },
    { id: 'g3', subjectId: 'francais', title: 'Dissertation', score: 14, max: 20, coefficient: 2, date: addDays(today, -12) },
    { id: 'g4', subjectId: 'francais', title: 'Lecture analytique', score: 15, max: 20, coefficient: 1, date: addDays(today, -3) },
    { id: 'g5', subjectId: 'histoire', title: 'QCM Lumières', score: 16, max: 20, coefficient: 1, date: addDays(today, -9) },
    { id: 'g6', subjectId: 'anglais', title: 'Expression écrite', score: 12, max: 20, coefficient: 1, date: addDays(today, -7) },
    { id: 'g7', subjectId: 'physique', title: 'TP noté — optique', score: 9, max: 20, coefficient: 1, date: addDays(today, -6) },
    { id: 'g8', subjectId: 'physique', title: 'DS n°1 — mécanique', score: 11, max: 20, coefficient: 2, date: addDays(today, -25) },
    { id: 'g9', subjectId: 'svt', title: 'Exposé', score: 17, max: 20, coefficient: 1, date: addDays(today, -15) },
    { id: 'g10', subjectId: 'nsi', title: 'Projet — page web', score: 18, max: 20, coefficient: 2, date: addDays(today, -2) },
  ]
}

export const seedState = () => ({
  subjects: buildSubjects(),
  tasks: buildTasks(),
  grades: buildGrades(),
  settings: {
    studentName: 'Élève',
    className: 'Terminale',
    dailyMinutes: 90,
    startTime: '17:00',
    theme: 'light',
    goal: 14,
  },
})
