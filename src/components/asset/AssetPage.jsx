import { useEffect, useMemo } from 'react'
import { useMasterDataset } from '../../context/MasterDatasetContext'
import { BudgetDashboardHeader } from '../budget/dashboard/BudgetDashboardHeader'
import { MasterDataEmptyState } from '../budget/MasterDataEmptyState'
import { IconDatabase } from '../icons/DuotoneIcons'
import { AssetWorkspace } from './AssetWorkspace'
import { ASSET_DATASET, ASSET_MASTER_PATH, IT_DIVISION_ID, assetsFromPayload } from './master/assetMasterModel'

// Menu Aset (Subbagian Umum dan TI). Angkanya dari Master Data Aset versi
// aktif - tidak ada lagi unggahan dokumen di halaman ini, sama seperti menu
// Bezetting di SDM dan menu akun di Keuangan.
export function AssetPage() {
  const { active, refresh } = useMasterDataset(ASSET_DATASET, { ownerDivision: IT_DIVISION_ID })

  // Sekali saat halaman dibuka; perubahan berikutnya datang lewat realtime.
  useEffect(() => {
    sessionStorage.setItem('bpk-dashboard-selected-division', IT_DIVISION_ID)
    refresh()
  }, [])

  const assets = useMemo(() => assetsFromPayload(active?.payload), [active])
  const subtitle = `UMUM DAN TI · BPK PERWAKILAN PROVINSI PAPUA BARAT DAYA${active?.periodLabel ? ` · ${active.periodLabel.toUpperCase()}` : ''}`

  return (
    <div className="flex flex-col gap-3 text-[#12305f] fit:gap-2.5">
      <BudgetDashboardHeader title="ASET" subtitle={subtitle} icon={IconDatabase} showYearPicker={false} />

      {assets.length ? (
        <AssetWorkspace assets={assets} />
      ) : (
        <MasterDataEmptyState
          title="Belum ada Master Data Aset"
          description="Angka menu ini dibentuk dari daftar Barang Milik Negara yang diunggah administrator di menu Master Data Aset."
          masterDataPath={ASSET_MASTER_PATH}
        />
      )}
    </div>
  )
}
