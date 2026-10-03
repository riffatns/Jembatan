import { formatBillion, formatPercent, formatRupiah } from '../../../lib/budgetFormat'
import { CARD_CLASS, CARD_TITLE_CLASS } from './dashboardTheme'
import { ChartTooltip, useChartTooltip } from './ChartTooltip'

const CENTER = 130
const RADIUS = 84
const THICKNESS = 42
const SLICE_GAP = 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
// Irisan di bawah 8% terlalu sempit untuk labelnya; label dipindah ke luar cincin.
const SMALL_SLICE = 0.08
// Teks putih di atas kuning di bawah kontras 3:1, jadi irisan kuning memakai teks gelap.
const DARK_TEXT_ON = new Set(['#eda100'])

export function BudgetCompositionChart({ rows, totalPagu }) {
  const { tip, bind } = useChartTooltip()

  let offset = 0
  const slices = rows.map((row) => {
    const fraction = totalPagu ? row.pagu / totalPagu : 0
    const slice = { row, fraction, offset }
    offset += fraction
    return slice
  })

  return (
    <div className={CARD_CLASS}>
      <h2 className={`${CARD_TITLE_CLASS} mb-3`}>Komposisi Anggaran</h2>
      <div className="grid items-center gap-4 sm:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <svg viewBox="0 0 260 260" className="w-full max-w-[260px] justify-self-center" role="img" aria-label="Komposisi pagu per kode anggaran">
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
                  strokeDasharray={`${Math.max(fraction * CIRCUMFERENCE - SLICE_GAP, 0)} ${CIRCUMFERENCE}`}
                  strokeDashoffset={-start * CIRCUMFERENCE}
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
                  pointerEvents="none"
                >
                  {formatPercent(fraction * 100)}
                </text>
              </g>
            )
          })}
          <text x={CENTER} y={CENTER + 2} textAnchor="middle" fontSize="21" fontWeight="800" fill="#12305f">{formatBillion(totalPagu)}</text>
          <text x={CENTER} y={CENTER + 24} textAnchor="middle" fontSize="14" fill="#3f557d">Total Pagu</text>
        </svg>

        <ul className="flex flex-col gap-[22px]">
          {rows.map((row) => (
            <li key={row.code} className="grid grid-cols-[24px_minmax(0,1fr)] items-start gap-3">
              <i className="block h-6 w-6 rounded-full" style={{ backgroundColor: row.color }} />
              <div>
                <b className="block text-base text-[#12305f]">Kode {row.code}</b>
                <span className="text-sm tabular-nums text-[#3f557d]">{formatBillion(row.pagu)} ({formatPercent(row.paguShare)})</span>
                <small className="block text-xs text-[#7a8aa8]">{row.name}</small>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <ChartTooltip tip={tip} />
    </div>
  )
}
