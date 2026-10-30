import { useMemo } from 'react'
import { useDerived } from '../store/derived'
import { Badge, Icon, ProgressRing } from '../components/ui'
import { buildCoachAdvice, methodForTask } from '../lib/coach'
import { useAverageReveal } from '../lib/useAverageReveal'
import { formatAverage, mention } from '../lib/grades'
import { typeInfo } from '../lib/priority'
import { addDays, dueLabel, formatLongDate, hoursToLabel, minutesToLabel, todayISO } from '../lib/utils'

export function Dashboard({ onNavigate, onNewTask, onEditTask }) {
  const data = useDerived()
  const {
    settings,
    sortedOpen,
    todayTasks,
    weekTasks,
    overdueTasks,
    generalAverage,
    stats,
    weekMinutes,
    completionRate,
    actions,
  } = data

  const advice = useMemo(
    () => buildCoachAdvice({ tasks: data.tasks, subjectStats: stats, generalAverage }),
    [data.tasks, stats, generalAverage],
  )

  const nextTask = sortedOpen[0] ?? null
  const todayPlan = todayTasks.length ? todayTasks : weekTasks.slice(0, 3)
  const todayPlanMinutes = todayPlan.reduce((sum, task) => sum + task.estimatedMinutes, 0)
  const average = useAverageReveal()
  const goalGap = average.revealed && average.average != null ? settings.goal - average.average : null

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">{formatLongDate(todayISO())}</p>
          <h1>Bonjour {settings.studentName} 👋</h1>
          <p className="subtitle">
            {sortedOpen.length === 0
              ? 'Aucun travail en attente : profite-en pour consolider une matière.'
              : `${sortedOpen.length} travail${sortedOpen.length > 1 ? 'x' : ''} en cours · ${hoursToLabel(
                  weekMinutes,
                )} estimées cette semaine.`}
          </p>
        </div>
        <div className="page-header__actions">
          <button type="button" className="btn btn--ghost" onClick={() => onNavigate('planning')}>
            <Icon name="calendar" size={18} /> Mon planning
          </button>
          <button type="button" className="btn btn--primary" onClick={onNewTask}>
            <Icon name="plus" size={18} /> Nouveau travail
          </button>
        </div>
      </header>

      <section className="kpi-grid">
        <KpiCard
          icon="tasks"
          tone="indigo"
          label="À faire"
          value={sortedOpen.length}
          hint={`${todayTasks.length} pour aujourd’hui`}
        />
        <KpiCard
          icon="clock"
          tone="cyan"
          label="Charge cette semaine"
          value={hoursToLabel(weekMinutes)}
          hint={`${weekTasks.length} échéance${weekTasks.length > 1 ? 's' : ''} d’ici 7 jours`}
        />
        <KpiCard
          icon="alert"
          tone={overdueTasks.length ? 'red' : 'green'}
          label="En retard"
          value={overdueTasks.length}
          hint={overdueTasks.length ? 'À traiter en priorité' : 'Rien de dépassé, bravo'}
        />
        <KpiCard
          icon="grades"
          tone="violet"
          label="Moyenne générale"
          value={
            average.revealed ? (
              average.average == null ? (
                '—'
              ) : (
                <>
                  {formatAverage(average.average)}
                  <small>/20</small>
                </>
              )
            ) : average.calculating ? (
              <span className="calc-value">
                Calcul<span className="calc-dots" />
              </span>
            ) : (
              <button type="button" className="reveal-inline" onClick={average.reveal}>
                <Icon name="eye" size={14} /> Révéler
              </button>
            )
          }
          hint={
            average.revealed
              ? mention(average.average)
              : average.calculating
                ? 'Calcul en cours…'
                : 'Masquée jusqu’à ton choix'
          }
        />
      </section>

      <div className="dashboard-grid">
        <section className="card hero-card">
          <div className="card__header">
            <h2 className="card__title">
              <Icon name="flag" size={18} /> Priorité du moment
            </h2>
            <span className="card__hint">Calculée sur l’échéance, la difficulté et ta moyenne</span>
          </div>

          {nextTask ? (
            <div className="hero">
              <div className="hero__content">
                <div className="hero__chips">
                  <span className="subject-chip" style={{ '--chip': nextTask.subject?.color ?? '#94a3b8' }}>
                    <span className="subject-chip__dot" />
                    {nextTask.subject?.name}
                  </span>
                  <Badge tone="neutral">
                    {typeInfo(nextTask.type).emoji} {typeInfo(nextTask.type).label}
                  </Badge>
                  <Badge tone={nextTask.priority.days < 0 ? 'danger' : 'warning'}>{dueLabel(nextTask.dueDate)}</Badge>
                </div>
                <h3>{nextTask.title}</h3>
                <p className="hero__why">{nextTask.priority.explanation}</p>
                <ul className="hero__reasons">
                  {nextTask.priority.reasons.slice(0, 3).map((reason) => (
                    <li key={reason.key}>
                      <span>{reason.key}</span>
                      <strong>{reason.detail}</strong>
                    </li>
                  ))}
                </ul>
                <p className="hero__method">
                  <Icon name="sparkles" size={15} /> {methodForTask(nextTask.type)}
                </p>
                <div className="hero__actions">
                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={() => actions.setTaskStatus(nextTask.id, 'doing')}
                  >
                    <Icon name="target" size={18} /> Je m’y mets maintenant
                  </button>
                  <button type="button" className="btn btn--ghost" onClick={() => onEditTask(nextTask)}>
                    Voir le détail
                  </button>
                </div>
              </div>
              <div className="hero__side">
                <ProgressRing
                  value={nextTask.priority.score}
                  label={nextTask.priority.score}
                  sublabel={`priorité ${nextTask.priority.label.toLowerCase()}`}
                  color={nextTask.priority.color}
                  size={140}
                />
                <p className="hero__duration">
                  <Icon name="clock" size={15} /> Session conseillée&nbsp;: {minutesToLabel(nextTask.estimatedMinutes)}
                </p>
              </div>
            </div>
          ) : (
            <div className="hero hero--empty">
              <div>
                <h3>Tout est fait 🎉</h3>
                <p className="hero__why">
                  Ajoute un prochain travail ou révise 20 minutes la matière où ta moyenne est la plus fragile.
                </p>
                <button type="button" className="btn btn--primary" onClick={onNewTask}>
                  <Icon name="plus" size={18} /> Ajouter un travail
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="card">
          <div className="card__header">
            <h2 className="card__title">
              <Icon name="sparkles" size={18} /> Coach du jour
            </h2>
          </div>
          <div className="advice-list">
            {advice.map((item) => (
              <div className={`advice advice--${item.tone}`} key={item.id}>
                <span className="advice__icon">
                  <Icon name={item.tone === 'danger' ? 'alert' : item.tone === 'success' ? 'check' : 'sparkles'} size={16} />
                </span>
                <div>
                  <h4>{item.title}</h4>
                  <p>{item.message}</p>
                </div>
              </div>
            ))}
          </div>
          <button type="button" className="card__link" onClick={() => onNavigate('guide')}>
            Voir le guide d’organisation <Icon name="arrowRight" size={15} />
          </button>
        </section>

        <section className="card">
          <div className="card__header">
            <h2 className="card__title">
              <Icon name="tasks" size={18} /> Mes priorités d’apprentissage
            </h2>
            <button type="button" className="card__link card__link--inline" onClick={() => onNavigate('tasks')}>
              Tout voir <Icon name="arrowRight" size={14} />
            </button>
          </div>
          <div className="mini-list">
            {sortedOpen.slice(0, 5).map((task, index) => (
              <button type="button" className="mini-task" key={task.id} onClick={() => onEditTask(task)}>
                <span className="mini-task__rank">{index + 1}</span>
                <span className="mini-task__body">
                  <span className="mini-task__title">{task.title}</span>
                  <span className="mini-task__meta">
                    <span className="subject-dot" style={{ background: task.subject?.color ?? '#94a3b8' }} />
                    {task.subject?.name} · {dueLabel(task.dueDate)} · {minutesToLabel(task.estimatedMinutes)}
                  </span>
                </span>
                <span className="mini-task__score" style={{ color: task.priority.color }}>
                  {task.priority.score}
                </span>
              </button>
            ))}
            {sortedOpen.length === 0 && <p className="muted">Aucune priorité : tout est sous contrôle.</p>}
          </div>
        </section>

        <section className="card">
          <div className="card__header">
            <h2 className="card__title">
              <Icon name="calendar" size={18} /> Les 7 prochains jours
            </h2>
            <button type="button" className="card__link card__link--inline" onClick={() => onNavigate('planning')}>
              Planning <Icon name="arrowRight" size={14} />
            </button>
          </div>
          <div className="week-strip">
            {Array.from({ length: 7 }, (_, index) => {
              const iso = addDays(todayISO(), index)
              const count = data.tasks.filter((task) => task.status !== 'done' && task.dueDate === iso).length
              const day = new Date(iso + 'T00:00:00')
              return (
                <div className={`day-chip ${count ? 'has-work' : ''}`} key={iso}>
                  <span>
                    {new Intl.DateTimeFormat('fr-FR', { weekday: 'short' }).format(day).replace('.', '')}
                  </span>
                  <strong>{day.getDate()}</strong>
                  <small>{count ? `${count} travail${count > 1 ? 'x' : ''}` : 'libre'}</small>
                </div>
              )
            })}
          </div>

          <div className="plan-preview">
            <div className="plan-preview__head">
              <h3>Plan conseillé aujourd’hui</h3>
              <span>{minutesToLabel(todayPlanMinutes)} · {todayPlan.length} tâche{todayPlan.length > 1 ? 's' : ''}</span>
            </div>
            {todayPlan.length ? (
              <ol className="plan-preview__list">
                {todayPlan.slice(0, 3).map((task) => (
                  <li key={task.id}>
                    <span className="plan-preview__bullet" style={{ background: task.subject?.color }} />
                    <span>{task.title}</span>
                    <em>{minutesToLabel(task.estimatedMinutes)}</em>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="muted">Rien de prévu : choisis une matière à consolider dans le planning.</p>
            )}
          </div>
        </section>

        <section className="card">
          <div className="card__header">
            <h2 className="card__title">
              <Icon name="grades" size={18} /> Moyennes par matière
            </h2>
            <button type="button" className="card__link card__link--inline" onClick={() => onNavigate('grades')}>
              Détail <Icon name="arrowRight" size={14} />
            </button>
          </div>
          <div className="subject-bars">
            {[...stats]
              .sort((a, b) => (b.average ?? -1) - (a.average ?? -1))
              .slice(0, 6)
              .map((stat) => (
                <div className="bar-row" key={stat.subject.id}>
                  <span className="bar-row__label">
                    <span className="subject-dot" style={{ background: stat.subject.color }} />
                    {stat.subject.name}
                  </span>
                  <span className="bar-row__track">
                    <span
                      className="bar-row__fill"
                      style={{
                        width: `${stat.average == null ? 0 : (stat.average / 20) * 100}%`,
                        background: stat.subject.color,
                      }}
                    />
                  </span>
                  <span className={`bar-row__value ${stat.average != null && stat.average < 10 ? 'is-low' : ''}`}>
                    {stat.average == null ? '—' : formatAverage(stat.average)}
                  </span>
                </div>
              ))}
          </div>
        </section>

        <section className="card card--accent">
          <div className="progress-block">
            <ProgressRing value={completionRate} size={104} stroke={9} sublabel="terminé" />
            <div>
              <h3>Progression de la semaine</h3>
              <p>
                {completionRate}% de tes travaux sont terminés. Objectif de moyenne&nbsp;:{' '}
                {settings.goal}/20{' '}
                {goalGap != null && average.revealed && (
                  <strong className={goalGap <= 0 ? 'text-success' : ''}>
                    {goalGap <= 0
                      ? '— objectif atteint 🎉'
                      : `— encore ${formatAverage(Math.abs(goalGap))} pt à gagner`}
                  </strong>
                )}
              </p>
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => onNavigate('planning')}>
                <Icon name="target" size={16} /> Créer mon plan de révision
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

function KpiCard({ icon, label, value, hint, tone = 'indigo', suffix }) {
  return (
    <div className={`kpi kpi--${tone}`}>
      <span className="kpi__icon">
        <Icon name={icon} size={18} />
      </span>
      <div>
        <span className="kpi__label">{label}</span>
        <p className="kpi__value">
          {value}
          {suffix && <small>{suffix}</small>}
        </p>
        <span className="kpi__hint">{hint}</span>
      </div>
    </div>
  )
}
