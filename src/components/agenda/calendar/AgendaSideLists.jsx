import { IconCalendar, IconPlay } from '../../icons/DuotoneIcons'
import { CARD_CLASS, CARD_TITLE_CLASS } from '../../ui/cardStyles'
import { getDivisionVisual } from '../../../data/divisionPalette'
import { agendaEndDate, formatAgendaTime } from '../../../lib/agendaStorage'
import { PhasePill } from './AgendaDetailCard'

const SHORT = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' })
const shortDate = (iso) => SHORT.format(new Date(`${iso}T00:00:00`))

function Dot({ divisionId }) {
  return <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: getDivisionVisual(divisionId).color }} aria-hidden="true" />
}

// Kegiatan yang berjalan hari ini, lintas bidang.
export function OngoingAgendaList({ events, divisionName, selectedId, onSelect }) {
  return (
    <div className={`${CARD_CLASS} min-h-0 gap-2`}>
      <h2 className={`${CARD_TITLE_CLASS} flex items-center gap-2`}><IconPlay className="h-5 w-5 text-[#2f7fe8]" />Agenda Hari Ini</h2>
      {events.length ? (
        <ul className="flex min-h-0 flex-col gap-1 overflow-y-auto">
          {events.map((event) => (
            <li key={event.id}>
              <button
                type="button"
                onClick={() => onSelect(event)}
                aria-pressed={selectedId === event.id}
                className={`grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-lg px-1.5 py-1 text-left text-[13px] ${selectedId === event.id ? 'bg-[#e6eefb]' : 'hover:bg-[#f1f5fb]'}`}
              >
                <Dot divisionId={event.divisionId} />
                <span className="min-w-0">
                  <b className="block truncate text-[#12305f]">{event.title}</b>
                  <span className="block truncate text-xs text-[#5a6f93]">
                    {formatAgendaTime(event)}
                    {event.location ? ` · ${event.location}` : ''}
                    {divisionName(event.divisionId) ? ` · ${divisionName(event.divisionId)}` : ''}
                  </span>
                </span>
                <PhasePill phase="berlangsung" />
              </button>
            </li>
          ))}
        </ul>
      ) : <p className="text-sm text-[#7a8aa8]">Tidak ada kegiatan yang berjalan hari ini.</p>}
    </div>
  )
}

// Kegiatan terdekat setelah hari ini.
export function UpcomingAgendaList({ events, divisionName, selectedId, onSelect }) {
  return (
    <div className={`${CARD_CLASS} min-h-0 gap-2`}>
      <h2 className={`${CARD_TITLE_CLASS} flex items-center gap-2`}><IconCalendar className="h-5 w-5 text-[#2f7fe8]" />Agenda Mendatang</h2>
      {events.length ? (
        <ul className="flex min-h-0 flex-col gap-1 overflow-y-auto">
          {events.map((event) => {
            const end = agendaEndDate(event)
            return (
              <li key={event.id}>
                <button
                  type="button"
                  onClick={() => onSelect(event)}
                  aria-pressed={selectedId === event.id}
                  className={`grid w-full grid-cols-[64px_minmax(0,1fr)] items-center gap-2 rounded-lg px-1.5 py-1 text-left text-[13px] ${selectedId === event.id ? 'bg-[#e6eefb]' : 'hover:bg-[#f1f5fb]'}`}
                >
                  <span className="rounded-lg bg-[#eef3fb] px-1 py-1 text-center text-[11px] font-bold leading-tight text-[#12305f]">
                    {shortDate(event.eventDate)}
                    {end !== event.eventDate && <span className="block font-semibold text-[#5a6f93]">s.d. {shortDate(end)}</span>}
                  </span>
                  <span className="min-w-0">
                    <span className="flex min-w-0 items-center gap-2">
                      <Dot divisionId={event.divisionId} />
                      <b className="truncate text-[#12305f]">{event.title}</b>
                    </span>
                    <span className="block truncate text-xs text-[#5a6f93]">
                      {formatAgendaTime(event)}
                      {event.location ? ` · ${event.location}` : ''}
                      {divisionName(event.divisionId) ? ` · ${divisionName(event.divisionId)}` : ''}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      ) : <p className="text-sm text-[#7a8aa8]">Tidak ada agenda mendatang.</p>}
    </div>
  )
}
