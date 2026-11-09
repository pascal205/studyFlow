import { useEffect } from 'react'

const reminderStorageKey = (userId) => `studyflow.reminders.v1.${userId}`

const localISODate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function useTaskReminders({ tasks, enabled, userId }) {
  useEffect(() => {
    if (!enabled || !userId || !('Notification' in window) || Notification.permission !== 'granted') return undefined

    let checking = false
    const checkDueTasks = async () => {
      if (checking) return
      checking = true
      try {
        const today = localISODate(new Date())
        let sent = new Set()
        try {
          const stored = JSON.parse(localStorage.getItem(reminderStorageKey(userId)) || '[]')
          sent = new Set(Array.isArray(stored) ? stored : [])
        } catch {
          sent = new Set()
        }

        const dueTasks = tasks.filter((task) => {
          if (task.status === 'done' || !task.dueDate || task.dueDate > today) return false
          const reminderId = `${task.id}:${task.dueDate}`
          if (sent.has(reminderId)) return false
          if (task.dueDate === today && Date.now() < new Date(`${task.dueDate}T09:00:00`).getTime()) return false
          return true
        })
        if (!dueTasks.length) return

        const overdueCount = dueTasks.filter((task) => task.dueDate < today).length
        const labels = dueTasks.slice(0, 3).map((task) => task.title)
        const extraCount = dueTasks.length - labels.length
        const body = `${dueTasks.length} tâche${dueTasks.length > 1 ? 's' : ''} à terminer${overdueCount ? `, dont ${overdueCount} en retard` : ' aujourd’hui'} : ${labels.join(', ')}${extraCount ? ` et ${extraCount} autre${extraCount > 1 ? 's' : ''}` : ''}.`
        const options = {
          body,
          tag: `studyflow-reminders-${today}`,
          icon: `${import.meta.env.BASE_URL}icons/icon-192.png`,
        }
        const registration = await navigator.serviceWorker?.getRegistration?.()
        if (registration?.showNotification) {
          await registration.showNotification('Rappel StudyFlow', options)
        } else {
          new Notification('Rappel StudyFlow', options)
        }
        dueTasks.forEach((task) => sent.add(`${task.id}:${task.dueDate}`))
        try {
          localStorage.setItem(reminderStorageKey(userId), JSON.stringify([...sent].slice(-500)))
        } catch {
          // La notification peut être envoyée même si le navigateur ne peut pas mémoriser son envoi.
        }
      } catch {
        // Les restrictions ou erreurs de notification ne doivent pas interrompre l’application.
      } finally {
        checking = false
      }
    }

    checkDueTasks()
    const intervalId = window.setInterval(checkDueTasks, 60_000)
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') checkDueTasks()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      window.clearInterval(intervalId)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [tasks, enabled, userId])
}
