import { useAnimatedProgress } from '../../hooks/useAnimatedProgress'
import { ChartTooltip, useChartTooltip } from './ChartTooltip'

const SIZE = 200
const CENTER = SIZE / 2
const RADIUS = 72
const THICKNESS = 34
const SLICE_GAP = 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const SMALL_SLICE = 0.08

const percentText = (value) => `${value.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`

// Donat generik: segments [{ key, label, value, color }], angka di tengah,
// legenda (titik, label, jumlah, persen) di samping. Irisan kecil diberi
// label di luar cincin. Lihat CLAUDE.md, Modul bersama.
export function DonutChart({ segments, centerValue, centerLabel, formatValue = (value) => value.toLocaleString('id-ID'), ariaLabel }) {
  const { tip, bind } = useChartTooltip()
  const total = segments.reduce((sum, segment) => sum + segment.value, 0)
  const sweep = useAnimatedProgress(segments.map((segment) => `${segment.key}:${segment.value}`).join('|'))

  let offset = 0
  const slices = segments.filter((segment) => segment.value > 0).map((segment) => {
    const fraction = total ? segment.value / total : 0
    const slice = { segment, fraction, start: offset }
    offset += fraction
    return slice
  })

  return (
    <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
      <svg viewBox={`-14 -14 ${SIZE + 28} ${SIZE + 28}`} className="mx-auto aspect-square max-h-full w-full max-w-[220px]" role="img" aria-label={ariaLabel}>
        <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" stroke="#edf1f8" strokeWidth={THICKNESS} />
        {slices.map(({ segment, fraction, start }) => {
          const middle = (start + fraction / 2) * 2 * Math.PI - Math.PI / 2
          const outside = fraction < SMALL_SLICE
          const labelRadius = outside ? RADIUS + THICKNESS / 2 + 12 : RADIUS
          return (
            <g key={segment.key}>
              <circle
                {...bind(<><b>{segment.label}</b><br />{formatValue(segment.value)} ({percentText(fraction * 100)})</>)}
                cx={CENTER}
                cy={CENTER}
                r={RADIUS}
                fill="none"
                stroke={segment.color}
                strokeWidth={THICKNESS}
                strokeDasharray={`${Math.max(fraction * CIRCUMFERENCE * sweep - SLICE_GAP, 0)} ${CIRCUMFERENCE}`}
                strokeDashoffset={-start * CIRCUMFERENCE * sweep}
                transform={`rotate(-90 ${CENTER} ${CENTER})`}
                className="outline-none hover:brightness-110 focus-visible:brightness-110"
              />
              <text
                x={CENTER + labelRadius * Math.cos(middle)}
                y={CENTER + labelRadius * Math.sin(middle) + 4}
                textAnchor="middle"
                fontSize="12"
                fontWeight="700"
                fill={outside ? '#12305f' : '#ffffff'}
                opacity={sweep}
                pointerEvents="none"
              >
                {formatValue(segment.value)}
              </text>
            </g>
          )
        })}
        <text x={CENTER} y={CENTER + 2} textAnchor="middle" fontSize="26" fontWeight="800" fill="#12305f">{centerValue ?? formatValue(total)}</text>
        {centerLabel && <text x={CENTER} y={CENTER + 22} textAnchor="middle" fontSize="12" fill="#3f557d">{centerLabel}</text>}
      </svg>

      <ul className="flex flex-col gap-2.5 text-[13px]">
        {segments.map((segment) => (
          <li key={segment.key} className="grid grid-cols-[12px_minmax(0,auto)_auto_auto] items-center gap-2.5">
            <i className="h-3 w-3 rounded-full" style={{ backgroundColor: segment.color }} />
            <span className="font-semibold text-[#12305f]">{segment.label}</span>
            <b className="text-right tabular-nums text-[#12305f]">{formatValue(segment.value)}</b>
            <span className="text-right tabular-nums text-[#7a8aa8]">{percentText(total ? (segment.value / total) * 100 : 0)}</span>
          </li>
        ))}
      </ul>
      <ChartTooltip tip={tip} />
    </div>
  )
}
