import { useEffect, useMemo, useState } from 'react'
import { NavLink, useLocation, matchPath, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  ShieldCheck,
  ChevronDown,
  X,
  Home,
  Users,
  GraduationCap,
  BookOpen,
  HeartPulse,
  CalendarDays,
  ClipboardList,
  FileText,
  FolderArchive,
  AppWindow,
  LineChart,
  ScrollText,
  Building2,
  Boxes,
  Archive,
  Handshake
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { cn } from '../../lib/utils'
import { AGENDA_CATEGORY_ID } from '../../lib/agendaStorage'

const LEGACY_ICONS = {
  Users,
  Wallet: Building2,
  Scale: ClipboardList,
  Monitor: AppWindow,
  Megaphone: Home,
  ClipboardList,
  Archive,
  Building2
}

const DIVISION_ICON_MAP = {
  hr: {
    bezzetting: Users,
    bezetting: Users,
    diklat: GraduationCap,
    'manajemen-pengetahuan': BookOpen,
    klinik: HeartPulse,
    mcu: HeartPulse,
    'agenda-kalan': CalendarDays,
    'tata-usaha-kalan': ClipboardList,
    'publikasi-pemberitaan': Home,
    'dokumentasi-kegiatan': FileText,
    'arsip-pemeriksaan': FolderArchive,
    perpustakaan: BookOpen,
    jdih: ScrollText,
    'legislasi-review-mou': ClipboardList,
    perjanjian: Handshake,
    'manajemen-risiko': ShieldCheck,
    aset: Boxes,
    arsip: Archive,
    'pengadaan-barang-jasa': Building2,
    'peminjaman-aset': Building2
  },
  finance: {
    'realisasi-anggaran': LineChart,
    'sisa-anggaran': LineChart,
    'belanja-pegawai': Users,
    'belanja-barang': Boxes,
    'belanja-modal': Building2
  },
  legal: {
    jdih: ScrollText,
    'legislasi-review-mou': ClipboardList,
    perjanjian: Handshake,
    'manajemen-risiko': ShieldCheck
  },
  pr: {
    'agenda-kalan': CalendarDays,
    'tata-usaha-kalan': ClipboardList,
    'publikasi-pemberitaan': Home,
    'dokumentasi-kegiatan': FileText,
    'arsip-pemeriksaan': FolderArchive,
    perpustakaan: BookOpen
  },
  it: {
    aset: Boxes,
    arsip: Archive,
    'pengadaan-barang-jasa': Building2,
    'peminjaman-aset': Building2
  }
}

function DivisionItemIcon({ divisionId, categoryId, className }) {
  const Icon = DIVISION_ICON_MAP[divisionId]?.[categoryId] || FileText
  return <Icon className={className} />
}

function DivisionSidebar({ divisionId, onCloseMobile }) {
  const { user } = useAuth()
  const { getDocumentDivision, getDocumentCategories, stats, documents, agendaEvents } = useData()
  const navigate = useNavigate()
  const location = useLocation()
  const isDashboardRoute = location.pathname === '/dashboard'

  const division = getDocumentDivision(divisionId)
  const categories = getDocumentCategories(divisionId)
  const storageKey = `bpk-dashboard-active-category-${divisionId}`
  const [activeCategoryId, setActiveCategoryId] = useState(() => sessionStorage.getItem(storageKey) || categories[0]?.id || 'all')

  useEffect(() => {
    if (isDashboardRoute) {
      setActiveCategoryId(null)
      return
    }

    const stored = sessionStorage.getItem(storageKey)
    setActiveCategoryId(stored || categories[0]?.id || 'all')
  }, [isDashboardRoute, storageKey, categories])

  useEffect(() => {
    const onCategoryChange = (event) => {
      if (event.detail?.divisionId === divisionId) {
        setActiveCategoryId(event.detail.categoryId)
      }
    }
    window.addEventListener('bpk-dashboard-category-change', onCategoryChange)
    return () => window.removeEventListener('bpk-dashboard-category-change', onCategoryChange)
  }, [divisionId])

  const selectCategory = (categoryId) => {
    const nextCategory = categoryId || categories[0]?.id || 'all'
    sessionStorage.setItem(storageKey, nextCategory)
    sessionStorage.setItem('bpk-dashboard-selected-division', divisionId)
    setActiveCategoryId(nextCategory)
    window.dispatchEvent(new CustomEvent('bpk-dashboard-category-change', { detail: { divisionId, categoryId: nextCategory } }))
    navigate(`/dashboard/division/${divisionId}`)
  }

  const categoryCounts = useMemo(() => {
    return Object.fromEntries(
      categories.map((category) => [
        category.id,
        category.id === AGENDA_CATEGORY_ID
          ? agendaEvents.filter((event) => event.divisionId === divisionId && event.categoryId === category.id).length
          : documents.filter((document) => document.divisionId === divisionId && document.categoryId === category.id).length
      ])
    )
  }, [categories, documents, agendaEvents, divisionId])

  if (!division) return null

  const totalDivisionDocs = stats.documentsByDivision.find((item) => item.id === divisionId)?.total || 0

  return (
    <aside className="flex w-full flex-col bg-[#0b2d5a] text-white shadow-[0_20px_60px_rgba(0,0,0,0.28)] lg:sticky lg:top-0 lg:h-screen lg:w-[290px]">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-5">
        <button
          type="button"
          onClick={() => navigate('/transition')}
          className="flex items-center gap-3 text-left transition-opacity hover:opacity-90"
          aria-label="Back to transition page"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 p-1 shadow-[0_0_24px_rgba(60,130,255,0.22)]">
            <img src="/jembatan-logo.png" alt="Logo Jembatan" className="h-full w-full object-contain" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight text-white">JEMBATAN</p>
            <p className="text-[11px] leading-tight text-sky-200/80">Jendela Manajemen dan Kolaborasi Kesekretariatan</p>
          </div>
        </button>
        <button onClick={onCloseMobile} className="text-slate-300 lg:hidden" aria-label="Tutup sidebar">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-none">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="mb-4 flex w-full items-center gap-3 rounded-xl bg-[#1f63d3] px-4 py-3 text-left text-sm font-semibold text-white shadow-[0_10px_24px_rgba(31,99,211,0.28)] transition-transform hover:translate-y-[-1px]"
        >
          <Home className="h-5 w-5" />
          Dashboard
        </button>

        <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-200/65">Layanan</p>
        <div className="mt-3 space-y-1.5">
          {categories.map((category) => {
            const ActiveIcon = DIVISION_ICON_MAP[divisionId]?.[category.id] || FileText
            const isActive = !isDashboardRoute && activeCategoryId === category.id
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => selectCategory(category.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left transition-all',
                  isActive
                    ? 'bg-white text-[#0b2d5a] shadow-[0_10px_24px_rgba(255,255,255,0.12)]'
                    : 'text-white/88 hover:bg-white/8 hover:text-white'
                )}
              >
                <div className={cn('flex h-8 w-8 items-center justify-center rounded-full', isActive ? 'bg-[#1f63d3] text-white' : 'bg-white/10 text-sky-100')}>
                  <ActiveIcon className="h-4.5 w-4.5" />
                </div>
                <span className="flex-1 text-sm font-medium leading-tight">{category.name}</span>
                <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold', isActive ? 'bg-[#1f63d3] text-white' : 'bg-white/10 text-sky-100')}>
                  {categoryCounts[category.id] || 0}
                </span>
              </button>
            )
          })}
        </div>

        <div className="mt-5 border-t border-white/10 pt-4">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-200/65">Monitoring</p>
          <div className="mt-3 space-y-1.5">
            {[
              { label: 'Kalender Bersama', icon: CalendarDays, action: () => navigate('/dashboard/kalender') },
              {
                label: 'Monitoring Layanan',
                icon: LineChart,
                action: () => {
                  sessionStorage.setItem('bpk-dashboard-selected-division', divisionId)
                  navigate(`/dashboard/division/${divisionId}`)
                }
              },
              { label: 'Laporan', icon: ClipboardList, action: () => navigate('/approvals') }
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={item.action}
                className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-white/80 transition-all hover:bg-white/8 hover:text-white"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sky-100">
                  <item.icon className="h-4.5 w-4.5" />
                </div>
                <span className="flex-1 text-sm font-medium leading-tight">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 border-t border-white/10 pt-4">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-200/65">Dokumen</p>
          <div className="mt-3 space-y-1.5">
            {[
              {
                label: 'Dokumen',
                icon: FileText,
                action: () => {
                  sessionStorage.setItem('bpk-dashboard-selected-division', divisionId)
                  navigate(`/dashboard/division/${divisionId}`)
                }
              },
              {
                label: 'Arsip Digital',
                icon: FolderArchive,
                action: () => {
                  sessionStorage.setItem('bpk-dashboard-selected-division', divisionId)
                  navigate(`/dashboard/division/${divisionId}`)
                }
              }
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={item.action}
                className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-white/80 transition-all hover:bg-white/8 hover:text-white"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sky-100">
                  <item.icon className="h-4.5 w-4.5" />
                </div>
                <span className="flex-1 text-sm font-medium leading-tight">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-200/65">Integrasi Aplikasi</p>
          <div className="mt-3 rounded-xl bg-[#14376b] p-3">
            <p className="text-sm font-semibold text-white">JASMIN</p>
            <p className="mt-1 text-xs text-sky-100/75">Integrasi Aplikasi (Persuratan)</p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-5 py-4">
        <p className="text-[11px] leading-relaxed text-sky-100/70">
          {user?.name}
          <br />
          {totalDivisionDocs} dokumen pada bidang ini
        </p>
      </div>
    </aside>
  )
}

function LegacySidebar({ mobileOpen, onCloseMobile }) {
  const { isAdmin, isEmployee, user } = useAuth()
  const { divisions, stats } = useData()
  const navigate = useNavigate()
  const location = useLocation()
  const [divisionsExpanded, setDivisionsExpanded] = useState(true)

  const divisionMatch = matchPath('/dashboard/division/:divisionId/*', location.pathname) || matchPath('/division/:divisionId/*', location.pathname)
  const activeDivisionId = divisionMatch?.params?.divisionId
  const employeeDivision = divisions.find((division) => division.id === user?.division)
  const selectedDivisionId = sessionStorage.getItem('bpk-dashboard-selected-division')
  const selectedDivision = selectedDivisionId
    ? divisions.find((division) => division.id === selectedDivisionId)
    : null
  const visibleDivisions = isEmployee
    ? [selectedDivision, employeeDivision]
        .filter(Boolean)
        .filter((division, index, list) => list.findIndex((item) => item.id === division.id) === index)
    : activeDivisionId
      ? divisions.filter((division) => division.id === activeDivisionId)
      : []

  const linkBase = 'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors'
  const linkActive = 'bg-teal/10 text-teal-700 border-l-4 border-teal -ml-[4px] pl-[16px]'
  const linkInactive = 'text-slate-300 hover:bg-white/5 hover:text-white'

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-navy-950/50 lg:hidden"
          onClick={onCloseMobile}
        />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-navy transition-transform lg:static lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-5">
          <button
            type="button"
            onClick={() => navigate('/transition')}
            className="flex items-center gap-3 text-left transition-opacity hover:opacity-90"
            aria-label="Back to transition page"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 p-1 shadow-[0_0_24px_rgba(60,130,255,0.22)]">
              <img src="/jembatan-logo.png" alt="Logo Jembatan" className="h-full w-full object-contain" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white leading-tight">JEMBATAN</p>
              <p className="text-xs text-slate-400 leading-tight">Jendela Manajemen dan Kolaborasi Kesekretariatan</p>
            </div>
          </button>
          <button onClick={onCloseMobile} className="text-slate-300 lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-5 scrollbar-none">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => cn(linkBase, isActive ? linkActive : linkInactive)}
            onClick={onCloseMobile}
          >
            <LayoutDashboard className="h-[18px] w-[18px]" />
            Dashboard
          </NavLink>

          {visibleDivisions.length > 0 && (
            <button
              onClick={() => setDivisionsExpanded((v) => !v)}
              className="mt-4 flex w-full items-center justify-between px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400"
            >
              {isEmployee ? 'My / Selected Division' : 'Current Division'}
              <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', divisionsExpanded ? '' : '-rotate-90')} />
            </button>
          )}

          {divisionsExpanded && visibleDivisions.length > 0 && (
            <div className="space-y-1">
              {visibleDivisions.map((d) => {
                const Icon = LEGACY_ICONS[d.icon] || Building2
                const pendingCount = stats.perDivision.find((p) => p.id === d.id)?.pending || 0
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => {
                      sessionStorage.setItem('bpk-dashboard-selected-division', d.id)
                      navigate('/dashboard')
                      onCloseMobile()
                    }}
                    className={cn(linkBase, 'w-full border-l-0 text-left', activeDivisionId === d.id ? linkActive : linkInactive)}
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0" />
                    <span className="flex-1 truncate">{d.name}</span>
                    {isAdmin && pendingCount > 0 && (
                      <span className="rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold text-navy-900">
                        {pendingCount}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}

          {isAdmin && (
            <>
              <p className="mt-4 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Administration
              </p>
              <NavLink
                to="/approvals"
                className={({ isActive }) => cn(linkBase, isActive ? linkActive : linkInactive)}
                onClick={onCloseMobile}
              >
                <ShieldCheck className="h-[18px] w-[18px]" />
                <span className="flex-1">Approvals</span>
                {stats.pending > 0 && (
                  <span className="rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold text-navy-900">
                    {stats.pending}
                  </span>
                )}
              </NavLink>
            </>
          )}
        </nav>

        <div className="border-t border-white/10 px-5 py-4">
          <p className="text-[11px] leading-relaxed text-slate-400">
            Badan Pemeriksa Keuangan Republik Indonesia
            <br />
            Internal use only &copy; 2026
          </p>
        </div>
      </aside>
    </>
  )
}

export function Sidebar({ mobileOpen, onCloseMobile }) {
  const { user } = useAuth()
  const location = useLocation()
  const divisionMatch = matchPath('/dashboard/division/:divisionId/*', location.pathname) || matchPath('/division/:divisionId/*', location.pathname)
  const isDashboardRoute = location.pathname === '/dashboard'
  const isProfileRoute = location.pathname === '/profile'
  const isSharedCalendarRoute = location.pathname === '/dashboard/kalender'
  const selectedDivisionId = sessionStorage.getItem('bpk-dashboard-selected-division') || user?.division || 'finance'

  if (divisionMatch || isDashboardRoute || isProfileRoute || isSharedCalendarRoute) {
    const activeDivisionId = divisionMatch?.params?.divisionId || selectedDivisionId
    if (!activeDivisionId) {
      return <LegacySidebar mobileOpen={mobileOpen} onCloseMobile={onCloseMobile} />
    }
    return <DivisionSidebar divisionId={activeDivisionId} onCloseMobile={onCloseMobile} />
  }

  return <LegacySidebar mobileOpen={mobileOpen} onCloseMobile={onCloseMobile} />
}