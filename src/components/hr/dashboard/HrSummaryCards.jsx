import { IconAlert, IconUsers } from '../../icons/DuotoneIcons'
import { formatPercent } from '../../../lib/budgetFormat'
import { CARD_CLASS, CARD_TITLE_CLASS } from '../../ui/cardStyles'
import { DashboardSummaryCard } from '../../dashboard/DashboardSummaryCard'

export function HrSummaryCards({ model }) {
  const { total, fulfillment, shortageShare, largestShortage, unitsShort, people, diklat } = model

  return (
    <div className={CARD_CLASS}>
      <h2 className={`${CARD_TITLE_CLASS} mb-3 fit:mb-1.5`}>Ringkasan Kepegawaian</h2>
      <div className="grid gap-3.5 sm:grid-cols-2 fit:gap-2.5">
        <DashboardSummaryCard
          tone="green"
          icon={IconUsers}
          label="Pegawai Terisi"
          value={total.actual}
          satuan="orang"
          keterangan={`${Math.round(fulfillment)}% dari kebutuhan ABK`}
        />
        <DashboardSummaryCard
          tone="amber"
          icon={IconAlert}
          label="Kekurangan Pegawai"
          value={total.shortage}
          satuan="orang"
          keterangan={`${Math.round(shortageShare)}% dari kebutuhan ABK`}
        />
      </div>

      {/* Dilipat di layar yang tidak cukup tinggi, supaya dashboard tetap muat
          satu layar - perlakuan yang sama dengan Ringkasan Realisasi. */}
      <p className="mt-3.5 text-[12.5px] text-[#7a8aa8] fit:hidden tall:mt-2 tall:block">
        {largestShortage ? (
          <>
            <b className="font-semibold text-[#3f557d]">{largestShortage.name}</b> paling kurang, {largestShortage.shortage} orang
            dari {largestShortage.need}. {unitsShort > 1 ? `${unitsShort} unit masih di bawah kebutuhan.` : 'Unit lain sudah terpenuhi.'}
          </>
        ) : (
          <>Seluruh unit sudah memenuhi kebutuhan ABK.</>
        )}
        {people.total ? (
          <> Komposisi {people.male} laki-laki dan {people.female} perempuan ({formatPercent((people.female / people.total) * 100, 0)} perempuan).</>
        ) : null}
        {diklat.ongoing ? <> {diklat.ongoing} diklat sedang berlangsung.</> : null}
      </p>
    </div>
  )
}
