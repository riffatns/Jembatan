import { IconBuilding, IconCalendar, IconClock, IconPlay, IconUsers } from '../../icons/DuotoneIcons'
import { KpiCard } from '../../hr/bezetting/BezettingKpiCards'

const MONTH_NAME = new Intl.DateTimeFormat('id-ID', { month: 'long' })

// Kartu ringkasan Kalender Bersama. Bentuknya sama dengan Kalender Diklat,
// isinya tidak: yang dihitung agenda antarbidang, bukan program pelatihan.
//
// "Sedang Berlangsung" memakai tanggal hari ini, bukan status tersimpan, jadi
// kegiatan tiga hari tetap terhitung berlangsung di hari keduanya.
export function SharedCalendarKpiCards({ kpis, today }) {
  const monthName = MONTH_NAME.format(new Date(`${today}T00:00:00`))

  return (
    <section className="grid shrink-0 grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5 fit:gap-2.5">
      <KpiCard icon={IconCalendar} tone="blue" label="Total Agenda" value={kpis.total} />
      <KpiCard icon={IconPlay} tone="green" label="Sedang Berlangsung" value={kpis.ongoing} />
      <KpiCard icon={IconClock} tone="orange" label={`Bulan Ini (${monthName})`} value={kpis.thisMonth} />
      <KpiCard icon={IconUsers} tone="purple" label="Akan Datang" value={kpis.upcoming} />
      <KpiCard icon={IconBuilding} tone="blue" label="Bidang Terlibat" value={kpis.divisions} />
    </section>
  )
}
