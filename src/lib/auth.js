/**
 * Authentification locale (sans serveur) :
 * - mots de passe dérivés avec PBKDF2-SHA256 (210 000 itérations) + sel aléatoire
 * - aucun mot de passe en clair n'est stocké
 * - session persistée avec expiration
 */

const USERS_KEY = 'studyflow.users.v1'
const SESSION_KEY = 'studyflow.session.v1'
const ITERATIONS = 210000
const SESSION_DAYS = 30

const toBase64 = (buffer) => {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

const fromBase64 = (value) => Uint8Array.from(atob(value), (char) => char.charCodeAt(0))

const subtle = () => {
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    throw new Error(
      'Le stockage sécurisé du navigateur est indisponible. Ouvre StudyFlow depuis localhost ou en HTTPS.',
    )
  }
  return crypto.subtle
}

const derive = async (password, salt, iterations = ITERATIONS) => {
  const keyMaterial = await subtle().importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const bits = await subtle().deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    keyMaterial,
    256,
  )
  return toBase64(bits)
}

export const hashPassword = async (password) => {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const hash = await derive(password, salt)
  return { salt: toBase64(salt), hash, iterations: ITERATIONS, algo: 'PBKDF2-SHA256' }
}

export const verifyPassword = async (password, record) => {
  if (!record?.salt || !record?.hash) return false
  const candidate = await derive(password, fromBase64(record.salt), record.iterations || ITERATIONS)
  if (candidate.length !== record.hash.length) return false
  let diff = 0
  for (let i = 0; i < candidate.length; i += 1) {
    diff |= candidate.charCodeAt(i) ^ record.hash.charCodeAt(i)
  }
  return diff === 0
}

export const normalizeEmail = (email = '') => email.trim().toLowerCase()

export const isEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalizeEmail(email))

export const loadUsers = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const saveUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export const findUserByEmail = (email) =>
  loadUsers().find((user) => normalizeEmail(user.email) === normalizeEmail(email)) || null

export const createUser = async ({ name, email, password, withDemo = true }) => {
  const users = loadUsers()
  const normalized = normalizeEmail(email)
  if (users.some((user) => normalizeEmail(user.email) === normalized)) {
    throw new Error('Un compte existe déjà avec cet e-mail.')
  }
  const credentials = await hashPassword(password)
  const user = {
    id: `u_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    name: name.trim(),
    email: normalized,
    withDemo: Boolean(withDemo),
    createdAt: new Date().toISOString(),
    password: credentials,
  }
  saveUsers([...users, user])
  return user
}

export const updateUserName = (userId, name) => {
  const users = loadUsers().map((user) => (user.id === userId ? { ...user, name: name.trim() } : user))
  saveUsers(users)
}

export const updateUserPassword = async (userId, password) => {
  const credentials = await hashPassword(password)
  const users = loadUsers().map((user) =>
    user.id === userId ? { ...user, password: credentials, passwordChangedAt: new Date().toISOString() } : user,
  )
  saveUsers(users)
}

export const removeUser = (userId) => {
  saveUsers(loadUsers().filter((user) => user.id !== userId))
}

export const saveSession = (userId, remember = true) => {
  const duration = (remember ? SESSION_DAYS : 0.5) * 86400000
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ userId, createdAt: Date.now(), expiresAt: Date.now() + duration }),
  )
}

export const readSession = () => {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const session = JSON.parse(raw)
    if (!session?.userId || !session?.expiresAt || session.expiresAt < Date.now()) {
      localStorage.removeItem(SESSION_KEY)
      return null
    }
    return session
  } catch {
    return null
  }
}

export const clearSession = () => {
  try {
    localStorage.removeItem(SESSION_KEY)
  } catch {
    /* ignore */
  }
}

export const passwordStrength = (password = '') => {
  let score = 0
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1
  if (/\d/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1
  return Math.min(4, score)
}
