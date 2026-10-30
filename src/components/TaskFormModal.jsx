import { useEffect, useState } from 'react'
import { Icon, Modal } from './ui'
import { TASK_TYPES, typeInfo } from '../lib/priority'
import { todayISO } from '../lib/utils'

const empty = () => ({
  title: '',
  subjectId: '',
  type: 'devoir',
  dueDate: todayISO(),
  estimatedMinutes: 30,
  difficulty: 3,
  status: 'todo',
  notes: '',
})

export function TaskFormModal({ open, onClose, onSubmit, subjects, initial, defaultSubjectId }) {
  const [form, setForm] = useState(empty)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setError('')
    if (initial) {
      setForm({ ...empty(), ...initial })
    } else {
      setForm({ ...empty(), subjectId: defaultSubjectId || subjects[0]?.id || '' })
    }
  }, [open, initial, defaultSubjectId, subjects])

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!form.title.trim()) {
      setError('Donne un titre à ton travail.')
      return
    }
    if (!form.subjectId) {
      setError('Choisis une matière (tu peux en créer une dans l’onglet Matières).')
      return
    }
    if (!form.dueDate) {
      setError('Indique une date d’échéance.')
      return
    }
    onSubmit({ ...form, title: form.title.trim() })
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Modifier le travail' : 'Nouveau travail'}
      subtitle="La priorité est recalculée automatiquement."
    >
      <form className="form" onSubmit={handleSubmit}>
        <label className="field">
          <span className="field__label">Titre du travail</span>
          <input
            autoFocus
            type="text"
            placeholder="Ex. Exercices p. 84, révision chapitre 3…"
            value={form.title}
            onChange={(event) => update('title', event.target.value)}
          />
        </label>

        <div className="form__grid">
          <label className="field">
            <span className="field__label">Matière</span>
            <select value={form.subjectId} onChange={(event) => update('subjectId', event.target.value)}>
              <option value="">— Choisir —</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field__label">Type</span>
            <select value={form.type} onChange={(event) => update('type', event.target.value)}>
              {TASK_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.emoji} {type.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="form__grid">
          <label className="field">
            <span className="field__label">Échéance</span>
            <input type="date" value={form.dueDate} onChange={(event) => update('dueDate', event.target.value)} />
          </label>

          <label className="field">
            <span className="field__label">Temps estimé (min)</span>
            <input
              type="number"
              min="5"
              step="5"
              value={form.estimatedMinutes}
              onChange={(event) => update('estimatedMinutes', event.target.value)}
            />
          </label>
        </div>

        <fieldset className="field field--fieldset">
          <legend className="field__label">Difficulté ressentie</legend>
          <div className="difficulty-picker">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                type="button"
                key={level}
                className={`difficulty-picker__btn ${Number(form.difficulty) === level ? 'is-active' : ''}`}
                onClick={() => update('difficulty', level)}
                aria-pressed={Number(form.difficulty) === level}
              >
                {level}
                <small>{['Facile', 'Simple', 'Moyen', 'Dur', 'Très dur'][level - 1]}</small>
              </button>
            ))}
          </div>
        </fieldset>

        <div className="form__grid">
          <label className="field">
            <span className="field__label">Statut</span>
            <select value={form.status} onChange={(event) => update('status', event.target.value)}>
              <option value="todo">À faire</option>
              <option value="doing">En cours</option>
              <option value="done">Terminé</option>
            </select>
          </label>
          <div className="priority-preview">
            <span>Priorité calculée</span>
            <strong>{typeInfo(form.type).label} · difficulté {form.difficulty}/5</strong>
            <small>Recalculée automatiquement selon l’échéance et la matière.</small>
          </div>
        </div>

        <label className="field">
          <span className="field__label">Notes / consignes (optionnel)</span>
          <textarea
            rows="3"
            placeholder="Pages, chapitres, documents à rendre…"
            value={form.notes}
            onChange={(event) => update('notes', event.target.value)}
          />
        </label>

        {error && <p className="form__error">{error}</p>}

        <div className="form__actions">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Annuler
          </button>
          <button type="submit" className="btn btn--primary">
            <Icon name="check" size={18} /> {initial ? 'Enregistrer' : 'Ajouter le travail'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
