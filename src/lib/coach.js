import { minutesToTime, timeToMinutes, daysUntil } from './utils'

/**
 * Construit un plan de travail réaliste pour une journée :
 * sessions triées par priorité, plafonnées par le temps disponible,
 * avec des pauses de 5 minutes entre deux sessions.
 */
export function buildDayPlan(tasks = [], options = {}) {
  const { startTime = '17:00', budget = 90, maxPerTask = 45, breakMinutes = 5 } = options
  const ordered = [...tasks]
    .filter((task) => task.status !== 'done')
    .sort((a, b) => b.priority.score - a.priority.score)

  let remaining = Math.max(0, Number(budget) || 0)
  let cursor = timeToMinutes(startTime)
  const items = []
  let plannedCount = 0

  for (const task of ordered) {
    if (remaining < 15) break
    const minutes = Math.min(task.estimatedMinutes || 30, maxPerTask, remaining)
    const start = cursor
    const end = start + minutes
    items.push({
      kind: 'task',
      task,
      minutes,
      startTime: minutesToTime(start),
      endTime: minutesToTime(end),
      partial: minutes < (task.estimatedMinutes || 30),
    })
    plannedCount += 1
    cursor = end
    remaining -= minutes

    const next = ordered[plannedCount]
    if (next && remaining >= 15) {
      items.push({
        kind: 'break',
        minutes: breakMinutes,
        startTime: minutesToTime(cursor),
        endTime: minutesToTime(cursor + breakMinutes),
      })
      cursor += breakMinutes
    }
  }

  const plannedMinutes = items
    .filter((item) => item.kind === 'task')
    .reduce((sum, item) => sum + item.minutes, 0)

  return {
    items,
    plannedMinutes,
    remainingMinutes: Math.max(0, remaining),
    deferredCount: Math.max(0, ordered.length - plannedCount),
    endTime: items.length ? items[items.length - 1].endTime : startTime,
  }
}

/** Charge de travail (minutes) des travaux non terminés sur une période. */
export const workloadWithin = (tasks = [], days = 7) =>
  tasks
    .filter((task) => task.status !== 'done')
    .filter((task) => {
      const delta = daysUntil(task.dueDate)
      return delta <= days
    })
    .reduce((sum, task) => sum + (Number(task.estimatedMinutes) || 30), 0)

/**
 * Génère des conseils d'organisation personnalisés, du plus urgent au plus général.
 */
export function buildCoachAdvice({ tasks = [], subjectStats = [], generalAverage = null }) {
  if (!tasks.length) {
    return [
      {
        id: 'welcome',
        tone: 'info',
        title: 'Ton espace est prêt',
        message:
          'Ajoute ton premier devoir ou ta première interrogation : StudyFlow calculera sa priorité et construira ton planning. Tes matières par défaut sont déjà en place.',
      },
      {
        id: 'welcome-grades',
        tone: 'success',
        title: 'Ajoute tes notes au fur et à mesure',
        message:
          'Dès ta première évaluation, tu verras ta moyenne par matière. La moyenne générale, elle, reste masquée jusqu’à ce que tu choisisses de la révéler.',
      },
    ]
  }

  const advice = []
  const open = tasks.filter((task) => task.status !== 'done')
  const overdue = open.filter((task) => task.priority.days < 0)
  const todayOrTomorrow = open.filter((task) => task.priority.days >= 0 && task.priority.days <= 1)
  const top = [...open].sort((a, b) => b.priority.score - a.priority.score)[0]

  if (overdue.length) {
    advice.push({
      id: 'overdue',
      tone: 'danger',
      title: `${overdue.length} travail${overdue.length > 1 ? 'x' : ''} en retard`,
      message: `Commence par « ${overdue[0].title} » (${overdue[0].subject?.name}). Une petite session de 25 min vaut mieux qu'une dette qui s'accumule.`,
    })
  }

  if (todayOrTomorrow.length) {
    advice.push({
      id: 'soon',
      tone: 'warning',
      title: 'Échéances imminentes',
      message: `${todayOrTomorrow.length} travail${todayOrTomorrow.length > 1 ? 'x' : ''} à rendre d'ici demain. Bloque un créneau ce soir et fais une première passe rapide, puis une relecture demain.`,
    })
  }

  const weak = subjectStats
    .filter((stat) => stat.average != null)
    .sort((a, b) => a.average - b.average)[0]
  if (weak && weak.average < 12) {
    advice.push({
      id: 'weak',
      tone: 'info',
      title: `Matière à consolider : ${weak.subject.name}`,
      message: `Moyenne actuelle ${weak.average.toFixed(1)}/20. Ajoute 20 min de révision active (fiche + questions) deux fois par semaine pour remonter sans surcharge.`,
    })
  }

  const upcoming = open.filter((task) => ['interrogation', 'controle'].includes(task.type)).length
  if (upcoming >= 2) {
    advice.push({
      id: 'tests',
      tone: 'info',
      title: 'Plusieurs évaluations à préparer',
      message: 'Étale tes révisions : 3 sessions de 25 min réparties sur plusieurs jours sont plus efficaces qu’une seule session de 2 h la veille.',
    })
  }

  if (!open.length) {
    advice.push({
      id: 'clear',
      tone: 'success',
      title: 'Tout est à jour 🎉',
      message: 'Profite de ce temps libre pour une révision de 20 min sur ta matière la plus fragile, ou anticipe le prochain contrôle.',
    })
  } else if (!overdue.length && !todayOrTomorrow.length && top) {
    advice.push({
      id: 'next',
      tone: 'success',
      title: 'Rythme maîtrisé',
      message: `Rien d'urgent : avance sur « ${top.title} » (${top.subject?.name}) pour garder de l'avance et éviter le stress de dernière minute.`,
    })
  }

  if (generalAverage != null && generalAverage < 10) {
    advice.push({
      id: 'average',
      tone: 'warning',
      title: 'Objectif : sécuriser les bases',
      message: 'Cible les matières à fort coefficient et les chapitres déjà vus. Mieux vaut consolider 2 matières que tout survoler.',
    })
  }

  if (advice.length === 0) {
    advice.push({
      id: 'start',
      tone: 'info',
      title: 'Bien démarrer',
      message: 'Ajoute tes premiers devoirs et interrogations : StudyFlow calculera automatiquement l’ordre de travail le plus efficace.',
    })
  }

  return advice.slice(0, 4)
}

/** Conseil de méthode associé au type de travail. */
export const methodForTask = (type) => {
  switch (type) {
    case 'interrogation':
      return 'Rappel actif : cache tes notes, récite, puis vérifie. Ajoute une session de rappel demain.'
    case 'controle':
      return 'Fais un planning de révision par chapitre, puis 2 sujets d’entraînement en conditions réelles.'
    case 'oral':
      return 'Enregistre-toi, réécoute, améliore l’introduction et la conclusion en priorité.'
    case 'projet':
      return 'Découpe en 3 étapes (recherche, rédaction, relecture) et fixe une échéance interne 2 jours avant.'
    default:
      return 'Commence par relire la consigne, liste les étapes, puis travaille 25 min sans notification.'
  }
}
