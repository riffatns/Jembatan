import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient'
import { toRemoteBudget } from '../lib/budgetStorage'
import {
  loadStoredReports,
  mapRemoteReport,
  mapRemoteUpload,
  periodLabel,
  reportToBudget,
  saveStoredReports,
  toRemoteReport,
  toRemoteUpload
} from '../lib/budgetReportStorage'
import { useAuth } from './AuthContext'
import { useData } from './DataContext'

const SELECTED_YEAR_KEY = 'bpk-dashboard-budget-year'

const BudgetReportContext = createContext(null)

// Master Data Anggaran: satu laporan per tahun anggaran (budget_reports).
// Sumber angka untuk Dashboard Keuangan dan menu akun 51/52/53.
export function BudgetReportProvider({ children }) {
  const { user } = useAuth()
  const { refreshBudget } = useData()
  const [reports, setReports] = useState(loadStoredReports)
  const [uploads, setUploads] = useState([])
  const [selectedYear, setSelectedYear] = useState(() => Number(sessionStorage.getItem(SELECTED_YEAR_KEY)) || null)

  const refreshReports = useCallback(async () => {
    if (!isSupabaseConfigured || !user) return
    const { data, error } = await supabase.from('budget_reports').select('*').order('fiscal_year', { ascending: false })
    // Tabel belum dibuat (anggaran-master.sql belum dijalankan): tetap pakai cadangan lokal.
    if (error) return
    setReports(Object.fromEntries(data.map((row) => [row.fiscal_year, mapRemoteReport(row)])))
  }, [user])

  const refreshUploads = useCallback(async () => {
    if (!isSupabaseConfigured || !user) return
    const { data, error } = await supabase
      .from('budget_report_uploads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)
    if (!error) setUploads(data.map(mapRemoteUpload))
  }, [user])

  useEffect(() => {
    if (!isSupabaseConfigured || !user) return undefined
    refreshReports().catch(() => {})
    const channel = supabase
      .channel('budget-reports-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'budget_reports' }, () => {
        refreshReports().catch(() => {})
      })
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, refreshReports])

  useEffect(() => { saveStoredReports(reports) }, [reports])

  const years = useMemo(() => Object.keys(reports).map(Number).sort((a, b) => b - a), [reports])
  const activeFiscalYear = selectedYear && reports[selectedYear] ? selectedYear : years[0] || null
  const activeReport = activeFiscalYear ? reports[activeFiscalYear] : null

  const selectFiscalYear = useCallback((year) => {
    sessionStorage.setItem(SELECTED_YEAR_KEY, String(year))
    setSelectedYear(Number(year))
  }, [])

  // Menyimpan laporan hasil parseBudgetReport untuk TA dan bulan pilihan admin.
  // Unggahan berikutnya untuk TA yang sama menimpa laporan TA itu.
  const saveReport = useCallback(async (parsed, { fiscalYear, periodMonth, fileName }) => {
    const report = {
      fiscalYear,
      periodMonth,
      periodLabel: periodLabel(periodMonth, fiscalYear),
      satker: parsed.satker,
      accounts: parsed.accounts,
      groups: parsed.groups,
      totals: parsed.totals,
      sourceFileName: fileName,
      uploadedByName: user?.name || null,
      updatedAt: new Date().toISOString()
    }
    setReports((current) => ({ ...current, [fiscalYear]: report }))
    selectFiscalYear(fiscalYear)

    if (!isSupabaseConfigured || !user?.id) {
      setUploads((current) => [{ id: `local-${Date.now()}`, ...report, accountCount: report.accounts.length, createdAt: report.updatedAt }, ...current])
      return { shared: false, message: 'Mode lokal: laporan hanya tersimpan di browser ini.' }
    }

    const { error } = await supabase.from('budget_reports').upsert(toRemoteReport(report, user), { onConflict: 'fiscal_year' })
    if (error) return { shared: false, message: error.message }

    // Ringkasan 51/52/53 juga ditulis ke budget_snapshots supaya menu lama
    // (Realisasi Anggaran, Sisa Anggaran) membaca angka yang sama.
    const [snapshotResult, uploadResult] = await Promise.all([
      supabase.from('budget_snapshots').upsert(toRemoteBudget(reportToBudget(report)), { onConflict: 'fiscal_year' }),
      supabase.from('budget_report_uploads').insert(toRemoteUpload(report, user))
    ])
    refreshBudget().catch(() => {})
    refreshUploads().catch(() => {})
    const followUpError = snapshotResult.error || uploadResult.error
    return { shared: true, message: followUpError ? `Laporan tersimpan, tetapi: ${followUpError.message}` : null }
  }, [user, refreshBudget, refreshUploads, selectFiscalYear])

  // Mengosongkan data satu TA. Dashboard dan menu akun TA itu kembali kosong
  // sampai laporan baru diunggah; riwayat unggah tetap ada.
  const deleteReport = useCallback(async (fiscalYear) => {
    const report = reports[fiscalYear]
    if (!report) return { ok: false, message: `Tidak ada data TA ${fiscalYear}.` }
    const removeLocally = () => setReports((current) => {
      const next = { ...current }
      delete next[fiscalYear]
      return next
    })

    if (!isSupabaseConfigured || !user?.id) {
      removeLocally()
      setUploads((current) => [{ id: `local-${Date.now()}`, action: 'delete', ...report, accountCount: 0, createdAt: new Date().toISOString() }, ...current])
      return { ok: true }
    }

    // RLS yang menolak delete tidak memberi galat, hanya 0 baris; karena itu
    // baris yang terhapus diminta kembali dan dihitung.
    const { data, error } = await supabase.from('budget_reports').delete().eq('fiscal_year', fiscalYear).select('fiscal_year')
    if (error) return { ok: false, message: error.message }
    if (!data?.length) {
      return { ok: false, message: 'Database menolak penghapusan. Jalankan supabase/anggaran-master-hapus.sql di SQL Editor, lalu coba lagi.' }
    }
    removeLocally()
    await supabase.from('budget_report_uploads').insert(toRemoteUpload({ ...report, accounts: [], totals: {} }, user, 'delete'))
    refreshUploads().catch(() => {})
    return { ok: true }
  }, [reports, user, refreshUploads])

  const value = {
    reports,
    years,
    activeFiscalYear,
    activeReport,
    selectFiscalYear,
    refreshReports,
    uploads,
    refreshUploads,
    saveReport,
    deleteReport
  }

  return <BudgetReportContext.Provider value={value}>{children}</BudgetReportContext.Provider>
}

export function useBudgetReports() {
  const context = useContext(BudgetReportContext)
  if (!context) throw new Error('useBudgetReports must be used within BudgetReportProvider')
  return context
}
