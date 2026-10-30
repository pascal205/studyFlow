/* Petites fonctions utilitaires partagées (dates, ids, formats). */

export const uid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

export const pad2 = (n) => String(n).padStart(2, '0')

/** Date -> "YYYY-MM-DD" en heure locale (évite les décalages UTC). */
export const toISODate = (date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`

/** "YYYY-MM-DD" -> Date locale à minuit. */
export const parseDate = (iso) => {
  if (!iso) return null
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const startOfToday = () => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

export const todayISO = () => toISODate(startOfToday())

export const addDays = (iso, amount) => {
  const date = parseDate(iso) ?? startOfToday()
  date.setDate(date.getDate() + amount)
  return toISODate(date)
}

export const daysUntil = (iso) => {
  const date = parseDate(iso)
  if (!date) return 999
  return Math.round((date - startOfToday()) / 86400000)
}

const shortDate = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
})

const longDate = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

const numericDate = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1)

export const formatDate = (iso) => {
  const date = parseDate(iso)
  return date ? capitalize(shortDate.format(date).replace('.', '')) : '—'
}

export const formatLongDate = (iso) => {
  const date = typeof iso === 'string' ? parseDate(iso) : iso
  return date ? capitalize(longDate.format(date)) : '—'
}

export const formatNumericDate = (iso) => {
  const date = parseDate(iso)
  return date ? numericDate.format(date) : '—'
}

/** Libellé d'échéance lisible : "En retard de 2 j", "Aujourd'hui", "Demain"... */
export const dueLabel = (iso) => {
  const days = daysUntil(iso)
  if (days < -1) return `En retard de ${Math.abs(days)} j`
  if (days === -1) return 'En retard (hier)'
  if (days === 0) return "Aujourd'hui"
  if (days === 1) return 'Demain'
  if (days <= 6) return `Dans ${days} j`
  if (days <= 13) return 'La semaine prochaine'
  return formatDate(iso)
}

export const minutesToLabel = (minutes = 0) => {
  const total = Math.round(minutes)
  if (total < 60) return `${total} min`
  const hours = Math.floor(total / 60)
  const rest = total % 60
  return rest === 0 ? `${hours} h` : `${hours} h ${pad2(rest)}`
}

export const hoursToLabel = (minutes = 0) => {
  const hours = minutes / 60
  return `${hours.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} h`
}

/** "17:30" -> 1050 minutes */
export const timeToMinutes = (time = '17:00') => {
  const [h, m] = time.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

/** 1050 -> "17:30" */
export const minutesToTime = (minutes = 0) => {
  const normalized = ((minutes % 1440) + 1440) % 1440
  return `${pad2(Math.floor(normalized / 60))}:${pad2(normalized % 60)}`
}

export const pluralize = (count, singular, plural = `${singular}s`) =>
  `${count} ${count > 1 ? plural : singular}`
