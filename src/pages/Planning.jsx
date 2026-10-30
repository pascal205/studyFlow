import { useMemo, useState } from 'react'
import { Badge, EmptyState, Icon } from '../components/ui'
import { buildDayPlan } from '../lib/coach'
import { minutesToLabel } from '../lib/utils'
import { useDerived } from '../store/derived'
import { addDays, dueLabel, formatDate, formatLongDate, minutesToTime, parseDate, timeToMinutes, todayISO } from '../lib/utils'

const REVISION_STEPS = [
  'Relire le cours et repérer les notions clés',
  'Faire une fiche + rappel actif sans le cours',
  'S’entraîner sur des exercices / annales',
  'S’auto-évaluer en conditions réelles (sans notes)',
  'Revoir uniquement les erreurs et les points fragiles',
]

export function Planning({ onNewTask }) {
  const { tasks, settings, actions } = useDerived()
  const [startTime, setStartTime] = useState(settings.startTime || '17:00')
  const [budget, setBudget] = useState(settings.dailyMinutes || 90)

  const openTasks = tasks.filter((task) => task.status !== 'done')
  const plan = useMemo(
    () => buildDayPlan(openTasks, { startTime, budget, maxPerTask: 45 }),
    [openTasks, startTime, budget],
  )

  const upcoming = useMemo(
    () =>
      [...openTasks]
        .filter((task) => task.priority.days >= 0 && task.priority.days <= 21)
        .sort((a, b) => a.priority.days - b.priority.days)
        .slice(0, 12),
    [openTasks],
  )
  const [selectedId, setSelectedId] = useState('')
  const selected = upcoming.find((task) => task.id === selectedId) ?? upcoming[0] ?? null

  const revisionPlan = selected ? buildRevisionPlan(selected, startTime) : []

  const week = Array.from({ length: 7 }, (_, index) => {
    const iso = addDays(todayISO(), index)
    const dayTasks = openTasks
      .filter((task) => task.dueDate === iso)
      .sort((a, b) => b.priority.score - a.priority.score)
    const minutes = dayTasks.reduce((sum, task) => sum + task.estimatedMinutes, 0)
    return { iso, dayTasks, minutes, date: parseDate(iso) }
  })

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Organisation</p>
          <h1>Planning de travail</h1>
          <p className="subtitle">
            Un plan réaliste, généré à partir de tes priorités et du temps dont tu disposes.
          </p>
        </div>
        <div className="page-header__actions">
          <button type="button" className="btn btn--primary" onClick={onNewTask}>
            <Icon name="plus" size={18} /> Nouveau travail
          </button>
        </div>
      </header>

      <div className="planning-grid">
        <section className="card">
          <div className="card__header">
            <h2 className="card__title">
              <Icon name="clock" size={18} /> Ma session du jour
            </h2>
            <span className="card__hint">{formatLongDate(todayISO())}</span>
          </div>

          <div className="plan-controls">
            <label className="field">
              <span className="field__label">Je commence à</span>
              <input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} />
            </label>
            <label className="field field--range">
              <span className="field__label">
                Temps disponible <strong>{minutesToLabel(budget)}</strong>
              </span>
              <input
                type="range"
                min="30"
                max="240"
                step="15"
                value={budget}
                onChange={(event) => setBudget(Number(event.target.value))}
              />
            </label>
            <div className="plan-controls__summary">
              <div>
                <strong>{minutesToLabel(plan.plannedMinutes)}</strong>
                <span>planifiées</span>
              </div>
              <div>
                <strong>{plan.deferredCount}</strong>
                <span>reportées</span>
              </div>
              <div>
                <strong>{plan.endTime}</strong>
                <span>fin estimée</span>
              </div>
            </div>
          </div>

          {plan.items.length ? (
            <ol className="timeline">
              {plan.items.map((item, index) =>
                item.kind === 'break' ? (
                  <li className="timeline__break" key={`break-${index}`}>
                    <span className="timeline__time">
                      {item.startTime} – {item.endTime}
                    </span>
                    <span className="timeline__dot" />
                    <span className="timeline__content">Pause · 5 min pour souffler</span>
                  </li>
                ) : (
                  <li className="timeline__item" key={item.task.id}>
                    <span className="timeline__time">
                      {item.startTime} – {item.endTime}
                    </span>
                    <span className="timeline__dot" style={{ background: item.task.subject?.color ?? '#94a3b8' }} />
                    <div className="timeline__content">
                      <div className="timeline__title">
                        {item.task.title}
                        {item.partial && <Badge tone="info">partie 1/2</Badge>}
                      </div>
                      <div className="timeline__meta">
                        {item.task.subject?.name} · {item.minutes} min · priorité {item.task.priority.score}
                        <button
                          type="button"
                          className="link"
                          onClick={() => actions.setTaskStatus(item.task.id, 'done')}
                        >
                          <Icon name="check" size={13} /> terminé
                        </button>
                      </div>
                    </div>
                  </li>
                ),
              )}
            </ol>
          ) : (
            <EmptyState
              icon="clock"
              title="Pas de session à générer"
              description="Ajoute des travaux à faire : StudyFlow remplira automatiquement ton créneau avec les bonnes priorités."
              action={
                <button type="button" className="btn btn--primary" onClick={onNewTask}>
                  <Icon name="plus" size={18} /> Ajouter un travail
                </button>
              }
            />
          )}

          {plan.deferredCount > 0 && (
            <p className="plan-note">
              <Icon name="alert" size={15} /> {plan.deferredCount} travail
              {plan.deferredCount > 1 ? 'x' : ''} ne rentre{plan.deferredCount > 1 ? 'nt' : ''} pas dans le temps
              disponible : garde-les pour demain ou augmente la durée de session.
            </p>
          )}
        </section>

        <section className="card">
          <div className="card__header">
            <h2 className="card__title">
              <Icon name="sparkles" size={18} /> Plan de révision ciblé
            </h2>
          </div>
          {upcoming.length ? (
            <>
              <label className="field">
                <span className="field__label">Évaluation à préparer</span>
                <select value={selected?.id ?? ''} onChange={(event) => setSelectedId(event.target.value)}>
                  {upcoming.map((task) => (
                    <option key={task.id} value={task.id}>
                      {task.title} — {dueLabel(task.dueDate)}
                    </option>
                  ))}
                </select>
              </label>

              {selected && (
                <>
                  <div className="revision-head">
                    <span className="subject-chip" style={{ '--chip': selected.subject?.color ?? '#94a3b8' }}>
                      <span className="subject-chip__dot" />
                      {selected.subject?.name}
                    </span>
                    <Badge tone={selected.priority.days <= 2 ? 'danger' : 'warning'}>
                      {dueLabel(selected.dueDate)}
                    </Badge>
                    <span className="muted">Score de priorité {selected.priority.score}/100</span>
                  </div>
                  <ol className="revision-steps">
                    {revisionPlan.map((session, index) => (
                      <li key={`${session.date}-${index}`}>
                        <span className="revision-steps__date">
                          <strong>{formatDate(session.date)}</strong>
                          <em>{session.time}</em>
                        </span>
                        <span className="revision-steps__body">
                          <strong>{REVISION_STEPS[index % REVISION_STEPS.length]}</strong>
                          <small>{session.minutes} min · {session.why}</small>
                        </span>
                      </li>
                    ))}
                  </ol>
                  <p className="plan-note plan-note--calm">
                    <Icon name="target" size={15} /> Étale les sessions : la répétition espacée est plus efficace qu’une
                    révision unique la veille.
                  </p>
                </>
              )}
            </>
          ) : (
            <p className="muted">Aucune évaluation à venir : ajoute une interrogation ou un contrôle pour générer un plan.</p>
          )}
        </section>
      </div>

      <section className="card">
        <div className="card__header">
          <h2 className="card__title">
            <Icon name="calendar" size={18} /> Les 7 prochains jours
          </h2>
          <span className="card__hint">Échéances regroupées par jour</span>
        </div>
        <div className="week-board">
          {week.map((day) => (
            <div className={`week-col ${day.iso === todayISO() ? 'is-today' : ''}`} key={day.iso}>
              <header className="week-col__head">
                <span>{new Intl.DateTimeFormat('fr-FR', { weekday: 'long' }).format(day.date)}</span>
                <strong>{day.date.getDate()}</strong>
                <small>{day.minutes ? minutesToLabel(day.minutes) : 'libre'}</small>
              </header>
              <div className="week-col__body">
                {day.dayTasks.map((task) => (
                  <div className="week-task" key={task.id} style={{ '--accent': task.subject?.color ?? '#94a3b8' }}>
                    <span className="week-task__type">{task.type === 'interrogation' ? '⚡' : task.type === 'controle' ? '🎯' : task.type === 'oral' ? '🎤' : task.type === 'projet' ? '🧩' : '📝'}</span>
                    <span className="week-task__title">{task.title}</span>
                    <small>{task.subject?.name}</small>
                  </div>
                ))}
                {!day.dayTasks.length && <span className="week-col__empty">—</span>}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

/** Répartit la révision d'une évaluation en sessions jusqu'à la veille. */
function buildRevisionPlan(task, startTime) {
  const days = Math.max(0, task.priority.days)
  const totalMinutes = task.estimatedMinutes || 30
  const sessionsCount = Math.max(1, Math.min(4, Math.ceil(totalMinutes / 25)))
  const start = timeToMinutes(startTime)
  const dates = []

  if (days === 0) {
    for (let i = 0; i < Math.min(2, sessionsCount); i += 1) dates.push(todayISO())
  } else {
    for (let i = 0; i < sessionsCount; i += 1) {
      const offset = Math.round((i * Math.max(1, days - 1)) / Math.max(1, sessionsCount - 1))
      const iso = addDays(todayISO(), Math.min(offset, Math.max(0, days - 1)))
      if (!dates.includes(iso)) dates.push(iso)
    }
  }

  const perDay = {}
  return dates.map((date, index) => {
    const occurrence = perDay[date] ?? 0
    perDay[date] = occurrence + 1
    return {
      date,
      time: minutesToTime(start + occurrence * 90),
      minutes: Math.max(20, Math.round(totalMinutes / dates.length)),
      why:
        index === dates.length - 1
          ? days <= 1
            ? 'dernière révision avant l’échéance'
            : 'révision finale avant l’échéance'
          : `session ${index + 1}/${dates.length} · répétition espacée`,
    }
  })
}
