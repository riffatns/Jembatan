import { useMemo, useState } from 'react'
import { useElementSize } from '../../hooks/useElementSize'
import { layoutWeek, monthWeeks } from '../../lib/calendarLayout'
import { IconChevronDown } from '../icons/DuotoneIcons'

const WEEKDAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
const MONTH_FORMAT = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' })
// Tinggi bilah 17px + jarak 3px; baris angka tanggal (+N) di atas 26px.
const LANE_HEIGHT = 20
const ROW_CHROME = 28
const NAV_BUTTON = 'grid h-8 w-8 place-items-center rounded-lg text-[#3f557d] transition-colors hover:bg-[#e6eefb] hover:text-[#1d5fd0]'

function EventBar({ segment, selected, onSelect }) {
  const { event, column, span, lane, continuesBefore, continuesAfter } = segment
  return (
    <button
      type="button"
      onClick={() => onSelect(event)}
      title={event.title || event.label}
      aria-pressed={selected}
      style={{
        gridColumn: `${column + 1} / span ${span}`,
        gridRow: lane + 1,
        backgroundColor: `${event.color}${selected ? '40' : '24'}`,
        boxShadow: selected ? `inset 0 0 0 1.5px ${event.color}` : undefined,
        borderLeft: continuesBefore ? 'none' : `3px solid ${event.color}`
      }}
      className={`pointer-events-auto mx-0.5 truncate px-1.5 text-left text-[11px] font-semibold leading-[17px] text-[#12305f] transition-colors ${continuesBefore ? 'rounded-l-none' : 'rounded-l-md'} ${continuesAfter ? 'rounded-r-none' : 'rounded-r-md'} ${event.muted ? 'opacity-60' : ''}`}
    >
      {continuesBefore ? '… ' : ''}{event.label}
    </button>
  )
}

// "+N": daftar kegiatan hari itu yang tidak muat, bisa dipilih.
function DayOverflow({ events, onSelect, alignRight }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false) }}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => { if (event.key === 'Escape') setOpen(false) }}
        aria-expanded={open}
        aria-label={`${events.length} kegiatan lain`}
        className="rounded px-1 text-[10.5px] font-bold text-[#1d5fd0] hover:bg-[#e6eefb]"
      >
        +{events.length}
      </button>
      {open && (
        <div className={`absolute top-full z-30 mt-1 flex w-56 flex-col gap-0.5 rounded-xl bg-white p-1.5 shadow-[0_12px_32px_-12px_rgba(18,48,95,0.45)] ${alignRight ? 'right-0' : 'left-0'}`}>
          {events.map((event) => (
            <button
              key={event.id}
              type="button"
              onClick={() => { onSelect(event); setOpen(false) }}
              className="flex items-center gap-2 rounded-lg px-2 py-1 text-left text-xs font-semibold text-[#12305f] hover:bg-[#f1f5fb]"
            >
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: event.color }} aria-hidden="true" />
              <span className="truncate">{event.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function WeekRow({ days, events, today, selectedId, onSelect, lanes, rowClassName }) {
  const { segments, hidden } = useMemo(() => layoutWeek(days, events, lanes), [days, events, lanes])
  return (
    <div className={`relative flex-1 border-t border-[#e8eef7] ${rowClassName}`}>
      <div className="absolute inset-0 grid grid-cols-7">
        {days.map((day, index) => (
          <div key={day.iso} className={`flex items-start justify-between border-l border-[#eef2f8] px-1.5 py-0.5 first:border-l-0 ${day.inMonth ? '' : 'bg-[#f8fafd]'}`}>
            <span className={`grid h-[22px] w-[22px] place-items-center rounded-full text-xs font-bold ${day.iso === today ? 'bg-[#1d5fd0] text-white' : day.inMonth ? 'text-[#12305f]' : 'text-[#b3c0d6]'}`}>{day.day}</span>
            {hidden[index].length > 0 && <DayOverflow events={hidden[index]} onSelect={onSelect} alignRight={index > 3} />}
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-[26px] grid grid-cols-7 gap-y-[3px]" style={{ gridAutoRows: '17px' }}>
        {segments.map((segment) => (
          <EventBar key={`${segment.event.id}-${days[0].iso}`} segment={segment} selected={segment.event.id === selectedId} onSelect={onSelect} />
        ))}
      </div>
    </div>
  )
}

// Kalender bulan generik. events: [{ id, label, start, end (ISO), color,
// title?, muted? }]. Kegiatan berhari-hari tampil sebagai bilah melintang per
// minggu; yang tidak muat diringkas "+N". Label selalu teks gelap di
// atas warna tipis supaya terbaca walau warnanya terang. Jumlah lajur per
// minggu mengikuti tinggi baris (maks. maxLanes); rowClassName memberi tinggi
// minimum baris, mis. 'min-h-[88px] tall:min-h-0' agar mengisi layar tinggi.
// title/aside: isi kiri (judul) dan kanan (legenda) di baris navigasi bulan.
export function MonthCalendar({ year, monthIndex, events, today, selectedId, onSelect, onMonthChange, maxLanes = 4, rowClassName = 'min-h-[88px]', className = '', title = null, aside = null }) {
  const weeks = useMemo(() => monthWeeks(year, monthIndex), [year, monthIndex])
  const [bodyRef, body] = useElementSize()
  const rowHeight = body.height / weeks.length
  const lanes = rowHeight ? Math.max(1, Math.min(maxLanes, Math.floor((rowHeight - ROW_CHROME) / LANE_HEIGHT))) : 3
  const shift = (step) => {
    const next = new Date(year, monthIndex + step, 1)
    onMonthChange(next.getFullYear(), next.getMonth())
  }

  return (
    <div className={`flex min-h-0 flex-col ${className}`}>
      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 2xl:grid 2xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        <div className="min-w-0">{title}</div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => shift(-1)} className={NAV_BUTTON} aria-label="Bulan sebelumnya">
            <IconChevronDown className="h-4 w-4 rotate-90" />
          </button>
          <h3 className="min-w-[132px] text-center text-[15px] font-extrabold capitalize text-[#12305f]" aria-live="polite">{MONTH_FORMAT.format(new Date(year, monthIndex, 1))}</h3>
          <button type="button" onClick={() => shift(1)} className={NAV_BUTTON} aria-label="Bulan berikutnya">
            <IconChevronDown className="h-4 w-4 -rotate-90" />
          </button>
        </div>
        <div className="min-w-0 2xl:justify-self-end">{aside}</div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-x-auto">
        <div className="flex min-h-0 min-w-[560px] flex-1 flex-col">
          <div className="grid grid-cols-7 pb-1">
            {WEEKDAYS.map((name) => <span key={name} className="px-1.5 text-[11px] font-bold uppercase tracking-wide text-[#7a8aa8]">{name}</span>)}
          </div>
          <div ref={bodyRef} className="flex min-h-0 flex-1 flex-col">
            {weeks.map((days) => (
              <WeekRow key={days[0].iso} days={days} events={events} today={today} selectedId={selectedId} onSelect={onSelect} lanes={lanes} rowClassName={rowClassName} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
