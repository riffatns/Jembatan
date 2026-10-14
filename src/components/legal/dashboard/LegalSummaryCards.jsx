import { IconAlert, IconDocument } from '../../icons/DuotoneIcons'
import { CARD_CLASS, CARD_TITLE_CLASS } from '../../ui/cardStyles'
import { DashboardSummaryCard } from '../../dashboard/DashboardSummaryCard'
import { REVIEW_WINDOW_DAYS } from './legalDashboardModel'
import { formatSisaHari } from '../../../data/agreementStatus'

export function LegalSummaryCards({ model }) {
  const { total, terdekat } = model

  return (
    <div className={CARD_CLASS}>
      <h2 className={`${CARD_TITLE_CLASS} mb-3 shrink-0 fit:mb-1.5`}>Ringkasan Kerja Sama</h2>
      <div className="grid gap-3.5 sm:grid-cols-2 fit:gap-2.5">
        <DashboardSummaryCard tone="green" icon={IconDocument} label="Masih Aktif" value={total.aktif} satuan="berkas" keterangan={`Berlaku lebih dari ${REVIEW_WINDOW_DAYS} hari lagi`} />
        <DashboardSummaryCard tone="amber" icon={IconAlert} label="Perlu Tindakan" value={total.perluTindakan} satuan="berkas" keterangan="Ditinjau atau sudah berakhir" />
      </div>

      {/* Dilipat di layar yang tidak cukup tinggi, supaya dashboard tetap muat
          satu layar - perlakuan yang sama dengan Ringkasan Realisasi. */}
      <p className="mt-3.5 text-[12.5px] text-[#7a8aa8] fit:hidden tall:mt-2 tall:block">
        {terdekat ? (
          <>
            Paling mendesak: <b className="font-semibold text-[#3f557d]">{terdekat.title}</b>
            {terdekat.counterparty ? <> dengan {terdekat.counterparty}</> : null}, {formatSisaHari(terdekat.sisa).toLowerCase()}.
          </>
        ) : (
          <>Belum ada kerja sama yang masa berlakunya dicatat.</>
        )}
        {total.tanpaMasaBerlaku ? (
          <> {total.tanpaMasaBerlaku} berkas berjangka belum diisi masa berlakunya, jadi belum ikut terpantau.</>
        ) : null}
      </p>
    </div>
  )
}
