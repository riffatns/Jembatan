import { useCallback, useEffect, useMemo, useState } from 'react'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { BudgetDashboardHeader } from '../components/budget/dashboard/BudgetDashboardHeader'
import { MonthCalendar } from '../components/calendar/MonthCalendar'
import { AgendaEventModal } from '../components/agenda/AgendaEventModal'
import { AgendaDetailCard } from '../components/agenda/calendar/AgendaDetailCard'
import { AgendaTable } from '../components/agenda/calendar/AgendaTable'
import { UpcomingAgendaList } from '../components/agenda/calendar/AgendaSideLists'
import { SharedCalendarFilters } from '../components/agenda/calendar/SharedCalendarFilters'
import { SharedCalendarKpiCards } from '../components/agenda/calendar/SharedCalendarKpiCards'
import { DivisionLegend } from '../components/agenda/calendar/DivisionLegend'
import { TodayAgendaStrip } from '../components/agenda/calendar/TodayAgendaStrip'
import { IconCalendar, IconUpload } from '../components/icons/DuotoneIcons'
import { Button } from '../components/ui/button'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { CARD_CLASS, CARD_TITLE_CLASS } from '../components/ui/cardStyles'
import { COLORED_DIVISION_IDS } from '../data/divisionPalette'
import { parseDateKey } from '../lib/agendaStorage'
import {
  EMPTY_FILTERS,
  agendaCalendarEvents,
  applyFilters,
  buildKpis,
  filterOptions,
  monthKeyOf,
  ongoingAgenda,
  todayKey,
  upcomingAgenda
} from '../components/agenda/calendar/sharedCalendarModel'

