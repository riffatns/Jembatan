import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({ children, roles, divisions, teknis = false }) {
  const { user, loading, isAdmin, isEmployee } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal border-t-transparent" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/" replace />
  }

  const roleAllowed = roles?.includes(user.role)
    || (roles?.includes('employee') && isEmployee)
    || (roles?.includes('admin') && isAdmin)
  if (roles && !roleAllowed) {
    return <Navigate to="/dashboard" replace />
  }

  const profileDivision = user.division || user.division_id
  if (divisions && !divisions.includes(profileDivision)) {
    return <Navigate to="/dashboard" replace />
  }

  // Penanda pengelola teknis terpisah dari peran: Kepala Perwakilan berperan
  // admin tetapi belum tentu orang yang mengurus sistemnya. Penolakan yang
  // sesungguhnya ada di database (fungsi daftar_akses); ini hanya supaya
  // halamannya tidak terbuka kosong.
  if (teknis && !user.is_teknis) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
