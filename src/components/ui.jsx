import { useEffect } from 'react'

const ICONS = {
  dashboard: ['M4 10.5 12 4l8 6.5', 'M6 9.5V20h12V9.5', 'M10 20v-5h4v5'],
  tasks: ['M4 6h7', 'M4 12h7', 'M4 18h7', 'm15.5 6.5 2 2 3.5-3.5', 'm15.5 15.5 2 2 3.5-3.5'],
  grades: ['M4 20V9', 'M10 20V4', 'M16 20v-7', 'M22 20H2'],
  calendar: ['M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z', 'M8 3v4', 'M16 3v4', 'M4 10h16'],
  book: ['M5 4.5A2.5 2.5 0 0 1 7.5 2H19v20H7.5A2.5 2.5 0 0 1 5 19.5z', 'M5 17.5A2.5 2.5 0 0 1 7.5 15H19'],
  compass: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'm15.5 8.5-2 5-5 2 2-5z'],
  plus: ['M12 5v14', 'M5 12h14'],
  check: ['m5 12.5 4.5 4.5L19 7'],
  x: ['M6 6l12 12', 'M18 6 6 18'],
  trash: ['M4 7h16', 'M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2', 'M6 7l1 13h10l1-13', 'M10 11v6', 'M14 11v6'],
  pencil: ['M4 20h4l10-10a2.5 2.5 0 0 0-3.5-3.5L4 16.5z', 'M14.5 6.5 17.5 9.5'],
  clock: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M12 7v5l3.5 2'],
  sparkles: ['M12 3l1.7 4.8L18.5 9.5l-4.8 1.7L12 16l-1.7-4.8L5.5 9.5l4.8-1.7z', 'M18 15.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z'],
  sun: ['M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z', 'M12 2v2', 'M12 20v2', 'M4 12H2', 'M22 12h-2', 'm5 5 1.5 1.5', 'm17.5 17.5 1.5 1.5', 'm19 5-1.5 1.5', 'm6.5 17.5-1.5 1.5'],
  moon: ['M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z'],
  search: ['M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z', 'm21 21-4.5-4.5'],
  flag: ['M5 21V4', 'M5 5h10l-1.5 4L15 13H5'],
  target: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9z', 'M12 13.2a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4z'],
  arrowRight: ['M5 12h14', 'm13 6 6 6-6 6'],
  alert: ['M12 3 2.5 20h19z', 'M12 9v5', 'M12 17h.01'],
  menu: ['M4 7h16', 'M4 12h16', 'M4 17h16'],
  download: ['M12 3v12', 'm7 10 5 5 5-5', 'M4 20h16'],
  upload: ['M12 17V5', 'm7 10 5-5 5 5', 'M4 20h16'],
  trello: ['M4 5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z', 'M8 8h3v8H8z', 'M14 8h2v5h-2z'],
  refresh: ['M20 11a8 8 0 1 0-2.5 6.5', 'M20 5v6h-6'],
  chevron: ['m9 6 6 6-6 6'],
  eye: ['M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z', 'M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z'],
  eyeOff: ['M3 3l18 18', 'M10.6 6.2A9.7 9.7 0 0 1 12 6c6.5 0 10 6 10 6a17.9 17.9 0 0 1-3.3 4', 'M6.3 7.3A18 18 0 0 0 2 12s3.5 6 10 6a9.7 9.7 0 0 0 4.1-.9', 'M9.9 9.9a3 3 0 0 0 4.2 4.2'],
  lock: ['M6 10.5h12a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8.5a1 1 0 0 1 1-1z', 'M8 10.5V7a4 4 0 0 1 8 0v3.5', 'M12 15v3'],
  user: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M4.5 21a7.5 7.5 0 0 1 15 0'],
  logout: ['M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3', 'M10 8l-4 4 4 4', 'M6 12h10'],
  archive: ['M4 7h16', 'M6 7v12a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7', 'M9 4h6l1 3H8z', 'M10 12h4'],
  install: ['M12 4v10', 'm8 10 4 4 4-4', 'M4 18v1a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1'],
  mail: ['M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z', 'm3.5 7 8.5 6 8.5-6'],
  shield: ['M12 21c4.5-2 7-5.5 7-10V6l-7-3-7 3v5c0 4.5 2.5 8 7 10z', 'm9 12 2 2 4-4'],
}

export function Icon({ name, size = 20, strokeWidth = 1.8, className = '' }) {
  const paths = ICONS[name] ?? ICONS.sparkles
  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths.map((d) => (
        <path d={d} key={d} />
      ))}
    </svg>
  )
}

export function Modal({ open, title, subtitle, onClose, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!open) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="modal-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className={`modal modal--${size}`} role="dialog" aria-modal="true" aria-label={title}>
        <header className="modal__header">
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Fermer">
            <Icon name="x" />
          </button>
        </header>
        <div className="modal__body">{children}</div>
        {footer && <footer className="modal__footer">{footer}</footer>}
      </div>
    </div>
  )
}

export function Badge({ children, tone = 'neutral', className = '', style }) {
  return (
    <span className={`badge badge--${tone} ${className}`} style={style}>
      {children}
    </span>
  )
}

export function ProgressRing({ value = 0, size = 116, stroke = 10, color = 'var(--primary)', label, sublabel }) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(100, value))
  const offset = circumference - (clamped / 100) * circumference

  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle className="ring__track" cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} fill="none" />
        <circle
          className="ring__value"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="ring__label">
        <strong>{label ?? `${Math.round(clamped)}%`}</strong>
        {sublabel && <span>{sublabel}</span>}
      </div>
    </div>
  )
}

export function PriorityMeter({ priority, showScore = true }) {
  return (
    <div className="priority" title={priority.explanation}>
      <div className="priority__bar">
        <span style={{ width: `${Math.max(6, priority.score)}%`, background: priority.color }} />
      </div>
      <span className="priority__label" style={{ color: priority.color }}>
        {priority.label}
        {showScore && <em>{priority.score}</em>}
      </span>
    </div>
  )
}

export function EmptyState({ icon = 'sparkles', title, description, action }) {
  return (
    <div className="empty">
      <div className="empty__icon">
        <Icon name={icon} size={26} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  )
}

export function ColorDot({ color, size = 10 }) {
  return <span className="color-dot" style={{ background: color, width: size, height: size }} />
}

export function Field({ label, hint, children, className = '' }) {
  return (
    <label className={`field ${className}`}>
      <span className="field__label">{label}</span>
      {children}
      {hint && <span className="field__hint">{hint}</span>}
    </label>
  )
}
