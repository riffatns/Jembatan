import { formatPercent, formatRupiah } from '../../lib/budgetFormat'
import {
  IconCoins,
  IconDatabase,
  IconPercent,
  IconPieChart,
  IconTarget,
  IconTrendUp
} from '../icons/DuotoneIcons'
import { CARD_CLASS } from '../ui/cardStyles'
import { useCountUp } from '../../hooks/useAnimatedProgress'

// Kartu ringkasan BMN, bentuknya sama dengan kartu di menu akun Keuangan
// (AccountKpiCards): ikon duotone di kotak berwarna, label kecil, angka besar
// yang mengecil mengikuti lebar kartunya sendiri.
//
// Urutan warnanya mengikuti kesepakatan yang sama: biru, ungu, hijau, oren,
// lalu kartu persentase.

const TONES = {
  blue: { icon: 'bg-[#e3eeff] text-[#2f7fe8]', value: 'text-[#1d5fd0]' },
  green: { icon: 'bg-[#dcf5e8] text-[#1fae7a]', value: 'text-[#137a52]' },
  orange: { icon: 'bg-[#fff0e0] text-[#f08a1c]', value: 'text-[#e8770c]' },
  purple: { icon: 'bg-[#ece8ff] text-[#6d4fe0]', value: 'text-[#4c32c4]' },
  teal: { icon: 'bg-[#dcf4f6] text-[#14a0b0]', value: 'text-[#0e5e6f]' }
}

const formatUnit = (value) => (
  <>
    {Math.round(value).toLocaleString('id-ID')}
    <span className="ml-1.5 text-[0.46em] font-semibold uppercase tracking-[0.08em] text-[#7a8aa8]">unit</span>
  </>
)

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
      <div style={{ containerType: 'inline-size' }}>
        <p
          className={`whitespace-nowrap font-extrabold tabular-nums tracking-[-0.01em] ${style.value}`}
          style={{ fontSize: 'clamp(13px, 7.6cqi, 26px)' }}
        >
          {format(shown)}
        </p>
      </div>
    </div>
  )
}

export function AssetKpiCards({ ringkasan }) {
  const sisaNilai = ringkasan.nilaiPerolehan ? (ringkasan.nilaiBuku / ringkasan.nilaiPerolehan) * 100 : 0

  return (
    <section className="grid grid-cols-2 gap-4 md:grid-cols-3 2xl:grid-cols-6 fit:gap-2.5 tall:gap-3">
      <KpiCard icon={IconDatabase} tone="blue" label="Total Aset" value={ringkasan.total} format={formatUnit} />
      <KpiCard icon={IconCoins} tone="purple" label="Nilai Perolehan" value={ringkasan.nilaiPerolehan} format={formatRupiah} />
      <KpiCard icon={IconTrendUp} tone="green" label="Nilai Buku" value={ringkasan.nilaiBuku} format={formatRupiah} />
      <KpiCard icon={IconPieChart} tone="orange" label="Akumulasi Penyusutan" value={ringkasan.penyusutan} format={formatRupiah} />
      <KpiCard
        icon={IconTarget}
        tone="teal"
        label="Aset Aktif"
        value={ringkasan.aktif}
        format={formatUnit}
        title={`Berstatus aktif, dari ${ringkasan.total.toLocaleString('id-ID')} aset tercatat`}
      />
      <KpiCard
        icon={IconPercent}
        tone="teal"
        label="Nilai Buku thd Perolehan"
        value={sisaNilai}
        format={(value) => formatPercent(value, 2)}
        title="Nilai buku terhadap nilai perolehan - sisa nilai yang belum tersusut"
      />
    </section>
  )
}
