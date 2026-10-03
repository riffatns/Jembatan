// Membaca berkas Bezetting SDM (sheet "ABK" dan "Lengkap_PBD") menjadi data
// Master Data SDM. Sengaja tanpa import lokal supaya bisa diuji dengan Node
// terhadap berkas asli.
//
// Data pribadi: kolom pegawai hanya dibaca sampai "TMT Jabatan Tertentu".
// Kolom sesudahnya (pasangan, anak, domisili, HP, BPJS, Taspen, NIK, ...)
// tidak pernah dibaca. Kolom yang dibaca dipisah menjadi data umum (untuk
// grafik dan daftar) dan data rinci (disimpan di tabel yang hanya bisa
// dibaca admin dan pegawai SDM).

export const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

const EMPLOYEE_SHEET = /^lengkap/i
const ABK_SHEET = /^abk$/i
const LAST_KEPT_COLUMN = /^tmt jabatan tertentu$/i

// Kolom umum: [kunci, pola judul]. Sisanya (sampai batas) menjadi data rinci.
const PUBLIC_COLUMNS = [
  ['fullName', /^nama lengkap$/i],
  ['name', /^nama$/i],
  ['pangkatGolongan', /^pangkat\/gol$/i],
  ['pangkat', /^pangkat$/i],
  ['golongan', /^gol$/i],
  ['unitKerjaAsli', /^unit kerja$/i],
  ['pendidikan', /^tk\.? ?pendidikan$/i],
  ['jenisKelamin', /^jenis kelamin$/i],
  ['statusKepegawaian', /^status kepegawaian$/i],
  ['jabatan', /^jabatan$/i],
  ['jabatanFungsional', /^jabatan fungsional$/i],
  ['jabatanStruktural', /^jabatan struktural$/i],
  ['rangeMasaKerja', /^range masa kerja$/i],
  ['rangeUsia', /^range usia$/i]
]

// Nama unit kerja di berkas punya banyak varian; dipetakan ke label pendek.
const UNIT_LABELS = [
  [/^bpk perwakilan/i, 'Pimpinan Perwakilan'],
  [/^sekretariat perwakilan/i, 'Sekretariat Perwakilan'],
  [/^bidang pemeriksaan papua barat daya/i, 'Bidang Pemeriksaan Papua Barat Daya'],
  [/^bidang pemeriksaan papua barat$/i, 'Bidang Pemeriksaan Papua Barat'],
  [/(sumber daya manusia|sdm).*keuangan/i, 'Subbag SDM dan Keuangan'],
  [/umum (dan|&) (teknologi informasi|ti)/i, 'Subbag Umum dan TI'],
  [/(humas|hubungan masyarakat).*hukum/i, 'Subbag Humas, Hukum dan TU Kalan']
]

const clean = (value) => String(value ?? '').replace(/\s+/g, ' ').trim()

async function toArrayBuffer(source) {
  if (source instanceof ArrayBuffer) return source
  if (ArrayBuffer.isView(source)) return source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength)
  return source.arrayBuffer()
}

// "49" -> 49, "(23)" -> -23, "-" atau kosong -> 0.
function toNumber(value) {
  if (typeof value === 'number') return value
  const text = clean(value)
  if (!text || text === '-') return 0
  const negative = /^\(.*\)$/.test(text)
  const digits = Number(text.replace(/[^\d.-]/g, ''))
  return Number.isFinite(digits) ? (negative ? -Math.abs(digits) : digits) : 0
}

function findPeriod(rows) {
  const text = rows.slice(0, 6).map((row) => row.map(clean).join(' ')).join(' ')
  const match = new RegExp(`(${MONTH_NAMES.join('|')})\\s+(\\d{4})`, 'i').exec(text)
  if (!match) return { periodMonth: null, periodYear: null }
  const periodMonth = MONTH_NAMES.findIndex((month) => month.toLowerCase() === match[1].toLowerCase()) + 1
  return { periodMonth, periodYear: Number(match[2]) }
}

function sumOf(items, key) {
  return items.reduce((total, item) => total + item[key], 0)
}

