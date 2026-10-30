import { Icon } from './ui'
import { formatAverage } from '../lib/grades'

const NAV = [
  { key: 'dashboard', label: 'Tableau de bord', icon: 'dashboard' },
  { key: 'tasks', label: 'Devoirs & contrôles', icon: 'tasks' },
  { key: 'planning', label: 'Planning', icon: 'calendar' },
  { key: 'grades', label: 'Notes', icon: 'grades' },
  { key: 'subjects', label: 'Matières', icon: 'book' },
  { key: 'guide', label: 'Guide & méthode', icon: 'compass' },
]

export function Sidebar({ page, onNavigate, counts, generalAverage, settings, onOpenSettings }) {
  const initials = (settings.studentName || 'Élève')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand__mark">S</span>
        <div>
          <strong>StudyFlow</strong>
          <span>Organise • Révise • Progresse</span>
        </div>
      </div>

      <nav className="sidebar__nav" aria-label="Navigation principale">
        {NAV.map((item) => (
          <button
            type="button"
            key={item.key}
            className={`nav-item ${page === item.key ? 'is-active' : ''}`}
            onClick={() => onNavigate(item.key)}
            aria-current={page === item.key ? 'page' : undefined}
          >
            <Icon name={item.icon} />
            <span>{item.label}</span>
            {counts[item.key] > 0 && <b className="nav-item__count">{counts[item.key]}</b>}
          </button>
        ))}
      </nav>

      <div className="sidebar__footer">
        <button type="button" className="profile-card" onClick={onOpenSettings}>
          <span className="avatar">{initials}</span>
          <span className="profile-card__text">
            <strong>{settings.studentName || 'Élève'}</strong>
            <small>{settings.className || 'Ma scolarité'}</small>
          </span>
          <span className="profile-card__avg">
            {settings.revealAverage && generalAverage != null ? formatAverage(generalAverage) : '—'}
            <small>
              {generalAverage == null ? 'aucune note' : settings.revealAverage ? '/20' : 'masquée'}
            </small>
          </span>
        </button>
        <p className="sidebar__tip">
          <Icon name="sparkles" size={14} /> Tes données restent sur cet appareil.
        </p>
      </div>
    </aside>
  )
}
