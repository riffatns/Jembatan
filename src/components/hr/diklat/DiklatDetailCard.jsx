import { IconBuilding, IconCalendar, IconClock, IconInfo, IconPlay, IconUsers } from '../../icons/DuotoneIcons'
import { CARD_CLASS, CARD_TITLE_CLASS } from '../../ui/cardStyles'
import { SECTION_COLORS, SECTION_LABELS, STATUS_LABELS, formatDuration, formatRange, programStatus } from './diklatModel'

export const STATUS_TONES = {
  berlangsung: 'bg-[#dcf5e8] text-[#0b7a4f]',
  'akan-datang': 'bg-[#e6eefb] text-[#1d5fd0]',
  selesai: 'bg-[#eef2f8] text-[#5a6f93]',
  diusulkan: 'bg-[#fff6ea] text-[#9a4d00]',
  tba: 'bg-[#fff6ea] text-[#9a4d00]'
}

export function StatusPill({ status }) {
  return <span className={`whitespace-nowrap rounded-md px-2 py-0.5 text-[11.5px] font-bold ${STATUS_TONES[status]}`}>{STATUS_LABELS[status]}</span>
}

export function SectionPill({ section }) {
  const color = SECTION_COLORS[section]
  return <span className="whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-bold text-[#12305f]" style={{ backgroundColor: `${color}26` }}>{SECTION_LABELS[section]}</span>
}

function Row({ icon: Icon, label, children }) {
  return (
    <div className="grid grid-cols-[18px_96px_minmax(0,1fr)] items-start gap-2 text-[13px] fit:text-[12.5px] tall:text-[13px]">
      <Icon className="mt-0.5 h-[18px] w-[18px] text-[#7a8aa8]" />
      <span className="text-[#5a6f93]">{label}</span>
      <span className="min-w-0 font-semibold text-[#12305f]">{children}</span>
    </div>
  )
}

// Rincian program terpilih. Tahapan (PKP, PKA, JFPA) ditampilkan berurutan;
// tahap yang sedang dipilih di kalender ditandai.
export function DiklatDetailCard({ program, today, selectedEventId }) {
  if (!program) {
    return (
      <div className={`${CARD_CLASS} gap-2`}>
        <h2 className={CARD_TITLE_CLASS}>Detail Diklat</h2>
        <p className="text-sm text-[#7a8aa8]">Pilih kegiatan di kalender atau daftar untuk melihat rinciannya.</p>
      </div>
    )
  }
  const datedPhases = program.phases.filter((phase) => phase.schedule.start || phase.schedule.raw)
  return (
    <div className={`${CARD_CLASS} min-h-0 gap-2.5`}>
      <h2 className={`${CARD_TITLE_CLASS} flex items-center gap-2`}><IconInfo className="h-5 w-5 text-[#2f7fe8]" />Detail Diklat</h2>
      <div className="flex flex-col items-start gap-1">
        <span className="flex flex-wrap gap-1.5"><SectionPill section={program.section} /><StatusPill status={programStatus(program, today)} /></span>
        <h3 className="text-[17px] font-extrabold leading-snug text-[#12305f]">{program.name}</h3>
      </div>
      <div className="flex min-h-0 flex-col gap-1 overflow-y-auto pr-1">
        <Row icon={IconCalendar} label="Tanggal">{formatRange(program.schedule.start, program.schedule.end)}</Row>
        <Row icon={IconPlay} label="Metode">{program.method}</Row>
        <Row icon={IconBuilding} label="Penyelenggara">{program.organizer}</Row>
        <Row icon={IconClock} label="Durasi">{formatDuration(program)}</Row>
        <Row icon={IconUsers} label="Peserta">{[program.participants && `${program.participants} orang`, program.criteria].filter(Boolean).join(' · ') || '-'}</Row>
        {datedPhases.length > 0 && (
          <ol className="mt-1 flex flex-col gap-1 rounded-xl bg-[#f6f9fe] p-2 text-xs">
            {datedPhases.map((phase) => (
              <li key={phase.id} className={`grid grid-cols-[minmax(0,1fr)_auto] gap-2 rounded-md px-1.5 py-0.5 ${selectedEventId === `${program.uid}:${phase.id}` ? 'bg-[#e6eefb] font-bold' : ''}`}>
                <span className="truncate text-[#12305f]">{phase.label}. {phase.name}</span>
                <span className="whitespace-nowrap text-[#5a6f93]">{formatRange(phase.schedule.start, phase.schedule.end)}</span>
              </li>
            ))}
          </ol>
        )}
        {program.schedule.parts.length > 0 && (
          <p className="text-xs text-[#5a6f93]">Jadwal per moda: {program.schedule.parts.map((part) => `${part.label} ${part.tba ? 'TBA' : formatRange(part.start, part.end)}`).join(' · ')}</p>
        )}
      </div>
    </div>
  )
}
