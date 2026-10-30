/** Toutes les notes sont ramenées sur 20 pour les comparaisons. */
export const gradeOn20 = (grade) => {
  const max = Number(grade.max) || 20
  return max > 0 ? (Number(grade.score) / max) * 20 : 0
}

export const weightedAverage = (grades = []) => {
  const totalWeight = grades.reduce((sum, grade) => sum + (Number(grade.coefficient) || 1), 0)
  if (!totalWeight) return null
  const total = grades.reduce(
    (sum, grade) => sum + gradeOn20(grade) * (Number(grade.coefficient) || 1),
    0,
  )
  return total / totalWeight
}

export const mention = (average) => {
  if (average == null) return 'Pas encore de note'
  if (average >= 18) return 'Excellent'
  if (average >= 16) return 'Très bien'
  if (average >= 14) return 'Bien'
  if (average >= 12) return 'Assez bien'
  if (average >= 10) return 'Passable'
  return 'Fragile'
}

export const mentionTone = (average) => {
  if (average == null) return 'neutral'
  if (average >= 16) return 'success'
  if (average >= 12) return 'info'
  if (average >= 10) return 'warning'
  return 'danger'
}

export const subjectStats = (subjects = [], grades = []) =>
  subjects.map((subject) => {
    const list = grades.filter((grade) => grade.subjectId === subject.id)
    const average = weightedAverage(list)
    return {
      subject,
      grades: list,
      average,
      count: list.length,
      best: list.length ? Math.max(...list.map(gradeOn20)) : null,
      lowest: list.length ? Math.min(...list.map(gradeOn20)) : null,
    }
  })

export const generalAverage = (subjects = [], grades = []) => {
  const stats = subjectStats(subjects, grades).filter((stat) => stat.average != null)
  if (!stats.length) return null
  const totalWeight = stats.reduce((sum, stat) => sum + (Number(stat.subject.coefficient) || 1), 0)
  const total = stats.reduce(
    (sum, stat) => sum + stat.average * (Number(stat.subject.coefficient) || 1),
    0,
  )
  return total / totalWeight
}

/** Évolution entre deux périodes (notes récentes vs notes plus anciennes). */
export const averageTrend = (grades = [], days = 30) => {
  if (!grades.length) return null
  const sorted = [...grades].sort((a, b) => (a.date < b.date ? 1 : -1))
  const limit = new Date()
  limit.setDate(limit.getDate() - days)
  const cut = limit.toISOString().slice(0, 10)
  const recent = sorted.filter((grade) => grade.date >= cut)
  const older = sorted.filter((grade) => grade.date < cut)
  if (!recent.length || !older.length) return null
  const diff = weightedAverage(recent) - weightedAverage(older)
  return Number.isFinite(diff) ? diff : null
}

export const formatAverage = (value) =>
  value == null ? '—' : value.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 2 })
