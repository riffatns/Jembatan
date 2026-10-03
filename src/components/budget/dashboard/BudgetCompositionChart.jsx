import { formatBillion, formatPercent, formatRupiah } from '../../../lib/budgetFormat'
import { CARD_CLASS, CARD_TITLE_CLASS } from '../../ui/cardStyles'
import { ChartTooltip, useChartTooltip } from '../../charts/ChartTooltip'
import { useAnimatedProgress } from '../../../hooks/useAnimatedProgress'

const CENTER = 130
const RADIUS = 84
const THICKNESS = 42
const SLICE_GAP = 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
// Irisan di bawah 8% terlalu sempit untuk labelnya; label dipindah ke luar cincin.
const SMALL_SLICE = 0.08
// Teks putih di atas kuning di bawah kontras 3:1, jadi irisan kuning memakai teks gelap.
const DARK_TEXT_ON = new Set(['#eda100'])

function DonutLegend({ rows }) {
  return (
    <ul className="flex min-w-0 flex-col gap-[22px] fit:gap-2 tall:gap-4">
      {rows.map((row) => (
        <li key={row.code} className="grid grid-cols-[24px_minmax(0,1fr)] items-start gap-3 fit:grid-cols-[16px_minmax(0,1fr)] fit:gap-2 tall:grid-cols-[22px_minmax(0,1fr)]">
          <i className="mt-0.5 block h-6 w-6 rounded-full fit:h-4 fit:w-4 tall:h-[22px] tall:w-[22px]" style={{ backgroundColor: row.color }} />
          <div className="min-w-0">
            <b className="block text-base text-[#12305f] fit:text-sm tall:text-base">Kode {row.code}</b>
            <span className="text-sm tabular-nums text-[#3f557d] fit:text-[13px]">{formatBillion(row.pagu)} ({formatPercent(row.paguShare)})</span>
            <small className="block text-xs text-[#7a8aa8] fit:hidden tall:block">{row.name}</small>
          </div>
        </li>
      ))}
    </ul>
  )
}

export function BudgetCompositionChart({ rows, totalPagu }) {
  const { tip, bind } = useChartTooltip()
  // Irisan berputar mengisi cincin; diputar ulang hanya bila pagunya berubah.
  const sweep = useAnimatedProgress(rows.map((row) => row.pagu).join('|'))

  let offset = 0
  const slices = rows.map((row) => {
    const fraction = totalPagu ? row.pagu / totalPagu : 0
    const slice = { row, fraction, offset }
    offset += fraction
    return slice
  })

  return (
    <div className={CARD_CLASS}>
      <h2 className={`${CARD_TITLE_CLASS} mb-3 fit:mb-1`}>Komposisi Anggaran</h2>
      <div className="grid items-center gap-4 sm:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] fit:flex fit:min-h-0 fit:flex-1 fit:justify-around fit:gap-3">
        <svg
          viewBox="0 0 260 260"
          className="aspect-square w-full max-w-[260px] justify-self-center fit:h-full fit:w-auto fit:min-w-0 fit:shrink"
          role="img"
          aria-label="Komposisi pagu per kode anggaran"
        >
          {slices.map(({ row, fraction, offset: start }) => {
            const middle = (start + fraction / 2) * 2 * Math.PI - Math.PI / 2
            const isSmall = fraction < SMALL_SLICE
            const labelRadius = isSmall ? RADIUS + THICKNESS / 2 + 15 : RADIUS
            const labelColor = isSmall ? '#12305f' : DARK_TEXT_ON.has(row.color) ? '#3d2a00' : '#ffffff'
            return (
              <g key={row.code}>
                <circle
                  {...bind(<><b>Kode {row.code} · {row.name}</b><br />{formatRupiah(row.pagu)}<br />{formatPercent(row.paguShare)} dari total pagu</>)}
                  cx={CENTER}
                  cy={CENTER}
                  r={RADIUS}
                  fill="none"
                  stroke={row.color}
                  strokeWidth={THICKNESS}
                  strokeDasharray={`${Math.max(fraction * CIRCUMFERENCE * sweep - SLICE_GAP, 0)} ${CIRCUMFERENCE}`}
                  strokeDashoffset={-start * CIRCUMFERENCE * sweep}
                  transform={`rotate(-90 ${CENTER} ${CENTER})`}
                  className="outline-none hover:brightness-110 focus-visible:brightness-110"
                />
                <text
                  x={CENTER + labelRadius * Math.cos(middle)}
                  y={CENTER + labelRadius * Math.sin(middle) + 5}
                  textAnchor="middle"
                  fontSize={isSmall ? 13 : 15}
                  fontWeight="700"
                  fill={labelColor}
                  opacity={sweep}
                  pointerEvents="none"
                >
                  {formatPercent(fraction * 100)}
                </text>
              </g>
            )
          })}
          <text x={CENTER} y={CENTER + 2} textAnchor="middle" fontSize="21" fontWeight="800" fill="#12305f">{formatBillion(totalPagu * sweep)}</text>
          <text x={CENTER} y={CENTER + 24} textAnchor="middle" fontSize="14" fill="#3f557d">Total Pagu</text>
        </svg>
        <DonutLegend rows={rows} />
      </div>
      <ChartTooltip tip={tip} />
    </div>
  )
}
