import { useCallback, useState } from 'react'

const TOOLTIP_WIDTH = 270
const OFFSET = 14

// Tooltip grafik yang bisa dipakai dengan tetikus maupun keyboard. Isinya
// node React biasa, bukan HTML mentah, jadi tidak membuka celah XSS.
export function useChartTooltip() {
  const [tip, setTip] = useState(null)

  const bind = useCallback(
    (content) => ({
      tabIndex: 0,
      onMouseEnter: (event) => setTip({ content, x: event.clientX, y: event.clientY }),
      onMouseMove: (event) => setTip({ content, x: event.clientX, y: event.clientY }),
      onMouseLeave: () => setTip(null),
      onFocus: (event) => {
        const box = event.currentTarget.getBoundingClientRect()
        setTip({ content, x: box.left + box.width / 2, y: box.top })
      },
      onBlur: () => setTip(null)
    }),
    []
  )

  return { tip, bind }
}

export function ChartTooltip({ tip }) {
  if (!tip) return null

  const fitsRight = tip.x + OFFSET + TOOLTIP_WIDTH < window.innerWidth - 8
  const left = Math.max(8, fitsRight ? tip.x + OFFSET : tip.x - TOOLTIP_WIDTH - OFFSET)
  const top = Math.max(8, Math.min(tip.y + OFFSET, window.innerHeight - 120))

  return (
    <div
      role="tooltip"
      className="pointer-events-none fixed z-50 rounded-[10px] bg-[#12305f] px-3 py-2 text-[12.5px] leading-normal text-white shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
      style={{ left, top, maxWidth: TOOLTIP_WIDTH }}
    >
      {tip.content}
    </div>
  )
}
