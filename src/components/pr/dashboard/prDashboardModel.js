import { AGENDA_EVENT_TYPES, getAgendaTypeMeta, toDateKey } from '../../../lib/agendaStorage'

// Angka Dashboard Humas dan TU Kalan. Murni, tanpa impor React.
//
// Sumbernya dua: agenda pimpinan yang dicatat di layanan Agenda Kalan, dan
// dokumen layanan bidang ini. Status agenda ("Selesai", "Dibatalkan") dibaca
// apa adanya dari catatannya - tidak diturunkan dari tanggal, karena agenda
// yang tanggalnya lewat belum tentu benar-benar terlaksana.

export const PR_DIVISION_ID = 'pr'

// Berapa agenda yang ditampilkan pada tabel "paling dekat".
const MAX_UPCOMING_ROWS = 8

const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

function tahunDari(event) {
  return Number(String(event.eventDate || '').slice(0, 4)) || 0
}

function bulanDari(event) {
  return Number(String(event.eventDate || '').slice(5, 7)) || 0
}

export function buildPrModel({ events = [], documents = [], categories = [], today = new Date() } = {}) {
  const hariIni = toDateKey(today)
  const tahunIni = today.getFullYear()

  const tahunan = events.filter((event) => tahunDari(event) === tahunIni)
  const lewat = events.filter((event) => String(event.eventDate || '') < hariIni)
  const terlaksana = lewat.filter((event) => event.status === 'done')
  const akanDatang = events
    .filter((event) => String(event.eventDate || '') >= hariIni && event.status !== 'cancelled')
    .sort((a, b) => String(a.eventDate).localeCompare(String(b.eventDate)))

  const perBulan = BULAN.map((label, index) => ({
    key: label,
    label,
    value: tahunan.filter((event) => bulanDari(event) === index + 1).length
  }))

  const jenis = AGENDA_EVENT_TYPES.map((meta) => ({
    key: meta.id,
    label: meta.label,
    value: events.filter((event) => getAgendaTypeMeta(event.eventType).id === meta.id).length,
    color: meta.color
  })).filter((item) => item.value > 0)

  const terdekat = akanDatang.slice(0, MAX_UPCOMING_ROWS).map((event) => ({
    id: event.id,
    title: event.title,
    location: event.location || '',
    typeLabel: getAgendaTypeMeta(event.eventType).label,
    typeColor: getAgendaTypeMeta(event.eventType).color,
    eventDate: event.eventDate,
    sisa: Math.round((new Date(`${event.eventDate}T00:00:00`) - new Date(`${hariIni}T00:00:00`)) / 86400000)
  }))

  // Dokumen per layanan - termasuk layanan yang belum punya dokumen, supaya
  // yang kosong terlihat kosong, bukan hilang dari daftar.
  const perLayanan = categories.map((category) => ({
    key: category.id,
    label: category.name,
    value: documents.filter((document) => document.categoryId === category.id).length
  }))

  const disetujui = documents.filter((document) => document.status === 'approved').length
  const menunggu = documents.filter((document) => document.status === 'pending').length
  const ditolak = documents.filter((document) => document.status === 'rejected').length

  return {
    hasData: events.length > 0 || documents.length > 0,
    total: {
      agenda: events.length,
      tahunIni: tahunan.length,
      akanDatang: akanDatang.length,
      terlaksana: terlaksana.length,
      lewat: lewat.length,
      dibatalkan: events.filter((event) => event.status === 'cancelled').length,
      dokumen: documents.length,
      disetujui,
      menunggu,
      ditolak
    },
    terlaksanaShare: lewat.length ? (terlaksana.length / lewat.length) * 100 : 0,
    disetujuiShare: documents.length ? (disetujui / documents.length) * 100 : 0,
    perBulan,
    jenis,
    terdekat,
    perLayanan,
    tahunIni
  }
}
