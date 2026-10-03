import { formatPercent, formatRupiah, formatTableBillion } from '../../../lib/budgetFormat'
import { IconTableList } from '../../icons/DuotoneIcons'
import { CARD_CLASS, CARD_TITLE_CLASS } from '../dashboard/dashboardTheme'
import { STATUS_STYLES } from './accountModel'

const HEAD_CELL = 'sticky top-0 z-10 bg-[#e6eefb] px-3 py-2 text-[13px] font-bold text-[#12305f] fit:py-1.5'
const CELL = 'whitespace-nowrap border-t border-[#e8edf5] px-3 py-1.5 text-[13px] tabular-nums text-[#12305f] fit:py-1 tall:py-1.5'

// Semua akun kelompok ini, urut pagu terbesar. Tabel bergulir di dalam kartu
// supaya halaman tetap muat satu layar; angka penuh ada di tooltip sel.
export function AccountDetailTable({ accounts }) {
  return (
    <div className={CARD_CLASS}>
      <h2 className={`${CARD_TITLE_CLASS} mb-2 flex items-center gap-2`}>
        <IconTableList className="h-5 w-5 text-[#2f7fe8]" />
        Rincian Akun Utama
      </h2>
      <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-[#e1e8f4]">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr>
              <th className={`${HEAD_CELL} w-[11%] text-center`}>Kode Akun</th>
              <th className={`${HEAD_CELL} text-left`}>Uraian</th>
              <th className={`${HEAD_CELL} w-[13%] text-center`}>Pagu</th>
              <th className={`${HEAD_CELL} w-[13%] text-center`}>Realisasi</th>
              <th className={`${HEAD_CELL} w-[11%] text-center`}>%</th>
              <th className={`${HEAD_CELL} w-[13%] text-center`}>Sisa</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => {
              const style = STATUS_STYLES[account.status]
              return (
                <tr key={account.code} className="hover:bg-[#f7faff]">
                  <td className={`${CELL} text-center font-bold`}>{account.code}</td>
                  <td className={`${CELL} text-left`}>{account.name}</td>
                  <td className={`${CELL} text-center`} title={formatRupiah(account.pagu)}>{formatTableBillion(account.pagu)}</td>
                  <td className={`${CELL} text-center`} title={formatRupiah(account.realisasi)}>{formatTableBillion(account.realisasi)}</td>
                  <td className={`${CELL} text-center`}>
                    <span className="inline-block min-w-[72px] rounded-md px-2 py-0.5 font-bold" style={{ backgroundColor: style.chipBg, color: style.chipText }}>
                      {formatPercent(account.absorption, 2)}
                    </span>
                  </td>
                  <td className={`${CELL} text-center`} title={formatRupiah(account.sisa)}>{formatTableBillion(account.sisa)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
