import { IconChartBars, IconDatabase, IconDocument } from '../../icons/DuotoneIcons'
import { formatPercent, formatRupiah } from '../../../lib/budgetFormat'
import { CARD_CLASS, LABEL_CLASS } from './dashboardTheme'
import { SERIES_COLORS } from './budgetDashboardModel'
import { ChartTooltip, useChartTooltip } from './ChartTooltip'
import { useCountUp } from './useAnimatedProgress'

// Ikon kecil di samping label, supaya angka Rupiah penuh mendapat seluruh
// lebar kartu walau lima kartu berjajar di layar laptop.

function MoneyCard({ icon: Icon, label, value, note, color }) {
  const shownValue = useCountUp(value)

  return (
    <div className={`${CARD_CLASS} col-span-2 !flex-row items-center gap-3.5 lg:col-span-1`}>
      {/* Lebar teks diukur sebagai container: angka Rupiah penuh mengecil
          mengikuti lebar kartu, bukan terpotong. */}
      <div className="min-w-0 flex-1" style={{ containerType: 'inline-size' }}>
        <p className={`${LABEL_CLASS} flex items-center gap-2`}>
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-white" style={{ backgroundColor: color }}>
            <Icon className="h-4 w-4" />
          </span>
          {label}
        </p>
        <p className="mt-1.5 whitespace-nowrap font-extrabold tabular-nums tracking-[-0.01em] text-[#12305f]" style={{ fontSize: 'clamp(15px, 9.4cqi, 26px)' }}>
          {formatRupiah(shownValue)}
        </p>
        <p className="mt-0.5 text-xs text-[#7a8aa8]">{note}</p>
      </div>
    </div>
  )
}

function RingCard({ label, percent, color, pagu }) {
  const { tip, bind } = useChartTooltip()
  const shownPercent = useCountUp(percent)

  return (
    <div className={`${CARD_CLASS} col-span-1 items-center justify-center gap-2.5 !px-3 text-center md:col-span-3 md:!flex-row md:gap-5 lg:col-span-1 lg:!flex-col lg:gap-2 fit:!gap-1.5 fit:!py-2 tall:!gap-2 tall:!py-3`}>
      <p className={`${LABEL_CLASS} fit:text-[10.5px] fit:leading-tight tall:text-[13px]`}>{label}</p>
      <svg viewBox="0 0 100 100" className="h-24 w-24 shrink-0 fit:h-14 fit:w-14 tall:h-[88px] tall:w-[88px]" role="img" aria-label={`${label} ${formatPercent(percent)}`}>
        <circle cx="50" cy="50" r="40" fill="none" stroke="#e4e9f2" strokeWidth="9" />
        <circle
          {...bind(<>{formatPercent(percent)} dari pagu {formatRupiah(pagu)}</>)}
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke={color}
          strokeWidth="9"
          strokeLinecap="round"
          pathLength="100"
          strokeDasharray={`${shownPercent} 100`}
          transform="rotate(-90 50 50)"
          className="outline-none"
        />
        <text x="50" y="57" textAnchor="middle" fontSize="21" fontWeight="800" fill="#12305f">
          {Math.round(shownPercent)}%
        </text>
      </svg>
      <ChartTooltip tip={tip} />
    </div>
  )
}

// Desktop: kelima kartu sebaris. Tablet: tiga kartu Rupiah lalu dua kartu
// persentase. Ponsel: kartu Rupiah selebar layar, kartu persentase berdua.
export function BudgetKpiCards({ model }) {
  const { total, rows, absorption, remaining } = model
  const codes = rows.map((row) => row.code).join(', ')

  return (
    <section className="grid shrink-0 grid-cols-2 gap-4 md:grid-cols-6 lg:grid-cols-[repeat(3,minmax(0,1.55fr))_repeat(2,minmax(0,1fr))] fit:gap-2.5 tall:gap-3">
      <MoneyCard icon={IconDatabase} label="Pagu Anggaran" value={total.pagu} note={codes ? `Kode ${codes}` : 'Seluruh kode akun'} color={SERIES_COLORS.pagu} />
      <MoneyCard icon={IconChartBars} label="Realisasi Anggaran" value={total.realisasi} note={`${formatPercent(absorption)} dari pagu`} color={SERIES_COLORS.realisasi} />
      <MoneyCard icon={IconDocument} label="Sisa Anggaran" value={total.sisa} note={`${formatPercent(remaining)} dari pagu`} color={SERIES_COLORS.sisa} />
      <RingCard label="Persentase Realisasi" percent={absorption} color={SERIES_COLORS.realisasi} pagu={total.pagu} />
      <RingCard label="Persentase Sisa" percent={remaining} color={SERIES_COLORS.sisa} pagu={total.pagu} />
    </section>
  )
}
