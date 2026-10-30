import { backupsKey } from './storage'
import { uid } from './utils'

const MAX_BACKUPS = 12

const countsOf = (state) => ({
  subjects: state.subjects?.length ?? 0,
  tasks: state.tasks?.length ?? 0,
  grades: state.grades?.length ?? 0,
})

export const listBackups = (userId) => {
  try {
    const parsed = JSON.parse(localStorage.getItem(backupsKey(userId)) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const saveBackups = (userId, backups) => {
  try {
    localStorage.setItem(backupsKey(userId), JSON.stringify(backups))
  } catch {
    throw new Error('Espace de sauvegarde plein : supprime une ancienne sauvegarde.')
  }
}

const defaultLabel = () =>
  new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date())

/** Enregistre un instantané de l'état complet dans l'espace de sauvegarde du profil. */
export const createBackup = (userId, state, label) => {
  const entry = {
    id: uid(),
    label: label?.trim() || `Sauvegarde du ${defaultLabel()}`,
    createdAt: new Date().toISOString(),
    counts: countsOf(state),
    payload: {
      subjects: state.subjects,
      tasks: state.tasks,
      grades: state.grades,
      settings: state.settings,
      version: 1,
    },
  }
  const next = [entry, ...listBackups(userId)].slice(0, MAX_BACKUPS)
  saveBackups(userId, next)
  return entry
}

export const deleteBackup = (userId, backupId) => {
  saveBackups(userId, listBackups(userId).filter((backup) => backup.id !== backupId))
}

export const getBackup = (userId, backupId) =>
  listBackups(userId).find((backup) => backup.id === backupId) || null

export const formatBackupDate = (iso) =>
  new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso))
