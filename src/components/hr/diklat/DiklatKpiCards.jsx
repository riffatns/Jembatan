import { IconBook, IconCalendar, IconGlobe, IconPlay, IconUsers } from '../../icons/DuotoneIcons'
import { KpiCard } from '../bezetting/BezettingKpiCards'

const MONTH_NAME = new Intl.DateTimeFormat('id-ID', { month: 'long' })

// Kartu ringkasan. "Sedang Berlangsung" dan "Bulan Ini" menurut tanggal hari ini
// dan tanpa Self Learning (yang terbuka sepanjang tahun).
export function DiklatKpiCards({ kpis, today }) {
  const monthName = MONTH_NAME.format(new Date(`${today}T00:00:00`))
  return (
    <section className="grid shrink-0 grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5 fit:gap-2.5">
      <KpiCard icon={IconUsers} tone="blue" label="Total Program" value={kpis.total} />
      <KpiCard icon={IconPlay} tone="green" label="Sedang Berlangsung" value={kpis.ongoing} />
      <KpiCard icon={IconCalendar} tone="orange" label={`Bulan Ini (${monthName})`} value={kpis.thisMonth} />
      <KpiCard icon={IconBook} tone="purple" label="Self Learning" value={kpis.selfLearning} />
      <KpiCard icon={IconGlobe} tone="blue" label="Internasional" value={kpis.international} />
    </section>
  )
}
