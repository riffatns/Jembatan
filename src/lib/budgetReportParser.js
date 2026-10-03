// Membaca "Laporan Realisasi SP2D — Fa Detail 16 Segmen, Akun Based" yang
// dicetak ke Excel dari aplikasi resmi, lalu memilah angkanya per akun 6 digit
// dan per kelompok belanja 51 / 52 / 53.
//
// Sengaja tanpa import lokal, supaya bisa diuji langsung dengan Node terhadap
// berkas asli (lihat CLAUDE.md, bagian Master Data Anggaran).

export const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

export const BUDGET_GROUPS = ['51', '52', '53']
export const EXPECTED_SATKER = '694823'

const ACCOUNT_CODE = /^5\d{5}$/
// Baris akun selalu membawa tujuh angka berurutan. Posisi kolomnya bergeser
// karena sel gabungan, jadi angka dibaca menurut urutan, bukan indeks kolom.
const ACCOUNT_NUMBER_FIELDS = ['pagu', 'lockPagu', 'realisasiLalu', 'realisasiIni', 'realisasi', 'persen', 'sisa']
const SUM_FIELDS = ['pagu', 'realisasiLalu', 'realisasiIni', 'realisasi', 'sisa']
const TOLERANCE = 1
const FIELD_LABELS = {
  pagu: 'pagu', realisasiLalu: 'realisasi periode lalu', realisasiIni: 'realisasi periode ini',
  realisasi: 'realisasi s.d. periode', sisa: 'sisa'
}

async function toArrayBuffer(source) {
  if (source instanceof ArrayBuffer) return source
  if (ArrayBuffer.isView(source)) return source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength)
  return source.arrayBuffer()
}

function emptySums() {
  return Object.fromEntries(SUM_FIELDS.map((field) => [field, 0]))
}

function addSums(target, source) {
  SUM_FIELDS.forEach((field) => { target[field] += source[field] })
}

function rowNumbers(row) {
  return row.filter((cell) => typeof cell === 'number' && Number.isFinite(cell))
}

function rowTexts(row) {
  return row.map((cell) => (typeof cell === 'string' ? cell.trim() : String(cell ?? '').trim())).filter(Boolean)
}

function readHeader(rows) {
  const headerText = rows.slice(0, 10).map((row) => rowTexts(row).join(' ')).join('\n')
  const yearMatch = /\bTA\s*(\d{4})\b/i.exec(headerText)
  const periodMatch = new RegExp(`Periode\\s+(${MONTH_NAMES.join('|')})\\s+(\\d{4})`, 'i').exec(headerText)
  const satkerRow = rows.slice(0, 10).find((row) => rowTexts(row).some((text) => /satuan kerja/i.test(text)))
  const satkerTexts = satkerRow ? rowTexts(satkerRow) : []
  const satker = satkerTexts.find((text) => /^\d{6}$/.test(text)) || null

  const periodMonth = periodMatch
    ? MONTH_NAMES.findIndex((name) => name.toLowerCase() === periodMatch[1].toLowerCase()) + 1
    : null

  return {
    title: rowTexts(rows[0] || [])[0] || '',
    fiscalYear: yearMatch ? Number(yearMatch[1]) : periodMatch ? Number(periodMatch[2]) : null,
    periodMonth: periodMonth || null,
    satker,
    satkerName: satker ? satkerTexts[satkerTexts.indexOf(satker) + 1] || null : null
  }
}

function readAccountRow(row, rowIndex) {
  const cells = row.map((cell) => (typeof cell === 'string' ? cell.trim() : cell))
  const codeIndex = cells.findIndex((cell) => ACCOUNT_CODE.test(String(cell ?? '').trim()))
  if (codeIndex === -1) return null

  const code = String(cells[codeIndex]).trim()
  const name = cells.slice(codeIndex + 1).find((cell) => typeof cell === 'string' && cell && !/^[\d.,\s-]+$/.test(cell)) || ''
  const numbers = rowNumbers(cells.slice(codeIndex + 1))

  if (numbers.length !== ACCOUNT_NUMBER_FIELDS.length) {
    throw new Error(`Baris ${rowIndex + 1} (akun ${code}) tidak lengkap: ditemukan ${numbers.length} angka, seharusnya ${ACCOUNT_NUMBER_FIELDS.length}.`)
  }

  const values = Object.fromEntries(ACCOUNT_NUMBER_FIELDS.map((field, index) => [field, numbers[index]]))
  if (Math.abs(values.realisasiLalu + values.realisasiIni - values.realisasi) > TOLERANCE) {
    throw new Error(`Baris ${rowIndex + 1} (akun ${code}): realisasi periode lalu + periode ini tidak sama dengan realisasi s.d. periode.`)
  }

  return { code, name: name.replace(/\s+/g, ' '), group: code.slice(0, 2), ...values }
}

