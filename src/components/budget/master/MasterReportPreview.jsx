import { formatPercent, formatRupiah } from '../../../lib/budgetFormat'
import { MONTH_NAMES } from '../../../lib/budgetReportParser'
import { IconInfo, IconTableList } from '../../icons/DuotoneIcons'
import { CARD_CLASS, CARD_TITLE_CLASS } from '../dashboard/dashboardTheme'
import { ACCOUNT_GROUPS } from '../accounts/accountModel'

const HEAD = 'sticky top-0 bg-[#e6eefb] px-2.5 py-1.5 text-right text-[12.5px] font-bold text-[#12305f] first:text-left'
const CELL = 'whitespace-nowrap border-t border-[#e8edf5] px-2.5 py-1.5 text-right text-[12.5px] tabular-nums text-[#12305f] first:text-left'

function GroupRow({ label, values, bold }) {
  const percent = values.pagu ? (values.realisasi / values.pagu) * 100 : 0
  const weight = bold ? 'font-extrabold bg-[#f3f7fd]' : ''
  return (
    <tr>
      <td className={`${CELL} ${weight}`}>{label}</td>
      <td className={`${CELL} ${weight}`}>{formatRupiah(values.pagu)}</td>
      <td className={`${CELL} ${weight}`}>{formatRupiah(values.realisasi)}</td>
      <td className={`${CELL} ${weight}`}>{formatRupiah(values.realisasiIni)}</td>
      <td className={`${CELL} ${weight}`}>{formatRupiah(values.sisa)}</td>
      <td className={`${CELL} ${weight}`}>{formatPercent(percent, 2)}</td>
    </tr>
  )
}

// Pratinjau hasil pemilahan sebelum disimpan: inilah angka yang akan tampil
// di Dashboard Keuangan (baris Total) dan di tiap menu akun (baris 51/52/53).
export function MasterReportPreview({ parsed, fiscalYear, periodMonth }) {
  if (!parsed) {
    return (
      <div className={`${CARD_CLASS} shrink-0 items-center justify-center py-6 text-center`}>
        <IconTableList className="h-10 w-10 text-slate-300" />
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          Pilih berkas laporan untuk melihat pratinjau angka per akun 51, 52, dan 53 sebelum disimpan.
        </p>
      </div>
    )
  }

  const groupTotals = ['51', '52', '53'].reduce(
    (sum, code) => {
      const group = parsed.groups[code]
      return { pagu: sum.pagu + group.pagu, realisasi: sum.realisasi + group.realisasi, realisasiIni: sum.realisasiIni + group.realisasiIni, sisa: sum.sisa + group.sisa }
    },
    { pagu: 0, realisasi: 0, realisasiIni: 0, sisa: 0 }
  )

  return (
    <div className={`${CARD_CLASS} shrink-0`}>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h2 className={`${CARD_TITLE_CLASS} flex items-center gap-2`}>
          <IconTableList className="h-5 w-5 text-[#2f7fe8]" />
          Pratinjau TA {fiscalYear} · s.d. {MONTH_NAMES[periodMonth - 1]}
        </h2>
        <span className="rounded-full bg-[#dcf5e8] px-3 py-1 text-xs font-bold text-[#0b7a4f]">
          Cocok dengan JUMLAH SELURUHNYA
        </span>
      </div>
      <p className="mb-2 text-[13px] text-[#3f557d]">
        {parsed.rowCount} baris akun dibaca, digabung menjadi {parsed.accounts.length} akun 6 digit.
      </p>
      <div className="min-h-0 overflow-auto rounded-xl border border-[#e1e8f4]">
        <table className="w-full min-w-[600px] border-collapse">
          <thead>
            <tr>
              <th className={HEAD}>Akun</th>
              <th className={HEAD}>Pagu</th>
              <th className={HEAD}>Realisasi s.d.</th>
              <th className={HEAD}>Bulan ini</th>
              <th className={HEAD}>Sisa</th>
              <th className={HEAD}>%</th>
            </tr>
          </thead>
          <tbody>
            {['51', '52', '53'].map((code) => (
              <GroupRow key={code} label={`${code} · ${ACCOUNT_GROUPS[code].title} (${parsed.groups[code].accountCount} akun)`} values={parsed.groups[code]} />
            ))}
            <GroupRow label="Total (Dashboard)" values={groupTotals} bold />
          </tbody>
        </table>
      </div>
      {parsed.warnings.map((warning) => (
        <p key={warning} className="mt-2 flex items-start gap-2 rounded-xl bg-[#fff6ea] px-3 py-2 text-[13px] text-[#9a4d00]">
          <IconInfo className="mt-0.5 h-4 w-4 shrink-0" />
          {warning}
        </p>
      ))}
    </div>
  )
}
