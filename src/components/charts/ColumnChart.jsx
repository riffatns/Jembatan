import { useAnimatedProgress } from '../../hooks/useAnimatedProgress'
import { useElementSize } from '../../hooks/useElementSize'
import { buildAxis } from '../../lib/chartAxis'
import { ChartTooltip, useChartTooltip } from './ChartTooltip'

const MARGIN = { left: 30, right: 6, top: 20, bottom: 26 }

// Grafik kolom (batang vertikal) generik: items [{ key, label, value }].
// Kanvas mengikuti ukuran kartu; angka di atas batang, label di bawah.
export function ColumnChart({ items, color = '#2f7fe8', formatValue = (value) => value.toLocaleString('id-ID'), ariaLabel, minHeight = 'min-h-[180px]' }) {
  const { tip, bind } = useChartTooltip()
  const [frameRef, frame] = useElementSize()
  const growth = useAnimatedProgress(items.map((item) => `${item.key}:${item.value}`).join('|'))

  const { width, height } = frame
  const plot = { left: MARGIN.left, right: width - MARGIN.right, top: MARGIN.top, bottom: height - MARGIN.bottom }
  const axis = buildAxis(Math.max(0, ...items.map((item) => item.value)), 4)
  const y = (value) => plot.bottom - (value / axis.max) * (plot.bottom - plot.top)
  const slot = (plot.right - plot.left) / Math.max(items.length, 1)
  const barWidth = Math.min(44, Math.max(10, slot * 0.6))
  const ready = width > 0 && height > MARGIN.top + MARGIN.bottom

  return (
    <div ref={frameRef} className={`relative ${minHeight} flex-1 fit:min-h-0`}>
      {ready && (
        <svg width={width} height={height} className="absolute inset-0" role="img" aria-label={ariaLabel}>
          {axis.ticks.map((tick) => (
            <g key={tick}>
              <line x1={plot.left} x2={plot.right} y1={y(tick)} y2={y(tick)} stroke={tick ? '#edf1f8' : '#c9d3e4'} />
              <text x={plot.left - 8} y={y(tick) + 4} textAnchor="end" fontSize="11" fill="#7a8aa8">{formatValue(tick)}</text>
            </g>
          ))}
          {items.map((item, index) => {
            const center = plot.left + slot * index + slot / 2
            const top = plot.bottom - (plot.bottom - y(item.value)) * growth
            const radius = Math.min(4, plot.bottom - top)
            return (
              <g key={item.key}>
                <path
                  {...bind(<><b>{item.label}</b><br />{formatValue(item.value)}</>)}
                  d={`M${center - barWidth / 2} ${plot.bottom} V${top + radius} Q${center - barWidth / 2} ${top} ${center - barWidth / 2 + radius} ${top} H${center + barWidth / 2 - radius} Q${center + barWidth / 2} ${top} ${center + barWidth / 2} ${top + radius} V${plot.bottom}z`}
                  fill={color}
                  className="outline-none hover:brightness-110 focus-visible:brightness-110"
                />
                <text x={center} y={top - 6} textAnchor="middle" fontSize="12" fontWeight="700" fill="#12305f" opacity={growth}>{formatValue(item.value)}</text>
                <text x={center} y={plot.bottom + 17} textAnchor="middle" fontSize="11.5" fill="#3f557d">{item.label}</text>
              </g>
            )
          })}
        </svg>
      )}
      <ChartTooltip tip={tip} />
    </div>
  )
}
