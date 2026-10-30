import { useEffect, useState } from 'react'
import { Badge, Icon, Modal } from './ui'
import { useStudy } from '../store/StudyStore'
import { useAuth } from '../store/AuthStore'
import { createBackup, deleteBackup, formatBackupDate, listBackups } from '../lib/backups'
import { useInstallPrompt } from '../lib/useInstallPrompt'

export function SettingsModal({ open, onClose }) {
  const { settings, subjects, tasks, grades, actions } = useStudy()
  const { user, logout, changePassword, deleteAccount, updateProfileName } = useAuth()
  const { canInstall, installed, isIOS, install } = useInstallPrompt()

  const [form, setForm] = useState(settings)
  const [message, setMessage] = useState('')
  const [backups, setBackups] = useState([])
  const [backupLabel, setBackupLabel] = useState('')
  const [restoreTarget, setRestoreTarget] = useState(null)

  const [passwordOpen, setPasswordOpen] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' })
  const [passwordState, setPasswordState] = useState({ tone: '', text: '' })
  const [passwordBusy, setPasswordBusy] = useState(false)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    setForm({ ...settings })
    setMessage('')
    setBackups(user ? listBackups(user.id) : [])
    setBackupLabel('')
    setRestoreTarget(null)
    setPasswordOpen(false)
    setPasswordForm({ current: '', next: '', confirm: '' })
    setPasswordState({ tone: '', text: '' })
    setDeleteOpen(false)
    setDeletePassword('')
    setDeleteError('')
    setResetOpen(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const update = (key, value) => setForm((previous) => ({ ...previous, [key]: value }))

  const save = () => {
    const name = form.studentName.trim() || 'Élève'
    actions.updateSettings({
      ...form,
      studentName: name,
      dailyMinutes: Number(form.dailyMinutes) || 90,
      goal: Number(form.goal) || 14,
    })
    if (user) updateProfileName(name)
    onClose()
  }

  /* ------------------------------------------------------------- Sauvegardes */

  const refreshBackups = () => setBackups(user ? listBackups(user.id) : [])

  const handleCreateBackup = () => {
    if (!user) return
    try {
      createBackup(user.id, { subjects, tasks, grades, settings }, backupLabel)
      setBackupLabel('')
      refreshBackups()
      setMessage('Sauvegarde enregistrée dans ton espace profil.')
    } catch (error) {
      setMessage(error.message)
    }
  }

  const handleRestore = () => {
    if (!restoreTarget || !user) return
    // Sécurité : on sauvegarde l'état actuel avant de le remplacer.
    try {
      createBackup(user.id, { subjects, tasks, grades, settings }, 'Avant restauration')
    } catch {
      /* la sauvegarde de sécurité est optionnelle */
    }
    actions.importData(restoreTarget.payload)
    setMessage(`Sauvegarde « ${restoreTarget.label} » restaurée.`)
    setRestoreTarget(null)
    refreshBackups()
  }

  const handleDeleteBackup = (backup) => {
    if (!user) return
    deleteBackup(user.id, backup.id)
    refreshBackups()
    if (restoreTarget?.id === backup.id) setRestoreTarget(null)
    setMessage('Sauvegarde supprimée.')
  }

  /* ---------------------------------------------------------------- Compte */

  const submitPassword = async (event) => {
    event.preventDefault()
    setPasswordState({ tone: '', text: '' })
    if (passwordForm.next.length < 8) {
      return setPasswordState({ tone: 'error', text: 'Le nouveau mot de passe doit contenir 8 caractères minimum.' })
    }
    if (passwordForm.next !== passwordForm.confirm) {
      return setPasswordState({ tone: 'error', text: 'Les deux nouveaux mots de passe ne correspondent pas.' })
    }
    setPasswordBusy(true)
    try {
      await changePassword(passwordForm.current, passwordForm.next)
      setPasswordForm({ current: '', next: '', confirm: '' })
      setPasswordState({ tone: 'success', text: 'Mot de passe mis à jour.' })
    } catch (error) {
      setPasswordState({ tone: 'error', text: error.message })
    } finally {
      setPasswordBusy(false)
    }
  }

  const submitDelete = async (event) => {
    event.preventDefault()
    setDeleteError('')
    setDeleteBusy(true)
    try {
      await deleteAccount(deletePassword)
    } catch (error) {
      setDeleteError(error.message)
      setDeleteBusy(false)
    }
  }

  const initials = (user?.name || settings.studentName || 'Élève')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Mon profil & préférences"
      subtitle="Compte local, sauvegardes et personnalisation de ton accompagnement."
    >
      <div className="form">
        {/* --------------------------------------------------------- Compte */}
        <section className="settings-section">
          <h3 className="settings-section__title">
            <Icon name="user" size={16} /> Mon compte
          </h3>
          <div className="settings-account">
            <div className="settings-account__row">
              <span className="avatar">{initials}</span>
              <div className="settings-account__identity">
                <strong>{user?.name || settings.studentName}</strong>
                <small>
                  <Icon name="mail" size={13} /> {user?.email || '—'}
                </small>
              </div>
              <Badge tone="success">
                <Icon name="shield" size={12} /> Compte local
              </Badge>
            </div>
            <div className="settings-account__actions">
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => setPasswordOpen((value) => !value)}
              >
                <Icon name="lock" size={15} /> Changer le mot de passe
              </button>
              <button type="button" className="btn btn--ghost btn--sm" onClick={logout}>
                <Icon name="logout" size={15} /> Se déconnecter
              </button>
            </div>

            {passwordOpen && (
              <form className="password-form" onSubmit={submitPassword}>
                <label className="field">
                  <span className="field__label">Mot de passe actuel</span>
                  <input
                    type="password"
                    autoComplete="current-password"
                    value={passwordForm.current}
                    onChange={(event) =>
                      setPasswordForm((previous) => ({ ...previous, current: event.target.value }))
                    }
                  />
                </label>
                <div className="form__grid">
                  <label className="field">
                    <span className="field__label">Nouveau mot de passe</span>
                    <input
                      type="password"
                      autoComplete="new-password"
                      value={passwordForm.next}
                      onChange={(event) => setPasswordForm((previous) => ({ ...previous, next: event.target.value }))}
                    />
                  </label>
                  <label className="field">
                    <span className="field__label">Confirmation</span>
                    <input
                      type="password"
                      autoComplete="new-password"
                      value={passwordForm.confirm}
                      onChange={(event) =>
                        setPasswordForm((previous) => ({ ...previous, confirm: event.target.value }))
                      }
                    />
                  </label>
                </div>
                {passwordState.text && (
                  <p className={passwordState.tone === 'error' ? 'form__error' : 'form__notice'}>
                    {passwordState.text}
                  </p>
                )}
                <div className="form__actions">
                  <button type="button" className="btn btn--ghost btn--sm" onClick={() => setPasswordOpen(false)}>
                    Annuler
                  </button>
                  <button type="submit" className="btn btn--primary btn--sm" disabled={passwordBusy}>
                    {passwordBusy ? 'Enregistrement…' : 'Enregistrer le mot de passe'}
                  </button>
                </div>
              </form>
            )}

            <button
              type="button"
              className="link link--danger settings-account__delete"
              onClick={() => setDeleteOpen((value) => !value)}
            >
              Supprimer mon compte et mes données
            </button>

            {deleteOpen && (
              <form className="delete-form" onSubmit={submitDelete}>
                <p>
                  Cette action supprime définitivement ton compte, tes travaux, tes notes et tes sauvegardes de cet
                  appareil. Saisis ton mot de passe pour confirmer.
                </p>
                <label className="field">
                  <span className="field__label">Mot de passe</span>
                  <input
                    type="password"
                    autoComplete="current-password"
                    value={deletePassword}
                    onChange={(event) => setDeletePassword(event.target.value)}
                  />
                </label>
                {deleteError && <p className="form__error">{deleteError}</p>}
                <div className="form__actions">
                  <button type="button" className="btn btn--ghost btn--sm" onClick={() => setDeleteOpen(false)}>
                    Annuler
                  </button>
                  <button type="submit" className="btn btn--danger btn--sm" disabled={deleteBusy || !deletePassword}>
                    {deleteBusy ? 'Suppression…' : 'Confirmer la suppression'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>

        {/* --------------------------------------------------------- Profil */}
        <section className="settings-section">
          <h3 className="settings-section__title">
            <Icon name="compass" size={16} /> Mon profil d’élève
          </h3>
          <div className="form__grid">
            <label className="field">
              <span className="field__label">Prénom / nom affiché</span>
              <input
                type="text"
                value={form.studentName}
                onChange={(event) => update('studentName', event.target.value)}
              />
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
        </section>

        {/* ------------------------------------------------------ Sauvegardes */}
        <section className="settings-section">
          <h3 className="settings-section__title">
            <Icon name="archive" size={16} /> Mes sauvegardes
          </h3>
          <p className="settings-section__hint">
            Tes sauvegardes sont conservées ici, dans ton espace profil. Aucun fichier à retrouver sur ton ordinateur :
            tu peux restaurer un état en un clic.
          </p>

          <div className="backup-create">
            <input
              type="text"
              placeholder="Nom de la sauvegarde (optionnel)"
              value={backupLabel}
              onChange={(event) => setBackupLabel(event.target.value)}
            />
            <button type="button" className="btn btn--primary btn--sm" onClick={handleCreateBackup}>
              <Icon name="plus" size={15} /> Créer une sauvegarde
            </button>
          </div>

          {backups.length ? (
            <ul className="backup-list">
              {backups.map((backup) => (
                <li className="backup-item" key={backup.id}>
                  <span className="backup-item__icon">
                    <Icon name="archive" size={16} />
                  </span>
                  <div className="backup-item__body">
                    <strong>{backup.label}</strong>
                    <small>
                      {formatBackupDate(backup.createdAt)} · {backup.counts.tasks} travaux · {backup.counts.grades}{' '}
                      notes · {backup.counts.subjects} matières
                    </small>
                  </div>
                  <div className="backup-item__actions">
                    {restoreTarget?.id === backup.id ? (
                      <>
                        <button type="button" className="btn btn--danger btn--sm" onClick={handleRestore}>
                          Confirmer
                        </button>
                        <button type="button" className="btn btn--ghost btn--sm" onClick={() => setRestoreTarget(null)}>
                          Annuler
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm"
                          onClick={() => setRestoreTarget(backup)}
                        >
                          <Icon name="refresh" size={14} /> Restaurer
                        </button>
                        <button
                          type="button"
                          className="icon-btn icon-btn--danger"
                          onClick={() => handleDeleteBackup(backup)}
                          aria-label={`Supprimer ${backup.label}`}
                        >
                          <Icon name="trash" size={15} />
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="backup-empty">
              <Icon name="archive" size={15} /> Aucune sauvegarde pour l’instant.
            </p>
          )}
        </section>

        {/* --------------------------------------------------- Installation */}
        <section className="settings-section">
          <h3 className="settings-section__title">
            <Icon name="install" size={16} /> Installer l’application
          </h3>
          <div className="settings-io">
            <div>
              <h4>{installed ? 'StudyFlow est installée' : 'StudyFlow sur ton écran d’accueil'}</h4>
              <p>
                {installed
                  ? 'Tu utilises actuellement la version installée, disponible hors ligne.'
                  : isIOS
                    ? 'Sur iPhone / iPad : bouton Partager → « Sur l’écran d’accueil » pour installer StudyFlow.'
                    : canInstall
                      ? 'Installe StudyFlow sur cet appareil : accès plein écran, démarrage plus rapide et fonctionnement hors ligne.'
                      : 'Dans le menu de ton navigateur (⋮), choisis « Installer StudyFlow » ou « Créer un raccourci ». Sur mobile, utilise « Ajouter à l’écran d’accueil ».'}
              </p>
            </div>
            <div className="settings-io__actions">
              {installed ? (
                <Badge tone="success">
                  <Icon name="check" size={12} /> Installée
                </Badge>
              ) : (
                canInstall && (
                  <button type="button" className="btn btn--ghost btn--sm" onClick={install}>
                    <Icon name="install" size={16} /> Installer
                  </button>
                )
              )}
            </div>
          </div>
        </section>

        {/* --------------------------------------------------- Réinitialisation */}
        <section className="settings-section">
          <h3 className="settings-section__title">
            <Icon name="refresh" size={16} /> Réinitialiser mon espace
          </h3>
          <p className="settings-section__hint">
            Efface tes travaux, tes notes et tes matières, puis restaure les matières par défaut (Mathématiques,
            Français, Anglais). Ton compte et tes préférences sont conservés.
          </p>
          {resetOpen ? (
            <div className="delete-form">
              <p>Cette action supprime définitivement les travaux et notes de cet espace. Confirmer ?</p>
              <div className="form__actions">
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => setResetOpen(false)}>
                  Annuler
                </button>
                <button
                  type="button"
                  className="btn btn--danger btn--sm"
                  onClick={() => {
                    actions.resetData()
                    setResetOpen(false)
                    setMessage('Espace réinitialisé : matières par défaut restaurées, travaux et notes effacés.')
                  }}
                >
                  Confirmer la réinitialisation
                </button>
              </div>
            </div>
          ) : (
            <div className="settings-danger">
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => setResetOpen(true)}>
                <Icon name="refresh" size={16} /> Réinitialiser mes données
              </button>
            </div>
          )}
        </section>

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
