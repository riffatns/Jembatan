import { useCountUp } from '../../hooks/useAnimatedProgress'

// Kartu ringkasan berlatar gradasi dengan gelombang di kakinya, dipakai kolom
// kanan baris kedua tiap dashboard bidang. Sebelumnya tiap bidang menyalinnya
// ke berkasnya sendiri.
//
// `satuan` boleh dikosongkan bila angkanya sudah membawa satuannya sendiri -
// nilai rupiah lewat `format`, misalnya.

const TONES = {
  green: { background: 'bg-gradient-to-b from-[#f2fbf6] to-[#e6f7ef]', icon: 'text-[#1fae7a]', wave: '#1fae7a' },
  amber: { background: 'bg-gradient-to-b from-[#fffaf0] to-[#fff5de]', icon: 'text-[#c98500]', wave: '#eda100' },
  blue: { background: 'bg-gradient-to-b from-[#f2f7ff] to-[#e4eeff]', icon: 'text-[#2f7fe8]', wave: '#2f7fe8' },
  purple: { background: 'bg-gradient-to-b from-[#f6f3ff] to-[#ece7ff]', icon: 'text-[#6d4fe0]', wave: '#6d4fe0' }
}

function Wave({ color }) {
  return (
    <svg viewBox="0 0 300 48" preserveAspectRatio="none" aria-hidden="true" className="absolute inset-x-0 bottom-0 h-12 w-full fit:h-8 tall:h-12">
      <path d="M0 30 C40 14 70 40 110 28 S180 8 220 24 S280 36 300 20 V48 H0Z" fill={color} opacity="0.18" />
      <path d="M0 38 C50 26 80 46 130 36 S210 22 250 34 S290 40 300 32 V48 H0Z" fill={color} opacity="0.22" />
    </svg>
  )
}

export function DashboardSummaryCard({ tone, icon: Icon, label, value, satuan, keterangan, format }) {
  const style = TONES[tone]
  const shown = useCountUp(value)

  return (
    <div
      className={`relative grid content-start gap-3 overflow-hidden rounded-xl px-[18px] pb-[54px] pt-[18px] fit:gap-1.5 fit:px-3 fit:pb-9 fit:pt-2.5 tall:gap-3 tall:px-4 tall:pb-12 tall:pt-4 ${style.background}`}
    >
      <span className={`grid h-12 w-12 place-items-center rounded-full bg-white/75 fit:hidden tall:grid tall:h-11 tall:w-11 ${style.icon}`}>
        <Icon className="h-[26px] w-[26px] tall:h-6 tall:w-6" />
      </span>
      <div className="relative min-w-0" style={{ containerType: 'inline-size' }}>
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.04em] text-[#3f557d] fit:text-[11px] tall:text-xs">
          <Icon className={`hidden h-4 w-4 shrink-0 fit:block tall:hidden ${style.icon}`} />
          {label}
        </p>
        <p className="mt-1 whitespace-nowrap font-extrabold tabular-nums text-[#12305f] fit:mt-0.5" style={{ fontSize: 'clamp(18px, 15cqi, 30px)' }}>
          {format ? format(shown) : Math.round(shown).toLocaleString('id-ID')}
          {satuan ? (
            <span className="ml-1.5 text-[0.42em] font-semibold uppercase tracking-[0.08em] text-[#7a8aa8]">{satuan}</span>
          ) : null}
        </p>
        <p className="mt-1 text-[13.5px] text-[#3f557d] fit:mt-0 fit:text-[12.5px] tall:text-[13.5px]">{keterangan}</p>
      </div>
      <Wave color={style.wave} />
    </div>
  )
}
