import { formatCompactRupiah } from '../../../lib/budgetFormat'
import { MONTH_NAMES } from '../../../lib/budgetReportParser'
import { IconTrash } from '../../icons/DuotoneIcons'
import { CARD_CLASS, CARD_TITLE_CLASS } from '../../ui/cardStyles'

const CELL = 'whitespace-nowrap border-t border-[#e8edf5] px-3 py-1.5'

function formatTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function ActionBadge({ action }) {
  const isDelete = action === 'delete'
  return (
    <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${isDelete ? 'bg-[#fde2e2] text-[#c0262d]' : 'bg-[#dcf5e8] text-[#0b7a4f]'}`}>
      {isDelete ? 'Hapus' : 'Unggah'}
    </span>
  )
}

// Data aktif per tahun anggaran (dengan tombol hapus) dan riwayat unggah terbaru.
export function MasterUploadHistory({ reports, years, uploads, onDelete, notice }) {
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
              <button
                type="button"
                onClick={() => onDelete(report)}
                className="flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-bold text-[#c0262d] transition-colors hover:bg-[#fde2e2]"
                aria-label={`Hapus data TA ${year}`}
              >
                <IconTrash className="h-4 w-4" />
                Hapus
              </button>
            </div>
          )
        }) : <p className="text-sm text-slate-500">Belum ada master data. Dashboard dan menu akun masih kosong.</p>}
      </div>

      {notice && (
        <p className={`rounded-xl px-3 py-2 text-[13px] ${notice.ok ? 'bg-[#dcf5e8] text-[#0b7a4f]' : 'bg-[#fde2e2] text-[#c0262d]'}`}>{notice.text}</p>
      )}

      <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-[#e1e8f4]">
        <table className="w-full min-w-[600px] border-collapse text-[13px]">
          <thead>
            <tr className="text-left text-[#12305f]">
              {['Waktu', 'Aksi', 'TA / Bulan', 'Berkas', 'Oleh'].map((head) => (
                <th key={head} className="sticky top-0 bg-[#e6eefb] px-3 py-1.5 font-bold">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {uploads.length ? uploads.map((upload) => (
              <tr key={upload.id} className="text-[#12305f]">
                <td className={CELL}>{formatTime(upload.createdAt)}</td>
                <td className={CELL}><ActionBadge action={upload.action} /></td>
                <td className={CELL}>{upload.fiscalYear} / {MONTH_NAMES[upload.periodMonth - 1]}</td>
                <td className={`${CELL} max-w-[240px] truncate`} title={upload.sourceFileName}>{upload.sourceFileName || '-'}</td>
                <td className={CELL}>{upload.uploadedByName || '-'}</td>
              </tr>
            )) : (
              <tr><td colSpan={5} className="px-3 py-3 text-slate-500">Belum ada riwayat unggah.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
