import { useState } from 'react'
import { EmptyState, Icon } from '../components/ui'
import { formatAverage, mention } from '../lib/grades'
import { minutesToLabel } from '../lib/utils'
import { useDerived } from '../store/derived'

export function Subjects({ onAddSubject, onEditSubject }) {
  const { stats, tasks, grades, actions } = useDerived()
  const [pendingDelete, setPendingDelete] = useState(null)

  const confirmDelete = (subject) => {
    setPendingDelete(subject)
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Mon année</p>
          <h1>Mes matières</h1>
          <p className="subtitle">
            Coefficients, professeurs et moyenne par matière. Le coefficient pèse dans ta moyenne générale et dans les
            priorités.
          </p>
        </div>
        <div className="page-header__actions">
          <button type="button" className="btn btn--primary" onClick={onAddSubject}>
            <Icon name="plus" size={18} /> Nouvelle matière
          </button>
        </div>
      </header>

      {stats.length ? (
        <div className="subject-grid">
          {stats.map(({ subject, average, count, grades: subjectGrades }) => {
            const open = tasks.filter((task) => task.subjectId === subject.id && task.status !== 'done')
            const minutes = open.reduce((sum, task) => sum + task.estimatedMinutes, 0)
            const next = [...open].sort((a, b) => a.priority.days - b.priority.days)[0]

            return (
              <article className="card subject-card" key={subject.id} style={{ '--accent': subject.color }}>
                <header className="subject-card__head">
                  <span className="subject-card__avatar" style={{ background: `${subject.color}1f`, color: subject.color }}>
                    {subject.name.slice(0, 2).toUpperCase()}
                  </span>
                  <div>
                    <h3>{subject.name}</h3>
                    <p>
                      Coef. {subject.coefficient}
                      {subject.teacher ? ` · ${subject.teacher}` : ''}
                    </p>
                  </div>
                  <div className="subject-card__actions">
                    <button type="button" className="icon-btn" onClick={() => onEditSubject(subject)} aria-label="Modifier la matière">
                      <Icon name="pencil" size={16} />
                    </button>
                    <button
                      type="button"
                      className="icon-btn icon-btn--danger"
                      onClick={() => confirmDelete(subject)}
                      aria-label="Supprimer la matière"
                    >
                      <Icon name="trash" size={16} />
                    </button>
                  </div>
                </header>

                <div className="subject-card__average">
                  <strong>{average == null ? '—' : formatAverage(average)}</strong>
                  <span>/20</span>
                  <em>{average == null ? 'pas encore noté' : mention(average)}</em>
                </div>

                <div className="subject-card__bar">
                  <span style={{ width: `${average == null ? 0 : (average / 20) * 100}%`, background: subject.color }} />
                </div>

                <dl className="subject-card__stats">
                  <div>
                    <dt>Travaux en cours</dt>
                    <dd>{open.length}</dd>
                  </div>
                  <div>
                    <dt>Charge à venir</dt>
                    <dd>{minutesToLabel(minutes)}</dd>
                  </div>
                  <div>
                    <dt>Notes</dt>
                    <dd>{count}</dd>
                  </div>
                </dl>

                <footer className="subject-card__footer">
                  {next ? (
                    <p>
                      <Icon name="calendar" size={14} /> Prochain : <strong>{next.title}</strong>
                    </p>
                  ) : (
                    <p className="muted">Aucun travail en attente.</p>
                  )}
                  {subjectGrades.length > 0 && (
                    <p className="muted">
                      Dernière note : {subjectGrades.sort((a, b) => (a.date < b.date ? 1 : -1))[0].title}
                    </p>
                  )}
                </footer>
              </article>
            )
          })}
        </div>
      ) : (
        <EmptyState
          icon="book"
          title="Aucune matière"
          description="Commence par ajouter tes matières : elles servent à classer les devoirs, les notes et calculer les moyennes."
          action={
            <button type="button" className="btn btn--primary" onClick={onAddSubject}>
              <Icon name="plus" size={18} /> Créer une matière
            </button>
          }
        />
      )}

      {pendingDelete && (
        <div className="inline-confirm card">
          <div>
            <h4>Supprimer « {pendingDelete.name} » ?</h4>
            <p>
              Les {tasks.filter((task) => task.subjectId === pendingDelete.id).length} travaux et{' '}
              {grades.filter((grade) => grade.subjectId === pendingDelete.id).length} notes liés seront aussi supprimés.
            </p>
          </div>
          <div className="inline-confirm__actions">
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => setPendingDelete(null)}>
              Annuler
            </button>
            <button
              type="button"
              className="btn btn--danger btn--sm"
              onClick={() => {
                actions.deleteSubject(pendingDelete.id)
                setPendingDelete(null)
              }}
            >
              Supprimer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