function findGrandTotal(rows) {
  const row = rows.find((cells) => rowTexts(cells).some((text) => /^JUMLAH SELURUHNYA$/i.test(text)))
  if (!row) return null
  const numbers = rowNumbers(row)
  if (numbers.length !== ACCOUNT_NUMBER_FIELDS.length) return null
  return Object.fromEntries(ACCOUNT_NUMBER_FIELDS.map((field, index) => [field, numbers[index]]))
}

function summarize(accountRows) {
  const byCode = new Map()
  accountRows.forEach((row) => {
    const account = byCode.get(row.code) || { code: row.code, name: row.name, group: row.group, occurrences: 0, ...emptySums() }
    addSums(account, row)
    account.occurrences += 1
    byCode.set(row.code, account)
  })

  const accounts = [...byCode.values()].sort((a, b) => a.code.localeCompare(b.code))
  const groups = Object.fromEntries(BUDGET_GROUPS.map((group) => [group, { ...emptySums(), accountCount: 0 }]))
  const totals = emptySums()
  accounts.forEach((account) => {
    addSums(totals, account)
    if (!groups[account.group]) return
    addSums(groups[account.group], account)
    groups[account.group].accountCount += 1
  })

  return { accounts, groups, totals }
}

// Mengembalikan { fiscalYear, periodMonth, satker, accounts, groups, totals, warnings }.
// Melempar Error berbahasa Indonesia bila berkasnya tidak bisa dipercaya.
export async function parseBudgetReport(source) {
  const XLSX = await import('xlsx')
  const workbook = XLSX.read(await toArrayBuffer(source), { type: 'array' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  if (!sheet) throw new Error('Berkas Excel tidak memiliki sheet yang dapat dibaca.')

  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true, defval: '' })
  const header = readHeader(rows)
  const accountRows = rows.map(readAccountRow).filter(Boolean)
  if (!accountRows.length) {
    throw new Error('Tidak ditemukan baris akun 6 digit. Pastikan berkasnya "Laporan Realisasi SP2D — Akun Based".')
  }

  const { accounts, groups, totals } = summarize(accountRows)
  const grandTotal = findGrandTotal(rows)
  if (!grandTotal) throw new Error('Baris "JUMLAH SELURUHNYA" tidak ditemukan, sehingga angka tidak bisa dicocokkan.')

  const mismatched = SUM_FIELDS.filter((field) => Math.abs(totals[field] - grandTotal[field]) > TOLERANCE)
  if (mismatched.length) {
    throw new Error(`Jumlah seluruh akun tidak sama dengan baris JUMLAH SELURUHNYA (${mismatched.map((field) => FIELD_LABELS[field]).join(', ')}). Berkas mungkin terpotong atau terubah.`)
  }

  const warnings = []
  const otherGroups = accounts.filter((account) => !BUDGET_GROUPS.includes(account.group))
  if (otherGroups.length) {
    warnings.push(`Ada ${otherGroups.length} akun di luar 51/52/53 (${otherGroups.map((a) => a.code).join(', ')}); tidak dihitung di menu akun.`)
  }
  if (header.satker && header.satker !== EXPECTED_SATKER) {
    warnings.push(`Satuan kerja di berkas ${header.satker}, bukan ${EXPECTED_SATKER}.`)
  }
  if (!header.fiscalYear || !header.periodMonth) {
    warnings.push('Tahun anggaran atau periode tidak terbaca dari kepala laporan; isi secara manual.')
  }

  return { ...header, rowCount: accountRows.length, accounts, groups, totals, warnings }
}