function assertSums(parent, children, label) {
  if (!children.length) return
  if (sumOf(children, 'need') !== parent.need || sumOf(children, 'actual') !== parent.actual) {
    throw new Error(`Rincian "${parent.name}" tidak sama dengan jumlahnya pada sheet ABK (${label}). Periksa berkasnya.`)
  }
}

// Sheet ABK: kategori bernomor -> subbagian ("Subbagian ...") -> jabatan rinci.
export function parseAbkRows(rows) {
  const headerIndex = rows.findIndex((row) => {
    const text = row.map(clean).join(' ').toLowerCase()
    return text.includes('unit kerja') && text.includes('standar') && text.includes('riil')
  })
  if (headerIndex === -1) throw new Error('Judul kolom sheet ABK (Unit Kerja, Standar Kebutuhan, Jumlah Riil) tidak ditemukan.')

  const header = rows[headerIndex].map((cell) => clean(cell).toLowerCase())
  const col = {
    no: header.findIndex((cell) => cell === 'no'),
    name: header.findIndex((cell) => cell.includes('unit kerja')),
    need: header.findIndex((cell) => cell.includes('standar')),
    actual: header.findIndex((cell) => cell.includes('riil'))
  }

  const categories = []
  let total = null
  for (const row of rows.slice(headerIndex + 1)) {
    const name = clean(row[col.name])
    if (!name) continue
    const item = { name, need: toNumber(row[col.need]), actual: toNumber(row[col.actual]) }
    item.gap = item.actual - item.need
    if (/^jumlah\b/i.test(name)) { total = item; break }

    const current = categories[categories.length - 1]
    if (/^\d+$/.test(clean(row[col.no]))) categories.push({ no: Number(clean(row[col.no])), ...item, groups: [], positions: [] })
    else if (!current) continue
    else if (/^sub ?bag/i.test(name)) current.groups.push({ ...item, positions: [] })
    else (current.groups[current.groups.length - 1] || current).positions.push(item)
  }

  if (!categories.length) throw new Error('Sheet ABK tidak berisi kategori bernomor.')
  if (!total) throw new Error('Baris "Jumlah" pada sheet ABK tidak ditemukan.')
  categories.forEach((category) => {
    assertSums(category, category.groups.length ? category.groups : category.positions, 'per subbagian/jabatan')
    category.groups.forEach((group) => assertSums(group, group.positions, 'per jabatan'))
  })
  assertSums({ ...total, name: 'Jumlah' }, categories, 'total kategori')
  return { total, categories }
}

// Judul kolom digabung dengan sub-judulnya ("Mutasi ke Kantor ... · Nomor SK").
// Kolom "Range" dinamai menurut kolom sebelumnya (masa kerja / usia).
function columnLabels(header, subHeader) {
  const labels = []
  let parent = ''
  header.forEach((cell, index) => {
    const own = clean(cell)
    const sub = clean(subHeader[index])
    if (own) parent = own
    let label = own && sub ? `${own} · ${sub}` : own || (sub ? `${parent} · ${sub}` : '')
    if (/^range$/i.test(own)) label = /usia/i.test(clean(header[index - 1])) ? 'Range Usia' : 'Range Masa Kerja'
    labels.push(label)
  })
  return labels
}

function cellValue(value) {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value.toISOString().slice(0, 10)
  if (typeof value === 'number') return value
  const text = clean(value)
  return text && text !== '-' ? text : null
}

function normalizeEmployee(record) {
  const unit = clean(record.unitKerjaAsli)
  const unitLabel = UNIT_LABELS.find(([pattern]) => pattern.test(unit))?.[1] || null
  const pendidikan = clean(record.pendidikan).replace(/^diploma\s*(\d|iv|iii)$/i, (_, level) => `D${{ iv: 4, iii: 3 }[String(level).toLowerCase()] || level}`).toUpperCase()
  return {
    ...record,
    unitKerjaAsli: unit,
    unitKerja: unitLabel || unit,
    pendidikan: pendidikan || null,
    rangeUsia: record.rangeUsia ? clean(record.rangeUsia).replace(/\s*-\s*/, ' - ') : null,
    rangeMasaKerja: record.rangeMasaKerja ? clean(record.rangeMasaKerja).replace(/\s*-\s*/, ' - ') : null,
    unitDikenal: Boolean(unitLabel)
  }
}

