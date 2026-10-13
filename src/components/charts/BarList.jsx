import { useAnimatedProgress } from '../../hooks/useAnimatedProgress'
import { ChartTooltip, useChartTooltip } from './ChartTooltip'

// Daftar batang horizontal generik: items [{ key, label, value }], urut sesuai
// masukan. Label di kiri (rata kanan), batang, angka di ujung batang.
//
// Sebuah item boleh membawa `track`: nilai pembanding yang digambar sebagai
// batang pucat di belakangnya - misalnya kebutuhan formasi di belakang jumlah
// yang terisi. Skalanya tetap satu untuk seluruh daftar, jadi panjang batang
// antarbaris tetap bisa dibandingkan. Item tanpa `track` berperilaku seperti
// sebelumnya.
export function BarList({ items, color = '#2f7fe8', trackColor = '#dbe7f8', formatValue = (value) => value.toLocaleString('id-ID'), labelWidth = 'minmax(120px,42%)' }) {
  const { tip, bind } = useChartTooltip()
  const max = Math.max(1, ...items.map((item) => Math.max(item.value, item.track || 0)))
  const growth = useAnimatedProgress(items.map((item) => `${item.key}:${item.value}`).join('|'))

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ul className="flex min-h-0 flex-1 flex-col justify-around gap-1">
      {items.map((item) => {
        const width = (item.value / max) * 100 * growth
        return (
          <li key={item.key} className="grid items-center gap-3" style={{ gridTemplateColumns: `${labelWidth} minmax(0,1fr)` }}>
            <span className="truncate text-right text-[12px] text-[#3f557d]" title={item.label}>{item.label}</span>
            <span className="relative flex h-[clamp(10px,2.2vh,18px)] items-center pr-10">
              {item.track ? (
                <span
                  aria-hidden="true"
                  className="absolute left-0 h-full rounded-r-md"
                  style={{ width: `${(item.track / max) * 100 * growth}%`, backgroundColor: trackColor }}
                />
              ) : null}
              <span
                {...bind(
                  <>
                    <b>{item.label}</b>
                    <br />
                    {formatValue(item.value)}
                    {item.track ? <> dari {formatValue(item.track)}</> : null}
                  </>
                )}
                tabIndex={0}
                className="relative h-full rounded-r-md outline-none hover:brightness-110 focus-visible:brightness-110"
                style={{ width: `${width}%`, backgroundColor: color }}
              />
              <b className="pl-2 text-[12.5px] tabular-nums text-[#12305f]" style={{ opacity: growth }}>{formatValue(item.value)}</b>
            </span>
          </li>
        )
      })}
      </ul>
      <ChartTooltip tip={tip} />
    </div>
  )
}
