import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import {
  clearSession,
  createUser,
  findUserByEmail,
  loadUsers,
  readSession,
  removeUser,
  saveSession,
  updateUserName,
  updateUserPassword,
  verifyPassword,
} from '../lib/auth'
import { clearUserState, emptyState, saveUserState } from '../lib/storage'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const session = readSession()
    if (!session) return null
    return loadUsers().find((record) => record.id === session.userId) ?? null
  })

  const register = useCallback(async ({ name, email, password }) => {
    const record = await createUser({ name, email, password })
    // Nouvel espace vierge : matières par défaut, aucun travail, aucune note.
    saveUserState(record.id, emptyState(record.name))
    saveSession(record.id, true)
    setUser(record)
    return record
  }, [])

  const login = useCallback(async ({ email, password, remember = true }) => {
    const record = findUserByEmail(email)
    if (!record) throw new Error('Aucun compte ne correspond à cet e-mail.')
    const valid = await verifyPassword(password, record.password)
    if (!valid) throw new Error('Mot de passe incorrect.')
    saveSession(record.id, remember)
    setUser(record)
    return record
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setUser(null)
  }, [])

  const changePassword = useCallback(
    async (current, next) => {
      if (!user) throw new Error('Aucune session active.')
      const valid = await verifyPassword(current, user.password)
      if (!valid) throw new Error('Mot de passe actuel incorrect.')
      await updateUserPassword(user.id, next)
      const refreshed = loadUsers().find((record) => record.id === user.id) ?? null
      setUser(refreshed)
    },
    [user],
  )

  const deleteAccount = useCallback(
    async (password) => {
      if (!user) return
      const valid = await verifyPassword(password, user.password)
      if (!valid) throw new Error('Mot de passe incorrect.')
      removeUser(user.id)
      clearUserState(user.id)
      clearSession()
      setUser(null)
    },
    [user],
  )

  const updateProfileName = useCallback(
    (name) => {
      if (!user) return
      updateUserName(user.id, name)
      setUser((previous) => ({ ...previous, name }))
    },
    [user],
  )

  const value = useMemo(
    () => ({ user, register, login, logout, changePassword, deleteAccount, updateProfileName }),
    [user, register, login, logout, changePassword, deleteAccount, updateProfileName],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth doit être utilisé dans <AuthProvider>')
  return context
}
