import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient'
import {
  loadStoredReports,
  mapRemoteReport,
  mapRemoteUpload,
  periodLabel,
  reportSnapshot,
  saveStoredReports,
  toRemoteUpload
} from '../lib/budgetReportStorage'
import { activeUploadIds, previousVersion, reportFromVersion } from '../lib/budgetReportVersions'
import { applyReport, deleteActiveReport, deleteUploadRow, fetchLatestVersion, insertUploadLog } from '../lib/budgetReportRemote'
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
      .limit(100)
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
      setUploads((current) => [{ id: `local-${Date.now()}`, action: 'upload', ...report, report: reportSnapshot(report), accountCount: report.accounts.length, createdAt: report.updatedAt }, ...current])
      return { shared: false, message: 'Mode lokal: laporan hanya tersimpan di browser ini.' }
    }

    const applied = await applyReport(report, user)
    if (applied.error) return { shared: false, message: applied.error.message }

    // Riwayat menyimpan isi laporan supaya bisa dikembalikan bila versi
    // berikutnya dihapus.
    const uploadResult = await insertUploadLog(toRemoteUpload(report, user))
    refreshBudget().catch(() => {})
    refreshUploads().catch(() => {})
    const followUpError = applied.followUpError || uploadResult.error
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
    const removed = await deleteActiveReport(fiscalYear)
    if (removed.error) return { ok: false, message: removed.error.message }
    if (!removed.deleted) {
      return { ok: false, message: 'Database menolak penghapusan. Jalankan supabase/anggaran-master-hapus.sql di SQL Editor, lalu coba lagi.' }
    }
    removeLocally()
    await insertUploadLog(toRemoteUpload({ ...report, accounts: [], totals: {} }, user, 'delete'))
    refreshUploads().catch(() => {})
    return { ok: true }
  }, [reports, user, refreshUploads])

  const activeIds = useMemo(() => activeUploadIds(uploads, reports), [uploads, reports])

  // Menghapus satu unggahan (versi). Bila itu versi aktif, data TA kembali ke
  // unggahan sebelumnya; bila tidak ada, TA itu kosong. Versi lama: hanya
  // barisnya yang hilang. Hasil: { ok, outcome: 'restored' | 'emptied' | 'removed', restored }.
  const deleteUpload = useCallback(async (upload) => {
    const wasActive = activeIds.has(upload.id)
    const remote = isSupabaseConfigured && user?.id && !String(upload.id).startsWith('local-')

    if (remote) {
      const removed = await deleteUploadRow(upload.id)
      if (removed.error) return { ok: false, message: removed.error.message }
      if (!removed.deleted) {
        return { ok: false, message: 'Database menolak penghapusan. Jalankan supabase/anggaran-master-versi.sql di SQL Editor, lalu coba lagi.' }
      }
    }
    setUploads((current) => current.filter((row) => row.id !== upload.id))
    if (!wasActive) return { ok: true, outcome: 'removed' }

    const previous = remote ? await fetchLatestVersion(upload.fiscalYear) : previousVersion(uploads, upload)
    if (previous) {
      const restored = reportFromVersion(previous)
      setReports((current) => ({ ...current, [upload.fiscalYear]: restored }))
      if (remote) {
        const applied = await applyReport(restored, user)
        if (applied.error) return { ok: false, message: applied.error.message }
        refreshBudget().catch(() => {})
      }
      return { ok: true, outcome: 'restored', restored }
    }

    setReports((current) => {
      const next = { ...current }
      delete next[upload.fiscalYear]
      return next
    })
    if (remote) await deleteActiveReport(upload.fiscalYear)
    return { ok: true, outcome: 'emptied' }
  }, [activeIds, uploads, user, refreshBudget])

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
    deleteReport,
    activeUploadIds: activeIds,
    deleteUpload
  }

  return <BudgetReportContext.Provider value={value}>{children}</BudgetReportContext.Provider>
}

export function useBudgetReports() {
  const context = useContext(BudgetReportContext)
  if (!context) throw new Error('useBudgetReports must be used within BudgetReportProvider')
  return context
}
