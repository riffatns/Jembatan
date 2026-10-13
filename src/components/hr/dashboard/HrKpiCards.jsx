import { IconAlert, IconDatabase, IconUsers } from '../../icons/DuotoneIcons'
import { formatPercent } from '../../../lib/budgetFormat'
import { CARD_CLASS, LABEL_CLASS } from '../../ui/cardStyles'
import { HR_SERIES } from './hrDashboardModel'
import { ChartTooltip, useChartTooltip } from '../../charts/ChartTooltip'
import { useCountUp } from '../../../hooks/useAnimatedProgress'

// Susunannya sengaja sama persis dengan kartu Dashboard Anggaran: tiga kartu
// angka lalu dua cincin persentase. Pembaca yang berpindah antarbidang tidak
// perlu belajar tata letak baru - yang berganti isinya, bukan bentuknya.

function CountCard({ icon: Icon, label, value, note, color }) {
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
          <span className="ml-1.5 text-[0.46em] font-semibold uppercase tracking-[0.08em] text-[#7a8aa8]">orang</span>
        </p>
        <p className="mt-0.5 text-xs text-[#7a8aa8]">{note}</p>
      </div>
    </div>
  )
}

function RingCard({ label, percent, color, keterangan }) {
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

export function HrKpiCards({ model }) {
  const { total, fulfillment, shortageShare, rows } = model
  const catatanUnit = rows.length ? `${rows.length} unit kerja` : 'Seluruh unit kerja'

  return (
    <section className="grid shrink-0 grid-cols-2 gap-4 md:grid-cols-6 lg:grid-cols-[repeat(3,minmax(0,1.55fr))_repeat(2,minmax(0,1fr))] fit:gap-2.5 tall:gap-3">
      <CountCard icon={IconDatabase} label="Kebutuhan ABK" value={total.need} note={catatanUnit} color={HR_SERIES.need} />
      <CountCard
        icon={IconUsers}
        label="Pegawai Terisi"
        value={total.actual}
        note={`${formatPercent(fulfillment)} dari kebutuhan`}
        color={HR_SERIES.actual}
      />
      <CountCard
        icon={IconAlert}
        label="Kekurangan Pegawai"
        value={total.shortage}
        note={`${formatPercent(shortageShare)} dari kebutuhan`}
        color={HR_SERIES.gap}
      />
      <RingCard label="Keterisian Formasi" percent={fulfillment} color={HR_SERIES.actual} keterangan="dari kebutuhan ABK" />
      <RingCard label="Persentase Kekurangan" percent={shortageShare} color={HR_SERIES.gap} keterangan="dari kebutuhan ABK" />
    </section>
  )
}
