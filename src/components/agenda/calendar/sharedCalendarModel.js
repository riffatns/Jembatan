import {
  AGENDA_EVENT_TYPES,
  AGENDA_STATUSES,
  agendaCoversDate,
  agendaEndDate,
  getAgendaTypeMeta,
  toDateKey
} from '../../../lib/agendaStorage'
import { getDivisionVisual } from '../../../data/divisionPalette'

// Angka dan penyaringan Kalender Bersama. Murni, tanpa impor React.
//
// Sengaja terpisah dari diklatModel meski tampilannya sekeluarga: isinya
// agenda kegiatan antarbidang, bukan program pelatihan. Warnanya dari palet
// divisi (bukan palet jenis diklat), jenis kegiatannya rapat/kunjungan/...
// (bukan kepemimpinan/fungsional), dan satu-satunya sumbernya agendaEvents.
// Menggabungkan keduanya akan membuat satu kalender mengubah arti yang lain.

export const EMPTY_FILTERS = { search: '', division: '', type: '', month: '', status: '' }

// Berapa agenda mendatang yang ditampilkan di kolom kanan.
const MAX_UPCOMING = 6

const MONTH_LABEL = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' })

export const PHASE_LABELS = {
  berlangsung: 'Sedang Berlangsung',
  'akan-datang': 'Akan Datang',
  selesai: 'Selesai',
  dibatalkan: 'Dibatalkan'
}

export const PHASE_TONES = {
  berlangsung: 'bg-[#dcf5e8] text-[#0b7a4f]',
  'akan-datang': 'bg-[#e6eefb] text-[#1d5fd0]',
  selesai: 'bg-[#eef2f8] text-[#5a6f93]',
  dibatalkan: 'bg-[#fde2e2] text-[#c0262d]'
}

// Posisi agenda terhadap hari ini. Ini keadaan tampilan, bukan status yang
// tersimpan: Dashboard Humas tetap membaca event.status apa adanya, karena
// agenda yang tanggalnya lewat belum tentu benar-benar terlaksana. Keduanya
// ditampilkan berdampingan di kartu rincian supaya tidak saling menutupi.
export function agendaPhase(event, today) {
  if (event.status === 'cancelled') return 'dibatalkan'
  if (agendaCoversDate(event, today)) return 'berlangsung'
  return agendaEndDate(event) < today ? 'selesai' : 'akan-datang'
}

export function monthKeyOf(event) {
  return String(event.eventDate || '').slice(0, 7)
}

export function filterOptions(events, divisions = []) {
  const byId = new Map(divisions.map((division) => [division.id, division.name]))
  const hadir = (ambil) => [...new Set(events.map(ambil).filter(Boolean))]

  return {
    divisions: hadir((event) => event.divisionId)
      .map((id) => ({ value: id, label: byId.get(id) || getDivisionVisual(id).abbr }))
      .sort((a, b) => a.label.localeCompare(b.label, 'id')),
    types: AGENDA_EVENT_TYPES.filter((type) => events.some((event) => getAgendaTypeMeta(event.eventType).id === type.id))
      .map((type) => ({ value: type.id, label: type.label })),
    months: hadir(monthKeyOf)
      .sort()
      .map((key) => ({ value: key, label: MONTH_LABEL.format(new Date(`${key}-01T00:00:00`)) })),
    statuses: AGENDA_STATUSES.filter((status) => events.some((event) => event.status === status.id))
      .map((status) => ({ value: status.id, label: status.label }))
  }
}

export function applyFilters(events, filters) {
  const kata = filters.search.trim().toLowerCase()

  return events.filter((event) => {
    if (filters.division && event.divisionId !== filters.division) return false
    if (filters.type && getAgendaTypeMeta(event.eventType).id !== filters.type) return false
    if (filters.month && monthKeyOf(event) !== filters.month) return false
    if (filters.status && event.status !== filters.status) return false
    if (!kata) return true
    return [event.title, event.location, event.organizer, event.attendees, event.description]
      .filter(Boolean)
      .some((nilai) => String(nilai).toLowerCase().includes(kata))
  })
}

export function buildKpis(events, today) {
  const bulanIni = today.slice(0, 7)
  return {
    total: events.length,
    ongoing: events.filter((event) => agendaPhase(event, today) === 'berlangsung').length,
    thisMonth: events.filter((event) => monthKeyOf(event) === bulanIni).length,
    upcoming: events.filter((event) => agendaPhase(event, today) === 'akan-datang').length,
    divisions: new Set(events.map((event) => event.divisionId)).size
  }
}

// Bentuk yang dimengerti MonthCalendar. Warnanya per bidang, jadi satu bidang
// selalu berwarna sama di kalender, legenda, dan daftar.
export function agendaCalendarEvents(events) {
  return events.map((event) => ({
    id: event.id,
    label: event.title,
    title: event.title,
    color: getDivisionVisual(event.divisionId).color,
    start: event.eventDate,
    end: agendaEndDate(event),
    muted: event.status === 'cancelled'
  }))
}

const byStart = (a, b) =>
  String(a.eventDate).localeCompare(String(b.eventDate)) ||
  String(a.startTime || '').localeCompare(String(b.startTime || ''))

export function ongoingAgenda(events, today) {
  return events.filter((event) => agendaPhase(event, today) === 'berlangsung').sort(byStart)
}

export function upcomingAgenda(events, today) {
  return events
    .filter((event) => agendaPhase(event, today) === 'akan-datang')
    .sort(byStart)
    .slice(0, MAX_UPCOMING)
}

export function todayKey() {
  return toDateKey(new Date())
}
