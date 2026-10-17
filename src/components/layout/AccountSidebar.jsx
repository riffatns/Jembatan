import { ArrowLeft, BookOpen, LogOut, ShieldCheck, User, X } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Avatar } from '../ui/avatar'
import { cn } from '../../lib/utils'
import { halamanKembali } from '../../lib/akunNavigasi'

// Sidebar halaman akun (Profil, Akses Pengguna).
//
// Sidebar bidang tidak cocok di sini: menunya penuh layanan yang tidak ada
// hubungannya dengan halaman akun, dan tombol mereknya mengajak "Pilih bidang
// lain" - padahal yang diinginkan pengguna adalah kembali ke tempat ia tadi.
//
// Kerangka, warna, dan bentuk tombolnya sengaja sama persis dengan sidebar
// bidang supaya perpindahannya tidak terasa seperti keluar dari aplikasi.

function NavButton({ icon: Icon, label, isActive, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full cursor-pointer items-center gap-3 rounded-xl px-3.5 py-2.5 text-left transition-all active:scale-[0.99]',
        isActive
          ? 'bg-white text-[#0b2d5a] shadow-[0_10px_24px_rgba(255,255,255,0.12)]'
          : 'text-white/88 hover:bg-white/8 hover:text-white'
      )}
    >
      <div className={cn('flex h-8 w-8 items-center justify-center rounded-full', isActive ? 'bg-[#1f63d3] text-white' : 'bg-white/10 text-sky-100')}>
        <Icon className="h-4.5 w-4.5" />
      </div>
      <span className="flex-1 text-sm font-medium leading-tight">{label}</span>
    </button>
  )
}

function Kelompok({ judul, children }) {
  return (
    <div className="mt-5 border-t border-white/10 pt-4 first:mt-0 first:border-t-0 first:pt-0">
      <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-200/65">{judul}</p>
      <div className="mt-3 space-y-1.5">{children}</div>
    </div>
  )
}

export function AccountSidebar({ onCloseMobile }) {
  const { user, roleInfo, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const kembali = halamanKembali()
  const buka = (path) => {
    onCloseMobile?.()
    navigate(path)
  }

  return (
    <aside className="flex w-full flex-col bg-[#0b2d5a] text-white shadow-[0_20px_60px_rgba(0,0,0,0.28)] lg:sticky lg:top-0 lg:h-screen lg:w-[290px]">
      <div className="flex items-center gap-2 border-b border-white/10 px-3 py-4">
        <button
          type="button"
          onClick={() => buka(kembali)}
          title="Kembali ke halaman sebelumnya"
          className="group flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-2xl px-2 py-2 text-left transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/60"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15 transition-colors group-hover:bg-white/15">
            <img src="/favicon-jembatan.png" alt="" className="h-8 w-8 object-contain" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold leading-tight text-white">JEMBATAN</span>
            <span className="mt-1 flex items-center gap-1.5 text-[11px] font-medium leading-tight text-sky-200/85 transition-colors group-hover:text-white">
              <ArrowLeft className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:-translate-x-0.5" />
              Kembali
            </span>
          </span>
        </button>
        <button
          onClick={onCloseMobile}
          className="shrink-0 cursor-pointer rounded-lg p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
          aria-label="Tutup sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-none">
        <div className="mb-4 flex items-center gap-3 rounded-xl bg-white/8 px-3 py-3">
          <Avatar name={user?.name} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight text-white">{user?.name || 'Pengguna'}</p>
            <p className="truncate text-[11px] leading-tight text-sky-200/80">{roleInfo.label}</p>
          </div>
        </div>

        <Kelompok judul="Akun">
          <NavButton icon={User} label="Profil Saya" isActive={pathname === '/profile'} onClick={() => buka('/profile')} />
        </Kelompok>

        {/* Hanya yang ditandai pengelola teknis. Database tetap menolak
            pemanggil yang tidak ditandai walau alamatnya dibuka langsung. */}
        {user?.is_teknis && (
          <Kelompok judul="Pengelola">
            <NavButton
              icon={ShieldCheck}
              label="Akses Pengguna"
              isActive={pathname === '/dashboard/akses'}
              onClick={() => buka('/dashboard/akses')}
            />
          </Kelompok>
        )}

        <Kelompok judul="Bantuan">
          <NavButton icon={BookOpen} label="Panduan Sistem" onClick={() => buka('/dashboard/panduan')} />
        </Kelompok>
      </div>

      <div className="border-t border-white/10 px-4 py-4">
        <button
          type="button"
          onClick={() => {
            logout()
            navigate('/')
          }}
          className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium text-rose-200/90 transition-colors hover:bg-rose-500/15 hover:text-rose-100"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
            <LogOut className="h-4.5 w-4.5" />
          </div>
          Keluar
        </button>
      </div>
    </aside>
  )
}