// Kalender Bersama: agenda seluruh bidang dalam satu tampilan. Susunannya
// sama dengan Kalender Diklat - kartu ringkasan, bilah penyaring, kalender
// besar, kolom rincian di kanan - tetapi datanya berdiri sendiri. Keduanya
// memang beda urusan: yang satu program pelatihan pegawai, yang ini agenda
// kegiatan antarbidang, jadi tidak ada angka atau jadwal yang dibagi.
export default function SharedCalendar() {
  const { agendaEvents, divisions, addAgendaEvent, updateAgendaEvent, deleteAgendaEvent } = useData()
  const { user, isAdmin } = useAuth()
  const today = todayKey()

  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [view, setView] = useState('calendar')
  const [month, setMonth] = useState(() => ({ year: new Date().getFullYear(), monthIndex: new Date().getMonth() }))
  const [selectedId, setSelectedId] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Hanya bidang yang punya slot warna tervalidasi yang tampil di legenda.
  const calendarDivisions = useMemo(
    () => COLORED_DIVISION_IDS.map((id) => divisions.find((division) => division.id === id)).filter(Boolean),
    [divisions]
  )

  const divisionName = useCallback(
    (divisionId) => divisions.find((division) => division.id === divisionId)?.name || '',
    [divisions]
  )

  const options = useMemo(() => filterOptions(agendaEvents, divisions), [agendaEvents, divisions])
  const filtered = useMemo(() => applyFilters(agendaEvents, filters), [agendaEvents, filters])
  const kpis = useMemo(() => buildKpis(filtered, today), [filtered, today])
  const calendarEvents = useMemo(() => agendaCalendarEvents(filtered), [filtered])
  const ongoing = useMemo(() => ongoingAgenda(filtered, today), [filtered, today])
  const upcoming = useMemo(() => upcomingAgenda(filtered, today), [filtered, today])

  // Hitungan per bidang pada bulan yang sedang tampil, untuk legenda.
  const monthKey = `${month.year}-${String(month.monthIndex + 1).padStart(2, '0')}`
  const counts = useMemo(() => {
    const hasil = {}
    for (const event of agendaEvents) {
      if (monthKeyOf(event) !== monthKey) continue
      hasil[event.divisionId] = (hasil[event.divisionId] || 0) + 1
    }
    return hasil
  }, [agendaEvents, monthKey])

  const selected = filtered.find((event) => event.id === selectedId) || ongoing[0] || upcoming[0] || null

  const canManage = useCallback(
    (event) => {
      if (!user || !event) return false
      if (isAdmin) return true
      if (event.createdBy && user.id) return event.createdBy === user.id
      return Boolean(event.createdByName) && event.createdByName === user.name
    },
    [user, isAdmin]
  )

  const selectEvent = (event) => {
    setSelectedId(event.id)
    const iso = event.eventDate || event.start
    if (iso) setMonth({ year: Number(iso.slice(0, 4)), monthIndex: Number(iso.slice(5, 7)) - 1 })
  }

  // Memilih bulan di penyaring ikut memindahkan kalender ke bulan itu.
  const changeFilters = (next) => {
    setFilters(next)
    if (next.month && next.month !== filters.month) {
      setMonth({ year: Number(next.month.slice(0, 4)), monthIndex: Number(next.month.slice(5, 7)) - 1 })
    }
  }

  const openCreate = () => {
    setEditingEvent(null)
    setFormOpen(true)
  }

  const handleEdit = (event) => {
    setEditingEvent(event)
    setFormOpen(true)
  }

  const handleDelete = async () => {
    setDeleting(true)
    await deleteAgendaEvent(pendingDelete.id)
    setDeleting(false)
    setPendingDelete(null)
    setSelectedId(null)
  }

  const handleSubmit = async (payload) => {
    if (payload.id) await updateAgendaEvent(payload.id, payload)
    else await addAgendaEvent(payload)

    // Pastikan agenda yang baru disimpan benar-benar terlihat, bukan tersembunyi
    // di balik penyaring yang sedang aktif.
    setFilters(EMPTY_FILTERS)
    setSelectedId(payload.id || null)
    const target = parseDateKey(payload.eventDate)
    setMonth({ year: target.getFullYear(), monthIndex: target.getMonth() })
  }

  useEffect(() => {
    sessionStorage.removeItem('bpk-dashboard-selected-category')
  }, [])

  return (
    <div className={`flex flex-col gap-4 text-[#12305f] fit:gap-2.5 ${view === 'calendar' ? 'tall:h-[calc(100dvh-4rem)]' : ''}`}>
      <BudgetDashboardHeader
        title="KALENDER BERSAMA"
        subtitle="AGENDA KEGIATAN SELURUH BIDANG DALAM SATU TAMPILAN"
        icon={IconCalendar}
        showYearPicker={false}
        actions={
          <Button variant="teal" onClick={openCreate} className="rounded-full px-5 shadow-[0_14px_30px_rgba(31,99,211,0.26)]">
            <IconUpload className="h-4 w-4" /> Tambah Agenda
          </Button>
        }
      />

      <SharedCalendarKpiCards kpis={kpis} today={today} />
      <SharedCalendarFilters filters={filters} options={options} view={view} onChange={changeFilters} onViewChange={setView} />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.42fr)] fit:gap-2.5 tall:min-h-0 tall:flex-1">
        <div className="flex min-h-0 min-w-0 flex-col gap-4 fit:gap-2.5">
          <TodayAgendaStrip
            events={ongoing}
            today={today}
            divisionName={divisionName}
            selectedId={selected?.id}
            onSelect={selectEvent}
          />

          {view === 'calendar' ? (
            <div className={`${CARD_CLASS} min-h-0 flex-1`}>
              <MonthCalendar
                title={<h2 className={`${CARD_TITLE_CLASS} flex items-center gap-2`}><IconCalendar className="h-5 w-5 text-[#2f7fe8]" />Kalender Bersama</h2>}
                aside={<DivisionLegend divisions={calendarDivisions} active={filters.division} counts={counts} onPick={(id) => changeFilters({ ...filters, division: id })} />}
                year={month.year}
                monthIndex={month.monthIndex}
                events={calendarEvents}
                today={today}
                selectedId={selected?.id}
                onSelect={(event) => selectEvent(filtered.find((item) => item.id === event.id) || event)}
                onMonthChange={(year, monthIndex) => setMonth({ year, monthIndex })}
                rowClassName="min-h-[88px] tall:min-h-0"
                className="flex-1"
              />
            </div>
          ) : (
            <AgendaTable
              events={filtered}
              today={today}
              divisionName={divisionName}
              selectedId={selected?.id}
              onSelect={selectEvent}
            />
          )}
        </div>

        <aside className="flex min-h-0 min-w-0 flex-col gap-4 fit:gap-2.5">
          <AgendaDetailCard
            event={selected}
            today={today}
            divisionName={divisionName(selected?.divisionId)}
            allEvents={agendaEvents}
            canManage={canManage(selected)}
            onEdit={handleEdit}
            onDelete={setPendingDelete}
          />
          <UpcomingAgendaList events={upcoming} divisionName={divisionName} selectedId={selected?.id} onSelect={selectEvent} />
        </aside>
      </section>

      <AgendaEventModal
        open={formOpen}
        onOpenChange={setFormOpen}
        initialEvent={editingEvent}
        defaultDate={selected?.eventDate || today}
        defaultDivisionId={editingEvent?.divisionId || user?.division || calendarDivisions[0]?.id || ''}
        divisionOptions={calendarDivisions}
        lockDivision={!isAdmin}
        conflictPool={agendaEvents}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Hapus agenda?"
        description={pendingDelete ? `"${pendingDelete.title}" akan dihapus dari kalender bersama dan tidak bisa dikembalikan.` : ''}
        confirmLabel="Hapus agenda"
        busyLabel="Menghapus..."
        busy={deleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
