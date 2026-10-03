import { formatBillion, formatRupiah } from '../../../lib/budgetFormat'
import { CARD_CLASS, CARD_TITLE_CLASS } from './dashboardTheme'
import { SERIES_COLORS, buildAxis } from './budgetDashboardModel'
import { ChartTooltip, useChartTooltip } from './ChartTooltip'

const SERIES = [
  { key: 'pagu', label: 'Pagu' },
  { key: 'realisasi', label: 'Realisasi' },
  { key: 'sisa', label: 'Sisa' }
]

// Ukuran kanvas SVG. Grafik diskalakan selebar kartu dan digeser ke samping
// di layar sempit, supaya label angka di atas batang tidak bertumpuk.
const VIEW = { width: 700, height: 290, left: 70, right: 690, top: 26, bottom: 232 }
const BAR_WIDTH = 50
const BAR_GAP = 8

function barPath(x, top, bottom) {
  const height = bottom - top
  if (height < 1.5) return `M${x} ${bottom - 1.5} h${BAR_WIDTH} v1.5 h-${BAR_WIDTH}z`
  const r = Math.min(4, height)
  return `M${x} ${bottom} V${top + r} Q${x} ${top} ${x + r} ${top} H${x + BAR_WIDTH - r} Q${x + BAR_WIDTH} ${top} ${x + BAR_WIDTH} ${top + r} V${bottom}z`
}

function formatAxisBillion(value) {
  return (value / 1e9).toLocaleString('id-ID', { maximumFractionDigits: 2 })
}

export function BudgetCodeChart({ rows }) {
  const { tip, bind } = useChartTooltip()
  const axis = buildAxis(Math.max(0, ...rows.flatMap((row) => [row.pagu, row.realisasi, row.sisa])))
  const y = (value) => VIEW.bottom - (value / axis.max) * (VIEW.bottom - VIEW.top)
  const groupWidth = (VIEW.right - VIEW.left) / Math.max(rows.length, 1)
  const middle = (VIEW.top + VIEW.bottom) / 2

  return (
    <div className={CARD_CLASS}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-x-5 gap-y-2.5">
        <h2 className={CARD_TITLE_CLASS}>Realisasi per Kode Anggaran</h2>
        <div className="flex flex-wrap gap-[18px] text-sm text-[#3f557d]">
          {SERIES.map((series) => (
            <span key={series.key} className="flex items-center gap-[7px]">
              <i className="inline-block h-[11px] w-[11px] rounded-full" style={{ backgroundColor: SERIES_COLORS[series.key] }} />
              {series.label}
            </span>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="block h-auto w-full min-w-[560px]" role="img" aria-label="Pagu, realisasi, dan sisa per kode anggaran dalam miliar rupiah">
          {axis.ticks.map((tick) => (
            <g key={tick}>
              <line x1={VIEW.left} x2={VIEW.right} y1={y(tick)} y2={y(tick)} stroke={tick ? '#e9eef7' : '#c9d3e4'} />
              <text x={VIEW.left - 12} y={y(tick) + 4} textAnchor="end" fontSize="13" fill="#3f557d">
                {formatAxisBillion(tick)}
              </text>
            </g>
          ))}
          <text x="18" y={middle} textAnchor="middle" fontSize="12.5" fill="#3f557d" transform={`rotate(-90 18 ${middle})`}>
            Miliar Rupiah
          </text>

          {rows.map((row, groupIndex) => {
            const center = VIEW.left + groupWidth * groupIndex + groupWidth / 2
            const start = center - (BAR_WIDTH * SERIES.length + BAR_GAP * (SERIES.length - 1)) / 2
            return (
              <g key={row.code}>
                {groupIndex > 0 && (
                  <line x1={VIEW.left + groupWidth * groupIndex} x2={VIEW.left + groupWidth * groupIndex} y1={VIEW.top} y2={VIEW.bottom} stroke="#e9eef7" />
                )}
                {SERIES.map((series, barIndex) => {
                  const value = row[series.key]
                  const x = start + barIndex * (BAR_WIDTH + BAR_GAP)
                  const top = y(value)
                  return (
                    <g key={series.key}>
                      <path
                        {...bind(<><b>Kode {row.code} · {row.name}</b><br />{series.label}: {formatRupiah(value)}</>)}
                        d={barPath(x, top, VIEW.bottom)}
                        fill={SERIES_COLORS[series.key]}
                        className="outline-none hover:brightness-110 focus-visible:brightness-110"
                      />
                      <text x={x + BAR_WIDTH / 2} y={Math.min(top, VIEW.bottom - 1.5) - 7} textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#12305f">
                        {formatBillion(value)}
                      </text>
                    </g>
                  )
                })}
                <text x={center} y={VIEW.bottom + 26} textAnchor="middle" fontSize="16" fontWeight="800" fill="#12305f">{row.code}</text>
                <text x={center} y={VIEW.bottom + 45} textAnchor="middle" fontSize="12" fill="#7a8aa8">{row.name}</text>
              </g>
            )
          })}
        </svg>
      </div>
      <ChartTooltip tip={tip} />
    </div>
  )
}
