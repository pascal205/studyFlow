import { Icon, PriorityMeter } from './ui'
import { typeInfo } from '../lib/priority'
import { dueLabel, formatDate, minutesToLabel } from '../lib/utils'

export function TaskCard({ task, onEdit, onDelete, onToggle, onStatusChange }) {
  const type = typeInfo(task.type)
  const done = task.status === 'done'
  const late = task.priority.days < 0 && !done

  return (
    <article className={`task-card ${done ? 'is-done' : ''} ${late ? 'is-late' : ''}`}>
      <button
        type="button"
        className={`check ${done ? 'is-checked' : ''}`}
        onClick={() => onToggle(task)}
        aria-label={done ? 'Marquer comme à faire' : 'Marquer comme terminé'}
        title={done ? 'Rouvrir' : 'Marquer comme terminé'}
      >
        {done && <Icon name="check" size={14} strokeWidth={3} />}
      </button>

      <div className="task-card__main">
        <div className="task-card__top">
          <div className="task-card__titles">
            <h4>{task.title}</h4>
            <div className="task-card__meta">
              <span className="subject-chip" style={{ '--chip': task.subject?.color ?? '#94a3b8' }}>
                <span className="subject-chip__dot" />
                {task.subject?.name ?? 'Matière supprimée'}
              </span>
              <span className={`type-chip type-chip--${task.type}`}>
                {type.emoji} {type.label}
              </span>
              <span className="meta-item">
                <Icon name="calendar" size={14} /> {formatDate(task.dueDate)}
              </span>
              <span className="meta-item">
                <Icon name="clock" size={14} /> {minutesToLabel(task.estimatedMinutes)}
              </span>
            </div>
          </div>

          <div className="task-card__actions">
            <button type="button" className="icon-btn" onClick={() => onEdit(task)} aria-label="Modifier">
              <Icon name="pencil" size={17} />
            </button>
            <button
              type="button"
              className="icon-btn icon-btn--danger"
              onClick={() => onDelete(task)}
              aria-label="Supprimer"
            >
              <Icon name="trash" size={17} />
            </button>
          </div>
        </div>

        {task.notes && <p className="task-card__notes">{task.notes}</p>}

        <div className="task-card__footer">
          <PriorityMeter priority={task.priority} />
          <span className={`due-pill ${late ? 'is-late' : ''}`}>{dueLabel(task.dueDate)}</span>
          <div className="status-switch" role="group" aria-label="Statut">
            {[
              { value: 'todo', label: 'À faire' },
              { value: 'doing', label: 'En cours' },
              { value: 'done', label: 'Terminé' },
            ].map((status) => (
              <button
                type="button"
                key={status.value}
                className={task.status === status.value ? 'is-active' : ''}
                onClick={() => onStatusChange(task, status.value)}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </article>
  )
}
