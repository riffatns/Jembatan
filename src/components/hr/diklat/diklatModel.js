import { KALDIK_SECTIONS } from '../../../lib/kaldikParser.js'

// Model murni menu Kalender Diklat. Kaldik disimpan per triwulan
// (dataset 'hr-diklat:2026-TW4'); menu menggabungkan semua triwulan aktif.

export const DIKLAT_PREFIX = 'hr-diklat:'
const ROMAN = ['I', 'II', 'III', 'IV']

// Warna per jenis, urutan tetap (divalidasi validator palet: CVD & normal lolos;
// kontras < 3:1 sehingga bilah kalender selalu memakai label teks gelap).
export const SECTION_COLORS = {
  kepemimpinan: '#2a78d6',
  fungsional: '#eb6834',
  'non-pemeriksaan': '#1baf7a',
  teknis: '#eda100',
  'self-learning': '#e87ba4',
  internasional: '#4a3aa7'
}

export const SECTION_LABELS = Object.fromEntries(KALDIK_SECTIONS.map((section) => [section.id, section.label]))

export const STATUS_LABELS = {
  berlangsung: 'Sedang Berlangsung',
  'akan-datang': 'Akan Datang',
  selesai: 'Selesai',
  diusulkan: 'Diusulkan',
  tba: 'Jadwal Belum Pasti'
}

export function quarterLabel(quarter, year) {
  return `Triwulan ${ROMAN[quarter - 1] || quarter} Tahun ${year}`
}

export function diklatDatasetName(year, quarter) {
  return `${DIKLAT_PREFIX}${year}-TW${quarter}`
}

// '2026-TW4' -> { year: 2026, quarter: 4 }; null bila bukan nama periode Kaldik.
export function parsePeriod(period) {
  const match = /^(\d{4})-TW([1-4])$/.exec(period || '')
  return match ? { year: Number(match[1]), quarter: Number(match[2]) } : null
}

export function periodYears(partitions) {
  return [...new Set(partitions.map((partition) => parsePeriod(partition.period)?.year).filter(Boolean))].sort((a, b) => b - a)
}

export function quartersOfYear(partitions, year) {
  return partitions.map((partition) => parsePeriod(partition.period)).filter((period) => period?.year === year).map((period) => period.quarter).sort()
}

// Tahun bawaan: tahun berjalan bila ada datanya, selain itu tahun terbaru.
export function defaultYear(partitions, today) {
  const years = periodYears(partitions)
  const current = Number(today.slice(0, 4))
  return years.includes(current) ? current : years[0] || current
}

// Triwulan aktif sesuai pilihan Tahun dan Triwulan ('all' = semua triwulan tahun itu).
export function scopePartitions(partitions, { year, quarter }) {
  return partitions.filter((partition) => {
    const period = parsePeriod(partition.period)
    return period?.year === year && (quarter === 'all' || period.quarter === quarter)
  })
}

export function buildDiklatPayload(parsed) {
  return {
    period: { month: null, year: parsed.year, label: quarterLabel(parsed.quarter, parsed.year) },
    payload: { title: parsed.title, quarter: parsed.quarter, year: parsed.year, programs: parsed.programs, warnings: parsed.warnings }
  }
}

const pad = (value) => String(value).padStart(2, '0')
export const toIsoDate = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

// Program dari semua triwulan aktif. Program yang sama (jenis + nama + mulai)
// muncul di beberapa Kaldik (mis. PKP berjalan lintas triwulan): yang dipakai
// versi triwulan terbaru. partitions sudah urut dari periode terbaru.
export function combinePrograms(partitions) {
  const seen = new Set()
  const programs = []
  partitions.forEach(({ period, active }) => {
    (active?.payload?.programs || []).forEach((program) => {
      const key = `${program.section}|${program.name.toLowerCase()}|${program.schedule.start || program.schedule.raw}`
      if (seen.has(key)) return
      seen.add(key)
      programs.push({ ...program, uid: `${period}:${program.id}`, period })
    })
  })
  return programs
}

export function programStatus(program, today) {
  if (program.status === 'diusulkan') return 'diusulkan'
  const { start, end } = program.schedule
  if (!start) return 'tba'
  if (today < start) return 'akan-datang'
  if (today > end) return 'selesai'
  return 'berlangsung'
}

export const isSelfLearning = (program) => program.section === 'self-learning'

const LONG_EVENT_DAYS = 21
const daySpan = (start, end) => (new Date(end) - new Date(start)) / 86400000 + 1

// Kegiatan kalender: per tahap bila tahapnya bertanggal, lalu per moda
// (SL/DL/KL), selain itu program utuh. Self Learning tahunan tidak masuk kalender.
// Kegiatan > 3 minggu (mis. tahap belajar mandiri) diberi prioritas lajur rendah.
export function programEvents(program) {
  if (isSelfLearning(program)) return []
  const base = { programUid: program.uid, section: program.section, color: SECTION_COLORS[program.section], muted: program.status === 'diusulkan' }
  return rawEvents(program, base).map((event) => ({ ...event, priority: daySpan(event.start, event.end) > LONG_EVENT_DAYS ? 1 : 0 }))
}

