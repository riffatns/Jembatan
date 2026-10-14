import { useEffect, useMemo } from 'react'
import { useData } from '../context/DataContext'
import { IT_DIVISION_ID, buildItModel } from '../components/it/dashboard/itDashboardModel'
import { BudgetDashboardHeader } from '../components/budget/dashboard/BudgetDashboardHeader'
import { ItKpiCards } from '../components/it/dashboard/ItKpiCards'
import { ItValueChart } from '../components/it/dashboard/ItValueChart'
import { ItConditionChart } from '../components/it/dashboard/ItConditionChart'
import { ItTopAssetsTable } from '../components/it/dashboard/ItTopAssetsTable'
import { ItSummaryCards } from '../components/it/dashboard/ItSummaryCards'
import { IconBuilding, IconDatabase } from '../components/icons/DuotoneIcons'

// Susunan barisnya sama dengan Dashboard Anggaran, SDM, dan Hukum.
const ROW_CLASS =
  'grid gap-4 2xl:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)] fit:min-h-0 fit:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)] fit:gap-2.5 tall:gap-3'

// Dashboard Subbagian Umum dan TI. Pertanyaan yang dijawabnya: berapa nilai
// BMN yang dikelola, dalam kondisi apa, dan mana yang belum ber-PSP.
//
// Angka asetnya memakai ringkasAset yang sama dengan halaman Aset, bukan
// hitungan baru, supaya dashboard dan menunya tidak pernah berbeda.
export default function ItDashboard() {
  const { assets, documents, documentStructure } = useData()

  useEffect(() => {
    sessionStorage.setItem('bpk-dashboard-selected-division', IT_DIVISION_ID)
  }, [])

  const divisionAssets = useMemo(
    () => assets.filter((asset) => !asset.divisionId || asset.divisionId === IT_DIVISION_ID),
    [assets]
  )

  const divisionDocuments = useMemo(
    () => documents.filter((document) => document.divisionId === IT_DIVISION_ID),
    [documents]
  )

  const categories = useMemo(() => {
    const division = (documentStructure || []).find((item) => item.divisionId === IT_DIVISION_ID)
    return division?.categories || []
  }, [documentStructure])

  const model = useMemo(
    () => buildItModel({ assets: divisionAssets, documents: divisionDocuments, categories }),
    [divisionAssets, divisionDocuments, categories]
  )

  return (
    <div className="flex flex-col gap-4 text-[#12305f] fit:h-[calc(100dvh-4rem)] fit:gap-2.5 tall:gap-3">
      <BudgetDashboardHeader
        title="UMUM DAN TI"
        subtitle="BARANG MILIK NEGARA, PENGADAAN, DAN ARSIP"
        icon={IconBuilding}
        showYearPicker={false}
      />

      {!model.hasData ? (
        <div className="rounded-[24px] border border-dashed border-slate-300 bg-white p-8 text-center">
          <IconDatabase className="mx-auto h-10 w-10 text-slate-300" />
          <h2 className="mt-3 text-lg font-bold text-[#233b84]">Belum ada data Umum dan TI</h2>
          <p className="mx-auto mt-1 max-w-lg text-sm text-slate-500">
            Angka dashboard ini dibentuk dari daftar BMN yang diunggah pada layanan Aset dan dari dokumen
            layanan bidang ini.
          </p>
        </div>
      ) : (
        <>
          <ItKpiCards model={model} />
          <section className={`${ROW_CLASS} fit:flex-1`}>
            <ItValueChart items={model.nilaiJenis} />
            <ItConditionChart segments={model.kondisi} total={model.total.aset} />
          </section>
          <section className={`${ROW_CLASS} fit:flex-1`}>
            <ItTopAssetsTable rows={model.teratas} />
            <ItSummaryCards model={model} />
          </section>
        </>
      )}
    </div>
  )
}
