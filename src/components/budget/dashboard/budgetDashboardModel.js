import { SERVICE_CONTENT } from '../../../data/serviceContent'
import { SERVICE_META } from '../../../data/serviceMeta'

// Palet Dashboard Anggaran. Tiga warna ini sudah diuji untuk buta warna
// (validator palet kategorikal, latar putih) dan setiap batang tetap memakai
// label teks, karena hijau dan kuning di bawah kontras 3:1.
export const SERIES_COLORS = { pagu: '#2f7fe8', realisasi: '#1fae7a', sisa: '#eda100' }

// Warna per kode mengikuti urutan kode (51, 52, 53). Kode keempat dan
// seterusnya tidak diberi hue baru; mereka dilipat ke abu-abu netral.
const CODE_COLORS = ['#2f7fe8', '#1fae7a', '#eda100']
const FALLBACK_COLOR = '#94a3b8'

// Dokumen anggaran hanya menyimpan "51", "52", "53". Namanya diambil dari
// layanan yang terikat ke kode itu, sama seperti BudgetOverview.
const CODE_NAMES = Object.entries(SERVICE_CONTENT).reduce((names, [id, content]) => {
  if (content.budgetCode) names[content.budgetCode] = SERVICE_META[id]?.title || id
  return names
}, {})

function toPercent(part, whole) {
  return whole ? (part / whole) * 100 : 0
}

export function buildBudgetModel(budget) {
  const total = {
    pagu: budget?.totalPagu || 0,
    realisasi: budget?.totalRealisasi || 0,
    sisa: budget?.totalSisa || 0
  }

  const rows = (budget?.breakdown || [])
    .filter((row) => row.pagu || row.realisasi || row.sisa)
    .map((row) => ({
      code: String(row.code),
      pagu: row.pagu || 0,
      realisasi: row.realisasi || 0,
      sisa: row.sisa || 0
    }))
    .sort((a, b) => a.code.localeCompare(b.code, 'id', { numeric: true }))
    .map((row, index) => ({
      ...row,
      name: CODE_NAMES[row.code] || `Kode ${row.code}`,
      color: CODE_COLORS[index] || FALLBACK_COLOR,
      absorption: toPercent(row.realisasi, row.pagu),
      paguShare: toPercent(row.pagu, total.pagu),
      sisaShare: toPercent(row.sisa, total.sisa)
    }))

  const absorption = toPercent(total.realisasi, total.pagu)

  return {
    fiscalYear: budget?.fiscalYear || null,
    hasData: total.pagu > 0,
    total,
    rows,
    absorption,
    remaining: total.pagu ? Math.max(0, 100 - absorption) : 0
  }
}

// Dipindah ke lib/chartAxis.js supaya dipakai grafik bidang lain; perilaku sama.
export { buildAxis } from '../../../lib/chartAxis'
