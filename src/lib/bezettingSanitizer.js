import { findEmployeeColumns, isEmployeeSheet } from './bezettingParser.js'

// Salinan bersih berkas Bezetting untuk diunduh ulang dari Master Data SDM.
// Di sheet Lengkap_PBD semua kolom sesudah "TMT Jabatan Tertentu" (NIK, nomor
// kontak, BPJS, Taspen, data keluarga, ...) dikosongkan pada baris data;
// judul kolom dan sheet lain dibiarkan. Hasil selalu .xlsx (format sel bisa
// sedikit berbeda dari aslinya karena ditulis ulang).

const XLSX_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

async function toArrayBuffer(source) {
  if (source instanceof ArrayBuffer) return source
  if (ArrayBuffer.isView(source)) return source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength)
  return source.arrayBuffer()
}

// Hasil { blob, fileName, clearedCells }. Melempar Error bila sheet/kolom tidak ditemukan.
export async function sanitizeBezettingWorkbook(source, fileName) {
  const XLSX = await import('xlsx')
  // cellNF + cellStyles menjaga format tanggal, supaya berkas bersih terbaca sama seperti aslinya.
  const workbook = XLSX.read(await toArrayBuffer(source), { type: 'array', cellNF: true, cellStyles: true })
  const sheetName = workbook.SheetNames.find(isEmployeeSheet)
  if (!sheetName) throw new Error('Sheet "Lengkap_PBD" tidak ditemukan.')
  const sheet = workbook.Sheets[sheetName]
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true, defval: '', blankrows: true })
  const { headerIndex, lastIndex } = findEmployeeColumns(rows)
  const range = XLSX.utils.decode_range(sheet['!ref'])
  // Judul dua baris (judul + sub-judul) tetap, isi di bawahnya dikosongkan.
  const firstDataRow = range.s.r + headerIndex + 2
  const lastKeptColumn = range.s.c + lastIndex

  let clearedCells = 0
  Object.keys(sheet).filter((key) => !key.startsWith('!')).forEach((address) => {
    const { r, c } = XLSX.utils.decode_cell(address)
    if (r < firstDataRow || c <= lastKeptColumn) return
    delete sheet[address]
    clearedCells += 1
  })
  delete sheet['!comments']

  const bytes = XLSX.write(workbook, { bookType: 'xlsx', type: 'array', compression: true, cellStyles: true })
  const cleanName = String(fileName || 'bezetting').replace(/\.(xlsx|xls)$/i, '') + '.xlsx'
  return { blob: new Blob([bytes], { type: XLSX_TYPE }), fileName: cleanName, clearedCells }
}
