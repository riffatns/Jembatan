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
  CalendarPlus,
  CalendarRange,
  Clock3,
  UserCircle2,
  ArrowRight,
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
import { hasDocumentFile, resolveDocumentFileUrl } from '../lib/documentStorage'
import { DashboardHeader } from '../components/layout/DashboardHeader'
import { AgendaWorkspace } from '../components/agenda/AgendaWorkspace'
import { AGENDA_CATEGORY_ID } from '../lib/agendaStorage'
import { ServiceIntro } from '../components/ServiceIntro'
import { BudgetWorkspace } from '../components/budget/BudgetWorkspace'
import { getServiceContent } from '../data/serviceContent'
import { ServiceCard } from '../components/ServiceCard'
import {
  ARCHIVE_STATUSES,
  DEFAULT_ARCHIVE_STATUS,
  isArchiveCategory
} from '../data/archiveStatus'

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
  const [agendaCreateTick, setAgendaCreateTick] = useState(0)
  const archiveStorageKey = `bpk-dashboard-archive-status-${divisionId}`
  const [archiveFilter, setArchiveFilter] = useState(() => sessionStorage.getItem(archiveStorageKey) || 'all')
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
      const matchesArchive =
        !isArchiveCategory(document.categoryId) ||
        archiveFilter === 'all' ||
        (document.archiveStatus || DEFAULT_ARCHIVE_STATUS) === archiveFilter
      const documentDate = new Date(document.documentDate || document.uploadedAt)
      const matchesMonth = !selectedDate || (documentDate.getFullYear() === selectedDateObject.getFullYear() && documentDate.getMonth() === selectedDateObject.getMonth())
      return matchesSearch && matchesStatus && matchesYear && matchesCategory && matchesMonth && matchesArchive
    })
  }, [divisionDocuments, search, status, year, activeCategoryId, selectedDateObject, archiveFilter])

  const dateFilteredDocuments = useMemo(
    () => divisionDocuments.filter((document) => {
      const documentDate = new Date(document.documentDate || document.uploadedAt)
      return !selectedDate || (documentDate.getFullYear() === selectedDateObject.getFullYear() && documentDate.getMonth() === selectedDateObject.getMonth())
    }),
    [divisionDocuments, selectedDateObject]
  )

  const serviceContent = getServiceContent(activeCategoryId)
  const isAgendaMode = serviceContent.type === 'agenda'
  const isBudgetMode = serviceContent.type === 'anggaran'
  const isArchiveMode = isArchiveCategory(activeCategoryId)

  // Arsip lama boleh tidak punya status; perlakukan sebagai aktif supaya tidak
  // ada berkas yang menghilang dari ketiga sub bagian.
  const archiveStatusOf = (document) => document.archiveStatus || DEFAULT_ARCHIVE_STATUS

  const archiveDocuments = useMemo(
    () => dateFilteredDocuments.filter((document) => isArchiveCategory(document.categoryId)),
    [dateFilteredDocuments]
  )

  const archiveCards = useMemo(
    () =>
      ARCHIVE_STATUSES.map((meta) => {
        const total = archiveDocuments.filter((document) => archiveStatusOf(document) === meta.id).length
        return {
          ...meta,
          total,
          ratio: archiveDocuments.length ? total / archiveDocuments.length : 0
        }
      }),
    [archiveDocuments]
  )

  const selectArchiveFilter = (statusId) => {
    const next = archiveFilter === statusId ? 'all' : statusId
    sessionStorage.setItem(archiveStorageKey, next)
    setArchiveFilter(next)
  }

  const activeCategory = categories.find((category) => category.id === activeCategoryId)

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

  const handleDownload = async (doc) => {
    if (!hasDocumentFile(doc)) {
      window.alert('Dokumen ini belum memiliki berkas untuk diunduh.')
      return
    }

    const url = await resolveDocumentFileUrl(doc)
    if (!url) {
      window.alert('Berkas gagal diambil dari penyimpanan. Coba muat ulang halaman.')
      return
    }

    const link = globalThis.document.createElement('a')
    link.href = url
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
        actionLabel={serviceContent.uploadLabel}
        actionIcon={isAgendaMode ? CalendarPlus : Plus}
        onAction={isAgendaMode ? () => setAgendaCreateTick((tick) => tick + 1) : handleOpenUpload}
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

      {!isAgendaMode && (
        <ServiceIntro categoryId={activeCategoryId} categoryName={activeCategory?.name || division.name} />
      )}

      {isBudgetMode && (
        <BudgetWorkspace categoryId={activeCategoryId} categoryName={activeCategory?.name} budget={budget} />
      )}

      <div id="dokumen-section" className="space-y-4">
        {isAgendaMode ? (
          <AgendaWorkspace divisionId={divisionId} focusDate={selectedDate} createTick={agendaCreateTick} />
        ) : (
          <>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#233b84]">
                  Dokumen {activeCategory?.name || 'Seluruh Kategori'}
                  {isArchiveMode && archiveFilter !== 'all'
                    ? ` - ${ARCHIVE_STATUSES.find((item) => item.id === archiveFilter)?.label}`
                    : ''}
                </h2>
                <p className="text-sm text-[#61739b]">
                  {isBudgetMode ? 'Dokumen pendukung yang menjadi dasar angka di atas' : serviceContent.summary}
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-[#233b84] shadow-sm">
                <LayoutGrid className="h-4 w-4 text-[#1f63d3]" />
                {filteredDocuments.length} dokumen
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
          </>
        )}
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
