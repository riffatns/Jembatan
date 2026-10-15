import { DataTable } from '../../data-table/DataTable'
import { IconTableList } from '../../icons/DuotoneIcons'
import { CARD_CLASS, CARD_TITLE_CLASS } from '../../ui/cardStyles'
import { agendaEndDate, formatAgendaTime, getAgendaTypeMeta } from '../../../lib/agendaStorage'
import { DivisionPill, PhasePill, TypePill } from './AgendaDetailCard'
import { agendaPhase } from './sharedCalendarModel'

// Tampilan Daftar: seluruh kolom yang tidak muat di bilah kalender. Lebar
// kolomnya mengikat (fixedLayout) supaya tabelnya muat selebar kartu dan isi
// yang panjang membungkus, bukan memaksa tabel digeser ke samping.
const WRAP = '!whitespace-normal break-words leading-snug'

const SHORT = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
const shortDate = (iso) => SHORT.format(new Date(`${iso}T00:00:00`))

export function AgendaTable({ events, today, divisionName, selectedId, onSelect }) {
  const columns = [
    {
      key: 'eventDate',
      label: 'Tanggal',
      align: 'left',
      width: 'w-[12%]',
      className: WRAP,
      render: (row) => {
        const end = agendaEndDate(row)
        return (
          <>
            <span className="block font-semibold">{shortDate(row.eventDate)}</span>
            {end !== row.eventDate && <span className="block text-[11.5px] font-normal text-[#7a8aa8]">s.d. {shortDate(end)}</span>}
          </>
        )
      },
      text: (row) => `${shortDate(row.eventDate)} ${agendaEndDate(row)}`
    },
    { key: 'startTime', label: 'Waktu', align: 'left', width: 'w-[10%]', className: WRAP, text: (row) => formatAgendaTime(row) },
    {
      key: 'title',
      label: 'Kegiatan',
      align: 'left',
      width: 'w-[18%]',
      className: WRAP,
      render: (row) => (
        <>
          <span className="block font-semibold">{row.title}</span>
          {row.description && <span className="block text-[11.5px] font-normal text-[#7a8aa8]">{row.description}</span>}
        </>
      ),
      text: (row) => [row.title, row.description].filter(Boolean).join(' '),
      value: (row) => row.title
    },
    {
      key: 'eventType',
      label: 'Jenis',
      align: 'center',
      width: 'w-[12%]',
      render: (row) => <TypePill eventType={row.eventType} />,
      text: (row) => getAgendaTypeMeta(row.eventType).label
    },
    {
      key: 'divisionId',
      label: 'Bidang',
      align: 'left',
      width: 'w-[11%]',
      className: WRAP,
      render: (row) => <DivisionPill divisionId={row.divisionId} name={divisionName(row.divisionId)} short />,
      text: (row) => divisionName(row.divisionId) || row.divisionId
    },
    { key: 'location', label: 'Tempat', align: 'left', width: 'w-[12%]', className: WRAP, text: (row) => row.location || '-' },
    {
      key: 'organizer',
      label: 'Penyelenggara',
      align: 'left',
      width: 'w-[10%]',
      className: WRAP,
      render: (row) => (
        <>
          <span className="block">{row.organizer || '-'}</span>
          {row.attendees && <span className="block text-[11.5px] font-normal text-[#7a8aa8]">{row.attendees}</span>}
        </>
      ),
      text: (row) => [row.organizer, row.attendees].filter(Boolean).join(' '),
      value: (row) => row.organizer || ''
    },
    {
      key: 'status',
      label: 'Status',
      align: 'center',
      width: 'w-[15%]',
      render: (row) => <PhasePill phase={agendaPhase(row, today)} />,
      text: (row) => agendaPhase(row, today)
    }
  ]

  return (
    <div className={CARD_CLASS}>
      <DataTable
        rows={events}
        columns={columns}
        getRowKey={(row) => row.id}
        initialSort={{ key: 'eventDate', direction: 'asc' }}
        onRowClick={onSelect}
        fixedLayout
        minWidth="min-w-[760px]"
        itemLabel="agenda"
        searchable={false}
        title={
          <h2 className={`${CARD_TITLE_CLASS} flex items-center gap-2`}>
            <IconTableList className="h-5 w-5 text-[#2f7fe8]" />
            Daftar Agenda
            {selectedId && <span className="text-[13px] font-semibold text-[#7a8aa8]">· satu baris dipilih</span>}
          </h2>
        }
      />
    </div>
  )
}
