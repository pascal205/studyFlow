import { useMemo, useState } from 'react'
import { TaskCard } from '../components/TaskCard'
import { EmptyState, Icon } from '../components/ui'
import { TASK_TYPES } from '../lib/priority'
import { hoursToLabel } from '../lib/utils'
import { useDerived } from '../store/derived'

const SORTS = [
  { value: 'priority', label: 'Priorité d’apprentissage' },
  { value: 'due', label: 'Échéance la plus proche' },
  { value: 'duration', label: 'Durée estimée' },
  { value: 'subject', label: 'Matière' },
]

export function Tasks({ onNewTask, onEditTask }) {
  const { tasks, subjects, actions } = useDerived()
  const [status, setStatus] = useState('open')
  const [subjectId, setSubjectId] = useState('all')
  const [type, setType] = useState('all')
  const [sort, setSort] = useState('priority')
  const [search, setSearch] = useState('')

  const counts = useMemo(
    () => ({
      open: tasks.filter((task) => task.status !== 'done').length,
      doing: tasks.filter((task) => task.status === 'doing').length,
      done: tasks.filter((task) => task.status === 'done').length,
      all: tasks.length,
    }),
    [tasks],
  )

  const visible = useMemo(() => {
    let list = tasks.filter((task) => {
      if (status === 'open' && task.status === 'done') return false
      if (status === 'doing' && task.status !== 'doing') return false
      if (status === 'done' && task.status !== 'done') return false
      if (subjectId !== 'all' && task.subjectId !== subjectId) return false
      if (type !== 'all' && task.type !== type) return false
      if (search.trim()) {
        const needle = search.trim().toLowerCase()
        const haystack = `${task.title} ${task.notes} ${task.subject?.name ?? ''}`.toLowerCase()
        if (!haystack.includes(needle)) return false
      }
      return true
    })

    list = [...list].sort((a, b) => {
      if (sort === 'due') return a.priority.days - b.priority.days
      if (sort === 'duration') return b.estimatedMinutes - a.estimatedMinutes
      if (sort === 'subject') {
        const nameA = a.subject?.name ?? ''
        const nameB = b.subject?.name ?? ''
        return nameA.localeCompare(nameB, 'fr') || a.priority.days - b.priority.days
      }
      if (a.status === 'done' && b.status !== 'done') return 1
      if (b.status === 'done' && a.status !== 'done') return -1
      return b.priority.score - a.priority.score
    })
    return list
  }, [tasks, status, subjectId, type, sort, search])

  const workload = visible
    .filter((task) => task.status !== 'done')
    .reduce((sum, task) => sum + task.estimatedMinutes, 0)

  const handleToggle = (task) => {
    actions.setTaskStatus(task.id, task.status === 'done' ? 'todo' : 'done')
  }

  const handleDelete = (task) => {
    if (window.confirm(`Supprimer « ${task.title} » ?`)) actions.deleteTask(task.id)
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Organisation</p>
          <h1>Devoirs &amp; contrôles</h1>
          <p className="subtitle">
            {counts.open} travail{counts.open > 1 ? 'x' : ''} en attente · {hoursToLabel(workload)} dans la sélection
          </p>
        </div>
        <div className="page-header__actions">
          <button type="button" className="btn btn--primary" onClick={onNewTask}>
            <Icon name="plus" size={18} /> Nouveau travail
          </button>
        </div>
      </header>

      <div className="tasks-layout">
        <div className="toolbar card">
          <div className="tabs" role="tablist" aria-label="Filtrer par statut">
            {[
              { value: 'open', label: 'À faire', count: counts.open },
              { value: 'doing', label: 'En cours', count: counts.doing },
              { value: 'done', label: 'Terminés', count: counts.done },
              { value: 'all', label: 'Tous', count: counts.all },
            ].map((tab) => (
              <button
                type="button"
                role="tab"
                aria-selected={status === tab.value}
                key={tab.value}
                className={status === tab.value ? 'is-active' : ''}
                onClick={() => setStatus(tab.value)}
              >
                {tab.label} <span>{tab.count}</span>
              </button>
            ))}
          </div>

          <div className="toolbar__filters">
            <label className="search">
              <Icon name="search" size={16} />
              <input
                type="search"
                placeholder="Rechercher un travail…"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
            <select value={subjectId} onChange={(event) => setSubjectId(event.target.value)} aria-label="Matière">
              <option value="all">Toutes les matières</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
            <select value={type} onChange={(event) => setType(event.target.value)} aria-label="Type de travail">
              <option value="all">Tous les types</option>
              {TASK_TYPES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Trier par">
              {SORTS.map((item) => (
                <option key={item.value} value={item.value}>
                  Trier : {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="task-list">
          {visible.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={handleDelete}
              onToggle={handleToggle}
              onStatusChange={(item, value) => actions.setTaskStatus(item.id, value)}
            />
          ))}

          {!visible.length && (
            <EmptyState
              icon="tasks"
              title="Aucun travail dans cette sélection"
              description="Modifie les filtres ou ajoute un nouveau devoir pour commencer à organiser tes révisions."
              action={
                <button type="button" className="btn btn--primary" onClick={onNewTask}>
                  <Icon name="plus" size={18} /> Ajouter un travail
                </button>
              }
            />
          )}
        </div>
      </div>
    </div>
  )
}
