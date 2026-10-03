import { formatPercent } from '../../../lib/budgetFormat'
import { useCountUp } from '../../../hooks/useAnimatedProgress'
import { IconAlert, IconDocument, IconFemale, IconMale, IconPieChart, IconUsers } from '../../icons/DuotoneIcons'
import { CARD_CLASS } from '../../ui/cardStyles'

const TONES = {
  blue: { icon: 'bg-[#e3eeff] text-[#2f7fe8]', value: 'text-[#12305f]', label: 'text-[#12305f]' },
  green: { icon: 'bg-[#dcf5e8] text-[#1fae7a]', value: 'text-[#0f6e5d]', label: 'text-[#0f6e5d]' },
  orange: { icon: 'bg-[#fff0e0] text-[#f08a1c]', value: 'text-[#e8770c]', label: 'text-[#c2620a]' },
  male: { icon: 'bg-[#e3eeff] text-[#2f7fe8]', value: 'text-[#12305f]', label: 'text-[#12305f]' },
  female: { icon: 'bg-[#fde7ef] text-[#e0457b]', value: 'text-[#c2185b]', label: 'text-[#c2185b]' }
}

function Count({ value, format }) {
  const shown = useCountUp(value)
  return <>{format ? format(shown) : Math.round(shown)}</>
}

function KpiCard({ icon: Icon, tone, label, value, format }) {
  const style = TONES[tone]
  return (
    <div className={`${CARD_CLASS} !flex-row items-center gap-3 !py-3`}>
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${style.icon}`}>
        <Icon className="h-6 w-6" />
      </span>
      <div className="min-w-0">
        <p className={`text-[13px] font-semibold leading-tight ${style.label}`}>{label}</p>
        <p className={`text-[28px] font-extrabold leading-tight tabular-nums ${style.value}`}><Count value={value} format={format} /></p>
      </div>
    </div>
  )
}

function GenderCard({ male, female }) {
  return (
    <div className={`${CARD_CLASS} !flex-row items-stretch !gap-0 !p-0`}>
      {[['male', IconMale, 'Laki-laki', male], ['female', IconFemale, 'Perempuan', female]].map(([tone, Icon, label, value]) => (
        <div key={tone} className="flex min-w-0 flex-1 items-center gap-2 px-2.5 py-3 first:border-r first:border-[#e1e8f4]">
          <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${TONES[tone].icon}`}><Icon className="h-6 w-6" /></span>
          <div className="min-w-0">
            <p className={`whitespace-nowrap text-[12.5px] font-semibold ${TONES[tone].label}`}>{label}</p>
            <p className={`text-[26px] font-extrabold leading-tight tabular-nums ${TONES[tone].value}`}><Count value={value} /></p>
          </div>
        </div>
      ))}
    </div>
  )
}

// Total Pegawai dan L/P mengikuti filter; ABK, Kesenjangan, dan Pemenuhan
// selalu dari formasi lengkap.
export function BezettingKpiCards({ people, abk }) {
  return (
    <section className="grid shrink-0 grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-[repeat(4,minmax(0,1fr))_minmax(0,1.35fr)] fit:gap-2.5">
      <KpiCard icon={IconUsers} tone="blue" label="Total Pegawai" value={people.total} />
      <KpiCard icon={IconDocument} tone="green" label="Kebutuhan ABK" value={abk.total.need} />
      <KpiCard icon={IconAlert} tone="orange" label="Kesenjangan SDM" value={Math.max(0, -abk.total.gap)} />
      <KpiCard icon={IconPieChart} tone="blue" label="Tingkat Pemenuhan" value={abk.fulfillment} format={(value) => formatPercent(value)} />
      <GenderCard male={people.male} female={people.female} />
    </section>
  )
}
