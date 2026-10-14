import { IconCoins, IconPieChart } from '../../icons/DuotoneIcons'
import { CARD_CLASS, CARD_TITLE_CLASS } from '../../ui/cardStyles'
import { DashboardSummaryCard } from '../../dashboard/DashboardSummaryCard'
import { formatCompactRupiah, formatPercent } from '../../../lib/budgetFormat'

// Nilai BMN dilihat dari dua sisi: yang masih tercatat sebagai kekayaan
// (nilai buku) dan yang sudah habis dipakai (akumulasi penyusutan). Keduanya
// selalu berjumlah nilai perolehan, jadi satu kartu saja akan menyembunyikan
// separuh ceritanya.
export function ItSummaryCards({ model }) {
  const { total, nilaiBukuShare, perLayanan } = model
  const layananTeramai = [...perLayanan].sort((a, b) => b.value - a.value)[0]
  const layananKosong = perLayanan.filter((item) => item.value === 0).length

  return (
    <div className={CARD_CLASS}>
      <h2 className={`${CARD_TITLE_CLASS} mb-3 shrink-0 fit:mb-1.5`}>Ringkasan Nilai BMN</h2>
      <div className="grid gap-3.5 sm:grid-cols-2 fit:gap-2.5">
        <DashboardSummaryCard
          tone="blue"
          icon={IconCoins}
          label="Nilai Buku"
          value={total.nilaiBuku}
          format={formatCompactRupiah}
          keterangan={`${formatPercent(nilaiBukuShare, 0)} dari nilai perolehan`}
        />
        <DashboardSummaryCard
          tone="amber"
          icon={IconPieChart}
          label="Akumulasi Penyusutan"
          value={total.penyusutan}
          format={formatCompactRupiah}
          keterangan={`${formatPercent(100 - nilaiBukuShare, 0)} dari nilai perolehan`}
        />
      </div>

      {/* Dilipat di layar yang tidak cukup tinggi, supaya dashboard tetap muat
          satu layar - perlakuan yang sama dengan Ringkasan Realisasi. */}
      <p className="mt-3.5 text-[12.5px] text-[#7a8aa8] fit:hidden tall:mt-2 tall:block">
        Nilai perolehan seluruhnya {formatCompactRupiah(total.nilaiPerolehan)}.
        {total.belumPsp ? <> {total.belumPsp} aset belum memiliki PSP.</> : <> Seluruh aset sudah memiliki PSP.</>}
        {layananTeramai && layananTeramai.value ? (
          <> Dokumen terbanyak pada layanan <b className="font-semibold text-[#3f557d]">{layananTeramai.label}</b> ({layananTeramai.value} berkas).</>
        ) : null}
        {layananKosong ? <> {layananKosong} layanan belum memiliki dokumen.</> : null}
      </p>
    </div>
  )
}
