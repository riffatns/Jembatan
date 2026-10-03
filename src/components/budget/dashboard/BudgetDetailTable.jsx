import { formatAbsorption, formatRupiah } from '../../../lib/budgetFormat'
import { CARD_CLASS, CARD_TITLE_CLASS } from './dashboardTheme'

function AbsorptionBar({ percent, bold }) {
  return (
    <div className="flex items-center gap-3.5">
      <span className="h-[13px] flex-1 overflow-hidden rounded-full bg-[#e4e9f2]">
        <span className="block h-full rounded-full bg-gradient-to-r from-[#26c08a] to-[#1fae7a]" style={{ width: `${Math.min(percent, 100)}%` }} />
      </span>
      <b className={`w-[58px] text-right tabular-nums ${bold ? 'font-extrabold' : 'font-semibold'}`}>{formatAbsorption(percent)}</b>
    </div>
  )
}

const HEAD_CELL = 'border-r border-white/15 px-3 py-[9px] text-center text-[13.5px] font-semibold text-white last:border-r-0'
const BODY_CELL = 'whitespace-nowrap border-r border-t border-[#e1e8f4] px-3 py-2 text-center text-sm tabular-nums text-[#12305f] last:border-r-0'

export function BudgetDetailTable({ rows, total, absorption }) {
  return (
    <div className={CARD_CLASS}>
      <h2 className={`${CARD_TITLE_CLASS} mb-3`}>Rincian Anggaran per Kode</h2>
      <div className="overflow-x-auto rounded-[10px] border border-[#e1e8f4]">
        <table className="w-full min-w-[720px] border-collapse">
          <thead className="bg-[#1e4f8f]">
            <tr>
              <th className={`${HEAD_CELL} w-[9%]`}>Kode</th>
              <th className={HEAD_CELL}>Pagu Anggaran</th>
              <th className={HEAD_CELL}>Realisasi</th>
              <th className={HEAD_CELL}>Sisa</th>
              <th className={`${HEAD_CELL} w-[30%]`}>Persentase</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.code} title={row.name} className="hover:bg-[#f7faff]">
                <td className={BODY_CELL}>{row.code}</td>
                <td className={BODY_CELL}>{formatRupiah(row.pagu)}</td>
                <td className={BODY_CELL}>{formatRupiah(row.realisasi)}</td>
                <td className={BODY_CELL}>{formatRupiah(row.sisa)}</td>
                <td className={BODY_CELL}><AbsorptionBar percent={row.absorption} /></td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-[#e5effc] text-[15px] font-extrabold">
            <tr>
              <td className={`${BODY_CELL} text-[15px]`}>Total</td>
              <td className={`${BODY_CELL} text-[15px]`}>{formatRupiah(total.pagu)}</td>
              <td className={`${BODY_CELL} text-[15px]`}>{formatRupiah(total.realisasi)}</td>
              <td className={`${BODY_CELL} text-[15px]`}>{formatRupiah(total.sisa)}</td>
              <td className={BODY_CELL}><AbsorptionBar percent={absorption} bold /></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
