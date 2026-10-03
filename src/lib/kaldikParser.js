// Kalender Diklat (Kaldik) per triwulan dari PDF aplikasi sumber: grid tabel
// dibaca lewat pdfTable.js, tanggal lewat kaldikDates.js. Ditolak bila ragu;
// tanggal yang tidak terbaca ditandai TBA (tidak ditebak).

import { cellText, columnOf, readPdfTablePages, rowLinesForColumn } from './pdfTable.js'
import { parseSchedule } from './kaldikDates.js'

const COL = { no: 0, name: 1, objective: 2, days: 3, jp: 4, participants: 5, criteria: 6, method: 7, date: 8, organizer: 9 }
const COLUMN_LINES = 11
const QUARTERS = { I: 1, II: 2, III: 3, IV: 4 }

// Urutan penting: "non pemeriksaan" dicek sebelum "teknis pemeriksaan".
export const KALDIK_SECTIONS = [
  { id: 'kepemimpinan', label: 'Kepemimpinan', pattern: /kepemimpinan/i },
  { id: 'fungsional', label: 'Fungsional Pemeriksa', pattern: /fungsional pemeriksa/i },
  { id: 'non-pemeriksaan', label: 'Non Pemeriksaan', pattern: /non\s*pemeriksaan/i },
  { id: 'teknis', label: 'Teknis Pemeriksaan', pattern: /teknis pemeriksaan/i },
  { id: 'self-learning', label: 'Self Learning', pattern: /self learning/i },
  { id: 'internasional', label: 'Internasional', pattern: /internasional/i }
]

const strip = (text) => String(text || '').replace(/dengan\s+rincian:?/gi, ' ').replace(/\s+/g, ' ').trim()
const firstNumber = (text) => { const match = /\d+/.exec(String(text || '')); return match ? Number(match[0]) : null }

function readTitle(page) {
  const firstLine = Math.min(...page.horizontal.map((line) => line.y))
  const text = cellText(page.items.filter((item) => item.cy < firstLine))
  const match = /triwulan\s+(IV|I{1,3}|[1-4])\s+tahun\s+(\d{4})/i.exec(text)
  if (!match) throw new Error('Judul "Triwulan ... Tahun ..." tidak ditemukan. Pastikan berkasnya Kalender Pelatihan (Kaldik) dari aplikasi sumber.')
  const quarter = QUARTERS[match[1].toUpperCase()] || Number(match[1])
  return { title: text, quarter, year: Number(match[2]) }
}

function itemsIn(page, top, bottom) {
  return page.items.filter((item) => item.cy > top && item.cy < bottom)
}

// Sel kolom dalam satu pita program, dipotong garis milik kolom itu sendiri.
function columnCells(page, column, top, bottom, items) {
  const lines = [top, ...rowLinesForColumn(page, column).filter((y) => y > top + 1 && y < bottom - 1), bottom]
  const inColumn = items.filter((item) => columnOf(page, item.cx) === column)
  return lines.slice(0, -1).map((y, index) => ({ top: y, bottom: lines[index + 1], text: cellText(inColumn.filter((item) => item.cy > y && item.cy < lines[index + 1])) }))
}

// Nilai kolom untuk satu sub-baris: sel yang memuat titik tengah sub-baris itu.
function cellAt(cells, row) {
  const middle = (row.top + row.bottom) / 2
  return cells.find((cell) => cell.top <= middle && cell.bottom >= middle) || null
}

function valueAt(cells, row) {
  return cellAt(cells, row)?.text || ''
}

// Nilai untuk satu tahap. Sel yang digabung dengan baris program (mis. JP 905
// untuk seluruh PKP) milik program, bukan tahap. Sel yang digabung beberapa
// tahap (mis. 200 JP untuk tahap c-f) ditandai shared.
function phaseValue(cells, row, head, rows) {
  const cell = cellAt(cells, row)
  if (!cell || !cell.text || cell.top <= head.top + 1) return { text: '', shared: false }
  const covered = rows.filter((other) => cellAt(cells, other) === cell).length
  return { text: strip(cell.text), shared: covered > 1 }
}

// Kelompok metode untuk filter; teks asli tetap disimpan di method.
export function methodGroup(method) {
  const value = String(method || '').toLowerCase()
  if (value.includes('blended')) return 'Blended Learning'
  if (value.includes('self learning') && value.includes('distance')) return 'Self & Distance Learning'
  if (value.includes('self learning')) return 'Self Learning'
  if (value.includes('distance')) return 'Distance Learning'
  if (value.includes('klasikal')) return 'Klasikal'
  return method || 'Lainnya'
}

