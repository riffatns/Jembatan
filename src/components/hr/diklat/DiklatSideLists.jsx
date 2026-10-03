import { IconCalendar, IconChartBars } from '../../icons/DuotoneIcons'
import { CARD_CLASS, CARD_TITLE_CLASS } from '../../ui/cardStyles'
import { SECTION_COLORS } from './diklatModel'
import { SectionPill, StatusPill } from './DiklatDetailCard'

const SHORT = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' })
const shortDate = (iso) => SHORT.format(new Date(`${iso}T00:00:00`))

function Dot({ section }) {
  return <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: SECTION_COLORS[section] }} aria-hidden="true" />
}

// Daftar ringkas program yang berjalan hari ini.
export function OngoingList({ programs, onSelect }) {
  return (
    <div className={`${CARD_CLASS} min-h-0 gap-2`}>
      <h2 className={`${CARD_TITLE_CLASS} flex items-center gap-2`}><IconChartBars className="h-5 w-5 text-[#2f7fe8]" />Diklat Sedang Berlangsung</h2>
      {programs.length ? (
        <ul className="flex min-h-0 flex-col gap-1 overflow-y-auto">
          {programs.map((program) => (
            <li key={program.uid}>
              <button type="button" onClick={() => onSelect(program)} className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-lg px-1.5 py-1 text-left text-[13px] hover:bg-[#f1f5fb]">
                <Dot section={program.section} />
                <span className="min-w-0">
                  <b className="block truncate text-[#12305f]">{program.name}</b>
                  <span className="text-xs text-[#5a6f93]">{shortDate(program.schedule.start)} – {shortDate(program.schedule.end)}</span>
                </span>
                <StatusPill status="berlangsung" />
              </button>
            </li>
          ))}
        </ul>
      ) : <p className="text-sm text-[#7a8aa8]">Tidak ada diklat yang berjalan hari ini.</p>}
    </div>
  )
}

// Kegiatan terdekat setelah hari ini (per tahap / moda), maksimal lima.
export function UpcomingAgenda({ events, onSelect }) {
  return (
    <div className={`${CARD_CLASS} min-h-0 gap-2`}>
      <h2 className={`${CARD_TITLE_CLASS} flex items-center gap-2`}><IconCalendar className="h-5 w-5 text-[#2f7fe8]" />Agenda Mendatang</h2>
      {events.length ? (
        <ul className="flex min-h-0 flex-col gap-1 overflow-y-auto">
          {events.map((event) => (
            <li key={event.id}>
              <button type="button" onClick={() => onSelect(event)} className="grid w-full grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-2 rounded-lg px-1.5 py-1 text-left text-[13px] hover:bg-[#f1f5fb]">
                <span className="rounded-lg bg-[#eef3fb] px-1 py-1 text-center text-[11px] font-bold leading-tight text-[#12305f]">
                  {shortDate(event.start)}{event.end !== event.start && <span className="block font-semibold text-[#5a6f93]">s.d. {shortDate(event.end)}</span>}
                </span>
                <span className="flex min-w-0 items-center gap-2"><Dot section={event.section} /><span className="truncate font-semibold text-[#12305f]">{event.label}</span></span>
                <span className="hidden fitwide:inline"><SectionPill section={event.section} /></span>
              </button>
            </li>
          ))}
        </ul>
      ) : <p className="text-sm text-[#7a8aa8]">Tidak ada agenda mendatang.</p>}
    </div>
  )
}
