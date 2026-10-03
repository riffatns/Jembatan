import { useEffect, useMemo } from 'react'
import { useBudgetReports } from '../../../context/BudgetReportContext'
import { IconCoins } from '../../icons/DuotoneIcons'
import { BudgetDashboardHeader } from '../dashboard/BudgetDashboardHeader'
import { MasterDataEmptyState } from '../MasterDataEmptyState'
import { buildAccountModel } from './accountModel'
import { AccountKpiCards } from './AccountKpiCards'
import { AccountCompositionChart } from './AccountCompositionChart'
import { AccountStatusPanel } from './AccountStatusPanel'
import { AccountDetailTable } from './AccountDetailTable'

// Menu Belanja Pegawai (51), Belanja Barang (52), Belanja Modal (53) di
// Subbagian Keuangan. Angkanya irisan dari laporan Master Data yang sama
// dengan Dashboard Keuangan, sehingga 51 + 52 + 53 = total dashboard.
export function AccountBudgetPage({ groupCode }) {
  const { activeReport, activeFiscalYear, years, selectFiscalYear, refreshReports } = useBudgetReports()

  useEffect(() => {
    refreshReports()
    const onVisible = () => {
      if (document.visibilityState === 'visible') refreshReports()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [refreshReports])

  const model = useMemo(() => buildAccountModel(activeReport, groupCode), [activeReport, groupCode])

  return (
    <div className="flex flex-col gap-4 text-[#12305f] fit:gap-2.5 tall:gap-3">
      <BudgetDashboardHeader
        title={model.title.toUpperCase()}
        subtitle={`AKUN ${groupCode} · BPK PERWAKILAN PROVINSI PAPUA BARAT DAYA`}
        icon={IconCoins}
        years={years}
        fiscalYear={activeFiscalYear}
        periodName={model.monthName}
        onFiscalYearChange={selectFiscalYear}
      />

      {!model.hasData ? (
        <MasterDataEmptyState />
      ) : (
        <>
          <AccountKpiCards model={model} />
          {/* Grafik setinggi sisa layar pertama; tabel di bawahnya mengikuti jumlah akun. */}
          <section className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] fit:h-[clamp(280px,calc(100dvh-17rem),460px)] fit:gap-2.5 tall:gap-3">
            <AccountCompositionChart model={model} />
            <AccountStatusPanel model={model} />
          </section>
          <section>
            <AccountDetailTable accounts={model.accounts} />
          </section>
        </>
      )}
    </div>
  )
}
