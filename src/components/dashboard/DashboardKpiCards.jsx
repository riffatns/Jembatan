import { formatPercent } from '../../lib/budgetFormat'
import { CARD_CLASS, LABEL_CLASS } from '../ui/cardStyles'
import { ChartTooltip, useChartTooltip } from '../charts/ChartTooltip'
import { useCountUp } from '../../hooks/useAnimatedProgress'

// Dua bentuk kartu yang dipakai baris KPI setiap dashboard bidang: tiga kartu
// angka lalu dua cincin persentase, susunan yang berasal dari Dashboard
// Anggaran. Sebelumnya tiap bidang menyalin keduanya ke berkasnya sendiri,
// sehingga perbaikan pada satu salinan tidak pernah sampai ke yang lain.
//
// Kelas gridnya ikut di sini (KPI_ROW_CLASS) karena pembagian kolomnya -
// tiga kartu lebar, dua cincin sempit - adalah bagian dari bentuk itu, bukan
// pilihan tiap halaman.

export const KPI_ROW_CLASS =
  'grid shrink-0 grid-cols-2 gap-4 md:grid-cols-6 lg:grid-cols-[repeat(3,minmax(0,1.55fr))_repeat(2,minmax(0,1fr))] fit:gap-2.5 tall:gap-3'

export function CountCard({ icon: Icon, label, value, note, color, satuan = 'dokumen' }) {
  const shown = useCountUp(value)

  return (
    <div className={`${CARD_CLASS} col-span-2 !flex-row items-center gap-3.5 lg:col-span-1`}>
      <div className="min-w-0 flex-1" style={{ containerType: 'inline-size' }}>
        <p className={`${LABEL_CLASS} flex items-center gap-2`}>
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-white" style={{ backgroundColor: color }}>
            <Icon className="h-4 w-4" />
          </span>
          {label}
        </p>
        <p
          className="mt-1.5 whitespace-nowrap font-extrabold tabular-nums tracking-[-0.01em] text-[#12305f]"
          style={{ fontSize: 'clamp(15px, 9.4cqi, 26px)' }}
        >
          {Math.round(shown).toLocaleString('id-ID')}
          <span className="ml-1.5 text-[0.46em] font-semibold uppercase tracking-[0.08em] text-[#7a8aa8]">{satuan}</span>
        </p>
        <p className="mt-0.5 text-xs text-[#7a8aa8]">{note}</p>
      </div>
    </div>
  )
}

export function RingCard({ label, percent, color, keterangan }) {
  const { tip, bind } = useChartTooltip()
  const shown = useCountUp(percent)

  return (
    <div
      className={`${CARD_CLASS} col-span-1 items-center justify-center gap-2.5 !px-3 text-center md:col-span-3 md:!flex-row md:gap-5 lg:col-span-1 lg:!flex-col lg:gap-2 fit:!gap-1.5 fit:!py-2 tall:!gap-2 tall:!py-3`}
    >
      <p className={`${LABEL_CLASS} fit:text-[10.5px] fit:leading-tight tall:text-[13px]`}>{label}</p>
      <svg
        viewBox="0 0 100 100"
        className="h-24 w-24 shrink-0 fit:h-14 fit:w-14 tall:h-[88px] tall:w-[88px]"
        role="img"
        aria-label={`${label} ${formatPercent(percent)}`}
      >
        <circle cx="50" cy="50" r="40" fill="none" stroke="#e4e9f2" strokeWidth="9" />
        <circle
          {...bind(<>{formatPercent(percent)} {keterangan}</>)}
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke={color}
          strokeWidth="9"
          strokeLinecap="round"
          pathLength="100"
          strokeDasharray={`${shown} 100`}
          transform="rotate(-90 50 50)"
          className="outline-none"
        />
        <text x="50" y="57" textAnchor="middle" fontSize="21" fontWeight="800" fill="#12305f">
          {Math.round(shown)}%
        </text>
      </svg>
      <ChartTooltip tip={tip} />
    </div>
  )
}
