import { useEffect, useRef, useState } from 'react'
import { Icon } from './ui'
import { exportGradesExcel, exportGradesPdf, exportGradesWord } from '../lib/gradeExport'

const FORMATS = [
  {
    id: 'xlsx',
    label: 'Excel (.xlsx)',
    description: 'Modifiable · synthèse + détail des notes',
    icon: 'grades',
    tone: 'excel',
    run: exportGradesExcel,
  },
  {
    id: 'docx',
    label: 'Word (.docx)',
    description: 'Modifiable · tableau mis en forme',
    icon: 'book',
    tone: 'word',
    run: exportGradesWord,
  },
  {
    id: 'pdf',
    label: 'PDF (.pdf)',
    description: 'Prêt à imprimer · non modifiable',
    icon: 'download',
    tone: 'pdf',
    run: exportGradesPdf,
  },
]

export function ExportMenu({ model }) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState('')
  const [notice, setNotice] = useState(null)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const onPointerDown = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) setOpen(false)
    }
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  useEffect(() => {
    if (!notice) return undefined
    const timer = window.setTimeout(() => setNotice(null), 6000)
    return () => window.clearTimeout(timer)
  }, [notice])

  const handleExport = async (format) => {
    if (busy) return
    setOpen(false)
    setBusy(format.id)
    setNotice(null)
    try {
      await format.run(model)
      setNotice({ tone: 'success', text: `${format.label} téléchargé.` })
    } catch (error) {
      setNotice({
        tone: 'error',
        text: `Export impossible : ${error?.message || 'réessaie dans un instant.'}`,
      })
    } finally {
      setBusy('')
    }
  }

  const busyFormat = FORMATS.find((format) => format.id === busy)

  return (
    <div className="export-menu" ref={containerRef}>
      <button
        type="button"
        className="btn btn--ghost"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={Boolean(busy)}
      >
        {busy ? (
          <>
            <span className="spinner spinner--brand" /> Export…
          </>
        ) : (
          <>
            <Icon name="download" size={18} /> Exporter
            <Icon name="chevron" size={14} className={`export-menu__chevron ${open ? 'is-open' : ''}`} />
          </>
        )}
      </button>

      {open && (
        <div className="export-menu__panel" role="menu" aria-label="Choisir un format d’export">
          <p className="export-menu__hint">
            Tableau complet · 2 lignes vides par matière pour ajouter des notes à la main.
          </p>
          {FORMATS.map((format) => (
            <button
              type="button"
              role="menuitem"
              className="export-menu__item"
              key={format.id}
              onClick={() => handleExport(format)}
            >
              <span className={`export-menu__icon is-${format.tone}`}>
                <Icon name={format.icon} size={16} />
              </span>
              <span>
                <strong>{format.label}</strong>
                <small>{format.description}</small>
              </span>
            </button>
          ))}
        </div>
      )}

      {notice && (
        <p className={`export-notice export-notice--${notice.tone}`} role="status">
          {notice.text}
        </p>
      )}

      {busyFormat && <span className="sr-only">Export {busyFormat.label} en cours</span>}
    </div>
  )
}
