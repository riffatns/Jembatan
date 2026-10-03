// Tata letak kalender bulan (murni, diuji dengan Node): minggu dimulai Senin,
// kegiatan berhari-hari dipotong per minggu lalu disusun ke lajur (lane) agar
// tidak bertumpuk. Tanggal berupa string ISO 'YYYY-MM-DD'.

const pad = (value) => String(value).padStart(2, '0')
const iso = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

export function monthWeeks(year, monthIndex) {
  const first = new Date(year, monthIndex, 1)
  const offset = (first.getDay() + 6) % 7
  const cursor = new Date(year, monthIndex, 1 - offset)
  const last = new Date(year, monthIndex + 1, 0)
  const weeks = []
  while (cursor <= last || weeks.length === 0) {
    const days = []
    for (let index = 0; index < 7; index += 1) {
      days.push({ iso: iso(cursor), day: cursor.getDate(), inMonth: cursor.getMonth() === monthIndex })
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(days)
  }
  return weeks
}

// Potongan kegiatan dalam satu minggu: { event, column (0-6), span, lane,
// continuesBefore, continuesAfter }. hidden[i] = daftar kegiatan hari ke-i yang tidak muat.
// event.priority (bawaan 0) lebih kecil = dapat lajur lebih dulu, mis. kelas
// pendek didahulukan dari tahap yang berlangsung berbulan-bulan.
export function layoutWeek(days, events, maxLanes = 3) {
  const from = days[0].iso
  const to = days[6].iso
  const pieces = events
    .filter((event) => event.start <= to && event.end >= from)
    .map((event) => {
      const startIso = event.start < from ? from : event.start
      const endIso = event.end > to ? to : event.end
      const column = days.findIndex((day) => day.iso === startIso)
      const endColumn = days.findIndex((day) => day.iso === endIso)
      return { event, column, span: endColumn - column + 1, continuesBefore: event.start < from, continuesAfter: event.end > to }
    })
    .sort((a, b) => (a.event.priority || 0) - (b.event.priority || 0) || a.column - b.column || b.span - a.span || a.event.label.localeCompare(b.event.label))

  const occupied = []
  const segments = []
  const hidden = Array.from({ length: 7 }, () => [])
  pieces.forEach((piece) => {
    const columns = Array.from({ length: piece.span }, (_, index) => piece.column + index)
    let lane = occupied.findIndex((taken) => columns.every((column) => !taken[column]))
    if (lane === -1) lane = occupied.push(Array(7).fill(false)) - 1
    columns.forEach((column) => { occupied[lane][column] = true })
    if (lane < maxLanes) segments.push({ ...piece, lane })
    else columns.forEach((column) => { hidden[column].push(piece.event) })
  })
  return { segments, hidden, lanes: Math.min(occupied.length, maxLanes) }
}
