// Membaca tabel bergaris dari PDF berbasis teks (mis. ekspor Excel) dengan
// pdf.js: garis grid diambil dari jalur vektor, teks dari getTextContent.
// Modul pdf.js disuntikkan pemanggil, supaya sama di browser dan di uji Node.
// Koordinat dikembalikan dari atas halaman (y membesar ke bawah).

const THIN = 2

function pathRects(pdfjs, operatorList) {
  const rects = []
  operatorList.fnArray.forEach((fn, index) => {
    if (fn !== pdfjs.OPS.constructPath) return
    const [op, , minMax] = operatorList.argsArray[index]
    if (op === pdfjs.OPS.eoClip || op === pdfjs.OPS.clip || op === pdfjs.OPS.endPath || !minMax) return
    const [x0, y0, x1, y1] = Array.from(minMax)
    rects.push({ x0, y0, x1, y1 })
  })
  return rects
}

// Segmen garis horizontal pada y yang sama digabung menjadi rentang x.
function mergeSegments(segments) {
  const byY = new Map()
  segments.forEach(({ y, x0, x1 }) => {
    const key = Math.round(y)
    byY.set(key, [...(byY.get(key) || []), [x0, x1]])
  })
  return [...byY.entries()].sort((a, b) => a[0] - b[0]).map(([y, spans]) => {
    const merged = []
    spans.sort((a, b) => a[0] - b[0]).forEach(([x0, x1]) => {
      const last = merged[merged.length - 1]
      if (last && x0 <= last[1] + 1.5) last[1] = Math.max(last[1], x1)
      else merged.push([x0, x1])
    })
    return { y, spans: merged }
  })
}

export async function readPdfTablePages(pdfjs, data) {
  const task = pdfjs.getDocument({ data, isEvalSupported: false, verbosity: 0 })
  const doc = await task.promise
  const pages = []
  for (let number = 1; number <= doc.numPages; number += 1) {
    const page = await doc.getPage(number)
    const { height } = page.getViewport({ scale: 1 })
    const rects = pathRects(pdfjs, await page.getOperatorList())
    const vertical = [...new Set(rects.filter((r) => r.x1 - r.x0 < THIN && r.y1 - r.y0 > 5).map((r) => Math.round(r.x0)))].sort((a, b) => a - b)
    const horizontal = mergeSegments(rects
      .filter((r) => r.y1 - r.y0 < THIN && r.x1 - r.x0 > 3)
      .map((r) => ({ y: height - r.y1, x0: r.x0, x1: r.x1 })))
    const content = await page.getTextContent()
    const items = content.items
      .filter((item) => item.str && item.str.trim())
      .map((item) => {
        const size = Math.hypot(item.transform[2], item.transform[3]) || 8
        const x0 = item.transform[4]
        const baseline = height - item.transform[5]
        return { text: item.str, x0, x1: x0 + item.width, top: baseline - size * 0.8, bottom: baseline, cx: x0 + item.width / 2, cy: baseline - size * 0.35 }
      })
    pages.push({ number, height, columns: vertical, horizontal, items })
  }
  await task.destroy()
  return pages
}

// Garis-garis yang memotong kolom ke-index (berdasarkan titik tengah kolom).
export function rowLinesForColumn(page, columnIndex) {
  const center = (page.columns[columnIndex] + page.columns[columnIndex + 1]) / 2
  return page.horizontal.filter((line) => line.spans.some(([x0, x1]) => x0 <= center && x1 >= center)).map((line) => line.y)
}

export function columnOf(page, x) {
  for (let index = 0; index < page.columns.length - 1; index += 1) {
    if (x >= page.columns[index] && x < page.columns[index + 1]) return index
  }
  return -1
}

// Teks dalam satu sel: item diurutkan per baris (y) lalu x, digabung spasi.
export function cellText(items) {
  const lines = []
  ;[...items].sort((a, b) => a.cy - b.cy || a.x0 - b.x0).forEach((item) => {
    const line = lines.find((entry) => Math.abs(entry.cy - item.cy) < 2.5)
    if (line) line.items.push(item)
    else lines.push({ cy: item.cy, items: [item] })
  })
  return lines
    .sort((a, b) => a.cy - b.cy)
    .map((line) => line.items.sort((a, b) => a.x0 - b.x0).map((item) => item.text).join(' '))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}
