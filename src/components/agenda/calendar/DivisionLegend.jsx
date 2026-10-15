import { getDivisionVisual } from '../../../data/divisionPalette'

// Legenda warna bidang yang sekaligus penyaring: menekan satu bidang
// memfokuskan kalender ke bidang itu, menekannya lagi melepas fokus. Nilainya
// satu dengan penyaring Bidang di bilah atas, jadi tidak ada dua sumber
// kebenaran untuk pertanyaan "bidang mana yang sedang tampil".
export function DivisionLegend({ divisions, active, counts, onPick }) {
  return (
    <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs font-semibold text-[#3f557d]">
      {divisions.map((division) => {
        const visual = getDivisionVisual(division.id)
        const dipilih = active === division.id
        return (
          <li key={division.id}>
            <button
              type="button"
              onClick={() => onPick(dipilih ? '' : division.id)}
              aria-pressed={dipilih}
              className={`flex items-center gap-1.5 rounded-md px-1.5 py-0.5 transition-colors ${dipilih ? 'bg-[#e6eefb] text-[#12305f]' : 'hover:bg-[#f1f5fb]'} ${active && !dipilih ? 'opacity-50' : ''}`}
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: visual.color }} aria-hidden="true" />
              {division.name}
              {counts[division.id] ? <span className="text-[#7a8aa8]">{counts[division.id]}</span> : null}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
