import { IconTrash } from '../icons/DuotoneIcons'
import { DataTable } from '../data-table/DataTable'

export function formatDateTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const BADGES = {
  upload: 'bg-[#e6eefb] text-[#1d5fd0]',
  clear: 'bg-[#fde2e2] text-[#c0262d]',
  active: 'bg-[#dcf5e8] text-[#0b7a4f]'
}

function Badge({ tone, children }) {
  return <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${BADGES[tone]}`}>{children}</span>
}

// Riwayat versi Master Data generik (useMasterDataset): unggahan dan
// pengosongan, versi aktif ditandai, setiap baris bisa dihapus.
export function VersionHistory({ versions, activeId, onDelete }) {
  const columns = [
    { key: 'createdAt', label: 'Waktu', value: (row) => new Date(row.createdAt).getTime() || 0, text: (row) => formatDateTime(row.createdAt) },
    {
      key: 'action',
      label: 'Aksi',
      text: (row) => (row.action === 'clear' ? 'Kosongkan' : 'Unggah'),
      render: (row) => <Badge tone={row.action === 'clear' ? 'clear' : 'upload'}>{row.action === 'clear' ? 'Kosongkan' : 'Unggah'}</Badge>
    },
    { key: 'periodLabel', label: 'Periode', value: (row) => (row.periodYear || 0) * 100 + (row.periodMonth || 0), text: (row) => row.periodLabel || '-' },
    { key: 'sourceFileName', label: 'Berkas', title: (row) => row.sourceFileName, text: (row) => row.sourceFileName || '-', render: (row) => <span className="block max-w-[140px] truncate">{row.sourceFileName || '-'}</span> },
    { key: 'uploadedByName', label: 'Oleh', text: (row) => row.uploadedByName || '-' },
    {
      key: 'status',
      label: 'Status',
      value: (row) => (row.id === activeId ? 1 : 0),
      text: (row) => (row.id === activeId ? 'Aktif' : ''),
      render: (row) => (row.id === activeId ? <Badge tone="active">Aktif</Badge> : null)
    },
    {
      key: 'delete',
      label: '',
      sortable: false,
      align: 'right',
      text: () => '',
      render: (row) => (
        <button
          type="button"
          onClick={() => onDelete(row)}
          className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-[#c0262d] transition-colors hover:bg-[#fde2e2]"
          aria-label={`Hapus versi ${formatDateTime(row.createdAt)}`}
        >
          <IconTrash className="h-4 w-4" />
          Hapus
        </button>
      )
    }
  ]

  return (
    <DataTable
      rows={versions}
      columns={columns}
      getRowKey={(row) => row.id}
      initialSort={{ key: 'createdAt', direction: 'desc' }}
      itemLabel="versi"
      searchPlaceholder="Cari berkas, periode, atau nama..."
      minWidth="min-w-[640px]"
      dense
    />
  )
}
