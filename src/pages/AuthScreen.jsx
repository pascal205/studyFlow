import { useState } from 'react'
import { Icon } from '../components/ui'
import { useAuth } from '../store/AuthStore'
import { isEmail, loadUsers, passwordStrength } from '../lib/auth'

const STRENGTH_LABELS = ['Très faible', 'Faible', 'Correct', 'Solide', 'Excellent']

export function AuthScreen() {
  const { login, register } = useAuth()
  const [mode, setMode] = useState(() => (loadUsers().length ? 'login' : 'register'))
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
    remember: true,
  })
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  const update = (key, value) => setForm((previous) => ({ ...previous, [key]: value }))
  const strength = passwordStrength(form.password)

  const switchMode = (next) => {
    setMode(next)
    setError('')
    setForm((previous) => ({ ...previous, password: '', confirm: '' }))
  }

  const submit = async (event) => {
    event.preventDefault()
    setError('')

    if (mode === 'register') {
      if (!form.name.trim()) return setError('Indique ton prénom ou ton nom.')
      if (!isEmail(form.email)) return setError('Cette adresse e-mail n’est pas valide.')
      if (form.password.length < 8) return setError('Choisis un mot de passe de 8 caractères minimum.')
      if (form.password !== form.confirm) return setError('Les deux mots de passe ne correspondent pas.')
    } else {
      if (!isEmail(form.email)) return setError('Cette adresse e-mail n’est pas valide.')
      if (!form.password) return setError('Saisis ton mot de passe.')
    }

    setPending(true)
    try {
      if (mode === 'register') {
        await register({
          name: form.name,
          email: form.email,
          password: form.password,
        })
      } else {
        await login({ email: form.email, password: form.password, remember: form.remember })
      }
    } catch (err) {
      setError(err.message || 'Une erreur est survenue.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="auth">
      <section className="auth__aside">
        <div className="auth__brand">
          <span className="brand__mark">S</span>
          <div>
            <strong>StudyFlow</strong>
            <span>Organise • Révise • Progresse</span>
          </div>
        </div>

        <h1>
          Organise tes devoirs.
          <br />
          Révise au bon moment.
        </h1>
        <p className="auth__lead">
          StudyFlow classe tes devoirs et interrogations par priorité d’apprentissage, construit ton planning de
          révision et suit tes notes — matière par matière.
        </p>

        <ul className="auth__features">
          <li>
            <span className="auth__feature-icon">
              <Icon name="flag" size={17} />
            </span>
            Priorités calculées selon l’échéance, la difficulté et ta moyenne
          </li>
          <li>
            <span className="auth__feature-icon">
              <Icon name="calendar" size={17} />
            </span>
            Sessions de travail prêtes à l’emploi, pauses incluses
          </li>
          <li>
            <span className="auth__feature-icon">
              <Icon name="shield" size={17} />
            </span>
            Compte local sécurisé : tes données restent sur cet appareil
          </li>
        </ul>

        <p className="auth__aside-note">
          <Icon name="lock" size={14} /> Mots de passe protégés par PBKDF2-SHA256 · fonctionne hors ligne
        </p>
      </section>

      <section className="auth__panel">
        <div className="auth__card">
          <header className="auth__header">
            <span className="auth__mobile-brand">
              <span className="brand__mark">S</span> StudyFlow
            </span>
            <h2>{mode === 'login' ? 'Bon retour parmi nous' : 'Créer ton compte StudyFlow'}</h2>
            <p>
              {mode === 'login'
                ? 'Connecte-toi pour retrouver tes travaux, ton planning et tes notes.'
                : 'Un compte local, propre à cet appareil. Ton espace démarre vierge, avec tes matières par défaut.'}
            </p>
          </header>

          <div className="auth__tabs" role="tablist" aria-label="Connexion ou inscription">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'login'}
              className={mode === 'login' ? 'is-active' : ''}
              onClick={() => switchMode('login')}
            >
              Se connecter
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'register'}
              className={mode === 'register' ? 'is-active' : ''}
              onClick={() => switchMode('register')}
            >
              Créer un compte
            </button>
          </div>

          <form className="form" onSubmit={submit}>
            {mode === 'register' && (
              <label className="field">
                <span className="field__label">Prénom et nom</span>
                <input
                  type="text"
                  autoComplete="name"
                  placeholder="Ex. Pascal Ametêpé"
                  value={form.name}
                  onChange={(event) => update('name', event.target.value)}
                />
              </label>
            )}

            <label className="field">
              <span className="field__label">Adresse e-mail</span>
              <input
                type="email"
                autoComplete="email"
                placeholder="prenom@exemple.com"
                value={form.email}
                onChange={(event) => update('email', event.target.value)}
              />
            </label>

            <label className="field">
              <span className="field__label">Mot de passe</span>
              <input
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                placeholder={mode === 'login' ? 'Ton mot de passe' : '8 caractères minimum'}
                value={form.password}
                onChange={(event) => update('password', event.target.value)}
              />
              {mode === 'register' && form.password.length > 0 && (
                <span className="strength" aria-live="polite">
                  <span className="strength__bars">
                    {[0, 1, 2, 3].map((index) => (
                      <span key={index} className={index < strength ? `is-on level-${strength}` : ''} />
                    ))}
                  </span>
                  <em>{STRENGTH_LABELS[strength]}</em>
                </span>
              )}
            </label>

            {mode === 'register' && (
              <label className="field">
                <span className="field__label">Confirmer le mot de passe</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  placeholder="Retape ton mot de passe"
                  value={form.confirm}
                  onChange={(event) => update('confirm', event.target.value)}
                />
              </label>
            )}

            {mode === 'login' ? (
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={form.remember}
                  onChange={(event) => update('remember', event.target.checked)}
                />
                <span>Rester connecté sur cet appareil</span>
              </label>
            ) : (
              <p className="auth__hint">
                <Icon name="book" size={14} /> Mathématiques, Français et Anglais seront créés comme matières de départ —
                à toi d’ajouter tes devoirs et tes notes.
              </p>
            )}

            {error && <p className="form__error">{error}</p>}

            <button type="submit" className="btn btn--primary auth__submit" disabled={pending}>
              {pending ? (
                <>
                  <span className="spinner" /> Vérification…
                </>
              ) : mode === 'login' ? (
                <>
                  <Icon name="arrowRight" size={17} /> Se connecter
                </>
              ) : (
                <>
                  <Icon name="user" size={17} /> Créer mon compte
                </>
              )}
            </button>
          </form>

          <p className="auth__legal">
            <Icon name="shield" size={13} /> Les comptes et les données restent sur cet appareil. Le mot de passe est
            stocké sous forme de dérivation cryptographique, jamais en clair.
          </p>
        </div>
      </section>
    </div>
  )
}
