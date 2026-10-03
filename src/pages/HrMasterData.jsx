import { useEffect, useState } from 'react'
import { BudgetDashboardHeader } from '../components/budget/dashboard/BudgetDashboardHeader'
import { HR_DIVISION_ID } from '../components/hr/bezetting/bezettingModel'
import { BezettingMasterPanel } from '../components/hr/master/BezettingMasterPanel'
import { DiklatMasterPanel } from '../components/hr/master/DiklatMasterPanel'
import { IconCalendar, IconTableList, IconUsers } from '../components/icons/DuotoneIcons'

const TABS = [
  { id: 'bezetting', label: 'Bezetting Pegawai', hint: 'Excel', icon: IconUsers, Panel: BezettingMasterPanel },
  { id: 'diklat', label: 'Kalender Diklat', hint: 'PDF', icon: IconCalendar, Panel: DiklatMasterPanel }
]

const TAB_KEY = 'bpk-dashboard-hr-master-tab'

// Tab terakhir diingat di hash URL (#diklat) dan sessionStorage, supaya muat
// ulang atau kembali lewat sidebar tetap di tab yang sama.
function initialTab() {
  let saved = window.location.hash.replace('#', '')
  if (!saved) {
    try { saved = sessionStorage.getItem(TAB_KEY) || '' } catch { saved = '' }
  }
  return TABS.some((tab) => tab.id === saved) ? saved : TABS[0].id
}

// Master Data SDM (khusus administrator, tanpa approval). Setiap jenis data
// punya tab sendiri yang terpisah jelas: Bezetting Pegawai dan Kalender Diklat.
export default function HrMasterData() {
  const [active, setActive] = useState(initialTab)

  useEffect(() => { sessionStorage.setItem('bpk-dashboard-selected-division', HR_DIVISION_ID) }, [])

  const select = (id) => {
    setActive(id)
    window.history.replaceState(null, '', `#${id}`)
    try { sessionStorage.setItem(TAB_KEY, id) } catch { /* tab tetap dari hash */ }
  }

  const { Panel } = TABS.find((tab) => tab.id === active)
  return (
    <div className="flex flex-col gap-4 text-[#12305f] fit:gap-2.5">
      <BudgetDashboardHeader title="MASTER DATA SDM" icon={IconTableList} showYearPicker={false} />
      <div role="tablist" aria-label="Jenis master data SDM" className="flex flex-wrap gap-2 border-b border-[#dbe4f1]">
        {TABS.map(({ id, label, hint, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`hr-master-tab-${id}`}
            aria-selected={active === id}
            aria-controls={`hr-master-panel-${id}`}
            onClick={() => select(id)}
            className={`-mb-px inline-flex items-center gap-2 border-b-[3px] px-3 pb-2 pt-1 text-sm font-bold transition-colors ${active === id ? 'border-[#1d5fd0] text-[#12305f]' : 'border-transparent text-[#7a8aa8] hover:text-[#12305f]'}`}
          >
            <Icon className={`h-5 w-5 ${active === id ? 'text-[#1d5fd0]' : 'text-[#9db6dc]'}`} />
            {label}
            <span className="rounded-md bg-[#eef2f8] px-1.5 py-0.5 text-[11px] font-semibold text-[#5a6f93]">{hint}</span>
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`hr-master-panel-${active}`} aria-labelledby={`hr-master-tab-${active}`}>
        <Panel key={active} />
      </div>
    </div>
  )
}
