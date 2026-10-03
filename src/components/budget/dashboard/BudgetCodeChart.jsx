import { formatBillion, formatRupiah } from '../../../lib/budgetFormat'
import { CARD_CLASS, CARD_TITLE_CLASS } from '../../ui/cardStyles'
import { SERIES_COLORS, buildAxis } from './budgetDashboardModel'
import { ChartTooltip, useChartTooltip } from '../../charts/ChartTooltip'
import { useElementSize } from '../../../hooks/useElementSize'
import { useAnimatedProgress } from '../../../hooks/useAnimatedProgress'

// Sisa sengaja tidak digambar di grafik ini: angkanya sudah ada di kartu,
// tabel, dan ringkasan, dan tanpa batang ketiga pagu vs realisasi lebih jelas.
const SERIES = [
  { key: 'pagu', label: 'Pagu' },
  { key: 'realisasi', label: 'Realisasi' }
]

// Kanvas mengikuti ukuran kartu. Di bawah lebar ini grafik digeser ke samping
// supaya label angka di atas batang tidak bertumpuk.
const MIN_CHART_WIDTH = 520
const MARGIN = { left: 56, right: 8, top: 24, bottom: 44 }
const BAR_GAP = 8

function barPath(x, width, top, bottom) {
  const height = bottom - top
  if (height < 1.5) return `M${x} ${bottom - 1.5} h${width} v1.5 h-${width}z`
  const r = Math.min(4, height)
  return `M${x} ${bottom} V${top + r} Q${x} ${top} ${x + r} ${top} H${x + width - r} Q${x + width} ${top} ${x + width} ${top + r} V${bottom}z`
}

function formatAxisBillion(value) {
  return (value / 1e9).toLocaleString('id-ID', { maximumFractionDigits: 2 })
}

function ChartLegend() {
  return (
    <div className="flex flex-wrap gap-[18px] text-sm text-[#3f557d]">
      {SERIES.map((series) => (
        <span key={series.key} className="flex items-center gap-[7px]">
          <i className="inline-block h-[11px] w-[11px] rounded-full" style={{ backgroundColor: SERIES_COLORS[series.key] }} />
          {series.label}
        </span>
      ))}
    </div>
  )
}

export function BudgetCodeChart({ rows }) {
  const { tip, bind } = useChartTooltip()
  const [frameRef, frame] = useElementSize()
  // Batang tumbuh dari garis nol; diputar ulang hanya bila angkanya berubah.
  const growth = useAnimatedProgress(rows.map((row) => `${row.pagu}:${row.realisasi}`).join('|'))

  const width = Math.max(frame.width, MIN_CHART_WIDTH)
  const height = frame.height
  const plot = { left: MARGIN.left, right: width - MARGIN.right, top: MARGIN.top, bottom: height - MARGIN.bottom }
  const axis = buildAxis(Math.max(0, ...rows.flatMap((row) => SERIES.map((series) => row[series.key]))))
  const y = (value) => plot.bottom - (value / axis.max) * (plot.bottom - plot.top)
  const groupWidth = (plot.right - plot.left) / Math.max(rows.length, 1)
  const barWidth = Math.min(64, Math.max(18, (groupWidth * 0.6 - BAR_GAP) / SERIES.length))
  const valueFont = barWidth >= 44 ? 12.5 : 11
  const middle = (plot.top + plot.bottom) / 2
  const ready = height > MARGIN.top + MARGIN.bottom

  return (
    <div className={CARD_CLASS}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-x-5 gap-y-2.5 fit:mb-1">
        <h2 className={CARD_TITLE_CLASS}>Realisasi per Kode Anggaran</h2>
        <ChartLegend />
      </div>

      <div ref={frameRef} className="relative h-[260px] overflow-x-auto overflow-y-hidden fit:h-auto fit:min-h-0 fit:flex-1">
        {ready && (
          <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="absolute left-0 top-0 block" role="img" aria-label="Pagu dan realisasi per kode anggaran dalam miliar rupiah">
            {axis.ticks.map((tick) => (
              <g key={tick}>
                <line x1={plot.left} x2={plot.right} y1={y(tick)} y2={y(tick)} stroke={tick ? '#e9eef7' : '#c9d3e4'} />
                <text x={plot.left - 12} y={y(tick) + 4} textAnchor="end" fontSize="13" fill="#3f557d">{formatAxisBillion(tick)}</text>
              </g>
            ))}
            <text x="14" y={middle} textAnchor="middle" fontSize="12.5" fill="#3f557d" transform={`rotate(-90 14 ${middle})`}>Miliar Rupiah</text>

            {rows.map((row, groupIndex) => {
              const center = plot.left + groupWidth * groupIndex + groupWidth / 2
              const start = center - (barWidth * SERIES.length + BAR_GAP * (SERIES.length - 1)) / 2
              const divider = plot.left + groupWidth * groupIndex
              return (
                <g key={row.code}>
                  {groupIndex > 0 && <line x1={divider} x2={divider} y1={plot.top} y2={plot.bottom} stroke="#e9eef7" />}
                  {SERIES.map((series, barIndex) => {
                    const value = row[series.key]
                    const x = start + barIndex * (barWidth + BAR_GAP)
                    const top = plot.bottom - (plot.bottom - y(value)) * growth
                    return (
                      <g key={series.key}>
                        <path
                          {...bind(<><b>Kode {row.code} · {row.name}</b><br />{series.label}: {formatRupiah(value)}</>)}
                          d={barPath(x, barWidth, top, plot.bottom)}
                          fill={SERIES_COLORS[series.key]}
                          className="outline-none hover:brightness-110 focus-visible:brightness-110"
                        />
                        <text x={x + barWidth / 2} y={Math.min(top, plot.bottom - 1.5) - 7} textAnchor="middle" fontSize={valueFont} fontWeight="700" fill="#12305f" opacity={growth}>
                          {formatBillion(value)}
                        </text>
                      </g>
                    )
                  })}
                  <text x={center} y={plot.bottom + 22} textAnchor="middle" fontSize="16" fontWeight="800" fill="#12305f">{row.code}</text>
                  <text x={center} y={plot.bottom + 39} textAnchor="middle" fontSize="12" fill="#7a8aa8">{row.name}</text>
                </g>
              )
            })}
          </svg>
        )}
      </div>
      <ChartTooltip tip={tip} />
    </div>
  )
}
