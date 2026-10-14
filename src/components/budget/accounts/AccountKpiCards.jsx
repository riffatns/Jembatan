import { formatPercent, formatRupiah } from '../../../lib/budgetFormat'
import { IconCalendar, IconCoins, IconPercent, IconPieChart, IconTrendUp } from '../../icons/DuotoneIcons'
import { CARD_CLASS } from '../../ui/cardStyles'
import { useCountUp } from '../../../hooks/useAnimatedProgress'

const TONES = {
  blue: { icon: 'bg-[#e3eeff] text-[#2f7fe8]', value: 'text-[#1d5fd0]' },
  green: { icon: 'bg-[#dcf5e8] text-[#1fae7a]', value: 'text-[#137a52]' },
  orange: { icon: 'bg-[#fff0e0] text-[#f08a1c]', value: 'text-[#e8770c]' },
  purple: { icon: 'bg-[#ece8ff] text-[#6d4fe0]', value: 'text-[#4c32c4]' },
  teal: { icon: 'bg-[#dcf4f6] text-[#14a0b0]', value: 'text-[#0e5e6f]' }
}

function KpiCard({ icon: Icon, label, value, format, title, tone }) {
  const shown = useCountUp(value)
  const style = TONES[tone]

  return (
    <div className={`${CARD_CLASS} justify-center gap-2 !py-3 tall:!py-4`} title={title}>
      <div className="flex items-center gap-2.5">
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl tall:h-10 tall:w-10 ${style.icon}`}>
          <Icon className="h-5 w-5" />
        </span>
        <p className="min-w-0 text-[13px] font-medium leading-tight text-[#3f557d] tall:text-sm">{label}</p>
      </div>
      {/* Lebar kartu diukur sebagai container supaya angka mengecil, bukan terpotong.
          Pengalinya 7,6cqi, bukan 12,5 seperti waktu angkanya masih disingkat:
          "Rp 24.977.421.000" tujuh belas aksara, sedangkan "Rp2,36 Miliar" hanya
          tiga belas. Dengan pengali lama angka penuhnya meluber keluar kartu. */}
      <div style={{ containerType: 'inline-size' }}>
        <p className={`whitespace-nowrap font-extrabold tabular-nums tracking-[-0.01em] ${style.value}`} style={{ fontSize: 'clamp(13px, 7.6cqi, 26px)' }}>
          {format(shown)}
        </p>
      </div>
    </div>
  )
}

export function AccountKpiCards({ model }) {
  const { total, absorption, groupCode, monthName } = model

  return (
    <section className="grid shrink-0 grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5 fit:gap-2.5 tall:gap-3">
      {/* Urutannya mengikuti warna: biru, ungu, hijau, oren, lalu persentase. */}
      <KpiCard icon={IconCoins} tone="blue" label={`Pagu Akun ${groupCode}`} value={total.pagu} format={formatRupiah} />
      <KpiCard icon={IconCalendar} tone="purple" label={`Realisasi ${monthName || 'Bulan Ini'}`} value={total.realisasiIni} format={formatRupiah} />
      <KpiCard icon={IconTrendUp} tone="green" label="Realisasi s.d. Periode" value={total.realisasi} format={formatRupiah} />
      <KpiCard icon={IconPieChart} tone="orange" label="Sisa Anggaran" value={total.sisa} format={formatRupiah} />
      <KpiCard icon={IconPercent} tone="teal" label="Persentase Realisasi" value={absorption} format={(value) => formatPercent(value, 2)} title="Realisasi s.d. periode terhadap pagu" />
    </section>
  )
}
