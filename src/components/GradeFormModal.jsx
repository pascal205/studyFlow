import { useEffect, useState } from 'react'
import { Icon, Modal } from './ui'
import { todayISO } from '../lib/utils'

const empty = () => ({
  subjectId: '',
  title: '',
  score: '',
  max: 20,
  coefficient: 1,
  date: todayISO(),
})

export function GradeFormModal({ open, onClose, onSubmit, subjects, initial, defaultSubjectId }) {
  const [form, setForm] = useState(empty)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setError('')
    setForm(initial ? { ...empty(), ...initial } : { ...empty(), subjectId: defaultSubjectId || subjects[0]?.id || '' })
  }, [open, initial, defaultSubjectId, subjects])

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const submit = (event) => {
    event.preventDefault()
    if (!form.subjectId) return setError('Choisis une matière.')
    if (!form.title.trim()) return setError('Donne un intitulé à l’évaluation.')
    if (form.score === '' || Number.isNaN(Number(form.score))) return setError('Saisis une note.')
    if (Number(form.score) < 0 || Number(form.score) > Number(form.max))
      return setError('La note doit être comprise entre 0 et le barème.')
    onSubmit({
      ...form,
      title: form.title.trim(),
      score: Number(form.score),
      max: Number(form.max) || 20,
      coefficient: Number(form.coefficient) || 1,
    })
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Modifier la note' : 'Ajouter une note'}
      subtitle="Les moyennes sont pondérées par le coefficient de chaque évaluation."
    >
      <form className="form" onSubmit={submit}>
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
            <span className="field__label">Date</span>
            <input type="date" value={form.date} onChange={(event) => update('date', event.target.value)} />
          </label>
        </div>

        <label className="field">
          <span className="field__label">Intitulé</span>
          <input
            autoFocus
            type="text"
            placeholder="Ex. DS n°3 — probabilités"
            value={form.title}
            onChange={(event) => update('title', event.target.value)}
          />
        </label>

        <div className="form__grid form__grid--3">
          <label className="field">
            <span className="field__label">Note</span>
            <input
              type="number"
              step="0.25"
              min="0"
              value={form.score}
              onChange={(event) => update('score', event.target.value)}
            />
          </label>
          <label className="field">
            <span className="field__label">Barème</span>
            <select value={form.max} onChange={(event) => update('max', event.target.value)}>
              <option value={20}>sur 20</option>
              <option value={10}>sur 10</option>
              <option value={40}>sur 40</option>
              <option value={100}>sur 100</option>
            </select>
          </label>
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
        </div>

        {error && <p className="form__error">{error}</p>}

        <div className="form__actions">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Annuler
          </button>
          <button type="submit" className="btn btn--primary">
            <Icon name="check" size={18} /> {initial ? 'Enregistrer' : 'Ajouter la note'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
