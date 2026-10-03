import { DataTable } from '../../data-table/DataTable'
import { CARD_CLASS, CARD_TITLE_CLASS } from '../../ui/cardStyles'
import { SECTION_LABELS, STATUS_LABELS, formatRange, programStatus } from './diklatModel'
import { SectionPill, StatusPill } from './DiklatDetailCard'

// Tampilan Daftar: semua program hasil filter (termasuk Self Learning).
// Klik nama program untuk membuka rinciannya di panel kanan.
export function DiklatTable({ programs, today, onSelect }) {
  const columns = [
    { key: 'section', label: 'Jenis', text: (row) => SECTION_LABELS[row.section], render: (row) => <SectionPill section={row.section} /> },
    {
      key: 'name',
      label: 'Nama Program',
      text: (row) => row.name,
      render: (row) => (
        <button type="button" onClick={() => onSelect(row)} className="text-left font-semibold text-[#1d5fd0] hover:underline">{row.name}</button>
      )
    },
    { key: 'schedule', label: 'Jadwal', value: (row) => row.schedule.start || '9999', text: (row) => formatRange(row.schedule.start, row.schedule.end) },
    { key: 'method', label: 'Metode', text: (row) => row.method },
    { key: 'organizer', label: 'Penyelenggara', text: (row) => row.organizer },
    { key: 'jp', label: 'Durasi', text: (row) => [row.days, row.jp && `${row.jp} JP`].filter(Boolean).join(' / ') || '-' },
    {
      key: 'status',
      label: 'Status',
      text: (row) => STATUS_LABELS[programStatus(row, today)],
      render: (row) => <StatusPill status={programStatus(row, today)} />
    }
  ]

  return (
    <div className={`${CARD_CLASS} gap-3`}>
      <h2 className={CARD_TITLE_CLASS}>Daftar Program Diklat</h2>
      <DataTable
        rows={programs}
        columns={columns}
        getRowKey={(row) => row.uid}
        initialSort={{ key: 'schedule', direction: 'asc' }}
        itemLabel="program"
        searchPlaceholder="Cari di daftar..."
        minWidth="min-w-[860px]"
        dense
      />
    </div>
  )
}
