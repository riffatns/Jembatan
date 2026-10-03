import { FileText, TrendingUp } from 'lucide-react'
import { formatBillion, formatPercent, formatRupiah } from '../../../lib/budgetFormat'
import { CARD_CLASS, CARD_TITLE_CLASS } from './dashboardTheme'

const TONES = {
  green: { background: 'bg-gradient-to-b from-[#f2fbf6] to-[#e6f7ef]', icon: 'text-[#1fae7a]', wave: '#1fae7a' },
  amber: { background: 'bg-gradient-to-b from-[#fffaf0] to-[#fff5de]', icon: 'text-[#c98500]', wave: '#eda100' }
}

function Wave({ color }) {
  return (
    <svg viewBox="0 0 300 48" preserveAspectRatio="none" aria-hidden="true" className="absolute inset-x-0 bottom-0 h-12 w-full">
      <path d="M0 30 C40 14 70 40 110 28 S180 8 220 24 S280 36 300 20 V48 H0Z" fill={color} opacity="0.18" />
      <path d="M0 38 C50 26 80 46 130 36 S210 22 250 34 S290 40 300 32 V48 H0Z" fill={color} opacity="0.22" />
    </svg>
  )
}

function SummaryCard({ tone, icon: Icon, label, value, percent }) {
  const style = TONES[tone]
  return (
    <div className={`relative grid gap-3 overflow-hidden rounded-xl px-[18px] pb-[54px] pt-[18px] ${style.background}`}>
      <span className={`grid h-12 w-12 place-items-center rounded-full bg-white/75 ${style.icon}`}>
        <Icon className="h-[26px] w-[26px]" />
      </span>
      <div className="relative min-w-0" style={{ containerType: 'inline-size' }}>
        <p className="text-xs font-semibold uppercase tracking-[0.04em] text-[#3f557d]">{label}</p>
        <p className="mt-1 whitespace-nowrap font-extrabold tabular-nums text-[#12305f]" style={{ fontSize: 'clamp(18px, 15cqi, 30px)' }}>
          {formatBillion(value)}
        </p>
        <p className="mt-1 text-[13.5px] text-[#3f557d]">{Math.round(percent)}% dari total anggaran</p>
      </div>
      <Wave color={style.wave} />
    </div>
  )
}

export function BudgetSummaryCards({ model }) {
  const { total, rows, absorption, remaining } = model
  // Kode dengan sisa terbesar: tempat percepatan penyerapan paling berpengaruh.
  const largestRemaining = rows.reduce((largest, row) => (!largest || row.sisa > largest.sisa ? row : largest), null)
  const smallestRemaining = rows.reduce((smallest, row) => (!smallest || row.sisa < smallest.sisa ? row : smallest), null)

  return (
    <div className={CARD_CLASS}>
      <h2 className={`${CARD_TITLE_CLASS} mb-3`}>Ringkasan Realisasi</h2>
      <div className="grid gap-3.5 sm:grid-cols-2">
        <SummaryCard tone="green" icon={TrendingUp} label="Realisasi Anggaran" value={total.realisasi} percent={absorption} />
        <SummaryCard tone="amber" icon={FileText} label="Sisa Anggaran" value={total.sisa} percent={remaining} />
      </div>
      {largestRemaining && total.sisa > 0 && (
        <p className="mt-3.5 text-[12.5px] text-[#7a8aa8]">
          <b className="font-semibold text-[#3f557d]">Kode {largestRemaining.code} ({largestRemaining.name})</b> memegang{' '}
          {formatPercent(largestRemaining.sisaShare, 0)} dari seluruh sisa anggaran.
          {smallestRemaining && smallestRemaining.code !== largestRemaining.code && (
            <> Kode {smallestRemaining.code} tinggal {formatRupiah(smallestRemaining.sisa)}.</>
          )}
        </p>
      )}
    </div>
  )
}
