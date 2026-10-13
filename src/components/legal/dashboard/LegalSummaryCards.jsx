import { IconAlert, IconDocument } from '../../icons/DuotoneIcons'
import { CARD_CLASS, CARD_TITLE_CLASS } from '../../ui/cardStyles'
import { useCountUp } from '../../../hooks/useAnimatedProgress'
import { REVIEW_WINDOW_DAYS } from './legalDashboardModel'
import { formatSisaHari } from '../../../data/agreementStatus'

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

function SummaryCard({ tone, icon: Icon, label, value, keterangan }) {
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
          <span className="ml-1.5 text-[0.42em] font-semibold uppercase tracking-[0.08em] text-[#7a8aa8]">berkas</span>
        </p>
        <p className="mt-1 text-[13.5px] text-[#3f557d] fit:mt-0 fit:text-[12.5px] tall:text-[13.5px]">{keterangan}</p>
      </div>
      <Wave color={style.wave} />
    </div>
  )
}

export function LegalSummaryCards({ model }) {
  const { total, terdekat } = model

  return (
    <div className={CARD_CLASS}>
      <h2 className={`${CARD_TITLE_CLASS} mb-3 shrink-0 fit:mb-1.5`}>Ringkasan Kerja Sama</h2>
      <div className="grid gap-3.5 sm:grid-cols-2 fit:gap-2.5">
        <SummaryCard tone="green" icon={IconDocument} label="Masih Aktif" value={total.aktif} keterangan={`Berlaku lebih dari ${REVIEW_WINDOW_DAYS} hari lagi`} />
        <SummaryCard tone="amber" icon={IconAlert} label="Perlu Tindakan" value={total.perluTindakan} keterangan="Ditinjau atau sudah berakhir" />
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
