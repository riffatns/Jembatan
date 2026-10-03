import { BarChart3, Database, FileText } from 'lucide-react'
import { formatPercent, formatRupiah } from '../../../lib/budgetFormat'
import { CARD_CLASS, LABEL_CLASS } from './dashboardTheme'
import { SERIES_COLORS } from './budgetDashboardModel'
import { ChartTooltip, useChartTooltip } from './ChartTooltip'

function MoneyCard({ icon: Icon, label, value, note, color }) {
  return (
    <div className={`${CARD_CLASS} col-span-2 flex items-center gap-3.5 py-[22px] min-[1800px]:col-span-1`}>
      <span className="grid h-[58px] w-[58px] shrink-0 place-items-center rounded-full text-white" style={{ backgroundColor: color }}>
        <Icon className="h-7 w-7" />
      </span>
      {/* Lebar teks diukur sebagai container: angka Rupiah penuh mengecil
          mengikuti lebar kartu, bukan terpotong. */}
      <div className="min-w-0 flex-1" style={{ containerType: 'inline-size' }}>
        <p className={LABEL_CLASS}>{label}</p>
        <p className="mt-1.5 whitespace-nowrap font-extrabold tabular-nums tracking-[-0.01em] text-[#12305f]" style={{ fontSize: 'clamp(15px, 9.2cqi, 26px)' }}>
          {formatRupiah(value)}
        </p>
        <p className="mt-0.5 text-xs text-[#7a8aa8]">{note}</p>
      </div>
    </div>
  )
}

function RingCard({ label, percent, color, pagu }) {
  const { tip, bind } = useChartTooltip()

  return (
    <div className={`${CARD_CLASS} col-span-1 flex flex-col items-center justify-center gap-2.5 px-3 py-4 text-center md:col-span-3 md:flex-row md:gap-5 min-[1800px]:col-span-1 min-[1800px]:flex-col`}>
      <p className={LABEL_CLASS}>{label}</p>
      <svg viewBox="0 0 100 100" className="h-24 w-24" role="img" aria-label={`${label} ${formatPercent(percent)}`}>
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
          strokeDasharray={`${percent} 100`}
          transform="rotate(-90 50 50)"
          className="outline-none"
        />
        <text x="50" y="57" textAnchor="middle" fontSize="21" fontWeight="800" fill="#12305f">
          {Math.round(percent)}%
        </text>
      </svg>
      <ChartTooltip tip={tip} />
    </div>
  )
}

// Lima kartu sebaris hanya pada layar sangat lebar. Di bawah itu tiga kartu
// Rupiah sebaris dan dua kartu persentase di baris berikutnya, supaya angka
// Rupiah penuh tetap terbaca di samping sidebar.
export function BudgetKpiCards({ model }) {
  const { total, rows, absorption, remaining } = model
  const codes = rows.map((row) => row.code).join(', ')

  return (
    <section className="grid grid-cols-2 gap-4 md:grid-cols-6 min-[1800px]:grid-cols-[repeat(3,minmax(0,1.7fr))_repeat(2,minmax(0,1fr))]">
      <MoneyCard icon={Database} label="Pagu Anggaran" value={total.pagu} note={codes ? `Kode ${codes}` : 'Seluruh kode akun'} color={SERIES_COLORS.pagu} />
      <MoneyCard icon={BarChart3} label="Realisasi Anggaran" value={total.realisasi} note={`${formatPercent(absorption)} dari pagu`} color={SERIES_COLORS.realisasi} />
      <MoneyCard icon={FileText} label="Sisa Anggaran" value={total.sisa} note={`${formatPercent(remaining)} dari pagu`} color={SERIES_COLORS.sisa} />
      <RingCard label="Persentase Realisasi" percent={absorption} color={SERIES_COLORS.realisasi} pagu={total.pagu} />
      <RingCard label="Persentase Sisa" percent={remaining} color={SERIES_COLORS.sisa} pagu={total.pagu} />
    </section>
  )
}
