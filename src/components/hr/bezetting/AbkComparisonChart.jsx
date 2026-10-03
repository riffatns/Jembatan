import { useAnimatedProgress } from '../../../hooks/useAnimatedProgress'
import { buildAxis } from '../../../lib/chartAxis'
import { ChartTooltip, useChartTooltip } from '../../charts/ChartTooltip'
import { IconChartBars } from '../../icons/DuotoneIcons'
import { CARD_CLASS, CARD_TITLE_CLASS } from '../../ui/cardStyles'

const ABK_COLOR = '#2f7fe8'
const ACTUAL_COLOR = '#1fae7a'
const ROW = 'grid grid-cols-[minmax(110px,30%)_minmax(0,1fr)_56px] items-center gap-3'

function GapChip({ gap }) {
  const negative = gap < 0
  return (
    <span className={`rounded-md px-2 py-0.5 text-center text-[12px] font-bold tabular-nums ${negative ? 'bg-[#fde2e2] text-[#c0262d]' : 'bg-[#eef2f8] text-[#3f557d]'}`}>
      {gap}
    </span>
  )
}

// Perbandingan kebutuhan ABK dengan jumlah riil per kategori formasi, dengan
// kolom selisih (merah bila kurang).
export function AbkComparisonChart({ categories }) {
  const { tip, bind } = useChartTooltip()
  const axis = buildAxis(Math.max(1, ...categories.flatMap((category) => [category.need, category.actual])), 6)
  const growth = useAnimatedProgress(categories.map((category) => `${category.need}:${category.actual}`).join('|'))
  const bar = (value, color, label, category) => (
    <span className="flex h-[clamp(8px,1.5vh,13px)] items-center">
      <span
        {...bind(<><b>{category.name}</b><br />{label}: {value}</>)}
        className="h-full rounded-r outline-none"
        style={{ width: `${(value / axis.max) * 100 * growth}%`, minWidth: value ? 3 : 0, backgroundColor: color }}
      />
      <b className="pl-1.5 text-[11.5px] tabular-nums text-[#12305f]" style={{ opacity: growth }}>{value}</b>
    </span>
  )

  return (
    <div className={CARD_CLASS}>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h2 className={`${CARD_TITLE_CLASS} flex items-center gap-2`}>
          <IconChartBars className="h-5 w-5 text-[#2f7fe8]" />
          Perbandingan ABK vs Jumlah Riil
        </h2>
        <div className="flex gap-3 text-[12.5px] text-[#3f557d]">
          <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: ABK_COLOR }} />ABK</span>
          <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: ACTUAL_COLOR }} />Riil</span>
        </div>
      </div>
      <div className={`${ROW} text-[11px] font-semibold text-[#7a8aa8]`}><span /><span /><span className="text-center">Selisih</span></div>
      <ul className="flex min-h-0 flex-1 flex-col justify-around gap-1">
        {categories.map((category) => (
          <li key={category.no} className={ROW}>
            <span className="text-right text-[12px] leading-tight text-[#12305f]">{category.name}</span>
            <span className="flex flex-col gap-0.5 pr-6">
              {bar(category.need, ABK_COLOR, 'ABK', category)}
              {bar(category.actual, ACTUAL_COLOR, 'Riil', category)}
            </span>
            <GapChip gap={category.gap} />
          </li>
        ))}
      </ul>
      <div className={`${ROW} mt-1`}>
        <span />
        <span className="relative mr-6 h-4 text-[11px] text-[#7a8aa8]">
          {axis.ticks.map((tick) => (
            <span key={tick} className="absolute -translate-x-1/2" style={{ left: `${(tick / axis.max) * 100}%` }}>{tick}</span>
          ))}
        </span>
        <span />
      </div>
      <ChartTooltip tip={tip} />
    </div>
  )
}
