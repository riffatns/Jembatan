import { useEffect } from 'react'
import { BudgetDashboardHeader } from '../components/budget/dashboard/BudgetDashboardHeader'
import { AssetMasterPanel } from '../components/asset/master/AssetMasterPanel'
import { IT_DIVISION_ID } from '../components/asset/master/assetMasterModel'
import { IconTableList } from '../components/icons/DuotoneIcons'

// Master Data Aset (khusus administrator, tanpa approval). Satu jenis data
// saja - daftar BMN - jadi tidak bertab seperti Master Data SDM.
export default function AssetMasterData() {
  useEffect(() => {
    sessionStorage.setItem('bpk-dashboard-selected-division', IT_DIVISION_ID)
  }, [])

  return (
    <div className="flex flex-col gap-4 text-[#12305f] fit:gap-2.5">
      <BudgetDashboardHeader
        title="MASTER DATA ASET"
        subtitle="BARANG MILIK NEGARA YANG DIKUASAI PERWAKILAN"
        icon={IconTableList}
        showYearPicker={false}
      />
      <AssetMasterPanel />
    </div>
  )
}
