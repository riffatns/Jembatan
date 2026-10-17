import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({ children, roles, teknis = false }) {
  const { user, loading } = useAuth()

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

  if (roles && !roles.includes(user.role)) {
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
