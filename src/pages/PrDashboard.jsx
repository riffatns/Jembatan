import { useEffect, useMemo } from 'react'
import { useData } from '../context/DataContext'
import { PR_DIVISION_ID, buildPrModel } from '../components/pr/dashboard/prDashboardModel'
import { BudgetDashboardHeader } from '../components/budget/dashboard/BudgetDashboardHeader'
import { PrKpiCards } from '../components/pr/dashboard/PrKpiCards'
import { PrMonthlyChart } from '../components/pr/dashboard/PrMonthlyChart'
import { PrTypeChart } from '../components/pr/dashboard/PrTypeChart'
import { PrUpcomingTable } from '../components/pr/dashboard/PrUpcomingTable'
import { PrSummaryCards } from '../components/pr/dashboard/PrSummaryCards'
import { IconGlobe } from '../components/icons/DuotoneIcons'

// Susunan barisnya sama dengan Dashboard Anggaran, SDM, Hukum, dan Umum dan TI.
const ROW_CLASS =
  'grid gap-4 2xl:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)] fit:min-h-0 fit:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)] fit:gap-2.5 tall:gap-3'

// Dashboard Subbagian Humas dan TU Kalan. Pertanyaan yang dijawabnya: agenda
// pimpinan apa yang segera tiba, dan seberapa padat tahun ini.
//
// Agenda yang terbaca di sini sudah lolos penyaring keterlihatan yang sama
// dengan Kalender Bersama (canViewAgendaEvent di DataContext), jadi dashboard
// tidak pernah menghitung agenda yang tidak boleh dilihat pembacanya.
export default function PrDashboard() {
  const { agendaEvents, documents, documentStructure } = useData()

  useEffect(() => {
    sessionStorage.setItem('bpk-dashboard-selected-division', PR_DIVISION_ID)
  }, [])

  const divisionEvents = useMemo(
    () => (agendaEvents || []).filter((event) => event.divisionId === PR_DIVISION_ID),
    [agendaEvents]
  )

  const divisionDocuments = useMemo(
    () => documents.filter((document) => document.divisionId === PR_DIVISION_ID),
    [documents]
  )

  const categories = useMemo(() => {
    const division = (documentStructure || []).find((item) => item.divisionId === PR_DIVISION_ID)
    return division?.categories || []
  }, [documentStructure])

  const model = useMemo(
    () => buildPrModel({ events: divisionEvents, documents: divisionDocuments, categories }),
    [divisionEvents, divisionDocuments, categories]
  )

  return (
    <div className="flex flex-col gap-4 text-[#12305f] fit:h-[calc(100dvh-4rem)] fit:gap-2.5 tall:gap-3">
      <BudgetDashboardHeader
        title="HUMAS DAN TU KALAN"
        subtitle="AGENDA PIMPINAN, DOKUMENTASI, DAN PERPUSTAKAAN"
        icon={IconGlobe}
        showYearPicker={false}
      />

      {!model.hasData ? (
        <div className="rounded-[24px] border border-dashed border-slate-300 bg-white p-8 text-center">
          <IconGlobe className="mx-auto h-10 w-10 text-slate-300" />
          <h2 className="mt-3 text-lg font-bold text-[#233b84]">Belum ada data Humas dan TU Kalan</h2>
          <p className="mx-auto mt-1 max-w-lg text-sm text-slate-500">
            Angka dashboard ini dibentuk dari agenda yang dicatat pada layanan Agenda Kalan dan dari dokumen
            layanan bidang ini.
          </p>
        </div>
      ) : (
        <>
          <PrKpiCards model={model} />
          <section className={`${ROW_CLASS} fit:flex-1`}>
            <PrMonthlyChart items={model.perBulan} tahun={model.tahunIni} />
            <PrTypeChart segments={model.jenis} total={model.total.agenda} />
          </section>
          <section className={`${ROW_CLASS} fit:flex-1`}>
            <PrUpcomingTable rows={model.terdekat} />
            <PrSummaryCards model={model} />
          </section>
        </>
      )}
    </div>
  )
}