export function parseEmployeeRows(rows) {
  const headerIndex = rows.findIndex((row) => {
    const text = row.map(clean).join('|').toLowerCase()
    return text.includes('nama lengkap') && text.includes('jenis kelamin')
  })
  if (headerIndex === -1) throw new Error('Judul kolom sheet Lengkap_PBD (Nama Lengkap, Jenis Kelamin) tidak ditemukan.')

  const labels = columnLabels(rows[headerIndex], rows[headerIndex + 1] || [])
  const lastIndex = labels.findIndex((label) => LAST_KEPT_COLUMN.test(label.split(' · ')[0]))
  if (lastIndex === -1) throw new Error('Kolom "TMT Jabatan Tertentu" tidak ditemukan pada sheet Lengkap_PBD.')

  const employees = []
  const details = []
  rows.slice(headerIndex + 1).forEach((row) => {
    if (!/^\d+$/.test(clean(row[0]))) return
    const rowId = Number(clean(row[0]))
    const record = { rowId }
    const detail = {}
    for (let index = 1; index <= lastIndex; index += 1) {
      const label = labels[index]
      if (!label) continue
      const value = cellValue(row[index])
      const publicKey = PUBLIC_COLUMNS.find(([, pattern]) => pattern.test(label))?.[0]
      if (publicKey) record[publicKey] = value
      else if (value !== null) detail[label] = value
    }
    // Baris penomoran kolom ("1 | 2 | 3 ...") di bawah judul bukan pegawai.
    if (!record.fullName || /^\d+$/.test(String(record.fullName))) return
    employees.push(normalizeEmployee(record))
    details.push({ rowId, detail })
  })

  if (!employees.length) throw new Error('Sheet Lengkap_PBD tidak berisi baris pegawai bernomor.')
  return { employees, details }
}

// Mengembalikan { periodMonth, periodYear, abk, employees, details, warnings }.
// Melempar Error berbahasa Indonesia bila berkasnya tidak bisa dipercaya.
export async function parseBezettingWorkbook(source) {
  const XLSX = await import('xlsx')
  const workbook = XLSX.read(await toArrayBuffer(source), { type: 'array', cellDates: true })
  const abkName = workbook.SheetNames.find((name) => ABK_SHEET.test(name.trim()))
  const employeeName = workbook.SheetNames.find((name) => EMPLOYEE_SHEET.test(name.trim()))
  if (!abkName) throw new Error('Sheet "ABK" tidak ditemukan. Pastikan berkasnya Bezetting Pegawai.')
  if (!employeeName) throw new Error('Sheet "Lengkap_PBD" (daftar pegawai) tidak ditemukan.')

  const abkRows = XLSX.utils.sheet_to_json(workbook.Sheets[abkName], { header: 1, raw: false, defval: '' })
  const employeeRows = XLSX.utils.sheet_to_json(workbook.Sheets[employeeName], { header: 1, raw: true, defval: '' })
  const abk = parseAbkRows(abkRows)
  const { employees, details } = parseEmployeeRows(employeeRows)
  const period = findPeriod(abkRows)

  const warnings = []
  if (employees.length !== abk.total.actual) {
    warnings.push(`Jumlah pegawai di daftar (${employees.length}) berbeda dengan jumlah riil ABK (${abk.total.actual}).`)
  }
  const unknownUnits = [...new Set(employees.filter((employee) => !employee.unitDikenal).map((employee) => employee.unitKerja))]
  if (unknownUnits.length) warnings.push(`Unit kerja belum dikenal, ditampilkan apa adanya: ${unknownUnits.join('; ')}.`)
  if (!period.periodMonth) warnings.push('Periode data tidak terbaca dari sheet ABK; isi secara manual.')

  return { ...period, abk, employees, details, warnings }
}
