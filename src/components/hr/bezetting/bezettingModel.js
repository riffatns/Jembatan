import { MONTH_NAMES } from '../../../lib/bezettingParser'

export const BEZETTING_DATASET = 'hr-bezetting'
export const HR_DIVISION_ID = 'hr'

const PUBLIC_FIELDS = [
  'rowId', 'fullName', 'name', 'pangkatGolongan', 'pangkat', 'golongan', 'unitKerja', 'unitKerjaAsli',
  'pendidikan', 'jenisKelamin', 'statusKepegawaian', 'jabatan', 'jabatanFungsional', 'jabatanStruktural',
  'rangeUsia', 'rangeMasaKerja'
]

export const EDUCATION_COLORS = { S3: '#123f99', S2: '#5b9cf0', S1: '#1e5fd6', D4: '#8b7cf6', D3: '#b9a8ff' }
const EDUCATION_ORDER = ['S3', 'S2', 'S1', 'D4', 'D3', 'D2', 'D1', 'SLTA', 'SLTP', 'SD']

// Payload Master Data dari hasil parseBezettingWorkbook: data umum (tabel
// umum) dan data rinci (tabel privat, hanya admin + SDM), dipisah di sini.
export function buildBezettingPayloads(parsed, { periodMonth, periodYear }) {
  const label = periodMonth && periodYear ? `${MONTH_NAMES[periodMonth - 1]} ${periodYear}` : null
  return {
    period: { month: periodMonth || null, year: periodYear || null, label },
    payload: {
      abk: parsed.abk,
      employees: parsed.employees.map((employee) => Object.fromEntries(PUBLIC_FIELDS.map((field) => [field, employee[field] ?? null])))
    },
    privatePayload: { employees: parsed.details }
  }
}

function countBy(items, key) {
  return items.reduce((counts, item) => {
    const value = item[key] || 'Lainnya'
    counts[value] = (counts[value] || 0) + 1
    return counts
  }, {})
}

// "III/a" -> 3.01, "IV/d" -> 4.04: urutan golongan yang benar.
function golonganRank(value) {
  const match = /^(IV|III|II|I)\/([a-e])$/i.exec(String(value || ''))
  if (!match) return 99
  return { I: 1, II: 2, III: 3, IV: 4 }[match[1].toUpperCase()] + (match[2].toLowerCase().charCodeAt(0) - 96) / 100
}

const educationRank = (value) => {
  const index = EDUCATION_ORDER.indexOf(value)
  return index === -1 ? 99 : index
}

export function filterOptions(employees) {
  const byCount = (counts) => Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([value]) => value)
  return {
    units: byCount(countBy(employees, 'unitKerja')),
    education: Object.keys(countBy(employees, 'pendidikan')).sort((a, b) => educationRank(a) - educationRank(b)),
    golongan: Object.keys(countBy(employees, 'golongan')).sort((a, b) => golonganRank(a) - golonganRank(b))
  }
}

// Pencarian realtime pada nama, unit kerja, dan jabatan + tiga pilihan filter.
export function filterEmployees(employees, { query, unit, education, golongan }) {
  const terms = String(query || '').trim().toLowerCase().split(/\s+/).filter(Boolean)
  return employees.filter((employee) => {
    if (unit && employee.unitKerja !== unit) return false
    if (education && employee.pendidikan !== education) return false
    if (golongan && employee.golongan !== golongan) return false
    if (!terms.length) return true
    const haystack = [employee.fullName, employee.unitKerja, employee.unitKerjaAsli, employee.jabatan, employee.jabatanFungsional]
      .filter(Boolean).join(' ').toLowerCase()
    return terms.every((term) => haystack.includes(term))
  })
}

export function summarizeEmployees(employees) {
  const gender = countBy(employees, 'jenisKelamin')
  const education = countBy(employees, 'pendidikan')
  const golongan = countBy(employees, 'golongan')
  const units = countBy(employees, 'unitKerja')
  return {
    total: employees.length,
    male: gender['Laki-laki'] || 0,
    female: gender.Perempuan || 0,
    education: Object.entries(education)
      .sort((a, b) => b[1] - a[1] || educationRank(a[0]) - educationRank(b[0]))
      .map(([key, value]) => ({ key, label: key, value, color: EDUCATION_COLORS[key] || '#94a3b8' })),
    golongan: Object.entries(golongan)
      .sort((a, b) => golonganRank(a[0]) - golonganRank(b[0]))
      .map(([key, value]) => ({ key, label: key, value })),
    units: Object.entries(units).sort((a, b) => b[1] - a[1]).map(([key, value]) => ({ key, label: key, value }))
  }
}

// Formasi ABK: status per kategori dan catatan kesenjangan terbesar.
export function summarizeAbk(abk) {
  const categories = (abk?.categories || []).map((category) => ({
    ...category,
    status: category.gap >= 0 ? 'Terpenuhi' : 'Perlu Pemenuhan'
  }))
  const total = abk?.total || { need: 0, actual: 0, gap: 0 }
  const largestGaps = [...categories].filter((category) => category.gap < 0).sort((a, b) => a.gap - b.gap).slice(0, 2)
  return {
    categories,
    total,
    fulfillment: total.need ? (total.actual / total.need) * 100 : 0,
    largestGaps
  }
}
