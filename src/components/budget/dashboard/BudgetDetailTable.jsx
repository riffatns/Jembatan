import { formatAbsorption, formatRupiah } from '../../../lib/budgetFormat'
import { CARD_CLASS, CARD_TITLE_CLASS } from './dashboardTheme'
import { useAnimatedProgress } from './useAnimatedProgress'

function AbsorptionBar({ percent, bold, progress }) {
  return (
    <div className="flex items-center gap-3.5 fit:gap-2.5">
      <span className="h-[13px] min-w-[40px] flex-1 overflow-hidden rounded-full bg-[#e4e9f2] fit:h-[11px]">
        <span className="block h-full rounded-full bg-gradient-to-r from-[#26c08a] to-[#1fae7a]" style={{ width: `${Math.min(percent, 100) * progress}%` }} />
      </span>
      <b className={`w-[58px] text-right tabular-nums ${bold ? 'font-extrabold' : 'font-semibold'}`}>{formatAbsorption(percent * progress)}</b>
    </div>
  )
}

const HEAD_CELL = 'border-r border-white/15 px-3 py-[9px] text-center text-[13.5px] font-semibold text-white last:border-r-0 fit:px-2 fit:py-1.5 fit:text-[13px]'
const BODY_CELL =
  'whitespace-nowrap border-r border-t border-[#e1e8f4] px-3 py-2 text-center text-sm tabular-nums text-[#12305f] last:border-r-0 fit:px-1.5 fit:py-1 fit:text-[13px] min-[1440px]:fit:px-2 tall:py-1.5 tall:text-sm'
const TOTAL_CELL = `${BODY_CELL} text-[15px] fit:text-[13.5px] tall:text-[15px]`

export function BudgetDetailTable({ rows, total, absorption }) {
  // Bar persentase memanjang dari nol; diputar ulang hanya bila angkanya berubah.
  const progress = useAnimatedProgress(`${total.pagu}:${total.realisasi}:${rows.length}`)

  return (
    <div className={CARD_CLASS}>
      <h2 className={`${CARD_TITLE_CLASS} mb-3 fit:mb-1.5`}>Rincian Anggaran per Kode</h2>
      <div className="overflow-x-auto rounded-[10px] border border-[#e1e8f4] fit:min-h-0 fit:overflow-y-auto">
        <table className="w-full min-w-[720px] border-collapse fit:min-w-0">
          <thead className="bg-[#1e4f8f]">
            <tr>
              <th className={`${HEAD_CELL} w-[9%]`}>Kode</th>
              <th className={HEAD_CELL}>Pagu Anggaran</th>
              <th className={HEAD_CELL}>Realisasi</th>
              <th className={HEAD_CELL}>Sisa</th>
              <th className={`${HEAD_CELL} w-[28%]`}>Persentase</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.code} title={row.name} className="hover:bg-[#f7faff]">
                <td className={BODY_CELL}>{row.code}</td>
                <td className={BODY_CELL}>{formatRupiah(row.pagu)}</td>
                <td className={BODY_CELL}>{formatRupiah(row.realisasi)}</td>
                <td className={BODY_CELL}>{formatRupiah(row.sisa)}</td>
                <td className={BODY_CELL}><AbsorptionBar percent={row.absorption} progress={progress} /></td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-[#e5effc] font-extrabold">
            <tr>
              <td className={TOTAL_CELL}>Total</td>
              <td className={TOTAL_CELL}>{formatRupiah(total.pagu)}</td>
              <td className={TOTAL_CELL}>{formatRupiah(total.realisasi)}</td>
              <td className={TOTAL_CELL}>{formatRupiah(total.sisa)}</td>
              <td className={BODY_CELL}><AbsorptionBar percent={absorption} progress={progress} bold /></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
