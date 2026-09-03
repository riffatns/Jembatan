import { useEffect, useMemo, useState } from 'react'
import { useParams, Navigate, useNavigate } from 'react-router-dom'
import {
  Users,
  GraduationCap,
  BookOpen,
  HeartPulse,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  CalendarRange,
  Clock3,
  UserCircle2,
  ArrowRight,
  FileText,
  LayoutGrid,
  FolderOpen,
  Building2,
  ShieldCheck
} from 'lucide-react'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/button'
import { UserAccountMenu } from '../components/layout/UserAccountMenu'
import { Card, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { DocumentFilters } from '../components/documents/DocumentFilters'
import { DocumentTable } from '../components/documents/DocumentTable'
import { DocumentUploadModal } from '../components/documents/DocumentUploadModal'
import { DocumentDetail } from '../components/documents/DocumentDetail'
import { createDownloadUrl } from '../lib/documentStorage'
import { ServiceCard } from '../components/ServiceCard'
import { SERVICE_META } from '../data/serviceMeta'
import { DashboardHeader } from '../components/layout/DashboardHeader'

function toDateInputValue(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseDateInputValue(value) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export default function DivisionWorkspace({ divisionId: propDivisionId }) {
  const { divisionId: routeDivisionId } = useParams()
  const { getDocumentDivision, getDocumentCategories, documents, addDocument, updateDocument, deleteDocument, stats } = useData()
  const { user, canUploadToDivision, canManageDocument, canAccessDivision } = useAuth()
  const navigate = useNavigate()

  const divisionId = propDivisionId || routeDivisionId || sessionStorage.getItem('bpk-dashboard-selected-division') || 'finance'
  const division = getDocumentDivision(divisionId)
  const categories = getDocumentCategories(divisionId)
  const budget = stats.budget
  const storageKey = `bpk-dashboard-active-category-${divisionId}`

  const [activeCategoryId, setActiveCategoryId] = useState(() => sessionStorage.getItem(storageKey) || categories[0]?.id || 'all')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [year, setYear] = useState('all')
  const [selectedDate, setSelectedDate] = useState('')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [editingDocument, setEditingDocument] = useState(null)
  const [selectedDocument, setSelectedDocument] = useState(null)
  const selectedDateObject = useMemo(() => selectedDate ? parseDateInputValue(selectedDate) : new Date(), [selectedDate])

  useEffect(() => {
    const stored = sessionStorage.getItem(storageKey)
    setActiveCategoryId(stored || categories[0]?.id || 'all')
  }, [storageKey, categories])

  useEffect(() => {
    const onCategoryChange = (event) => {
      if (event.detail?.divisionId === divisionId) {
        setActiveCategoryId(event.detail.categoryId)
      }
    }
    window.addEventListener('bpk-dashboard-category-change', onCategoryChange)
    return () => window.removeEventListener('bpk-dashboard-category-change', onCategoryChange)
  }, [divisionId])

  const divisionDocuments = useMemo(() => {
    return documents
      .filter((document) => document.divisionId === divisionId)
      .sort((a, b) => new Date(b.uploadedAt || b.documentDate) - new Date(a.uploadedAt || a.documentDate))
  }, [documents, divisionId])

  const years = useMemo(() => {
    return [...new Set(divisionDocuments.map((document) => document.year).filter(Boolean))].sort((a, b) => b - a)
  }, [divisionDocuments])
  const filteredDocuments = useMemo(() => {
    return divisionDocuments.filter((document) => {
      const matchesSearch =
        !search.trim() ||
        [document.title, document.description, document.fileName, document.documentNumber]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(search.toLowerCase()))
      const matchesStatus = status === 'all' || document.status === status
      const matchesYear = year === 'all' || String(document.year) === String(year)
      const matchesCategory = activeCategoryId === 'all' || document.categoryId === activeCategoryId
      const documentDate = new Date(document.documentDate || document.uploadedAt)
      const matchesMonth = !selectedDate || (documentDate.getFullYear() === selectedDateObject.getFullYear() && documentDate.getMonth() === selectedDateObject.getMonth())
      return matchesSearch && matchesStatus && matchesYear && matchesCategory && matchesMonth
    })
  }, [divisionDocuments, search, status, year, activeCategoryId, selectedDateObject])

  const dateFilteredDocuments = useMemo(
    () => divisionDocuments.filter((document) => {
      const documentDate = new Date(document.documentDate || document.uploadedAt)
      return !selectedDate || (documentDate.getFullYear() === selectedDateObject.getFullYear() && documentDate.getMonth() === selectedDateObject.getMonth())
    }),
    [divisionDocuments, selectedDateObject]
  )

  const overviewCards = useMemo(() => {
    return categories.map((category) => {
      const meta = SERVICE_META[category.id] || {
        title: category.name,
        icon: FileText,
        color: '#2563eb',
        subtitle: category.description || 'Dokumen layanan'
      }

      return {
        id: category.id,
        title: meta.title,
        subtitle: meta.subtitle,
        icon: meta.icon,
        color: meta.color,
        value: dateFilteredDocuments.filter((document) => document.categoryId === category.id).length
      }
    })
  }, [categories, dateFilteredDocuments])

  const activeCategory = categories.find((category) => category.id === activeCategoryId)

  const activeCategoryDocuments = useMemo(() => {
    if (activeCategoryId === 'all') return dateFilteredDocuments
    return dateFilteredDocuments.filter((document) => document.categoryId === activeCategoryId)
  }, [activeCategoryId, dateFilteredDocuments])

  const handleActivateCategory = (categoryId) => {
    const nextCategory = categoryId || categories[0]?.id || 'all'
    sessionStorage.setItem(storageKey, nextCategory)
    setActiveCategoryId(nextCategory)
    window.dispatchEvent(new CustomEvent('bpk-dashboard-category-change', { detail: { divisionId, categoryId: nextCategory } }))
    globalThis.document.getElementById('dokumen-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleOpenUpload = () => {
    setEditingDocument(null)
    setUploadOpen(true)
  }

  const handleView = (document) => {
    if (document.categoryId === 'bezetting') {
      navigate(`/dashboard/division/${divisionId}/bezetting/${document.id}`, { state: { document } })
      return
    }
    setSelectedDocument(document)
    setDetailOpen(true)
  }

  const handleEdit = (document) => {
    setEditingDocument(document)
    setUploadOpen(true)
  }

  const handleDelete = (document) => {
    if (!window.confirm(`Delete dokumen "${document.title}"?`)) return
    deleteDocument(document.id)
  }

  const handleDownload = (doc) => {
    const link = globalThis.document.createElement('a')
    link.href = createDownloadUrl(doc)
    link.download = doc.fileName || doc.title
    link.click()
  }

  const handleSubmit = async (payload) => {
    if (payload.id) {
      await updateDocument(payload.id, payload)
      return
    }

    await addDocument({
      ...payload,
      uploadedBy: user?.name,
      uploadedAt: new Date().toISOString(),
      status: 'pending'
    })
  }

  if (!division || !canAccessDivision(divisionId)) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="space-y-6 text-slate-800">
      <DashboardHeader
        division={division}
        selectedDateObject={selectedDateObject}
        dateInputId="division-date-filter"
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        actionLabel="Upload Dokumen"
        actionIcon={Plus}
        onAction={handleOpenUpload}
        showAction={canUploadToDivision(divisionId)}
        onBrandClick={() => navigate('/dashboard')}
      />
      {/*
        <div>
          <button type="button" onClick={() => navigate('/dashboard')} className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#eff5ff] px-3 py-1 text-xs font-semibold tracking-[0.26em] text-[#1f3f89] transition-colors hover:bg-[#dceaff] active:scale-[0.98]" aria-label="Kembali ke dashboard utama">
            DASHBOARD {division.shortName}
          </button>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-[#233b84] sm:text-3xl">
            Dashboard {division.shortName}
          </h1>
          <p className="mt-1 text-sm text-[#61739b]">Ringkasan layanan {division.name}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="division-date-filter" className="relative flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-[#233b84] shadow-sm transition-colors hover:border-blue-300 hover:bg-[#f8fbff] active:scale-[0.98]" title="Pilih bulan filter dokumen">
            <CalendarRange className="h-4 w-4 text-[#1f63d3]" />
            {selectedDateObject.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
            <input id="division-date-filter" type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} className="absolute inset-0 cursor-pointer opacity-0" aria-label="Filter tanggal dokumen" />
          </label>
          <UserAccountMenu />
          {canUploadDocuments() && (
            <Button variant="teal" onClick={handleOpenUpload} className="rounded-full px-5 shadow-[0_14px_30px_rgba(31,99,211,0.26)]">
              <Plus className="h-4 w-4" /> Upload Dokumen
            </Button>
          )}
        </div>
      </div>

      */}

      <div className="grid gap-4 xl:grid-cols-4">
        {overviewCards.map((card, index) => (
          <ServiceCard
            key={card.id}
            title={card.title}
            value={card.value}
            subtitle={card.subtitle}
            icon={card.icon}
            color={card.color}
            active={activeCategoryId === card.id}
            onClick={() => handleActivateCategory(card.id)}
          />
        ))}
      </div>

      {divisionId === 'finance' && (
        <section className="grid gap-4 xl:grid-cols-2">
          <BudgetGauge title="Realisasi Anggaran" percentage={budget.realisasiPercent} value={budget.totalRealisasi} valueLabel="Realisasi" pagu={budget.totalPagu} accent="#2f8cff" />
          <BudgetGauge title="Sisa Anggaran" percentage={budget.sisaPercent} value={budget.totalSisa} valueLabel="Sisa Anggaran" pagu={budget.totalPagu} accent="#22d3ee" />
        </section>
      )}

      <div id="dokumen-section" className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#233b84]">
              Dokumen {activeCategory?.name || 'Seluruh Kategori'}
            </h2>
            <p className="text-sm text-[#61739b]">Kelola, cari, unggah, dan tinjau dokumen bidang ini</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-[#233b84] shadow-sm">
            <LayoutGrid className="h-4 w-4 text-[#1f63d3]" />
            {activeCategoryDocuments.length} dokumen
          </div>
        </div>

        <DocumentFilters
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
          year={year}
          onYearChange={setYear}
          categoryId={activeCategoryId}
          onCategoryChange={(categoryId) => handleActivateCategory(categoryId)}
          categories={categories}
          years={years}
        />

        <DocumentTable
          documents={filteredDocuments}
          categoryName={activeCategory?.name || division.name}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDownload={handleDownload}
          canEditDocument={canManageDocument}
          canDeleteDocument={canManageDocument}
          canDownload
        />
      </div>

      <DocumentUploadModal
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        initialDocument={editingDocument}
        defaultDivisionId={divisionId}
        defaultCategoryId={editingDocument?.categoryId || (activeCategoryId === 'all' ? '' : activeCategoryId)}
        onSubmit={handleSubmit}
      />

      <DocumentDetail document={selectedDocument} open={detailOpen} onOpenChange={setDetailOpen} />
    </div>
  )
}

function BudgetGauge({ title, percentage, value, valueLabel, pagu, accent }) {
  const clamped = Math.max(0, Math.min(100, percentage))
  const formattedValue = `Rp ${new Intl.NumberFormat('id-ID').format(Math.round(value))}`
  const formattedPagu = `Rp ${new Intl.NumberFormat('id-ID').format(Math.round(pagu))}`

  return (
    <div className="rounded-[28px] border border-sky-400/25 bg-[#071429]/95 p-5 text-white shadow-[0_18px_45px_rgba(15,23,42,0.18)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-slate-300">Persentase {valueLabel}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-sky-300/30 bg-white/5 text-sky-200">
          <ArrowRight className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="flex items-center justify-center sm:w-40">
          <div
            className="relative flex h-36 w-36 items-center justify-center rounded-full"
            style={{ background: `conic-gradient(${accent} ${clamped}%, rgba(148, 163, 184, 0.15) ${clamped}% 100%)` }}
          >
            <div className="absolute inset-3 rounded-full border border-sky-300/20 bg-[#05101f]" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-sky-300/15 bg-[#071429] text-3xl font-semibold text-white">
              {Math.round(clamped)}%
            </div>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="h-3 overflow-hidden rounded-full border border-sky-400/25 bg-slate-900/70">
            <div className="h-full rounded-full" style={{ width: `${clamped}%`, background: `linear-gradient(90deg, ${accent}, #4fa3ff)` }} />
          </div>
          <div className="mt-4 space-y-2 text-sm sm:text-base">
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-24 text-slate-400">{valueLabel}</span>
              <span className="font-medium">{formattedValue}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-24 text-slate-400">Pagu</span>
              <span className="font-medium">{formattedPagu}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}