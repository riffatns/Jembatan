import { useEffect, useMemo } from 'react'
import { useData } from '../context/DataContext'
import { buildLegalModel } from '../components/legal/dashboard/legalDashboardModel'
import { BudgetDashboardHeader } from '../components/budget/dashboard/BudgetDashboardHeader'
import { LegalKpiCards } from '../components/legal/dashboard/LegalKpiCards'
import { LegalServiceChart } from '../components/legal/dashboard/LegalServiceChart'
import { LegalStatusChart } from '../components/legal/dashboard/LegalStatusChart'
import { LegalExpiryTable } from '../components/legal/dashboard/LegalExpiryTable'
import { LegalSummaryCards } from '../components/legal/dashboard/LegalSummaryCards'
import { IconBook } from '../components/icons/DuotoneIcons'

const LEGAL_DIVISION_ID = 'legal'

// Susunan barisnya sama dengan Dashboard Anggaran dan Dashboard SDM.
const ROW_CLASS =
  'grid gap-4 2xl:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)] fit:min-h-0 fit:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)] fit:gap-2.5 tall:gap-3'

// Dashboard Subbagian Hukum. Pertanyaan yang dijawabnya: kerja sama mana yang
// masa berlakunya segera habis.
//
// Status Aktif/Review/Berakhir tidak dihitung di sini - dipakai
// getAgreementStatus yang sama dengan halaman Legislasi / Review MOU, yang
// menurunkannya dari tanggal dan tidak pernah menyimpannya.
export default function LegalDashboard() {
  const { documents, documentStructure } = useData()

  useEffect(() => {
    sessionStorage.setItem('bpk-dashboard-selected-division', LEGAL_DIVISION_ID)
  }, [])

  const divisionDocuments = useMemo(
    () => documents.filter((document) => document.divisionId === LEGAL_DIVISION_ID),
    [documents]
  )

  const categories = useMemo(() => {
    const division = (documentStructure || []).find((item) => item.divisionId === LEGAL_DIVISION_ID)
    return division?.categories || []
  }, [documentStructure])

  const model = useMemo(
    () => buildLegalModel({ documents: divisionDocuments, categories }),
    [divisionDocuments, categories]
  )

  return (
    <div className="flex flex-col gap-4 text-[#12305f] fit:h-[calc(100dvh-4rem)] fit:gap-2.5 tall:gap-3">
      <BudgetDashboardHeader title="HUKUM" subtitle="KERJA SAMA, REGULASI, DAN TELAAH HUKUM" icon={IconBook} showYearPicker={false} />

      {!model.hasData ? (
        <div className="rounded-[24px] border border-dashed border-slate-300 bg-white p-8 text-center">
          <IconBook className="mx-auto h-10 w-10 text-slate-300" />
          <h2 className="mt-3 text-lg font-bold text-[#233b84]">Belum ada dokumen hukum</h2>
          <p className="mx-auto mt-1 max-w-lg text-sm text-slate-500">
            Angka dashboard ini dibentuk dari dokumen yang diunggah pada layanan Bidang Hukum, dan
            pemantauan masa berlakunya dari Legislasi / Review MOU.
          </p>
        </div>
      ) : (
        <>
          <LegalKpiCards model={model} />
          <section className={`${ROW_CLASS} fit:flex-1`}>
            <LegalServiceChart items={model.perLayanan} />
            <LegalStatusChart segments={model.status} total={model.dinilai} />
          </section>
          <section className={`${ROW_CLASS} fit:flex-1`}>
            <LegalExpiryTable rows={model.segeraBerakhir} />
            <LegalSummaryCards model={model} />
          </section>
        </>
      )}
    </div>
  )
}
