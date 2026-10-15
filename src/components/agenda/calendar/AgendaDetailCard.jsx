import {
  IconAlert,
  IconBuilding,
  IconCalendar,
  IconClock,
  IconInfo,
  IconPlay,
  IconSearch,
  IconUsers
} from '../../icons/DuotoneIcons'
import { Button } from '../../ui/button'
import { CARD_CLASS, CARD_TITLE_CLASS } from '../../ui/cardStyles'
import { getDivisionVisual } from '../../../data/divisionPalette'
import {
  agendaDateKeys,
  findAgendaConflicts,
  formatAgendaDateRange,
  formatAgendaTime,
  getAgendaStatusMeta,
  getAgendaTypeMeta,
  getAgendaVisibilityMeta
} from '../../../lib/agendaStorage'
import { PHASE_LABELS, PHASE_TONES, agendaPhase } from './sharedCalendarModel'

export function PhasePill({ phase }) {
  return <span className={`whitespace-nowrap rounded-md px-2 py-0.5 text-[11.5px] font-bold ${PHASE_TONES[phase]}`}>{PHASE_LABELS[phase]}</span>
}

export function TypePill({ eventType }) {
  const meta = getAgendaTypeMeta(eventType)
  return (
    <span className="whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-bold text-[#12305f]" style={{ backgroundColor: `${meta.color}26` }}>
      {meta.label}
    </span>
  )
}

// `short` memakai singkatan bidang (KEU, SDM, HKM, HUMAS, TI) alih-alih nama
// panjangnya, untuk kolom tabel yang sempit. Teksnya tetap ada - palet divisi
// mensyaratkan setiap chip membawa tulisan, karena warnanya sendiri tidak
// cukup kontras untuk jadi penanda tunggal.
export function DivisionPill({ divisionId, name, short = false }) {
  const visual = getDivisionVisual(divisionId)
  return (
    <span
      title={name || visual.abbr}
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-[#eef2f8] px-2 py-0.5 text-[11px] font-bold text-[#12305f]"
    >
      <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: visual.color }} aria-hidden="true" />
      {short ? visual.abbr : name || visual.abbr}
    </span>
  )
}

function Row({ icon: Icon, label, children }) {
  return (
    <div className="grid grid-cols-[18px_96px_minmax(0,1fr)] items-start gap-2 text-[13px] fit:text-[12.5px] tall:text-[13px]">
      <Icon className="mt-0.5 h-[18px] w-[18px] shrink-0 text-[#7a8aa8]" />
      <span className="text-[#5a6f93]">{label}</span>
      <span className="min-w-0 break-words font-semibold text-[#12305f]">{children || '-'}</span>
    </div>
  )
}

// Rincian agenda terpilih. Kolomnya lebih banyak daripada kalender diklat
// karena pertanyaan yang dijawab kalender bersama memang berbeda: bukan
// "pelatihan apa ini", melainkan "kapan, di ruang mana, bidang siapa, siapa
// pesertanya, boleh dilihat siapa, dan apakah bentrok dengan kegiatan lain".
export function AgendaDetailCard({ event, today, divisionName, allEvents, canManage, onEdit, onDelete }) {
  if (!event) {
    return (
      <div className={`${CARD_CLASS} gap-2`}>
        <h2 className={`${CARD_TITLE_CLASS} flex items-center gap-2`}><IconInfo className="h-5 w-5 text-[#2f7fe8]" />Detail Agenda</h2>
        <p className="text-sm text-[#7a8aa8]">Pilih kegiatan di kalender atau daftar untuk melihat rinciannya.</p>
      </div>
    )
  }

  const phase = agendaPhase(event, today)
  const statusMeta = getAgendaStatusMeta(event.status)
  const visibilityMeta = getAgendaVisibilityMeta(event.visibility)
  const jumlahHari = agendaDateKeys(event).length
  const conflicts = findAgendaConflicts(allEvents || [], event)

  return (
    <div className={`${CARD_CLASS} min-h-0 gap-2.5`}>
      <h2 className={`${CARD_TITLE_CLASS} flex items-center gap-2`}><IconInfo className="h-5 w-5 text-[#2f7fe8]" />Detail Agenda</h2>

      <div className="flex flex-col items-start gap-1">
        <span className="flex flex-wrap gap-1.5">
          <DivisionPill divisionId={event.divisionId} name={divisionName} />
          <TypePill eventType={event.eventType} />
          <PhasePill phase={phase} />
        </span>
        <h3 className="text-[17px] font-extrabold leading-snug text-[#12305f]">{event.title}</h3>
      </div>

      <div className="flex min-h-0 flex-col gap-1 overflow-y-auto pr-1">
        <Row icon={IconCalendar} label="Tanggal">{formatAgendaDateRange(event)}</Row>
        <Row icon={IconClock} label="Waktu">{formatAgendaTime(event)}</Row>
        <Row icon={IconPlay} label="Durasi">{jumlahHari > 1 ? `${jumlahHari} hari` : 'Satu hari'}</Row>
        <Row icon={IconBuilding} label="Tempat">{event.location}</Row>
        <Row icon={IconUsers} label="Penyelenggara">{event.organizer}</Row>
        <Row icon={IconUsers} label="Peserta">{event.attendees}</Row>
        <Row icon={IconSearch} label="Keterlihatan">{visibilityMeta.label}</Row>
        <Row icon={IconInfo} label="Status">{statusMeta.label}</Row>

        {event.description && (
          <p className="mt-1 whitespace-pre-line rounded-xl bg-[#f6f9fe] p-2 text-xs leading-relaxed text-[#3f557d]">
            {event.description}
          </p>
        )}

        {/* Bentrok adalah pertanyaan khas kalender bersama: satu ruang dipakai
            dua kegiatan, atau satu bidang punya dua kegiatan berbarengan. */}
        {conflicts.length > 0 && (
          <div className="mt-1 flex flex-col gap-1 rounded-xl bg-[#fff6ea] p-2 text-xs text-[#9a4d00]">
            <span className="flex items-center gap-1.5 font-bold">
              <IconAlert className="h-4 w-4 shrink-0" />
              Bentrok dengan {conflicts.length} kegiatan
            </span>
            {conflicts.map(({ event: lain, reason }) => (
              <span key={lain.id} className="truncate" title={lain.title}>
                {lain.title} · {reason === 'location' ? 'tempat sama' : 'bidang sama'}
              </span>
            ))}
          </div>
        )}

        <p className="mt-1 text-[11.5px] text-[#7a8aa8]">Dicatat oleh {event.createdByName || 'pengguna tidak diketahui'}</p>
      </div>

      {canManage && (
        <div className="flex shrink-0 gap-2 border-t border-[#e1e8f4] pt-2">
          <Button size="sm" variant="outline" onClick={() => onEdit(event)} className="rounded-full">Edit</Button>
          <Button size="sm" variant="ghost" onClick={() => onDelete(event)} className="rounded-full text-[#c0262d] hover:bg-red-50">Hapus</Button>
        </div>
      )}
    </div>
  )
}
