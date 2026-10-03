import { useEffect, useMemo, useState } from 'react'
import { useMasterDatasetGroup } from '../../../context/MasterDatasetContext'
import { MasterDataEmptyState } from '../../budget/MasterDataEmptyState'
import { BudgetDashboardHeader } from '../../budget/dashboard/BudgetDashboardHeader'
import { MonthCalendar } from '../../calendar/MonthCalendar'
import { IconCalendar, IconChevronDown } from '../../icons/DuotoneIcons'
import { CARD_CLASS, CARD_TITLE_CLASS } from '../../ui/cardStyles'
import { HR_DIVISION_ID } from '../bezetting/bezettingModel'
import { DiklatDetailCard } from './DiklatDetailCard'
import { DiklatFilters } from './DiklatFilters'
import { DiklatKpiCards } from './DiklatKpiCards'
import { OngoingList, UpcomingAgenda } from './DiklatSideLists'
import { DiklatTable } from './DiklatTable'
import { OngoingPrograms } from './OngoingPrograms'
import {
  DIKLAT_PREFIX, SECTION_COLORS, applyFilters, buildKpis, combinePrograms, filterOptions, ongoingPrograms, programEvents, toIsoDate, upcomingEvents
} from './diklatModel'

const EMPTY_FILTERS = { search: '', section: '', method: '', month: '', organizer: '' }

// Pemilih triwulan di kepala halaman: satu chip bila hanya satu triwulan aktif.
function QuarterPicker({ partitions, value, onChange }) {
  const chip = 'flex items-center gap-2 rounded-2xl bg-white/90 py-2 pl-3 pr-3 text-sm font-bold text-[#12305f] shadow-[0_10px_28px_-14px_rgba(18,48,95,0.22)]'
  if (partitions.length < 2) {
    return <span className={chip}><IconCalendar className="h-5 w-5 text-[#1d5fd0]" />{partitions[0]?.active.periodLabel || 'Belum ada data'}</span>
  }
  return (
    <label className={`${chip} relative pr-8`}>
      <IconCalendar className="h-5 w-5 text-[#1d5fd0]" />
      <span className="sr-only">Triwulan</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="cursor-pointer appearance-none bg-transparent outline-none">
        <option value="all">Semua triwulan ({partitions.length})</option>
        {partitions.map((partition) => <option key={partition.dataset} value={partition.period}>{partition.active.periodLabel}</option>)}
      </select>
      <IconChevronDown className="pointer-events-none absolute right-2.5 h-4 w-4" />
    </label>
  )
}

function Legend({ sections }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-[#3f557d]">
      {sections.map((section) => (
        <li key={section.id} className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: SECTION_COLORS[section.id] }} aria-hidden="true" />{section.label}
        </li>
      ))}
    </ul>
  )
}

