import { useEffect, useMemo } from 'react'
import { useBudgetReports } from '../context/BudgetReportContext'
import { reportToBudget } from '../lib/budgetReportStorage'
import { MONTH_NAMES } from '../lib/budgetReportParser'
import { buildBudgetModel } from '../components/budget/dashboard/budgetDashboardModel'
import { BudgetDashboardHeader } from '../components/budget/dashboard/BudgetDashboardHeader'
import { BudgetKpiCards } from '../components/budget/dashboard/BudgetKpiCards'
import { BudgetCodeChart } from '../components/budget/dashboard/BudgetCodeChart'
import { BudgetCompositionChart } from '../components/budget/dashboard/BudgetCompositionChart'
import { BudgetDetailTable } from '../components/budget/dashboard/BudgetDetailTable'
import { BudgetSummaryCards } from '../components/budget/dashboard/BudgetSummaryCards'
import { MasterDataEmptyState } from '../components/budget/MasterDataEmptyState'

const FINANCE_DIVISION_ID = 'finance'

// Dua kolom di layar lebar. Pada layar "fit" (desktop, lihat tailwind.config)
// seluruh halaman dikunci setinggi layar: baris grafik mengisi sisa ruang,
// baris tabel setinggi isinya, sehingga tidak perlu scroll.
const ROW_CLASS = 'grid gap-4 2xl:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)] fit:min-h-0 fit:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)] fit:gap-2.5 tall:gap-3'

// Dashboard Subbagian Keuangan. Angkanya hanya dari Master Data Anggaran
// (budget_reports) TA yang dipilih: total 51 + 52 + 53, sama persis dengan
// jumlah ketiga menu akun. Tanpa master data, halaman sengaja kosong.
export default function BudgetDashboard() {
  const { activeReport, activeFiscalYear, years, selectFiscalYear, refreshReports } = useBudgetReports()

  // Ambil laporan terbaru saat halaman dibuka dan saat tab kembali aktif;
  // realtime menangani perubahan selama halaman terbuka.
  useEffect(() => {
    refreshReports()
    const onVisible = () => {
      if (document.visibilityState === 'visible') refreshReports()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [refreshReports])

  useEffect(() => {
    sessionStorage.setItem('bpk-dashboard-selected-division', FINANCE_DIVISION_ID)
  }, [])

  const model = useMemo(() => buildBudgetModel(activeReport ? reportToBudget(activeReport) : null), [activeReport])

  return (
    <div className="flex flex-col gap-4 text-[#12305f] fit:h-[calc(100dvh-4rem)] fit:gap-2.5 tall:gap-3">
      <BudgetDashboardHeader
        years={years}
        fiscalYear={activeFiscalYear}
        periodName={activeReport ? MONTH_NAMES[activeReport.periodMonth - 1] : null}
        onFiscalYearChange={selectFiscalYear}
      />

      {!model.hasData ? (
        <MasterDataEmptyState />
      ) : (
        <>
          <BudgetKpiCards model={model} />
          <section className={`${ROW_CLASS} fit:flex-1`}>
            <BudgetCodeChart rows={model.rows} />
            <BudgetCompositionChart rows={model.rows} totalPagu={model.total.pagu} />
          </section>
          <section className={`${ROW_CLASS} fit:shrink-0`}>
            <BudgetDetailTable rows={model.rows} total={model.total} absorption={model.absorption} />
            <BudgetSummaryCards model={model} />
          </section>
        </>
      )}
    </div>
  )
}
