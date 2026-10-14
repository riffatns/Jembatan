import { IconCalendar, IconDocument } from '../../icons/DuotoneIcons'
import { CARD_CLASS, CARD_TITLE_CLASS } from '../../ui/cardStyles'
import { DashboardSummaryCard } from '../../dashboard/DashboardSummaryCard'
import { formatPercent } from '../../../lib/budgetFormat'

// Dua sisi pekerjaan bidang ini: agenda yang sudah terlaksana dan dokumen
// yang sudah disetujui.
export function PrSummaryCards({ model }) {
  const { total, terlaksanaShare, disetujuiShare, perLayanan } = model
  const layananTeramai = [...perLayanan].sort((a, b) => b.value - a.value)[0]
  const layananKosong = perLayanan.filter((item) => item.value === 0).length

  return (
    <div className={CARD_CLASS}>
      <h2 className={`${CARD_TITLE_CLASS} mb-3 shrink-0 fit:mb-1.5`}>Ringkasan Kegiatan</h2>
      <div className="grid gap-3.5 sm:grid-cols-2 fit:gap-2.5">
        <DashboardSummaryCard
          tone="green"
          icon={IconCalendar}
          label="Agenda Terlaksana"
          value={total.terlaksana}
          satuan="kegiatan"
          keterangan={`${formatPercent(terlaksanaShare, 0)} dari agenda yang sudah lewat`}
        />
        <DashboardSummaryCard
          tone="blue"
          icon={IconDocument}
          label="Dokumen Disetujui"
          value={total.disetujui}
          satuan="berkas"
          keterangan={`${formatPercent(disetujuiShare, 0)} dari seluruh dokumen layanan`}
        />
      </div>

      {/* Dilipat di layar yang tidak cukup tinggi, supaya dashboard tetap muat
          satu layar - perlakuan yang sama dengan Ringkasan Realisasi. */}
      <p className="mt-3.5 text-[12.5px] text-[#7a8aa8] fit:hidden tall:mt-2 tall:block">
        {total.dibatalkan ? <>{total.dibatalkan} agenda dibatalkan. </> : null}
        {total.ditolak ? <>{total.ditolak} dokumen ditolak. </> : null}
        {layananTeramai && layananTeramai.value ? (
          <>
            Dokumen terbanyak pada layanan{' '}
            <b className="font-semibold text-[#3f557d]">{layananTeramai.label}</b> ({layananTeramai.value} berkas).
          </>
        ) : (
          <>Belum ada dokumen pada layanan bidang ini.</>
        )}
        {layananKosong ? <> {layananKosong} layanan belum memiliki dokumen.</> : null}
      </p>
    </div>
  )
}
