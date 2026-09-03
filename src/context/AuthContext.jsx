import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { USERS } from '../data/seed'
import { getRoleInfo } from '../data/accessControl'

const AuthContext = createContext(null)
const STORAGE_KEY = 'bpk-dashboard-auth'
const USERS_KEY = 'bpk-dashboard-users'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedUsers = localStorage.getItem(USERS_KEY)
    setUsers(savedUsers ? JSON.parse(savedUsers) : USERS)

    const savedUser = localStorage.getItem(STORAGE_KEY)
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch {
        setUser(null)
      }
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (users.length) {
      localStorage.setItem(USERS_KEY, JSON.stringify(users))
    }
  }, [users])

  const login = useCallback(
    (username, password) => {
      const found = users.find(
        (u) => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
      )
      if (!found) {
        return { success: false, message: 'Invalid username or password.' }
      }
      const { password: _pw, ...safeUser } = found
      setUser(safeUser)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(safeUser))
      return { success: true }
    },
    [users]
  )

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const updateProfile = useCallback(
    (updates) => {
      if (!user) return
      const updated = { ...user, ...updates }
      setUser(updated)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, ...updates } : u)))
    },
    [user]
  )

  const canAccessDivision = useCallback(
    (divisionId) => {
      return Boolean(user && divisionId)
    },
    [user]
  )

  const canUploadToDivision = useCallback(
    (divisionId) => {
      if (!user) return false
      return user.role === 'admin' || user.division === divisionId
    },
    [user]
  )

  const canUploadDocuments = useCallback(() => {
    return user?.role === 'admin' || user?.role === 'employee'
  }, [user?.role])

  const canManageDocument = useCallback(
    (document) => {
      if (!user) return false
      if (user.role === 'admin') return true
      return user.role === 'employee' && document.uploadedBy === user.name
    },
    [user]
  )

  const canReviewDocuments = useCallback(() => {
    return user?.role === 'admin'
  }, [user?.role])

  const value = {
    user,
    roleInfo: getRoleInfo(user?.role),
    users,
    loading,
    login,
    logout,
    updateProfile,
    canAccessDivision,
    canUploadToDivision,
    canUploadDocuments,
    canManageDocument,
    canReviewDocuments,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isEmployee: user?.role === 'employee',
    isViewer: user?.role === 'viewer'
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
