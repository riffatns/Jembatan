import { formatCompactRupiah } from '../../../lib/budgetFormat'
import { MONTH_NAMES } from '../../../lib/budgetReportParser'
import { IconTrash } from '../../icons/DuotoneIcons'
import { CARD_CLASS, CARD_TITLE_CLASS } from '../../ui/cardStyles'
import { DataTable } from '../../data-table/DataTable'
import { VersionActions } from '../../master-data/VersionActions'
import { useSourceDownload } from '../../master-data/useSourceDownload'

export function formatTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const BADGES = {
  delete: 'bg-[#fde2e2] text-[#c0262d]',
  active: 'bg-[#dcf5e8] text-[#0b7a4f]'
}

function Badge({ tone, children }) {
  return <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${BADGES[tone]}`}>{children}</span>
}

function DeleteButton({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-[#c0262d] transition-colors hover:bg-[#fde2e2]"
      aria-label={label}
    >
      <IconTrash className="h-4 w-4" />
      Hapus
    </button>
  )
}

// Data aktif per tahun anggaran (hapus per TA) dan riwayat setiap unggahan
// (unduh berkas asli dan hapus per unggahan; unggahan aktif ditandai).
export function MasterUploadHistory({ reports, years, uploads, activeIds, onDeleteYear, onDeleteUpload, notice }) {
  const source = useSourceDownload()
  const columns = [
    { key: 'createdAt', label: 'Waktu', value: (row) => new Date(row.createdAt).getTime() || 0, text: (row) => formatTime(row.createdAt) },
    { key: 'period', label: 'TA / Bulan', value: (row) => row.fiscalYear * 100 + row.periodMonth, text: (row) => `${row.fiscalYear} / ${MONTH_NAMES[row.periodMonth - 1]}` },
    { key: 'sourceFileName', label: 'Berkas', className: 'max-w-[220px] truncate', title: (row) => row.sourceFileName, text: (row) => row.sourceFileName || '-' },
    { key: 'uploadedByName', label: 'Oleh', text: (row) => row.uploadedByName || '-' },
    {
      key: 'status',
      label: 'Status',
      value: (row) => (activeIds.has(row.id) ? 2 : row.action === 'delete' ? 1 : 0),
      text: (row) => (activeIds.has(row.id) ? 'Aktif' : row.action === 'delete' ? 'Hapus TA' : ''),
      render: (row) => (activeIds.has(row.id) ? <Badge tone="active">Aktif</Badge> : row.action === 'delete' ? <Badge tone="delete">Hapus TA</Badge> : null)
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
          label={`unggahan ${formatTime(row.createdAt)}`}
          hasFile={row.action !== 'delete'}
          downloading={source.busyId === row.id}
          onDownload={source.download}
          onDelete={onDeleteUpload}
        />
      )
    }
  ]

  return (
    <div className={`${CARD_CLASS} gap-3`}>
      <h2 className={CARD_TITLE_CLASS}>Data Aktif & Riwayat Unggah</h2>

      <div className="flex flex-wrap gap-2">
        {years.length ? years.map((year) => {
          const report = reports[year]
          return (
            <div key={year} className="flex items-center gap-3 rounded-xl border border-[#e1e8f4] bg-[#f8fbff] py-2 pl-3 pr-2 text-[13px]">
              <div>
                <b className="text-[#12305f]">TA {year}</b>
                <span className="text-[#3f557d]"> · s.d. {MONTH_NAMES[report.periodMonth - 1]} · Pagu {formatCompactRupiah(report.totals?.pagu)}</span>
                <span className="block text-xs text-[#7a8aa8]">Diperbarui {formatTime(report.updatedAt)}{report.uploadedByName ? ` oleh ${report.uploadedByName}` : ''}</span>
              </div>
              <DeleteButton label={`Hapus data TA ${year}`} onClick={() => onDeleteYear(report)} />
            </div>
          )
        }) : <p className="text-sm text-slate-500">Belum ada master data. Dashboard dan menu akun masih kosong.</p>}
      </div>

      {source.notice && <p className="rounded-xl bg-[#fde2e2] px-3 py-2 text-[13px] text-[#c0262d]">{source.notice.text}</p>}
      {notice && (
        <p className={`rounded-xl px-3 py-2 text-[13px] ${notice.ok ? 'bg-[#dcf5e8] text-[#0b7a4f]' : 'bg-[#fde2e2] text-[#c0262d]'}`}>{notice.text}</p>
      )}

      <DataTable
        rows={uploads}
        columns={columns}
        getRowKey={(row) => row.id}
        initialSort={{ key: 'createdAt', direction: 'desc' }}
        itemLabel="unggahan"
        searchPlaceholder="Cari berkas, TA, bulan, atau nama..."
        minWidth="min-w-[680px]"
      />
    </div>
  )
}
