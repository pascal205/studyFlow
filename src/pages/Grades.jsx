import { useMemo, useState } from 'react'
import { Badge, EmptyState, Icon, ProgressRing } from '../components/ui'
import { formatAverage, gradeOn20, mention, mentionTone } from '../lib/grades'
import { formatNumericDate } from '../lib/utils'
import { useDerived } from '../store/derived'

export function Grades({ onAddGrade, onEditGrade }) {
  const { grades, stats, generalAverage, settings, actions } = useDerived()
  const [subjectId, setSubjectId] = useState('all')
  const [sort, setSort] = useState('date')

  const visibleGrades = useMemo(() => {
    const list = grades.filter((grade) => subjectId === 'all' || grade.subjectId === subjectId)
    return [...list].sort((a, b) => {
      if (sort === 'score') return gradeOn20(b) - gradeOn20(a)
      if (sort === 'subject') {
        const nameA = stats.find((stat) => stat.subject.id === a.subjectId)?.subject.name ?? ''
        const nameB = stats.find((stat) => stat.subject.id === b.subjectId)?.subject.name ?? ''
        return nameA.localeCompare(nameB, 'fr')
      }
      return a.date < b.date ? 1 : -1
    })
  }, [grades, subjectId, sort, stats])

  const ranked = useMemo(
    () => [...stats].filter((stat) => stat.average != null).sort((a, b) => b.average - a.average),
    [stats],
  )
  const distribution = useMemo(() => {
    const ranges = [
      { label: '< 8', min: 0, max: 8, color: 'var(--danger)' },
      { label: '8–12', min: 8, max: 12, color: 'var(--warning)' },
      { label: '12–16', min: 12, max: 16, color: 'var(--info)' },
      { label: '16–20', min: 16, max: 20.01, color: 'var(--success)' },
    ]
    return ranges.map((range) => ({
      ...range,
      count: grades.filter((grade) => {
        const value = gradeOn20(grade)
        return value >= range.min && value < range.max
      }).length,
    }))
  }, [grades])
  const maxBucket = Math.max(1, ...distribution.map((bucket) => bucket.count))
  const best = ranked[0] ?? null
  const worst = ranked[ranked.length - 1] ?? null
  const goal = settings.goal || 14

  const handleDelete = (grade) => {
    if (window.confirm(`Supprimer la note « ${grade.title} » ?`)) actions.deleteGrade(grade.id)
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Suivi scolaire</p>
          <h1>Mes notes</h1>
          <p className="subtitle">Moyennes pondérées par coefficient de matière et par évaluation.</p>
        </div>
        <div className="page-header__actions">
          <button type="button" className="btn btn--primary" onClick={onAddGrade}>
            <Icon name="plus" size={18} /> Ajouter une note
          </button>
        </div>
      </header>

      <div className="grades-top">
        <section className="card average-card">
          <div className="average-card__main">
            <ProgressRing
              value={generalAverage == null ? 0 : (generalAverage / 20) * 100}
              size={148}
              stroke={12}
              color="var(--primary)"
              label={generalAverage == null ? '—' : formatAverage(generalAverage)}
              sublabel="moyenne /20"
            />
            <div>
              <span className="eyebrow">Moyenne générale</span>
              <h2 className="average-card__value">
                {generalAverage == null ? 'Pas encore de note' : `${formatAverage(generalAverage)} / 20`}
              </h2>
              <Badge tone={mentionTone(generalAverage)}>{mention(generalAverage)}</Badge>
              <p className="average-card__hint">
                {generalAverage == null
                  ? 'Ajoute ta première note pour suivre ta progression.'
                  : generalAverage >= goal
                    ? `Objectif atteint : tu es ${formatAverage(generalAverage - goal)} point(s) au-dessus de ta cible.`
                    : `Il te manque ${formatAverage(goal - generalAverage)} point(s) pour atteindre ton objectif de ${goal}/20.`}
              </p>
            </div>
          </div>
          <div className="average-card__side">
            <div>
              <span>Meilleure matière</span>
              <strong>{best ? best.subject.name : '—'}</strong>
              <em>{best ? `${formatAverage(best.average)}/20` : ''}</em>
            </div>
            <div>
              <span>À consolider</span>
              <strong>{worst ? worst.subject.name : '—'}</strong>
              <em>{worst ? `${formatAverage(worst.average)}/20` : ''}</em>
            </div>
            <div>
              <span>Notes enregistrées</span>
              <strong>{grades.length}</strong>
              <em>{stats.filter((stat) => stat.count > 0).length} matières notées</em>
            </div>
          </div>

          <div className="distribution">
            <div className="distribution__head">
              <span>Répartition des notes</span>
              <small>sur 20</small>
            </div>
            <div className="distribution__bars">
              {distribution.map((bucket) => (
                <div className="dist-col" key={bucket.label}>
                  <div className="dist-col__track">
                    <span
                      style={{ height: `${(bucket.count / maxBucket) * 100}%`, background: bucket.color }}
                      title={`${bucket.count} note(s)`}
                    />
                  </div>
                  <small>{bucket.label}</small>
                  <em>{bucket.count}</em>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card__header">
            <h2 className="card__title">
              <Icon name="grades" size={18} /> Profil par matière
            </h2>
          </div>
          <div className="subject-grade-list">
            {[...stats]
              .sort((a, b) => (b.average ?? -1) - (a.average ?? -1))
              .map((stat) => (
                <div className="subject-grade" key={stat.subject.id}>
                  <span className="subject-grade__name">
                    <span className="subject-dot" style={{ background: stat.subject.color }} />
                    {stat.subject.name}
                    <small>coef. {stat.subject.coefficient}</small>
                  </span>
                  <span className="subject-grade__bar">
                    <span
                      style={{
                        width: `${stat.average == null ? 0 : (stat.average / 20) * 100}%`,
                        background: stat.subject.color,
                      }}
                    />
                  </span>
                  <strong className={stat.average != null && stat.average < 10 ? 'is-low' : ''}>
                    {stat.average == null ? '—' : formatAverage(stat.average)}
                  </strong>
                  <button type="button" className="icon-btn" onClick={() => onAddGrade(stat.subject.id)} aria-label={`Ajouter une note en ${stat.subject.name}`}>
                    <Icon name="plus" size={16} />
                  </button>
                </div>
              ))}
            {!stats.length && <p className="muted">Crée d’abord une matière dans l’onglet Matières.</p>}
          </div>
        </section>
      </div>

      <section className="card">
        <div className="card__header">
          <h2 className="card__title">
            <Icon name="trello" size={18} /> Tableau des notes
          </h2>
          <div className="card__filters">
            <select value={subjectId} onChange={(event) => setSubjectId(event.target.value)} aria-label="Filtrer par matière">
              <option value="all">Toutes les matières</option>
              {stats.map((stat) => (
                <option key={stat.subject.id} value={stat.subject.id}>
                  {stat.subject.name}
                </option>
              ))}
            </select>
            <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Trier">
              <option value="date">Plus récentes</option>
              <option value="score">Meilleures notes</option>
              <option value="subject">Par matière</option>
            </select>
          </div>
        </div>

        {visibleGrades.length ? (
          <div className="table-wrap">
            <table className="grade-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Matière</th>
                  <th>Évaluation</th>
                  <th className="num">Note</th>
                  <th className="num">Coeff.</th>
                  <th className="num">Sur 20</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {visibleGrades.map((grade) => {
                  const subject = stats.find((stat) => stat.subject.id === grade.subjectId)?.subject
                  const on20 = gradeOn20(grade)
                  return (
                    <tr key={grade.id}>
                      <td className="muted">{formatNumericDate(grade.date)}</td>
                      <td>
                        <span className="subject-chip" style={{ '--chip': subject?.color ?? '#94a3b8' }}>
                          <span className="subject-chip__dot" />
                          {subject?.name ?? '—'}
                        </span>
                      </td>
                      <td className="grade-table__title">{grade.title}</td>
                      <td className="num">
                        <strong>{grade.score}</strong>
                        <span className="muted">/{grade.max}</span>
                      </td>
                      <td className="num muted">×{grade.coefficient}</td>
                      <td className="num">
                        <span className={`grade-pill ${on20 < 10 ? 'is-low' : on20 >= 14 ? 'is-high' : ''}`}>
                          {on20.toFixed(1).replace('.0', '')}
                        </span>
                      </td>
                      <td>
                        <div className="row-actions">
                          <button type="button" className="icon-btn" onClick={() => onEditGrade(grade)} aria-label="Modifier">
                            <Icon name="pencil" size={16} />
                          </button>
                          <button type="button" className="icon-btn icon-btn--danger" onClick={() => handleDelete(grade)} aria-label="Supprimer">
                            <Icon name="trash" size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon="grades"
            title="Aucune note pour l’instant"
            description="Ajoute tes évaluations pour visualiser ta moyenne générale et repérer les matières à consolider."
            action={
              <button type="button" className="btn btn--primary" onClick={onAddGrade}>
                <Icon name="plus" size={18} /> Ajouter une note
              </button>
            }
          />
        )}
      </section>
    </div>
  )
}