function rawEvents(program, base) {
  const phases = program.phases.filter((phase) => phase.schedule.start)
  if (phases.length) {
    return phases.map((phase) => ({ ...base, id: `${program.uid}:${phase.id}`, label: `${program.name} · ${phase.label}. ${phase.name}`, start: phase.schedule.start, end: phase.schedule.end }))
  }
  const parts = program.schedule.parts.filter((part) => part.start)
  if (parts.length) {
    return parts.map((part) => ({ ...base, id: `${program.uid}:${part.label}`, label: `${program.name} (${part.label})`, start: part.start, end: part.end }))
  }
  if (!program.schedule.start) return []
  return [{ ...base, id: program.uid, label: program.name, start: program.schedule.start, end: program.schedule.end }]
}

const overlaps = (event, from, to) => event.start <= to && event.end >= from

export function monthRange(year, monthIndex) {
  const last = new Date(year, monthIndex + 1, 0).getDate()
  return { from: `${year}-${pad(monthIndex + 1)}-01`, to: `${year}-${pad(monthIndex + 1)}-${pad(last)}` }
}

export function scheduledInMonth(program, year, monthIndex) {
  const { from, to } = monthRange(year, monthIndex)
  return programEvents(program).some((event) => overlaps(event, from, to))
}

export function buildKpis(programs, today) {
  const date = new Date(`${today}T00:00:00`)
  return {
    total: programs.length,
    ongoing: programs.filter((program) => !isSelfLearning(program) && programStatus(program, today) === 'berlangsung').length,
    thisMonth: programs.filter((program) => scheduledInMonth(program, date.getFullYear(), date.getMonth())).length,
    selfLearning: programs.filter(isSelfLearning).length,
    international: programs.filter((program) => program.section === 'internasional').length
  }
}

// Bagian program yang sudah lewat (0..1) menurut tanggal hari ini.
export function programProgress(program, today) {
  const { start, end } = program.schedule
  if (!start || !end) return 0
  const span = new Date(end) - new Date(start) + 86400000
  return Math.min(1, Math.max(0, (new Date(today) - new Date(start) + 86400000) / span))
}

export function ongoingPrograms(programs, today) {
  return programs
    .filter((program) => !isSelfLearning(program) && programStatus(program, today) === 'berlangsung')
    .sort((a, b) => a.schedule.end.localeCompare(b.schedule.end))
}

export function upcomingEvents(programs, today, limit = 5) {
  return programs.flatMap(programEvents).filter((event) => event.start > today).sort((a, b) => a.start.localeCompare(b.start)).slice(0, limit)
}

export function filterOptions(programs) {
  const unique = (values) => [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'id'))
  return {
    sections: KALDIK_SECTIONS.filter((section) => programs.some((program) => program.section === section.id)),
    methods: unique(programs.map((program) => program.methodGroup)),
    organizers: unique(programs.map((program) => program.organizer)),
    months: eventMonths(programs)
  }
}

const MONTH_LABEL = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' })

// Bulan yang punya kegiatan kalender, sebagai { value: 'YYYY-MM', label: 'Oktober 2026' }.
function eventMonths(programs) {
  const months = new Set()
  programs.flatMap(programEvents).forEach((event) => {
    const cursor = new Date(`${event.start.slice(0, 7)}-01T00:00:00`)
    const last = event.end.slice(0, 7)
    while (toIsoDate(cursor).slice(0, 7) <= last) {
      months.add(toIsoDate(cursor).slice(0, 7))
      cursor.setMonth(cursor.getMonth() + 1)
    }
  })
  return [...months].sort().map((value) => ({ value, label: MONTH_LABEL.format(new Date(`${value}-01T00:00:00`)) }))
}

// Filter Bulan juga memuat Self Learning yang terbuka di bulan itu (rentang tahunan).
function inMonthForFilter(program, year, monthIndex) {
  if (!isSelfLearning(program)) return scheduledInMonth(program, year, monthIndex)
  const { from, to } = monthRange(year, monthIndex)
  return Boolean(program.schedule.start) && overlaps(program.schedule, from, to)
}

export function applyFilters(programs, filters) {
  const query = filters.search.trim().toLowerCase()
  return programs.filter((program) => {
    if (filters.section && program.section !== filters.section) return false
    if (filters.method && program.methodGroup !== filters.method) return false
    if (filters.organizer && program.organizer !== filters.organizer) return false
    if (filters.month && !inMonthForFilter(program, Number(filters.month.slice(0, 4)), Number(filters.month.slice(5, 7)) - 1)) return false
    if (query && !`${program.name} ${program.organizer} ${program.method}`.toLowerCase().includes(query)) return false
    return true
  })
}

// "2" -> "2 hari / 20 JP"; teks yang sudah berisi satuan dibiarkan.
export function formatDuration(program) {
  const days = /^\d+$/.test(program.days || '') ? `${program.days} hari` : program.days
  return [days, program.jp && `${program.jp} JP`].filter(Boolean).join(' / ') || '-'
}

const SHORT_DATE = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })

export function formatRange(start, end) {
  if (!start) return 'TBA'
  const from = SHORT_DATE.format(new Date(`${start}T00:00:00`))
  return start === end ? from : `${from} – ${SHORT_DATE.format(new Date(`${end}T00:00:00`))}`
}
