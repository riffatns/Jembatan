import { IconChartBars } from '../../icons/DuotoneIcons'
import { CARD_CLASS, CARD_TITLE_CLASS } from '../../ui/cardStyles'
import { getDivisionVisual } from '../../../data/divisionPalette'
import { agendaDateKeys, formatAgendaTime } from '../../../lib/agendaStorage'

// Bilah kegiatan yang berjalan hari ini, di atas kalender. Untuk kegiatan
// berhari-hari, bilah kemajuannya menunjukkan hari keberapa dari seluruhnya -
// itu yang ingin diketahui saat melihat kalender bersama di pagi hari.
function Chip({ event, today, divisionName, selected, onSelect }) {
  const hari = agendaDateKeys(event)
  const keBerapa = Math.max(1, hari.indexOf(today) + 1)
  const persen = Math.round((keBerapa / hari.length) * 100)
  const color = getDivisionVisual(event.divisionId).color

  return (
    <button
      type="button"
      onClick={() => onSelect(event)}
      aria-pressed={selected}
      title={`${event.title}${divisionName ? ` · ${divisionName}` : ''}`}
      className="flex min-w-0 flex-col gap-1 rounded-xl px-3 py-2 text-left transition-colors hover:brightness-[0.98]"
      style={{ backgroundColor: `${color}14`, boxShadow: selected ? `inset 0 0 0 1.5px ${color}` : undefined }}
    >
      <span className="flex min-w-0 items-center gap-2">
        <span className="h-3 w-3 shrink-0 rounded" style={{ backgroundColor: color }} aria-hidden="true" />
        <b className="truncate text-sm text-[#12305f]">{event.title}</b>
        {hari.length > 1 && <span className="ml-auto shrink-0 text-[11px] font-bold text-[#5a6f93]">{keBerapa}/{hari.length}</span>}
      </span>
      <span className="truncate text-xs text-[#5a6f93]">
        {formatAgendaTime(event)}
        {event.location ? ` · ${event.location}` : ''}
      </span>
      {hari.length > 1 && (
        <span className="h-1 w-full overflow-hidden rounded-full bg-white/70">
          <span className="block h-full rounded-full" style={{ width: `${persen}%`, backgroundColor: color }} />
        </span>
      )}
    </button>
  )
}

export function TodayAgendaStrip({ events, today, divisionName, selectedId, onSelect }) {
  return (
    <div className={`${CARD_CLASS} shrink-0 !flex-row items-center gap-4 !py-3`}>
      <h2 className={`${CARD_TITLE_CLASS} flex w-[160px] shrink-0 items-center gap-2 leading-tight`}>
        <IconChartBars className="h-5 w-5 shrink-0 text-[#2f7fe8]" />
        Agenda Hari Ini
      </h2>
      {events.length ? (
        <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto">
          {events.map((event) => (
            <div key={event.id} className="min-w-[200px] max-w-[280px] flex-1">
              <Chip
                event={event}
                today={today}
                divisionName={divisionName(event.divisionId)}
                selected={selectedId === event.id}
                onSelect={onSelect}
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[#7a8aa8]">Tidak ada kegiatan yang berjalan hari ini.</p>
      )}
    </div>
  )
}
