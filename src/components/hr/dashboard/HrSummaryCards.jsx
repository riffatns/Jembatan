import { IconAlert, IconUsers } from '../../icons/DuotoneIcons'
import { formatPercent } from '../../../lib/budgetFormat'
import { CARD_CLASS, CARD_TITLE_CLASS } from '../../ui/cardStyles'
import { useCountUp } from '../../../hooks/useAnimatedProgress'

const TONES = {
  green: { background: 'bg-gradient-to-b from-[#f2fbf6] to-[#e6f7ef]', icon: 'text-[#1fae7a]', wave: '#1fae7a' },
  amber: { background: 'bg-gradient-to-b from-[#fffaf0] to-[#fff5de]', icon: 'text-[#c98500]', wave: '#eda100' }
}

function Wave({ color }) {
  return (
    <svg viewBox="0 0 300 48" preserveAspectRatio="none" aria-hidden="true" className="absolute inset-x-0 bottom-0 h-12 w-full fit:h-8 tall:h-12">
      <path d="M0 30 C40 14 70 40 110 28 S180 8 220 24 S280 36 300 20 V48 H0Z" fill={color} opacity="0.18" />
      <path d="M0 38 C50 26 80 46 130 36 S210 22 250 34 S290 40 300 32 V48 H0Z" fill={color} opacity="0.22" />
    </svg>
  )
}

function SummaryCard({ tone, icon: Icon, label, value, percent, keterangan }) {
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
          {Math.round(shown).toLocaleString('id-ID')}
          <span className="ml-1.5 text-[0.42em] font-semibold uppercase tracking-[0.08em] text-[#7a8aa8]">orang</span>
        </p>
        <p className="mt-1 text-[13.5px] text-[#3f557d] fit:mt-0 fit:text-[12.5px] tall:text-[13.5px]">
          {Math.round(percent)}% {keterangan}
        </p>
      </div>
      <Wave color={style.wave} />
    </div>
  )
}

export function HrSummaryCards({ model }) {
  const { total, fulfillment, shortageShare, largestShortage, unitsShort, people, diklat } = model

  return (
    <div className={CARD_CLASS}>
      <h2 className={`${CARD_TITLE_CLASS} mb-3 fit:mb-1.5`}>Ringkasan Kepegawaian</h2>
      <div className="grid gap-3.5 sm:grid-cols-2 fit:gap-2.5">
        <SummaryCard
          tone="green"
          icon={IconUsers}
          label="Pegawai Terisi"
          value={total.actual}
          percent={fulfillment}
          keterangan="dari kebutuhan ABK"
        />
        <SummaryCard
          tone="amber"
          icon={IconAlert}
          label="Kekurangan Pegawai"
          value={total.shortage}
          percent={shortageShare}
          keterangan="dari kebutuhan ABK"
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
