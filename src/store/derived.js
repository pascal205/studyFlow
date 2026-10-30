import { useMemo } from 'react'
import { computePriority, sortByPriority } from '../lib/priority'
import { generalAverage, subjectStats } from '../lib/grades'
import { daysUntil } from '../lib/utils'
import { useStudy } from './StudyStore'

/**
 * Enrichit les données brutes : priorités calculées, stats par matière,
 * moyenne générale, compteurs pour le tableau de bord.
 */
export function useDerived() {
  const { subjects, tasks, grades, settings, actions } = useStudy()

  return useMemo(() => {
    const stats = subjectStats(subjects, grades)
    const averageBySubject = Object.fromEntries(
      stats.filter((stat) => stat.average != null).map((stat) => [stat.subject.id, stat.average]),
    )

    const enrichedTasks = tasks.map((task) => {
      const subject = subjects.find((item) => item.id === task.subjectId) ?? null
      const priority = computePriority(task, {
        subject,
        subjectAverage: averageBySubject[task.subjectId] ?? null,
      })
      return { ...task, subject, priority }
    })

    const openTasks = enrichedTasks.filter((task) => task.status !== 'done')
    const doneTasks = enrichedTasks.filter((task) => task.status === 'done')
    const sortedOpen = sortByPriority(openTasks)

    const weekTasks = openTasks
      .filter((task) => {
        const delta = daysUntil(task.dueDate)
        return delta >= 0 && delta <= 7
      })
      .sort((a, b) => (a.dueDate > b.dueDate ? 1 : -1))

    const overdueTasks = sortedOpen.filter((task) => task.priority.days < 0)
    const todayTasks = sortedOpen.filter((task) => task.priority.days === 0)
    const weekMinutes = weekTasks.reduce((sum, task) => sum + (task.estimatedMinutes || 0), 0)
    const completionRate = enrichedTasks.length
      ? Math.round((doneTasks.length / enrichedTasks.length) * 100)
      : 0

    return {
      subjects,
      tasks: enrichedTasks,
      openTasks,
      sortedOpen,
      doneTasks,
      weekTasks,
      overdueTasks,
      todayTasks,
      stats,
      averageBySubject,
      generalAverage: generalAverage(subjects, grades),
      grades,
      settings,
      actions,
      weekMinutes,
      completionRate,
      topPriority: sortedOpen[0] ?? null,
      urgentCount: sortedOpen.filter((task) => task.priority.level === 'critique').length,
      nextDeadline: sortedOpen
        .filter((task) => task.priority.days >= 0)
        .sort((a, b) => a.priority.days - b.priority.days)[0] ?? null,
    }
  }, [subjects, tasks, grades, settings, actions])
}
