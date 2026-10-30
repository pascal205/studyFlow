import { useMemo } from 'react'
import { Icon } from '../components/ui'
import { methodForTask } from '../lib/coach'
import { formatAverage } from '../lib/grades'
import { dueLabel, minutesToLabel } from '../lib/utils'
import { useDerived } from '../store/derived'

const WEIGHTS = [
  { label: 'Échéance', value: 40, text: 'Plus la date approche, plus la priorité grimpe.' },
  { label: 'Type de travail', value: 20, text: 'Une interrogation pèse plus qu’un devoir maison.' },
  { label: 'Difficulté ressentie', value: 14, text: 'Un chapitre difficile demande plus de temps.' },
  { label: 'Moyenne de la matière', value: 12, text: 'Une matière fragile passe devant.' },
  { label: 'Coefficient', value: 8, text: 'Les matières à fort coefficient comptent double.' },
  { label: 'Charge estimée', value: 6, text: 'Un travail long se commence plus tôt.' },
]

const METHODS = [
  {
    icon: 'sparkles',
    title: 'Rappel actif',
    text: 'Ferme le cours et récite, dessine ou explique de mémoire. Puis vérifie et corrige. C’est ce qui fait vraiment mémoriser.',
  },
  {
    icon: 'calendar',
    title: 'Répétition espacée',
    text: 'Revois une notion le jour même, à J+1, J+3 puis J+7. StudyFlow étale automatiquement tes sessions de révision.',
  },
  {
    icon: 'clock',
    title: 'Pomodoro',
    text: '25 min de travail concentré, 5 min de pause, puis une pause longue toutes les 4 sessions. Le planning les inclut.',
  },
  {
    icon: 'compass',
    title: 'Méthode Feynman',
    text: 'Explique la notion à voix haute comme à un enfant de 12 ans. Là où tu bloques, tu as trouvé ta lacune.',
  },
  {
    icon: 'target',
    title: 'Auto-évaluation',
    text: 'Fais un exercice ou un sujet chronométré sans notes. Corrige avec le cours, note tes erreurs sur une fiche.',
  },
  {
    icon: 'flag',
    title: 'Découpage des tâches',
    text: 'Un travail de 2 h se découpe en 3 sessions. La première étape doit toujours être simple pour démarrer.',
  },
]

const RULES = [
  'Écris chaque devoir dès qu’il est donné : rien dans la tête, tout dans StudyFlow.',
  'Travaille d’abord la priorité la plus haute, pas la tâche la plus facile.',
  'Commence les gros travaux au moins 5 jours avant l’échéance.',
  'Termine chaque session par une note : ce que tu sais, ce qui reste à revoir.',
  'Garde une soirée sans travail : la récupération fait partie de l’apprentissage.',
]