function buildProgram(page, band, items, section, year) {
  const nameCells = columnCells(page, COL.name, band.top, band.bottom, items)
  const cells = Object.fromEntries(['days', 'jp', 'participants', 'date'].map((key) => [key, columnCells(page, COL[key], band.top, band.bottom, items)]))
  const merged = (column) => cellText(items.filter((item) => columnOf(page, item.cx) === column))
  const [head, ...rows] = nameCells
  const schedule = parseSchedule(valueAt(cells.date, head), year)
  const phases = rows.filter((row) => row.text).map((row, index) => {
    const match = /^([a-z])\.\s*(.*)$/i.exec(row.text)
    const jp = phaseValue(cells.jp, row, head, rows)
    return {
      id: `${index + 1}`,
      label: match ? match[1].toLowerCase() : String.fromCharCode(97 + index),
      name: strip(match ? match[2] : row.text),
      days: phaseValue(cells.days, row, head, rows).text,
      jp: jp.text,
      jpShared: jp.shared,
      schedule: parseSchedule(phaseValue(cells.date, row, head, rows).text, year)
    }
  })
  return {
    section: section.id,
    no: firstNumber(merged(COL.no)),
    name: strip(head.text),
    objective: strip(merged(COL.objective)),
    days: strip(valueAt(cells.days, head)),
    jp: strip(valueAt(cells.jp, head)),
    participants: strip(valueAt(cells.participants, head)),
    criteria: strip(merged(COL.criteria)),
    method: strip(merged(COL.method)),
    methodGroup: methodGroup(strip(merged(COL.method))),
    organizer: strip(merged(COL.organizer)),
    status: schedule.status,
    schedule,
    phases
  }
}

function appendContinuation(program, page, items) {
  const add = (key, column) => {
    const extra = strip(cellText(items.filter((item) => columnOf(page, item.cx) === column)))
    if (extra) program[key] = strip(`${program[key]} ${extra}`)
  }
  add('objective', COL.objective); add('criteria', COL.criteria); add('organizer', COL.organizer); add('method', COL.method)
}

export async function parseKaldikPdf(pdfjs, data) {
  const pages = await readPdfTablePages(pdfjs, data)
  if (!pages.length) throw new Error('PDF tidak memiliki halaman.')
  const { title, quarter, year } = readTitle(pages[0])
  const programs = []
  let section = null

  pages.forEach((page) => {
    if (page.columns.length !== COLUMN_LINES) throw new Error(`Grid tabel halaman ${page.number} tidak dikenali (${page.columns.length - 1} kolom, seharusnya 10).`)
    const bounds = [...new Set(rowLinesForColumn(page, COL.objective))].sort((a, b) => a - b)
    bounds.slice(0, -1).forEach((top, index) => {
      const band = { top, bottom: bounds[index + 1] }
      const items = itemsIn(page, band.top, band.bottom)
      if (!items.length) return
      const text = cellText(items)
      if (/nama pelatihan/i.test(text)) return
      const sectionMatch = KALDIK_SECTIONS.find((candidate) => candidate.pattern.test(text))
      if (sectionMatch && text === text.toUpperCase() && !items.some((item) => columnOf(page, item.cx) >= COL.objective)) {
        section = sectionMatch
        return
      }
      const hasName = items.some((item) => columnOf(page, item.cx) === COL.name)
      if (!hasName && programs.length) return appendContinuation(programs[programs.length - 1], page, items)
      if (!section) throw new Error(`Program sebelum judul jenis diklat ditemukan di halaman ${page.number}.`)
      programs.push(buildProgram(page, band, items, section, year))
    })
  })

  return validatePrograms({ title, quarter, year, programs })
}

function validatePrograms(result) {
  if (!result.programs.length) throw new Error('Tidak ada program pelatihan yang terbaca dari PDF.')
  const warnings = []
  KALDIK_SECTIONS.forEach((section) => {
    const numbers = result.programs.filter((program) => program.section === section.id && program.no !== null).map((program) => program.no)
    if (numbers.some((number, index) => number !== index + 1)) {
      throw new Error(`Nomor urut "${section.label}" tidak berurutan (${numbers.join(', ')}). PDF mungkin terpotong.`)
    }
  })
  result.programs.forEach((program, index) => {
    program.id = `${program.section}-${program.no ?? index + 1}`
    const missing = ['name', 'method', 'organizer'].filter((key) => !program[key])
    if (missing.length) throw new Error(`Program ke-${index + 1} (${program.name || 'tanpa nama'}) tidak lengkap: ${missing.join(', ')}.`)
    if (program.schedule.tba) warnings.push(`Jadwal "${program.name}" belum pasti (${program.schedule.raw || 'kosong'}), ditandai TBA.`)
  })
  return { ...result, warnings }
}