// Menu Kalender Diklat (Bidang SDM). Data dari Master Data SDM tab Kalender
// Diklat; setiap triwulan punya versi aktif sendiri dan kalender menggabungkannya.
export function DiklatPage() {
  const group = useMasterDatasetGroup(DIKLAT_PREFIX)
  const today = toIsoDate(new Date())
  const [period, setPeriod] = useState('all')
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [view, setView] = useState('calendar')
  const [month, setMonth] = useState(() => ({ year: new Date().getFullYear(), monthIndex: new Date().getMonth() }))
  const [selection, setSelection] = useState({ programUid: null, eventId: null })

  useEffect(() => {
    sessionStorage.setItem('bpk-dashboard-selected-division', HR_DIVISION_ID)
    group.refresh()
  }, [])

  const active = useMemo(() => group.partitions.filter((partition) => partition.active), [group.partitions])
  const scoped = useMemo(() => (period === 'all' ? active : active.filter((partition) => partition.period === period)), [active, period])
  const programs = useMemo(() => combinePrograms(scoped), [scoped])
  const options = useMemo(() => filterOptions(programs), [programs])
  const filtered = useMemo(() => applyFilters(programs, filters), [programs, filters])
  const events = useMemo(() => filtered.flatMap(programEvents), [filtered])
  // Tahap > 3 minggu (belajar mandiri PKA/JFPA) tidak digambar di grid supaya kelas
  // pendek terbaca; tahap itu tampil di kartu Sedang Berlangsung, Agenda, dan Detail.
  const calendarEvents = useMemo(() => events.filter((event) => !event.priority), [events])
  const ongoing = useMemo(() => ongoingPrograms(filtered, today), [filtered, today])
  // Bulan ini kosong (mis. Kaldik triwulan depan): kalender dibuka di kegiatan terdekat.
  const hasData = programs.length > 0
  useEffect(() => {
    const shown = `${month.year}-${String(month.monthIndex + 1).padStart(2, '0')}`
    if (events.some((event) => event.start.slice(0, 7) <= shown && event.end.slice(0, 7) >= shown)) return
    const next = events.filter((event) => event.end >= today).map((event) => event.start).sort()[0]
    if (next) setMonth({ year: Number(next.slice(0, 4)), monthIndex: Number(next.slice(5, 7)) - 1 })
  }, [hasData])

  const selected = filtered.find((program) => program.uid === selection.programUid) || ongoing[0] || null

  const changeFilters = (next) => {
    setFilters(next)
    if (next.month && next.month !== filters.month) setMonth({ year: Number(next.month.slice(0, 4)), monthIndex: Number(next.month.slice(5, 7)) - 1 })
  }
  const selectProgram = (program) => setSelection({ programUid: program.uid, eventId: null })
  const selectEvent = (event) => {
    setSelection({ programUid: event.programUid, eventId: event.id })
    setMonth({ year: Number(event.start.slice(0, 4)), monthIndex: Number(event.start.slice(5, 7)) - 1 })
  }

  const header = <BudgetDashboardHeader title="KALENDER DIKLAT" subtitle="JADWAL PELATIHAN PEGAWAI DAN AGENDA PENGEMBANGAN KOMPETENSI" icon={IconCalendar} showYearPicker={false} actions={<QuarterPicker partitions={active} value={period} onChange={setPeriod} />} />
  if (!active.length) {
    return (
      <div className="flex flex-col gap-4 text-[#12305f] fit:gap-2.5">
        {header}
        <MasterDataEmptyState title="Belum ada Kalender Diklat" description="Jadwal diklat dibentuk dari PDF Kalender Pelatihan (Kaldik) per triwulan yang diunggah administrator di Master Data SDM, tab Kalender Diklat." masterDataPath="/dashboard/master-sdm#diklat" />
      </div>
    )
  }

  return (
    <div className={`flex flex-col gap-4 text-[#12305f] fit:gap-2.5 ${view === 'calendar' ? 'tall:h-[calc(100dvh-4rem)]' : ''}`}>
      {header}
      <DiklatKpiCards kpis={buildKpis(filtered, today)} today={today} />
      <DiklatFilters filters={filters} options={options} view={view} onChange={changeFilters} onViewChange={setView} />
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.42fr)] fit:gap-2.5 tall:min-h-0 tall:flex-1">
        <div className="flex min-h-0 min-w-0 flex-col gap-4 fit:gap-2.5">
          <OngoingPrograms programs={ongoing} today={today} selectedUid={selected?.uid} onSelect={selectProgram} />
          {view === 'calendar' ? (
            <div className={`${CARD_CLASS} min-h-0 flex-1`}>
              <MonthCalendar
                title={<h2 className={`${CARD_TITLE_CLASS} flex items-center gap-2`}><IconCalendar className="h-5 w-5 text-[#2f7fe8]" />Kalender Diklat</h2>}
                aside={<Legend sections={options.sections.filter((section) => section.id !== 'self-learning')} />}
                year={month.year}
                monthIndex={month.monthIndex}
                events={calendarEvents}
                today={today}
                selectedId={selection.eventId}
                onSelect={selectEvent}
                onMonthChange={(year, monthIndex) => setMonth({ year, monthIndex })}
                rowClassName="min-h-[88px] tall:min-h-0"
                className="flex-1"
              />
            </div>
          ) : <DiklatTable programs={filtered} today={today} onSelect={selectProgram} />}
        </div>
        <aside className="flex min-h-0 min-w-0 flex-col gap-4 fit:gap-2.5">
          <DiklatDetailCard program={selected} today={today} selectedEventId={selection.eventId} />
          <OngoingList programs={ongoing} onSelect={selectProgram} />
          <UpcomingAgenda events={upcomingEvents(filtered, today)} onSelect={selectEvent} />
        </aside>
      </section>
    </div>
  )
}
