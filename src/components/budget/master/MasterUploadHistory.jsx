import { formatCompactRupiah } from '../../../lib/budgetFormat'
import { MONTH_NAMES } from '../../../lib/budgetReportParser'
import { CARD_CLASS, CARD_TITLE_CLASS } from '../dashboard/dashboardTheme'

function formatTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// Data aktif per tahun anggaran dan riwayat unggahan terbaru.
export function MasterUploadHistory({ reports, years, uploads }) {
  return (
    <div className={`${CARD_CLASS} gap-3`}>
      <h2 className={CARD_TITLE_CLASS}>Data Aktif & Riwayat Unggah</h2>

      <div className="flex flex-wrap gap-2">
        {years.length ? years.map((year) => {
          const report = reports[year]
          return (
            <div key={year} className="rounded-xl border border-[#e1e8f4] bg-[#f8fbff] px-3 py-2 text-[13px]">
              <b className="text-[#12305f]">TA {year}</b>
              <span className="text-[#3f557d]"> · s.d. {MONTH_NAMES[report.periodMonth - 1]} · Pagu {formatCompactRupiah(report.totals?.pagu)}</span>
              <span className="block text-xs text-[#7a8aa8]">Diperbarui {formatTime(report.updatedAt)}{report.uploadedByName ? ` oleh ${report.uploadedByName}` : ''}</span>
            </div>
          )
        }) : <p className="text-sm text-slate-500">Belum ada master data. Dashboard dan menu akun masih kosong.</p>}
      </div>

      <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-[#e1e8f4]">
        <table className="w-full min-w-[560px] border-collapse text-[13px]">
          <thead>
            <tr className="text-left text-[#12305f]">
              {['Waktu', 'TA / Bulan', 'Berkas', 'Pengunggah'].map((head) => (
                <th key={head} className="sticky top-0 bg-[#e6eefb] px-3 py-1.5 font-bold">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {uploads.length ? uploads.map((upload) => (
              <tr key={upload.id} className="text-[#12305f]">
                <td className="whitespace-nowrap border-t border-[#e8edf5] px-3 py-1.5">{formatTime(upload.createdAt)}</td>
                <td className="whitespace-nowrap border-t border-[#e8edf5] px-3 py-1.5">{upload.fiscalYear} / {MONTH_NAMES[upload.periodMonth - 1]}</td>
                <td className="max-w-[260px] truncate border-t border-[#e8edf5] px-3 py-1.5" title={upload.sourceFileName}>{upload.sourceFileName || '-'}</td>
                <td className="whitespace-nowrap border-t border-[#e8edf5] px-3 py-1.5">{upload.uploadedByName || '-'}</td>
              </tr>
            )) : (
              <tr><td colSpan={4} className="px-3 py-3 text-slate-500">Belum ada riwayat unggah.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
