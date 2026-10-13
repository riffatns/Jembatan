import { IconChartBars } from '../../icons/DuotoneIcons'
import { CARD_CLASS, CARD_TITLE_CLASS } from '../../ui/cardStyles'
import { BarList } from '../../charts/BarList'

// Jumlah dokumen per layanan hukum. Layanan yang belum punya dokumen tetap
// ditampilkan dengan batang kosong - yang kosong perlu terlihat kosong, bukan
// hilang dari daftar dan disangka tidak ada layanannya.
export function LegalServiceChart({ items }) {
  return (
    <div className={CARD_CLASS}>
      <div className="mb-2 flex shrink-0 items-center justify-between gap-3">
        <h2 className={`${CARD_TITLE_CLASS} flex items-center gap-2`}>
          <IconChartBars className="h-5 w-5 text-[#2f7fe8]" />
          Dokumen per Layanan
        </h2>
        <span className="shrink-0 text-xs text-[#7a8aa8]">Jumlah berkas</span>
      </div>

      {/* Gulir di dalam kartu bila layanannya banyak, supaya halaman tetap muat
          satu layar - perlakuan yang sama dengan tabel rincian. */}
      <div className="flex min-h-[160px] flex-1 flex-col fit:min-h-0 fit:overflow-y-auto">
        <BarList
          items={items}
          color="#2a78d6"
          formatValue={(value) => `${value.toLocaleString('id-ID')} berkas`}
          labelWidth="minmax(120px,42%)"
        />
      </div>
    </div>
  )
}
