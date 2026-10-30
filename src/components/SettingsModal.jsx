import { useEffect, useRef, useState } from 'react'
import { Icon, Modal } from './ui'
import { useStudy } from '../store/StudyStore'

export function SettingsModal({ open, onClose }) {
  const { settings, subjects, tasks, grades, actions } = useStudy()
  const [form, setForm] = useState(settings)
  const [message, setMessage] = useState('')
  const fileRef = useRef(null)

  useEffect(() => {
    if (open) {
      setForm(settings)
      setMessage('')
    }
  }, [open, settings])

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const save = () => {
    actions.updateSettings({
      ...form,
      studentName: form.studentName.trim() || 'Élève',
      dailyMinutes: Number(form.dailyMinutes) || 90,
      goal: Number(form.goal) || 14,
    })
    onClose()
  }

  const exportData = () => {
    const payload = { app: 'studyFlow', version: 1, exportedAt: new Date().toISOString(), subjects, tasks, grades, settings }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `studyflow-sauvegarde-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
    setMessage('Sauvegarde exportée.')
  }

  const importData = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result))
        if (!Array.isArray(parsed.subjects)) throw new Error('format')
        actions.importData(parsed)
        setMessage('Données importées avec succès.')
      } catch {
        setMessage('Fichier invalide : sélectionne une sauvegarde StudyFlow.')
      }
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  return (
    <Modal open={open} onClose={onClose} title="Mon profil & préférences" subtitle="Personnalise ton accompagnement StudyFlow.">
      <div className="form">
        <div className="form__grid">
          <label className="field">
            <span className="field__label">Prénom / nom</span>
            <input type="text" value={form.studentName} onChange={(event) => update('studentName', event.target.value)} />
          </label>
          <label className="field">
            <span className="field__label">Classe</span>
            <input type="text" value={form.className} onChange={(event) => update('className', event.target.value)} />
          </label>
        </div>

        <div className="form__grid form__grid--3">
          <label className="field">
            <span className="field__label">Temps de travail / jour (min)</span>
            <input
              type="number"
              min="15"
              step="15"
              value={form.dailyMinutes}
              onChange={(event) => update('dailyMinutes', event.target.value)}
            />
          </label>
          <label className="field">
            <span className="field__label">Début des révisions</span>
            <input type="time" value={form.startTime} onChange={(event) => update('startTime', event.target.value)} />
          </label>
          <label className="field">
            <span className="field__label">Moyenne visée /20</span>
            <input
              type="number"
              min="0"
              max="20"
              step="0.5"
              value={form.goal}
              onChange={(event) => update('goal', event.target.value)}
            />
          </label>
        </div>

        <fieldset className="field field--fieldset">
          <legend className="field__label">Apparence</legend>
          <div className="segmented">
            <button
              type="button"
              className={form.theme === 'light' ? 'is-active' : ''}
              onClick={() => update('theme', 'light')}
            >
              <Icon name="sun" size={16} /> Clair
            </button>
            <button
              type="button"
              className={form.theme === 'dark' ? 'is-active' : ''}
              onClick={() => update('theme', 'dark')}
            >
              <Icon name="moon" size={16} /> Sombre
            </button>
          </div>
        </fieldset>

        <div className="settings-io">
          <div>
            <h4>Sauvegarde des données</h4>
            <p>Tes données sont stockées localement. Exporte un fichier pour les retrouver ailleurs.</p>
          </div>
          <div className="settings-io__actions">
            <button type="button" className="btn btn--ghost btn--sm" onClick={exportData}>
              <Icon name="download" size={16} /> Exporter
            </button>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => fileRef.current?.click()}>
              <Icon name="upload" size={16} /> Importer
            </button>
            <input ref={fileRef} type="file" accept="application/json" hidden onChange={importData} />
          </div>
        </div>

        <div className="settings-danger">
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => {
              actions.resetData()
              setMessage('Données de démonstration restaurées.')
            }}
          >
            <Icon name="refresh" size={16} /> Réinitialiser la démo
          </button>
          <button
            type="button"
            className="btn btn--ghost btn--sm btn--danger-text"
            onClick={() => {
              actions.clearData()
              setMessage('Toutes les données ont été effacées.')
            }}
          >
            <Icon name="trash" size={16} /> Tout effacer
          </button>
        </div>

        {message && <p className="form__notice">{message}</p>}

        <div className="form__actions">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Fermer
          </button>
          <button type="button" className="btn btn--primary" onClick={save}>
            <Icon name="check" size={18} /> Enregistrer
          </button>
        </div>
      </div>
    </Modal>
  )
}
