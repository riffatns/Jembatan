// Pembacaan Excel apa adanya, untuk ditampilkan sebagai tabel di aplikasi.
//
// Berbeda dari parseExcelABK yang menebak baris header dan membuang baris judul
// agar cocok dengan format ABK, berkas di sini bisa berbentuk apa saja - daftar
// arsip, misalnya, punya empat baris judul dan header bertingkat. Jadi isinya
// dibawa utuh, termasuk sel gabungan, supaya tampilannya mengikuti berkas asli.

function cellText(value) {
  if (value === null || value === undefined) return ''
  if (value instanceof Date) return value.toLocaleDateString('id-ID')
  return String(value).replace(/\r\n/g, '\n').trim()
}

async function toArrayBuffer(source) {
  if (source instanceof ArrayBuffer) return source
  if (typeof source === 'string') {
    const response = await fetch(source)
    if (!response.ok) throw new Error('Berkas tidak dapat diambil.')
    return response.arrayBuffer()
  }
  return source.arrayBuffer()
}

// Sel yang tertutup oleh penggabungan tidak boleh ikut dirender; hanya sel
// kiri-atas dari tiap rentang yang tampil, membawa rowSpan dan colSpan.
function buildSpanMap(merges = []) {
  const anchors = new Map()
  const covered = new Set()

  for (const merge of merges) {
    const { s: start, e: end } = merge
    anchors.set(`${start.r}:${start.c}`, {
      rowSpan: end.r - start.r + 1,
      colSpan: end.c - start.c + 1
    })

    for (let row = start.r; row <= end.r; row += 1) {
      for (let column = start.c; column <= end.c; column += 1) {
        if (row === start.r && column === start.c) continue
        covered.add(`${row}:${column}`)
      }
    }
  }

  return { anchors, covered }
}

export async function readWorkbookGrid(source) {
  if (!source) throw new Error('Berkas Excel belum tersedia.')

  const XLSX = await import('xlsx')
  const workbook = XLSX.read(await toArrayBuffer(source), { type: 'array', cellDates: true })

  const sheets = workbook.SheetNames.map((name) => {
    const sheet = workbook.Sheets[name]
    const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: false, blankrows: false })
    const rows = matrix.map((row) => row.map(cellText))
    const columnCount = rows.reduce((max, row) => Math.max(max, row.length), 0)
    const { anchors, covered } = buildSpanMap(sheet['!merges'])

    return {
      name,
      rows,
      columnCount,
      spanAt: (row, column) => anchors.get(`${row}:${column}`) || null,
      isCovered: (row, column) => covered.has(`${row}:${column}`)
    }
  }).filter((sheet) => sheet.rows.length > 0)

  if (!sheets.length) throw new Error('Berkas Excel ini tidak memiliki isi yang dapat ditampilkan.')
  return { sheets }
}
