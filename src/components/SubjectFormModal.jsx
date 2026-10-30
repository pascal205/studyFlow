import { useEffect, useState } from 'react'
import { Icon, Modal } from './ui'
import { SUBJECT_COLORS } from '../data/seed'

const empty = () => ({ name: '', coefficient: 2, teacher: '', color: SUBJECT_COLORS[0] })

export function SubjectFormModal({ open, onClose, onSubmit, initial }) {
  const [form, setForm] = useState(empty)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setError('')
    setForm(initial ? { ...initial } : { ...empty(), color: SUBJECT_COLORS[Math.floor(Math.random() * SUBJECT_COLORS.length)] })
  }, [open, initial])

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const submit = (event) => {
    event.preventDefault()
    if (!form.name.trim()) return setError('Indique le nom de la matière.')
    onSubmit({ ...form, name: form.name.trim(), coefficient: Number(form.coefficient) || 1 })
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Modifier la matière' : 'Nouvelle matière'}
      subtitle="Le coefficient sert à pondérer la moyenne générale."
    >
      <form className="form" onSubmit={submit}>
        <label className="field">
          <span className="field__label">Nom de la matière</span>
          <input
            autoFocus
            type="text"
            placeholder="Ex. Sciences économiques"
            value={form.name}
            onChange={(event) => update('name', event.target.value)}
          />
        </label>

        <div className="form__grid">
          <label className="field">
            <span className="field__label">Coefficient</span>
            <input
              type="number"
              min="0.5"
              step="0.5"
              value={form.coefficient}
              onChange={(event) => update('coefficient', event.target.value)}
            />
          </label>
          <label className="field">
            <span className="field__label">Professeur (optionnel)</span>
            <input
              type="text"
              placeholder="Ex. Mme Martin"
              value={form.teacher || ''}
              onChange={(event) => update('teacher', event.target.value)}
            />
          </label>
        </div>

        <fieldset className="field field--fieldset">
          <legend className="field__label">Couleur</legend>
          <div className="color-picker">
            {SUBJECT_COLORS.map((color) => (
              <button
                type="button"
                key={color}
                className={`color-picker__swatch ${form.color === color ? 'is-active' : ''}`}
                style={{ background: color }}
                onClick={() => update('color', color)}
                aria-label={`Couleur ${color}`}
                aria-pressed={form.color === color}
              />
            ))}
          </div>
        </fieldset>

        {error && <p className="form__error">{error}</p>}

        <div className="form__actions">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Annuler
          </button>
          <button type="submit" className="btn btn--primary">
            <Icon name="check" size={18} /> {initial ? 'Enregistrer' : 'Créer la matière'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
