import { clamp, daysUntil } from './utils'

/** Types de travaux scolaires et leur poids dans la priorité. */
export const TASK_TYPES = [
  { value: 'devoir', label: 'Devoir', weight: 0.75, emoji: '📝' },
  { value: 'interrogation', label: 'Interrogation', weight: 1, emoji: '⚡' },
  { value: 'controle', label: 'Contrôle', weight: 0.95, emoji: '🎯' },
  { value: 'projet', label: 'Projet', weight: 0.8, emoji: '🧩' },
  { value: 'oral', label: 'Oral', weight: 0.85, emoji: '🎤' },
]

export const TASK_STATUSES = [
  { value: 'todo', label: 'À faire' },
  { value: 'doing', label: 'En cours' },
  { value: 'done', label: 'Terminé' },
]

export const typeInfo = (value) =>
  TASK_TYPES.find((type) => type.value === value) ?? TASK_TYPES[0]

export const statusLabel = (value) =>
  TASK_STATUSES.find((status) => status.value === value)?.label ?? 'À faire'

export const PRIORITY_LEVELS = {
  critique: { label: 'Critique', color: '#ef4444', rank: 4 },
  haute: { label: 'Haute', color: '#f59e0b', rank: 3 },
  moyenne: { label: 'Moyenne', color: '#3b82f6', rank: 2 },
  basse: { label: 'Basse', color: '#10b981', rank: 1 },
}

/** Une matière sans note est considérée "neutre", une moyenne basse augmente la priorité. */
export const subjectWeakness = (average) => {
  if (average == null) return 0.45
  return clamp((15 - average) / 8, 0, 1)
}

const urgencyFromDays = (days) => {
  if (days < 0) return 1
  return clamp(1 - days / 21, 0.05, 1)
}

/**
 * Calcule un score de priorité d'apprentissage (0-100) à partir de :
 * échéance, type de travail, difficulté ressentie, fragilité de la matière,
 * coefficient de la matière et charge de travail estimée.
 */
export function computePriority(task, context = {}) {
  const { subject, subjectAverage = null } = context
  const days = daysUntil(task.dueDate)
  const urgency = urgencyFromDays(days)
  const type = typeInfo(task.type).weight
  const difficulty = clamp((Number(task.difficulty) || 3) / 5, 0, 1)
  const weakness = subjectWeakness(subjectAverage)
  const coefficient = clamp((Number(subject?.coefficient) || 2) / 4, 0, 1)
  const effort = clamp((Number(task.estimatedMinutes) || 30) / 180, 0, 1)

  const score =
    100 *
    (0.4 * urgency +
      0.2 * type +
      0.14 * difficulty +
      0.12 * weakness +
      0.08 * coefficient +
      0.06 * effort)

  let level = 'basse'
  if (score >= 78) level = 'critique'
  else if (score >= 58) level = 'haute'
  else if (score >= 38) level = 'moyenne'

  const reasons = [
    { key: 'Échéance', detail: days < 0 ? 'dépassée' : `dans ${days} j`, weight: 0.4, value: urgency },
    { key: 'Type', detail: typeInfo(task.type).label, weight: 0.2, value: type },
    { key: 'Difficulté', detail: `${task.difficulty || 3}/5`, weight: 0.14, value: difficulty },
    {
      key: 'Matière',
      detail: subjectAverage == null ? 'pas de note' : `moy. ${subjectAverage.toFixed(1)}`,
      weight: 0.12,
      value: weakness,
    },
    { key: 'Coefficient', detail: `×${subject?.coefficient ?? 2}`, weight: 0.08, value: coefficient },
    { key: 'Charge', detail: `${task.estimatedMinutes || 30} min`, weight: 0.06, value: effort },
  ].sort((a, b) => b.weight * b.value - a.weight * a.value)

  return {
    score: Math.round(score),
    level,
    label: PRIORITY_LEVELS[level].label,
    color: PRIORITY_LEVELS[level].color,
    rank: PRIORITY_LEVELS[level].rank,
    days,
    reasons,
    explanation: buildExplanation(task, context, days, score),
  }
}

function buildExplanation(task, context, days, score) {
  const subjectName = context.subject?.name ?? 'cette matière'
  const parts = []
  if (days < 0) parts.push(`échéance dépassée depuis ${Math.abs(days)} jour(s)`)
  else if (days === 0) parts.push("échéance aujourd'hui")
  else if (days <= 2) parts.push(`échéance très proche (${days} j)`)
  else if (days <= 7) parts.push(`échéance cette semaine (${days} j)`)

  if (task.type === 'interrogation' || task.type === 'controle')
    parts.push('travail noté qui demande des révisions actives')
  if ((task.difficulty || 3) >= 4) parts.push('difficulté élevée')
  if (context.subjectAverage != null && context.subjectAverage < 12)
    parts.push(`moyenne fragile en ${subjectName}`)
  if ((context.subject?.coefficient || 2) >= 4) parts.push('matière à fort coefficient')

  if (parts.length === 0) parts.push('charge de travail modérée, à garder dans le rythme')
  return `Score ${Math.round(score)}/100 : ${parts.join(', ')}.`
}

/** Trie des tâches déjà enrichies par priorité décroissante. */
export const sortByPriority = (tasks) =>
  [...tasks].sort((a, b) => {
    if (b.priority.score !== a.priority.score) return b.priority.score - a.priority.score
    return a.priority.days - b.priority.days
  })
