import { IconAlert, IconDatabase, IconUsers } from '../../icons/DuotoneIcons'
import { formatPercent } from '../../../lib/budgetFormat'
import { CountCard, KPI_ROW_CLASS, RingCard } from '../../dashboard/DashboardKpiCards'
import { HR_SERIES } from './hrDashboardModel'

// Susunannya sengaja sama persis dengan kartu Dashboard Anggaran: tiga kartu
// angka lalu dua cincin persentase. Pembaca yang berpindah antarbidang tidak
// perlu belajar tata letak baru - yang berganti isinya, bukan bentuknya.
// Bentuk kartunya sendiri ada di components/dashboard/DashboardKpiCards.jsx.

export function HrKpiCards({ model }) {
  const { total, fulfillment, shortageShare, rows } = model
  const catatanUnit = rows.length ? `${rows.length} unit kerja` : 'Seluruh unit kerja'

  return (
    <section className={KPI_ROW_CLASS}>
      <CountCard icon={IconDatabase} label="Kebutuhan ABK" value={total.need} note={catatanUnit} color={HR_SERIES.need} satuan="orang" />
      <CountCard
        icon={IconUsers}
        label="Pegawai Terisi"
        value={total.actual}
        note={`${formatPercent(fulfillment)} dari kebutuhan`}
        color={HR_SERIES.actual}
        satuan="orang"
      />
      <CountCard
        icon={IconAlert}
        label="Kekurangan Pegawai"
        value={total.shortage}
        note={`${formatPercent(shortageShare)} dari kebutuhan`}
        color={HR_SERIES.gap}
        satuan="orang"
      />
      <RingCard label="Keterisian Formasi" percent={fulfillment} color={HR_SERIES.actual} keterangan="dari kebutuhan ABK" />
      <RingCard label="Persentase Kekurangan" percent={shortageShare} color={HR_SERIES.gap} keterangan="dari kebutuhan ABK" />
    </section>
  )
}
