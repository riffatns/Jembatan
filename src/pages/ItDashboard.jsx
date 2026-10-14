import { useEffect, useMemo } from 'react'
import { useData } from '../context/DataContext'
import { useMasterDataset } from '../context/MasterDatasetContext'
import { ASSET_DATASET, ASSET_MASTER_PATH, assetsFromPayload } from '../components/asset/master/assetMasterModel'
import { IT_DIVISION_ID, buildItModel } from '../components/it/dashboard/itDashboardModel'
import { BudgetDashboardHeader } from '../components/budget/dashboard/BudgetDashboardHeader'
import { ItKpiCards } from '../components/it/dashboard/ItKpiCards'
import { ItValueChart } from '../components/it/dashboard/ItValueChart'
import { ItConditionChart } from '../components/it/dashboard/ItConditionChart'
import { ItTopAssetsTable } from '../components/it/dashboard/ItTopAssetsTable'
import { ItSummaryCards } from '../components/it/dashboard/ItSummaryCards'
import { MasterDataEmptyState } from '../components/budget/MasterDataEmptyState'
import { IconBuilding } from '../components/icons/DuotoneIcons'

// Susunan barisnya sama dengan Dashboard Anggaran, SDM, dan Hukum.
const ROW_CLASS =
  'grid gap-4 2xl:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)] fit:min-h-0 fit:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)] fit:gap-2.5 tall:gap-3'

// Dashboard Subbagian Umum dan TI. Pertanyaan yang dijawabnya: berapa nilai
// BMN yang dikelola, dalam kondisi apa, dan mana yang belum ber-PSP.
//
// Angka asetnya dari Master Data Aset versi aktif, lewat ringkasAset yang
// sama dengan menu Aset - bukan hitungan baru, supaya dashboard dan menunya
// tidak pernah berbeda.
export default function ItDashboard() {
  const { documents, documentStructure } = useData()
  const { active, refresh } = useMasterDataset(ASSET_DATASET, { ownerDivision: IT_DIVISION_ID })

  // Sekali saat halaman dibuka; perubahan berikutnya datang lewat realtime.
  useEffect(() => {
    sessionStorage.setItem('bpk-dashboard-selected-division', IT_DIVISION_ID)
    refresh()
  }, [])

  const divisionAssets = useMemo(() => assetsFromPayload(active?.payload), [active])

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
        subtitle={`BARANG MILIK NEGARA, PENGADAAN, DAN ARSIP${active?.periodLabel ? ` · ${active.periodLabel.toUpperCase()}` : ''}`}
        icon={IconBuilding}
        showYearPicker={false}
      />

      {!model.hasData ? (
        <MasterDataEmptyState
          title="Belum ada data Umum dan TI"
          description="Angka dashboard ini dibentuk dari daftar Barang Milik Negara yang diunggah administrator di menu Master Data Aset, dan dari dokumen layanan bidang ini."
          masterDataPath={ASSET_MASTER_PATH}
        />
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
