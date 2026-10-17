import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { ingatHalamanSebelumAkun, isRuteAkun } from '../../lib/akunNavigasi'

export function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  // Halaman bukan-akun terakhir diingat, supaya tombol Kembali di sidebar
  // akun mengembalikan pengguna ke tempat ia berangkat.
  useEffect(() => { ingatHalamanSebelumAkun(location.pathname) }, [location.pathname])
  const isDivisionShellRoute = location.pathname === '/dashboard' || location.pathname.startsWith('/dashboard/division/') || location.pathname.startsWith('/dashboard/kalender') ||
    location.pathname.startsWith('/dashboard/anggaran') ||
    location.pathname.startsWith('/dashboard/master-anggaran') ||
    location.pathname.startsWith('/dashboard/master-sdm') ||
    location.pathname.startsWith('/dashboard/monitoring') ||
    location.pathname.startsWith('/dashboard/laporan') ||
    location.pathname.startsWith('/dashboard/panduan') ||
    isRuteAkun(location.pathname)

  if (isDivisionShellRoute) {
    return (
      <div className="min-h-screen bg-[#eef4fb] lg:flex">
        <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
        <div className="flex min-h-screen flex-1 flex-col overflow-x-hidden overflow-y-auto">
          {/* Samping 16px supaya kartu memakai lebar layar; atas-bawah tetap
              (tinggi satu layar di dashboard menghitung 2rem atas + bawah). */}
          <main className="flex-1 p-4 sm:py-6 lg:py-8">
            <Outlet />
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar onOpenMobile={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