export function Guide({ onNavigate, onEditTask }) {
  const { sortedOpen, stats, generalAverage, settings } = useDerived()

  const actions = useMemo(() => {
    const list = sortedOpen.slice(0, 4).map((task) => ({
      id: task.id,
      title: `Travailler ${minutesToLabel(Math.min(task.estimatedMinutes, 45))} sur « ${task.title} »`,
      detail: `${task.subject?.name} · ${dueLabel(task.dueDate)} · ${methodForTask(task.type)}`,
      tone: task.priority.level === 'critique' ? 'danger' : 'info',
      task,
    }))

    const weak = [...stats].filter((stat) => stat.average != null).sort((a, b) => a.average - b.average)[0]
    if (weak && weak.average < 12) {
      list.push({
        id: 'weak-subject',
        title: `Ajouter 2 sessions de 20 min en ${weak.subject.name}`,
        detail: `Moyenne ${formatAverage(weak.average)}/20. Objectif : fiches + rappel actif, pas de simple relecture.`,
        tone: 'warning',
      })
    }

    if (!list.length) {
      list.push({
        id: 'empty',
        title: 'Planifier ta semaine',
        detail: 'Ajoute tes devoirs et interrogations : StudyFlow générera ton plan automatiquement.',
        tone: 'success',
      })
    }
    return list
  }, [sortedOpen, stats])

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Accompagnement</p>
          <h1>Guide &amp; méthode</h1>
          <p className="subtitle">
            Comprends comment StudyFlow priorise ton travail et applique les bonnes méthodes de révision.
          </p>
        </div>
        <div className="page-header__actions">
          <button type="button" className="btn btn--primary" onClick={() => onNavigate('planning')}>
            <Icon name="target" size={18} /> Voir mon planning
          </button>
        </div>
      </header>

      <div className="guide-grid">
        <section className="card guide-actions">
          <div className="card__header">
            <h2 className="card__title">
              <Icon name="sparkles" size={18} /> Ton plan d’action personnalisé
            </h2>
            <span className="card__hint">{settings.studentName} · objectif {settings.goal}/20</span>
          </div>
          <ol className="action-list">
            {actions.map((action, index) => (
              <li key={action.id} className={`action-item action-item--${action.tone}`}>
                <span className="action-item__num">{index + 1}</span>
                <div>
                  <h4>{action.title}</h4>
                  <p>{action.detail}</p>
                  {action.task && (
                    <button type="button" className="link" onClick={() => onEditTask(action.task)}>
                      Ouvrir le travail <Icon name="arrowRight" size={13} />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ol>
          <div className="guide-actions__footer">
            <div>
              <strong>
                {settings.revealAverage && generalAverage != null ? `${formatAverage(generalAverage)}/20` : '—'}
              </strong>
              <span>{settings.revealAverage ? 'moyenne actuelle' : 'moyenne non révélée'}</span>
            </div>
            <div>
              <strong>{sortedOpen.length}</strong>
              <span>travaux en attente</span>
            </div>
            <div>
              <strong>{minutesToLabel(sortedOpen.reduce((sum, task) => sum + task.estimatedMinutes, 0))}</strong>
              <span>charge totale estimée</span>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card__header">
            <h2 className="card__title">
              <Icon name="flag" size={18} /> Comment la priorité est calculée
            </h2>
          </div>
          <p className="muted">
            Chaque travail reçoit un score sur 100. Il combine six critères, pondérés ainsi :
          </p>
          <div className="weights">
            {WEIGHTS.map((weight) => (
              <div className="weight-row" key={weight.label} title={weight.text}>
                <span className="weight-row__label">{weight.label}</span>
                <span className="weight-row__track">
                  <span style={{ width: `${(weight.value / 40) * 100}%` }} />
                </span>
                <strong>{weight.value}%</strong>
              </div>
            ))}
          </div>
          <p className="plan-note plan-note--calm">
            <Icon name="sparkles" size={15} /> Résultat : un travail difficile dans une matière à fort coefficient, dû
            demain, passe devant un devoir simple à rendre dans deux semaines.
          </p>
        </section>
      </div>

      <section className="card">
        <div className="card__header">
          <h2 className="card__title">
            <Icon name="compass" size={18} /> La méthode StudyFlow en 4 étapes
          </h2>
        </div>
        <div className="steps-grid">
          {[
            {
              title: '1. Capturer',
              text: 'Ajoute chaque devoir, contrôle ou oral dès l’annonce : matière, date, temps estimé et difficulté.',
            },
            {
              title: '2. Prioriser',
              text: 'StudyFlow calcule un score sur 100 et classe les travaux du plus stratégique au moins urgent.',
            },
            {
              title: '3. Planifier',
              text: 'Le planning transforme ces priorités en sessions de 20 à 45 min adaptées à ton temps disponible.',
            },
            {
              title: '4. Réviser',
              text: 'Rappel actif, fiches, exercices, auto-évaluation : chaque type de travail a sa technique recommandée.',
            },
          ].map((step) => (
            <div className="step-card" key={step.title}>
              <h4>{step.title}</h4>
              <p>{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="guide-grid">
        <section className="card">
          <div className="card__header">
            <h2 className="card__title">
              <Icon name="book" size={18} /> Techniques qui fonctionnent
            </h2>
          </div>
          <div className="method-grid">
            {METHODS.map((method) => (
              <div className="method-card" key={method.title}>
                <span className="method-card__icon">
                  <Icon name={method.icon} size={18} />
                </span>
                <h4>{method.title}</h4>
                <p>{method.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <div className="card__header">
            <h2 className="card__title">
              <Icon name="check" size={18} /> Les règles d’or
            </h2>
          </div>
          <ul className="rules-list">
            {RULES.map((rule) => (
              <li key={rule}>
                <span className="rules-list__check">
                  <Icon name="check" size={13} strokeWidth={3} />
                </span>
                {rule}
              </li>
            ))}
          </ul>
          <div className="quote">
            <p>« Ce n’est pas le temps passé qui compte, c’est la qualité de l’attention. »</p>
            <span>— Principe de base de l’apprentissage actif</span>
          </div>
        </section>
      </div>
    </div>
  )
}
