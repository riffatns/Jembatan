import { lazy } from 'react'
import { USE_NEW_FINANCE_DASHBOARD } from '../lib/tampilan'

const Dashboard = lazy(() => import('./Dashboard'))
const BudgetDashboard = lazy(() => import('./BudgetDashboard'))

// Rute /dashboard. Subbagian Keuangan mendapat Dashboard Anggaran yang baru;
// bidang lain tetap memakai Dashboard yang ada. Dashboard lama Keuangan tidak
// dihapus, hanya disembunyikan lewat saklar di lib/tampilan.js.
export default function DashboardHome() {
  const selectedDivisionId = sessionStorage.getItem('bpk-dashboard-selected-division') || 'finance'

  if (USE_NEW_FINANCE_DASHBOARD && selectedDivisionId === 'finance') {
    return <BudgetDashboard />
  }

  return <Dashboard />
}
