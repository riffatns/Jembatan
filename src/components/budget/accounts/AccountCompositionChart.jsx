import { formatBillionFirst, formatRupiah } from '../../../lib/budgetFormat'
import { IconChartBars, IconInfo } from '../../icons/DuotoneIcons'
import { CARD_CLASS, CARD_TITLE_CLASS } from '../../ui/cardStyles'
import { buildAxis } from '../dashboard/budgetDashboardModel'
import { ChartTooltip, useChartTooltip } from '../../charts/ChartTooltip'
import { useAnimatedProgress } from '../../../hooks/useAnimatedProgress'

const MAX_BARS = 6
// Kolom label akun, lalu kolom batang. Ruang kanan batang untuk label nilainya.
const ROW_GRID = 'grid grid-cols-[minmax(96px,32%)_minmax(0,1fr)] gap-x-3'
const LABEL_SPACE = '7.5rem'

function formatAxisBillion(value) {
  return (value / 1e9).toLocaleString('id-ID', { maximumFractionDigits: 2 })
}

// Garis kisi dan angka sumbu memakai kolom batang yang sama dengan baris akun.
function AxisLayer({ axis, withLabels }) {
  return (
    <div className={`${ROW_GRID} ${withLabels ? 'h-5' : 'pointer-events-none absolute inset-0'}`} aria-hidden={!withLabels}>
      <div />
      <div className="relative" style={{ marginRight: LABEL_SPACE }}>
        {axis.ticks.map((tick) => (
          withLabels ? (
            <span key={tick} className="absolute -translate-x-1/2 text-[11px] text-[#7a8aa8]" style={{ left: `${(tick / axis.max) * 100}%` }}>
              {formatAxisBillion(tick)}
            </span>
          ) : (
            <span key={tick} className={`absolute inset-y-0 w-px ${tick ? 'bg-[#edf1f8]' : 'bg-[#c9d3e4]'}`} style={{ left: `${(tick / axis.max) * 100}%` }} />
          )
        ))}
      </div>
    </div>
  )
}

export function AccountCompositionChart({ model }) {
  const { tip, bind } = useChartTooltip()
  const accounts = model.accounts.slice(0, MAX_BARS)
  const isSingle = model.accounts.length === 1
  const axis = buildAxis(Math.max(0, ...accounts.map((account) => account.pagu)), 5)
  const growth = useAnimatedProgress(accounts.map((account) => `${account.code}:${account.pagu}`).join('|'))

  return (
    <div className={CARD_CLASS}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 className={`${CARD_TITLE_CLASS} flex items-center gap-2`}>
          <IconChartBars className="h-5 w-5 text-[#2f7fe8]" />
          {isSingle ? 'Komposisi Pagu Utama' : 'Komposisi Pagu Terbesar'}
        </h2>
        <span className="text-xs text-[#7a8aa8]">Nilai Pagu (Rp Miliar)</span>
      </div>

      <div className="relative flex min-h-[180px] flex-1 flex-col justify-around gap-0.5 overflow-hidden py-0.5 fit:min-h-0">
        <AxisLayer axis={axis} />
        {accounts.map((account, index) => {
          const width = (account.pagu / axis.max) * 100 * growth
          return (
            <div key={account.code} className={`${ROW_GRID} relative items-center`}>
              <div className="min-w-0">
                <p className="text-[12.5px] font-bold leading-none text-[#12305f]">{account.code}</p>
                <p className="truncate text-[11px] leading-tight text-[#3f557d]" title={account.name}>{account.name}</p>
              </div>
              <div className="relative h-[clamp(12px,2.8vh,28px)]" style={{ marginRight: LABEL_SPACE }}>
                <div
                  {...bind(<><b>{account.code} · {account.name}</b><br />Pagu {formatRupiah(account.pagu)}</>)}
                  className="h-full rounded-r-md outline-none hover:brightness-105 focus-visible:brightness-105"
                  style={{ width: `${width}%`, background: index === 0 ? 'linear-gradient(90deg,#1e5fd6,#3b82f6)' : '#a8cbf7' }}
                />
                <span
                  className="absolute top-1/2 -translate-y-1/2 whitespace-nowrap pl-2 text-[12.5px] font-bold text-[#12305f]"
                  style={{ left: `${width}%`, opacity: growth }}
                >
                  {formatBillionFirst(account.pagu)}
                </span>
              </div>
            </div>
          )
        })}
      </div>
      <AxisLayer axis={axis} withLabels />

      {isSingle && (
        <p className="mt-2 flex items-center gap-2 rounded-xl bg-[#eef4fd] px-3 py-2 text-[13px] text-[#12305f]">
          <IconInfo className="h-5 w-5 shrink-0 text-[#2f7fe8]" />
          Seluruh pagu Akun {model.groupCode} terkonsentrasi pada 1 akun utama.
        </p>
      )}
      <ChartTooltip tip={tip} />
    </div>
  )
}
