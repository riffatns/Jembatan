import { useEffect, useMemo, useState } from 'react'
import { useMasterDataset } from '../../../context/MasterDatasetContext'
import { MasterDataEmptyState } from '../../budget/MasterDataEmptyState'
import { BudgetDashboardHeader } from '../../budget/dashboard/BudgetDashboardHeader'
import { BarList } from '../../charts/BarList'
import { ColumnChart } from '../../charts/ColumnChart'
import { DonutChart } from '../../charts/DonutChart'
import { IconBuilding, IconChartBars, IconGraduation, IconUsers } from '../../icons/DuotoneIcons'
import { CARD_CLASS, CARD_TITLE_CLASS } from '../../ui/cardStyles'
import { AbkComparisonChart } from './AbkComparisonChart'
import { BezettingFilters } from './BezettingFilters'
import { BezettingKpiCards } from './BezettingKpiCards'
import { EmployeeTable } from './EmployeeTable'
import { FormationSummary, KeyNote } from './FormationSummary'
import { BEZETTING_DATASET, HR_DIVISION_ID, filterEmployees, filterOptions, summarizeAbk, summarizeEmployees } from './bezettingModel'

const EMPTY_FILTERS = { query: '', unit: '', education: '', golongan: '' }

function ChartCard({ icon: Icon, title, className = '', children }) {
  return (
    <div className={`${CARD_CLASS} ${className}`}>
      <h2 className={`${CARD_TITLE_CLASS} mb-2 flex items-center gap-2`}><Icon className="h-5 w-5 text-[#2f7fe8]" />{title}</h2>
      {children}
    </div>
  )
}

// Menu Bezetting Pegawai (Bidang SDM). Angkanya dari Master Data SDM versi
// aktif. Layar pertama memuat seluruh ringkasan; Daftar Pegawai di bawahnya.
export function BezettingPage() {
  const { active, activeDetails, refresh } = useMasterDataset(BEZETTING_DATASET, { ownerDivision: HR_DIVISION_ID, loadDetails: true })
  const [filters, setFilters] = useState(EMPTY_FILTERS)

  // Sekali saat halaman dibuka; perubahan berikutnya datang lewat realtime.
  useEffect(() => {
    sessionStorage.setItem('bpk-dashboard-selected-division', HR_DIVISION_ID)
    refresh()
  }, [])

  const employees = useMemo(() => active?.payload?.employees || [], [active])
  const options = useMemo(() => filterOptions(employees), [employees])
  const filtered = useMemo(() => filterEmployees(employees, filters), [employees, filters])
  const people = useMemo(() => summarizeEmployees(filtered), [filtered])
  const abk = useMemo(() => summarizeAbk(active?.payload?.abk), [active])

  const subtitle = `RINGKASAN KOMPOSISI DAN KEBUTUHAN SDM${active?.periodLabel ? ` · ${active.periodLabel.toUpperCase()}` : ''}`

  return (
    <div className="flex flex-col gap-4 text-[#12305f] fit:gap-2.5">
      {/* Layar tinggi (tall): ringkasan dikunci satu layar. Layar laptop: tiap kartu
          setinggi isinya (tidak ada yang terpotong) karena halaman ini memang
          di-scroll untuk Daftar Pegawai. */}
      <div className="flex flex-col gap-4 fit:gap-2.5 tall:h-[calc(100dvh-4rem)]">
        <BudgetDashboardHeader title="BEZETTING PEGAWAI" subtitle={subtitle} icon={IconUsers} showYearPicker={false} />
        {!active ? (
          <MasterDataEmptyState
            title="Belum ada Master Data SDM"
            description="Angka bezetting pegawai dibentuk dari berkas Bezetting (sheet ABK dan Lengkap_PBD) yang diunggah administrator di menu Master Data SDM."
            masterDataPath="/dashboard/master-sdm"
          />
        ) : (
          <>
            <BezettingKpiCards people={people} abk={abk} />
            <BezettingFilters filters={filters} options={options} onChange={setFilters} />
            <section className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_minmax(0,1fr)] fit:gap-2.5 tall:min-h-0 tall:flex-[1.1]">
              <AbkComparisonChart categories={abk.categories} />
              <ChartCard icon={IconGraduation} title="Komposisi Pendidikan">
                <DonutChart segments={people.education} centerLabel="Pegawai" ariaLabel="Komposisi pendidikan pegawai" />
              </ChartCard>
              <ChartCard icon={IconChartBars} title="Sebaran Golongan">
                <ColumnChart items={people.golongan} ariaLabel="Sebaran golongan pegawai" minHeight="min-h-[170px]" />
              </ChartCard>
            </section>
            <section className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] fit:gap-2.5 tall:min-h-0 tall:flex-1">
              <FormationSummary categories={abk.categories} />
              <div className="flex min-h-0 flex-col gap-2.5">
                <ChartCard icon={IconBuilding} title="Sebaran Unit Kerja" className="flex-1">
                  <BarList items={people.units} labelWidth="minmax(150px,40%)" />
                </ChartCard>
                <KeyNote largestGaps={abk.largestGaps} />
              </div>
            </section>
          </>
        )}
      </div>
      {active && <EmployeeTable employees={filtered} details={activeDetails?.employees || null} />}
    </div>
  )
}
