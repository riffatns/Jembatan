import { useEffect, useMemo } from 'react'
import { useMasterDataset, useMasterDatasetGroup } from '../context/MasterDatasetContext'
import { BEZETTING_DATASET, HR_DIVISION_ID, summarizeAbk, summarizeEmployees } from '../components/hr/bezetting/bezettingModel'
import { DIKLAT_PREFIX, buildKpis, combinePrograms, toIsoDate } from '../components/hr/diklat/diklatModel'
import { buildHrModel } from '../components/hr/dashboard/hrDashboardModel'
import { BudgetDashboardHeader } from '../components/budget/dashboard/BudgetDashboardHeader'
import { HrKpiCards } from '../components/hr/dashboard/HrKpiCards'
import { HrFormationChart } from '../components/hr/dashboard/HrFormationChart'
import { HrCompositionChart } from '../components/hr/dashboard/HrCompositionChart'
import { HrFormationTable } from '../components/hr/dashboard/HrFormationTable'
import { HrSummaryCards } from '../components/hr/dashboard/HrSummaryCards'
import { MasterDataEmptyState } from '../components/budget/MasterDataEmptyState'
import { IconUsers } from '../components/icons/DuotoneIcons'

// Susunan barisnya sama dengan Dashboard Anggaran, termasuk perbandingan
// lebar kolomnya, supaya kedua bidang terbaca satu keluarga.
const ROW_CLASS =
  'grid gap-4 2xl:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)] fit:min-h-0 fit:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)] fit:gap-2.5 tall:gap-3'

// Dashboard Subbagian SDM. Angkanya dari Master Data SDM versi aktif -
// summarizeAbk dan summarizeEmployees yang sama dengan menu Bezetting, dan
// buildKpis yang sama dengan Kalender Diklat. Tidak ada hitungan baru di sini,
// jadi dashboard dan menunya tidak mungkin menyebut angka yang berbeda.
export default function HrDashboard() {
  const { active, refresh } = useMasterDataset(BEZETTING_DATASET, { ownerDivision: HR_DIVISION_ID })
  const { partitions, refresh: refreshDiklat } = useMasterDatasetGroup(DIKLAT_PREFIX)

  useEffect(() => {
    sessionStorage.setItem('bpk-dashboard-selected-division', HR_DIVISION_ID)
    refresh()
    refreshDiklat()
  }, [])

  const model = useMemo(() => {
    const payload = active?.payload
    const programs = combinePrograms(partitions || [])
    return buildHrModel({
      abk: summarizeAbk(payload?.abk),
      people: summarizeEmployees(payload?.employees || []),
      diklat: buildKpis(programs, toIsoDate(new Date()))
    })
  }, [active, partitions])

  const subtitle = `KOMPOSISI DAN KEBUTUHAN SDM${active?.periodLabel ? ` · ${active.periodLabel.toUpperCase()}` : ''}`

  return (
    <div className="flex flex-col gap-4 text-[#12305f] fit:h-[calc(100dvh-4rem)] fit:gap-2.5 tall:gap-3">
      <BudgetDashboardHeader title="SUMBER DAYA MANUSIA" subtitle={subtitle} icon={IconUsers} showYearPicker={false} />

      {!model.hasData ? (
        <MasterDataEmptyState
          title="Belum ada Master Data SDM"
          description="Angka dashboard dibentuk dari berkas Bezetting (sheet ABK dan Lengkap_PBD) yang diunggah administrator di menu Master Data SDM."
          masterDataPath="/dashboard/master-sdm"
        />
      ) : (
        <>
          <HrKpiCards model={model} />
          <section className={`${ROW_CLASS} fit:flex-1`}>
            <HrFormationChart rows={model.rows} />
            <HrCompositionChart segments={model.golongan} total={model.people.total} />
          </section>
          {/* Kedua baris sama-sama lentur, tidak seperti Keuangan yang barisnya
              setinggi isi. Tabel SDM punya satu baris per unit kerja, jadi
              dibiarkan setinggi isinya ia akan menelan hampir seluruh layar
              dan menyisakan grafik setinggi tiga batang. */}
          <section className={`${ROW_CLASS} fit:flex-1`}>
            <HrFormationTable rows={model.rows} total={model.total} fulfillment={model.fulfillment} />
            <HrSummaryCards model={model} />
          </section>
        </>
      )}
    </div>
  )
}
