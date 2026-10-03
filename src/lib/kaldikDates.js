// Mengurai kolom "Tanggal" Kaldik yang ditulis bebas menjadi tanggal ISO.
// Contoh yang didukung: "4 Mei - 1 Okt", "5 - 20 Mei", "12-Nov", "3 - 27 Agst",
// "20 jul - 18 Sep", "19 -21 Okt", "5 - 7 Oktober", "Jan - Des", "Juli - Des",
// "diusulkan 2 - 27 Nov", "5 s.d. 30 Okt (SL: 5-9 Okt DL: 12-16 Okt KL: 19-23 Okt)",
// "SL : TBA DL : TBA KL : 16-20 Nov". Yang tidak terbaca ditandai TBA, tidak ditebak.

const MONTH_ALIASES = [
  ['jan', 'januari'], ['feb', 'februari', 'pebruari'], ['mar', 'maret'], ['apr', 'april'], ['mei'],
  ['jun', 'juni'], ['jul', 'juli'], ['agu', 'agt', 'ags', 'agst', 'agust', 'agus', 'agustus'],
  ['sep', 'sept', 'september'], ['okt', 'oktober', 'oct'], ['nov', 'nop', 'november', 'nopember'],
  ['des', 'desember', 'dec']
]

const MONTH_BY_ALIAS = Object.fromEntries(MONTH_ALIASES.flatMap((aliases, index) => aliases.map((alias) => [alias, index + 1])))
const PART_LABEL = /\b(SL|DL|KL)\s*:/gi

export function monthFromText(text) {
  return MONTH_BY_ALIAS[String(text || '').toLowerCase().replace(/\.$/, '')] || null
}

const pad = (value) => String(value).padStart(2, '0')
const iso = (year, month, day) => `${year}-${pad(month)}-${pad(day)}`
const lastDay = (year, month) => new Date(year, month, 0).getDate()

function validDay(year, month, day) {
  return month && day >= 1 && day <= lastDay(year, month)
}

// Satu rentang tanpa label moda, mis. "4 Mei - 1 Okt". null bila tak terbaca.
export function parseRange(text, year) {
  const value = String(text || '').toLowerCase().replace(/\s+/g, ' ').replace(/s\.\s?d\.?|s\/d/g, '-').trim()
  if (!value) return null

  let match = /^(\d{1,2}) ?([a-z]+)? ?- ?(\d{1,2}) ?([a-z]+)$/.exec(value)
  if (match) {
    const endMonth = monthFromText(match[4])
    const startMonth = match[2] ? monthFromText(match[2]) : endMonth
    const startDay = Number(match[1])
    const endDay = Number(match[3])
    if (!validDay(year, startMonth, startDay) || !validDay(year, endMonth, endDay)) return null
    const endYear = endMonth < startMonth ? year + 1 : year
    return { start: iso(year, startMonth, startDay), end: iso(endYear, endMonth, endDay) }
  }

  match = /^(\d{1,2}) ?-? ?([a-z]+)$/.exec(value)
  if (match) {
    const month = monthFromText(match[2])
    const day = Number(match[1])
    if (!validDay(year, month, day)) return null
    return { start: iso(year, month, day), end: iso(year, month, day) }
  }

  match = /^([a-z]+) ?- ?([a-z]+)$/.exec(value)
  if (match) {
    const startMonth = monthFromText(match[1])
    const endMonth = monthFromText(match[2])
    if (!startMonth || !endMonth) return null
    const endYear = endMonth < startMonth ? year + 1 : year
    return { start: iso(year, startMonth, 1), end: iso(endYear, endMonth, lastDay(endYear, endMonth)) }
  }
  return null
}

// Seluruh isi sel Tanggal: status, rentang utama, dan sub-jadwal per moda.
export function parseSchedule(rawText, year) {
  const raw = String(rawText || '').replace(/\s+/g, ' ').trim()
  let text = raw
  const status = /sedang berlangsung/i.test(text) ? 'berlangsung' : /diusulkan/i.test(text) ? 'diusulkan' : null
  text = text.replace(/sedang berlangsung|diusulkan|dengan rincian:?/gi, ' ').replace(/[()]/g, ' ').replace(/\s+/g, ' ').trim()

  const parts = []
  const labels = [...text.matchAll(PART_LABEL)]
  let main = labels.length ? text.slice(0, labels[0].index).trim() : text
  labels.forEach((label, index) => {
    const body = text.slice(label.index + label[0].length, labels[index + 1]?.index ?? text.length).trim()
    const range = /^tba$/i.test(body) ? null : parseRange(body, year)
    parts.push({ label: label[1].toUpperCase(), raw: body, start: range?.start || null, end: range?.end || null, tba: !range })
  })

  const mainRange = main ? parseRange(main, year) : null
  if (main && !mainRange) main = null
  const datedParts = parts.filter((part) => !part.tba)
  const start = mainRange?.start || datedParts.map((part) => part.start).sort()[0] || null
  const end = mainRange?.end || datedParts.map((part) => part.end).sort().slice(-1)[0] || null

  return { raw, status, start, end, tba: !start || parts.some((part) => part.tba), parts }
}
