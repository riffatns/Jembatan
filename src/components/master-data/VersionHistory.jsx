import { DataTable } from '../data-table/DataTable'
import { VersionActions } from './VersionActions'
import { useSourceDownload } from './useSourceDownload'

export function formatDateTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const BADGES = {
  clear: 'bg-[#fde2e2] text-[#c0262d]',
  active: 'bg-[#dcf5e8] text-[#0b7a4f]'
}

function Badge({ tone, children }) {
  return <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${BADGES[tone]}`}>{children}</span>
}

// Riwayat versi Master Data generik (useMasterDataset): unggahan dan
// pengosongan, versi aktif ditandai, setiap baris bisa diunduh ulang dan dihapus.
export function VersionHistory({ versions, activeId, onDelete }) {
  const source = useSourceDownload()
  const columns = [
    { key: 'createdAt', label: 'Waktu', value: (row) => new Date(row.createdAt).getTime() || 0, text: (row) => formatDateTime(row.createdAt) },
    { key: 'periodLabel', label: 'Periode', value: (row) => (row.periodYear || 0) * 100 + (row.periodMonth || 0), text: (row) => row.periodLabel || '-' },
    { key: 'sourceFileName', label: 'Berkas', title: (row) => row.sourceFileName, text: (row) => row.sourceFileName || '-', render: (row) => <span className="block max-w-[140px] truncate">{row.sourceFileName || '-'}</span> },
    { key: 'uploadedByName', label: 'Oleh', text: (row) => row.uploadedByName || '-' },
    {
      key: 'status',
      label: 'Status',
      value: (row) => (row.id === activeId ? 2 : row.action === 'clear' ? 1 : 0),
      text: (row) => (row.id === activeId ? 'Aktif' : row.action === 'clear' ? 'Dikosongkan' : ''),
      render: (row) => (row.id === activeId ? <Badge tone="active">Aktif</Badge> : row.action === 'clear' ? <Badge tone="clear">Dikosongkan</Badge> : null)
    },
    {
      key: 'actions',
      label: 'Aksi',
      sortable: false,
      align: 'right',
      text: () => '',
      render: (row) => (
        <VersionActions
          row={row}
          label={`versi ${formatDateTime(row.createdAt)}`}
          hasFile={row.action !== 'clear'}
          downloading={source.busyId === row.id}
          onDownload={source.download}
          onDelete={onDelete}
        />
      )
    }
  ]

  return (
    <>
      {source.notice && <p className="rounded-xl bg-[#fde2e2] px-3 py-2 text-[13px] text-[#c0262d]">{source.notice.text}</p>}
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
    </>
  )
}
