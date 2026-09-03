import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useData } from '../context/DataContext'
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

export default function Dashboard() {
  const { documents, getDocumentCategory, getDocumentDivision, getDocumentCategories } = useData()
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState(() => toDateInputValue(new Date()))

  const selectedDivisionId = sessionStorage.getItem('bpk-dashboard-selected-division') || 'finance'
  const division = getDocumentDivision(selectedDivisionId) || getDocumentDivision('finance')
  const categories = getDocumentCategories(selectedDivisionId) || getDocumentCategories('finance')

  const divisionDocuments = useMemo(
    () => documents.filter((document) => document.divisionId === selectedDivisionId),
    [documents, selectedDivisionId]
  )

  const selectedDateObject = useMemo(() => parseDateInputValue(selectedDate), [selectedDate])
  const selectedDateDocuments = useMemo(
    () => divisionDocuments.filter((document) => new Date(document.documentDate || document.uploadedAt).toDateString() === selectedDateObject.toDateString()),
    [divisionDocuments, selectedDateObject]
  )

  const overviewCards = useMemo(
    () =>
      categories.map((category) => {
        const meta = SERVICE_META[category.id] || { title: category.name, subtitle: 'Dokumen layanan', color: '#2563eb', icon: Building2 }

        return {
          id: category.id,
          title: meta.title,
          subtitle: meta.subtitle,
          color: meta.color,
          icon: meta.icon,
          value: divisionDocuments.filter((document) => document.categoryId === category.id).length
        }
      }),
    [categories, divisionDocuments]
  )

  const monthCalendar = useMemo(() => {
    const base = selectedDateObject
    const first = new Date(base.getFullYear(), base.getMonth(), 1)
    const startDay = (first.getDay() + 6) % 7
    const cells = []

    for (let i = 0; i < startDay; i += 1) cells.push(null)
    for (let day = 1; day <= new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate(); day += 1) {
      cells.push(new Date(base.getFullYear(), base.getMonth(), day))
    }
    while (cells.length % 7 !== 0) cells.push(null)

    return Array.from({ length: cells.length / 7 }, (_, index) => cells.slice(index * 7, index * 7 + 7))
  }, [selectedDateObject])

  const agendaItems = useMemo(
    () =>
      selectedDateDocuments.slice(0, 3).map((document, index) => ({
        id: document.id,
        time: ['09.00', '11.00', '14.00'][index] || '16.00',
        title: document.title,
        room: getDocumentCategory(document.divisionId, document.categoryId)?.name || division?.name || 'Divisi',
        color: ['#2563eb', '#16a34a', '#f97316'][index] || '#2563eb'
      })),
    [division?.name, selectedDateDocuments, getDocumentCategory]
  )

  const goToDivision = () => {
    sessionStorage.setItem('bpk-dashboard-selected-division', selectedDivisionId)
    navigate(`/dashboard/division/${selectedDivisionId}`)
  }

  const setCalendarMonth = (offset) => {
    const nextMonth = new Date(selectedDateObject.getFullYear(), selectedDateObject.getMonth() + offset, 1)
    setSelectedDate(toDateInputValue(nextMonth))
  }

  const goToToday = () => setSelectedDate(toDateInputValue(new Date()))

  return (
    <div className="space-y-6 text-slate-800">
      <DashboardHeader
        division={division}
        selectedDateObject={selectedDateObject}
        dateInputId="dashboard-date-filter"
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        actionLabel="Lihat Dokumen"
        actionIcon={Building2}
        onAction={goToDivision}
        onBrandClick={() => navigate('/dashboard')}
      />
      {/*
        <div>
          <button type="button" onClick={() => navigate('/dashboard')} className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#eff5ff] px-3 py-1 text-xs font-semibold tracking-[0.26em] text-[#1f3f89] transition-colors hover:bg-[#dceaff] active:scale-[0.98]" aria-label="Kembali ke dashboard utama">
            DASHBOARD {division?.shortName?.toUpperCase() || 'DIVISI'}
          </button>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-[#233b84] sm:text-3xl">
            Dashboard {division?.shortName || 'Divisi'}
          </h1>
          <p className="mt-1 text-sm text-[#61739b]">Ringkasan layanan {division?.name || 'divisi'}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="dashboard-date-filter" className="relative flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-[#233b84] shadow-sm transition-colors hover:border-blue-300 hover:bg-[#f8fbff] active:scale-[0.98]" title="Pilih tanggal filter">
            <CalendarRange className="h-4 w-4 text-[#1f63d3]" />
            {selectedDateObject.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
            <input id="dashboard-date-filter" type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} className="absolute inset-0 cursor-pointer opacity-0" aria-label="Filter tanggal dashboard" />
          </label>
          <UserAccountMenu />
          <Button variant="teal" onClick={goToDivision} className="rounded-full px-5">
            <Building2 className="h-4 w-4" />
            Lihat Dokumen
          </Button>
        </div>
      </div>
      */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {overviewCards.map((item) => (
          <ServiceCard
            key={item.id}
            title={item.title}
            value={item.value}
            subtitle={item.subtitle}
            icon={item.icon}
            color={item.color}
            onClick={goToDivision}
          />
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.9fr)_minmax(340px,1fr)]">
        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-[#233b84]">Kalender Kegiatan {division?.shortName || 'Divisi'}</h2>
              <p className="text-sm text-slate-500">{selectedDateObject.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setCalendarMonth(-1)} className="cursor-pointer rounded-full border border-slate-200 bg-white p-2 text-slate-600 transition-colors hover:bg-slate-50 active:scale-[0.95]" aria-label="Bulan sebelumnya">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button type="button" onClick={goToToday} className="cursor-pointer rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 active:scale-[0.98]">
                Hari Ini
              </button>
              <button type="button" onClick={() => setCalendarMonth(1)} className="cursor-pointer rounded-full border border-slate-200 bg-white p-2 text-slate-600 transition-colors hover:bg-slate-50 active:scale-[0.95]" aria-label="Bulan berikutnya">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-5 rounded-[20px] border border-slate-200 bg-white p-3">
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-500">
              {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day) => (
                <div key={day} className="py-2">{day}</div>
              ))}
            </div>

            <div className="mt-2 space-y-2">
              {monthCalendar.map((week, index) => (
                <div key={index} className="grid grid-cols-7 gap-2">
                  {week.map((date, dayIndex) => {
                            const isToday = date && date.toDateString() === selectedDateObject.toDateString()
                    const docs = date
                      ? divisionDocuments.filter((document) => new Date(document.documentDate || document.uploadedAt).toDateString() === date.toDateString())
                      : []

                    return (
                      <div key={`${index}-${dayIndex}`} className={`min-h-[112px] rounded-2xl border p-2 ${date ? 'border-slate-200 bg-white' : 'border-transparent bg-transparent'} ${isToday ? 'border-blue-300 bg-[#eff5ff]' : ''}`}>
                        {date && (
                          <>
                            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${isToday ? 'bg-[#1f63d3] text-white' : 'text-[#233b84]'}`}>
                              {date.getDate()}
                            </div>
                            <div className="mt-2 space-y-1">
                              {docs.slice(0, 2).map((document) => (
                                <button key={document.id} type="button" onClick={goToDivision} className="block w-full cursor-pointer rounded-lg bg-[#eff5ff] px-2 py-1 text-left text-[11px] font-medium text-[#1f3f89] transition-colors hover:bg-[#dceaff] active:scale-[0.99]">
                                  {document.title}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-[#233b84]">Agenda Terdekat</h2>
              <p className="text-sm text-slate-500">Dokumen dan layanan terbaru</p>
            </div>
            <button type="button" onClick={goToDivision} className="cursor-pointer rounded-md px-2 py-1 text-sm font-medium text-[#1f63d3] transition-colors hover:bg-[#eff5ff] active:scale-[0.98]">
              Lihat Semua
            </button>
          </div>

          <div className="mt-4 space-y-1">
            {agendaItems.length === 0 && <p className="rounded-2xl px-3 py-6 text-sm text-slate-500">Tidak ada agenda pada tanggal terpilih.</p>}
            {agendaItems.map((item) => (
              <div key={item.id} className="flex items-start gap-3 rounded-2xl px-3 py-3 transition-colors hover:bg-slate-50">
                <div className="w-14 text-sm font-semibold text-[#2d62d7]">{item.time}</div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full text-white" style={{ backgroundColor: item.color }}>
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#233b84]">{item.title}</p>
                  <p className="truncate text-xs text-slate-500">{item.room}</p>
                </div>
                <span className="rounded-full border border-green-200 bg-green-50 px-2 py-1 text-[10px] font-semibold text-green-700">
                  Hari Ini
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}