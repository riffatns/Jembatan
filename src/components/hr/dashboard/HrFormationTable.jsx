import { formatAbsorption } from '../../../lib/budgetFormat'
import { CARD_CLASS, CARD_TITLE_CLASS } from '../../ui/cardStyles'
import { useAnimatedProgress } from '../../../hooks/useAnimatedProgress'

// Bentuk tabelnya mengikuti Rincian Anggaran per Kode: kepala biru, sel
// tengah, baris jumlah bergaris, dan bilah persentase di kolom terakhir.

function FulfillmentBar({ percent, bold, progress }) {
  return (
    <div className="flex items-center gap-3.5 fit:gap-2.5">
      <span className="h-[13px] min-w-[40px] flex-1 overflow-hidden rounded-full bg-[#e4e9f2] fit:h-[11px]">
        <span
          className="block h-full rounded-full bg-gradient-to-r from-[#26c08a] to-[#1fae7a]"
          style={{ width: `${Math.min(percent, 100) * progress}%` }}
        />
      </span>
      <b className={`w-[58px] text-right tabular-nums ${bold ? 'font-extrabold' : 'font-semibold'}`}>
        {formatAbsorption(percent * progress)}
      </b>
    </div>
  )
}

const HEAD_CELL =
  'border-r border-white/15 px-3 py-[9px] text-center text-[13.5px] font-semibold text-white last:border-r-0 fit:px-2 fit:py-1.5 fit:text-[13px]'
const BODY_CELL =
  'whitespace-nowrap border-r border-t border-[#e1e8f4] px-3 py-2 text-center text-sm tabular-nums text-[#12305f] last:border-r-0 fit:px-1.5 fit:py-1 fit:text-[13px] fitwide:px-2 tall:py-1.5 tall:text-sm'
const TOTAL_CELL = `${BODY_CELL} text-[15px] fit:text-[13.5px] tall:text-[15px]`

export function HrFormationTable({ rows, total, fulfillment }) {
  const progress = useAnimatedProgress(`${total.need}:${total.actual}:${rows.length}`)

  return (
    <div className={CARD_CLASS}>
      <h2 className={`${CARD_TITLE_CLASS} mb-3 fit:mb-1.5`}>Rincian Formasi per Unit</h2>
      <div className="overflow-x-auto rounded-[10px] border border-[#e1e8f4] fit:min-h-0 fit:overflow-y-auto">
        <table className="w-full min-w-[720px] border-collapse fit:min-w-0">
          <thead className="bg-[#1e4f8f]">
            <tr>
              <th className={`${HEAD_CELL} w-[34%] !text-left`}>Unit Kerja</th>
              <th className={HEAD_CELL}>Kebutuhan</th>
              <th className={HEAD_CELL}>Terisi</th>
              <th className={HEAD_CELL}>Kurang</th>
              <th className={`${HEAD_CELL} w-[28%]`}>Keterisian</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} title={row.status} className="hover:bg-[#f7faff]">
                <td className={`${BODY_CELL} max-w-0 truncate !text-left`}>{row.name}</td>
                <td className={BODY_CELL}>{row.need.toLocaleString('id-ID')}</td>
                <td className={BODY_CELL}>{row.actual.toLocaleString('id-ID')}</td>
                <td className={BODY_CELL}>
                  {row.shortage ? (
                    <span className="font-semibold text-[#e8770c]">{row.shortage.toLocaleString('id-ID')}</span>
                  ) : (
                    <span className="text-[#7a8aa8]">&ndash;</span>
                  )}
                </td>
                <td className={BODY_CELL}>
                  <FulfillmentBar percent={row.fulfillment} progress={progress} />
                </td>
              </tr>
            ))}
            <tr className="bg-[#eef4ff] font-bold">
              <td className={`${TOTAL_CELL} !text-left`}>Jumlah</td>
              <td className={TOTAL_CELL}>{total.need.toLocaleString('id-ID')}</td>
              <td className={TOTAL_CELL}>{total.actual.toLocaleString('id-ID')}</td>
              <td className={TOTAL_CELL}>{total.shortage.toLocaleString('id-ID')}</td>
              <td className={TOTAL_CELL}>
                <FulfillmentBar percent={fulfillment} bold progress={progress} />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
