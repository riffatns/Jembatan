import { lazy } from 'react'
import {
  USE_NEW_FINANCE_DASHBOARD,
  USE_NEW_HR_DASHBOARD,
  USE_NEW_IT_DASHBOARD,
  USE_NEW_LEGAL_DASHBOARD,
  USE_NEW_PR_DASHBOARD
} from '../lib/tampilan'

const Dashboard = lazy(() => import('./Dashboard'))
const BudgetDashboard = lazy(() => import('./BudgetDashboard'))
const HrDashboard = lazy(() => import('./HrDashboard'))
const LegalDashboard = lazy(() => import('./LegalDashboard'))
const ItDashboard = lazy(() => import('./ItDashboard'))
const PrDashboard = lazy(() => import('./PrDashboard'))

// Rute /dashboard. Tiap bidang yang sudah punya dashboard sendiri mendapat
// dashboard itu; sisanya tetap memakai Dashboard umum yang ada. Dashboard lama
// tidak dihapus, hanya dilewati lewat saklar di lib/tampilan.js.
export default function DashboardHome() {
  const selectedDivisionId = sessionStorage.getItem('bpk-dashboard-selected-division') || 'finance'

  if (USE_NEW_FINANCE_DASHBOARD && selectedDivisionId === 'finance') {
    return <BudgetDashboard />
  }

  if (USE_NEW_HR_DASHBOARD && selectedDivisionId === 'hr') {
    return <HrDashboard />
  }

  if (USE_NEW_LEGAL_DASHBOARD && selectedDivisionId === 'legal') {
    return <LegalDashboard />
  }

  if (USE_NEW_IT_DASHBOARD && selectedDivisionId === 'it') {
    return <ItDashboard />
  }

  if (USE_NEW_PR_DASHBOARD && selectedDivisionId === 'pr') {
    return <PrDashboard />
  }

  return <Dashboard />
}
