import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconChartBars } from '../components/icons/DuotoneIcons'
import { useData } from '../context/DataContext'
import { buildBudgetModel } from '../components/budget/dashboard/budgetDashboardModel'
import { BudgetDashboardHeader } from '../components/budget/dashboard/BudgetDashboardHeader'
import { BudgetKpiCards } from '../components/budget/dashboard/BudgetKpiCards'
import { BudgetCodeChart } from '../components/budget/dashboard/BudgetCodeChart'
import { BudgetCompositionChart } from '../components/budget/dashboard/BudgetCompositionChart'
import { BudgetDetailTable } from '../components/budget/dashboard/BudgetDetailTable'
import { BudgetSummaryCards } from '../components/budget/dashboard/BudgetSummaryCards'

const FINANCE_DIVISION_ID = 'finance'

// Dua kolom di layar lebar. Pada layar "fit" (desktop, lihat tailwind.config)
// seluruh halaman dikunci setinggi layar: baris grafik mengisi sisa ruang,
// baris tabel setinggi isinya, sehingga tidak perlu scroll.
const ROW_CLASS = 'grid gap-4 2xl:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)] fit:min-h-0 fit:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)] fit:gap-2.5 tall:gap-3'

// Dashboard Subbagian Keuangan. Angkanya stats.budget dari DataContext, yang
// diisi dari budget_snapshots dan diperbarui setiap kali berkas anggaran diunggah.
export default function BudgetDashboard() {
  const { stats, refreshBudget } = useData()
  const navigate = useNavigate()

  // Ambil snapshot terbaru saat halaman dibuka dan saat tab kembali aktif,
  // supaya angka yang diunggah admin dari perangkat lain ikut tampil walaupun
  // realtime belum dinyalakan di Supabase.
  useEffect(() => {
    refreshBudget()
    const onVisible = () => {
      if (document.visibilityState === 'visible') refreshBudget()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [refreshBudget])

  useEffect(() => {
    sessionStorage.setItem('bpk-dashboard-selected-division', FINANCE_DIVISION_ID)
  }, [])

  const model = useMemo(() => buildBudgetModel(stats.budget), [stats.budget])

  // Sama dengan tombol Lihat Dokumen di Dashboard lama.
  const goToDocuments = () => {
    sessionStorage.setItem('bpk-dashboard-selected-division', FINANCE_DIVISION_ID)
    navigate(`/dashboard/division/${FINANCE_DIVISION_ID}`)
  }

  return (
    <div className="flex flex-col gap-4 text-[#12305f] fit:h-[calc(100dvh-4rem)] fit:gap-2.5 tall:gap-3">
      <BudgetDashboardHeader fiscalYear={model.fiscalYear} onViewDocuments={goToDocuments} />

      {!model.hasData ? (
        <div className="rounded-[24px] border border-dashed border-slate-300 bg-white p-8 text-center">
          <IconChartBars className="mx-auto h-10 w-10 text-slate-300" />
          <h2 className="mt-3 text-lg font-bold text-[#233b84]">Angka anggaran belum tersedia</h2>
          <p className="mx-auto mt-1 max-w-lg text-sm text-slate-500">
            Unggah dokumen anggaran berformat Excel pada layanan Realisasi Anggaran. Begitu berkasnya
            diperbarui, halaman ini ikut berubah.
          </p>
        </div>
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
