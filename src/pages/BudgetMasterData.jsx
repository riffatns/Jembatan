import { useEffect, useMemo, useState } from 'react'
import { useBudgetReports } from '../context/BudgetReportContext'
import { MONTH_NAMES, parseBudgetReport } from '../lib/budgetReportParser'
import { IconTableList } from '../components/icons/DuotoneIcons'
import { BudgetDashboardHeader } from '../components/budget/dashboard/BudgetDashboardHeader'
import { MasterUploadForm } from '../components/budget/master/MasterUploadForm'
import { MasterReportPreview } from '../components/budget/master/MasterReportPreview'
import { MasterUploadHistory } from '../components/budget/master/MasterUploadHistory'
import { MasterDeleteDialog } from '../components/budget/master/MasterDeleteDialog'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_FILE = /\.(xlsx|xls)$/i

// Master Data Anggaran (khusus administrator, tanpa approval). Satu unggahan
// laporan realisasi SP2D membentuk angka Dashboard Keuangan dan menu akun
// 51/52/53 untuk tahun anggaran yang dipilih.
export default function BudgetMasterData() {
  const { reports, years, uploads, refreshUploads, refreshReports, saveReport, deleteReport } = useBudgetReports()
  const [file, setFile] = useState(null)
  const [parsed, setParsed] = useState(null)
  const [error, setError] = useState(null)
  const [parsing, setParsing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(null)
  const [fiscalYear, setFiscalYear] = useState(() => new Date().getFullYear())
  const [periodMonth, setPeriodMonth] = useState(() => new Date().getMonth() + 1)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteNotice, setDeleteNotice] = useState(null)

  useEffect(() => {
    sessionStorage.setItem('bpk-dashboard-selected-division', 'finance')
    refreshReports()
    refreshUploads()
  }, [refreshReports, refreshUploads])

  const handleFile = async (nextFile) => {
    setSaved(null)
    setParsed(null)
    setError(null)
    setDeleteNotice(null)
    if (!nextFile) return
    setFile(nextFile)
    if (!ALLOWED_FILE.test(nextFile.name)) return setError('Berkas harus berformat Excel (.xlsx atau .xls).')
    if (nextFile.size > MAX_FILE_SIZE) return setError('Ukuran berkas melebihi 5 MB.')

    setParsing(true)
    try {
      const result = await parseBudgetReport(nextFile)
      setParsed(result)
      if (result.fiscalYear) setFiscalYear(result.fiscalYear)
      if (result.periodMonth) setPeriodMonth(result.periodMonth)
    } catch (parseError) {
      setError(parseError.message || 'Berkas tidak dapat dibaca.')
    } finally {
      setParsing(false)
    }
  }

  const notices = useMemo(() => {
    const list = []
    if (saved) list.push({ tone: saved.shared ? 'success' : 'warning', text: saved.text })
    if (!parsed) return list
    if (parsed.fiscalYear && parsed.fiscalYear !== fiscalYear) {
      list.push({ tone: 'warning', text: `Kepala berkas menyebut TA ${parsed.fiscalYear}, tetapi yang dipilih TA ${fiscalYear}.` })
    }
    if (parsed.periodMonth && parsed.periodMonth !== periodMonth) {
      list.push({ tone: 'warning', text: `Kepala berkas menyebut periode ${MONTH_NAMES[parsed.periodMonth - 1]}, tetapi yang dipilih ${MONTH_NAMES[periodMonth - 1]}.` })
    }
    const existing = reports[fiscalYear]
    if (existing && !saved) {
      const older = periodMonth < existing.periodMonth ? ' Bulan yang dipilih lebih lama dari data saat ini.' : ''
      list.push({ tone: 'warning', text: `Data TA ${fiscalYear} (s.d. ${MONTH_NAMES[existing.periodMonth - 1]}) akan ditimpa.${older}` })
    }
    return list
  }, [parsed, fiscalYear, periodMonth, reports, saved])

  const handleSave = async () => {
    if (!parsed) return
    setSaving(true)
    try {
      const result = await saveReport(parsed, { fiscalYear, periodMonth, fileName: file?.name || null })
      const text = result.shared
        ? `Tersimpan. Dashboard dan menu akun TA ${fiscalYear} kini memakai laporan s.d. ${MONTH_NAMES[periodMonth - 1]}.${result.message ? ` ${result.message}` : ''}`
        : result.message || 'Laporan belum tersimpan ke server.'
      setSaved({ shared: result.shared, text })
    } catch (saveError) {
      setSaved({ shared: false, text: saveError.message || 'Gagal menyimpan laporan.' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    const year = deleteTarget.fiscalYear
    try {
      const result = await deleteReport(year)
      setDeleteNotice(result.ok
        ? { ok: true, text: `Data TA ${year} dihapus. Dashboard dan menu akun TA ${year} kini kosong.` }
        : { ok: false, text: result.message })
      if (result.ok) setSaved(null)
    } catch (deleteError) {
      setDeleteNotice({ ok: false, text: deleteError.message || 'Gagal menghapus data.' })
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  return (
    <div className="flex flex-col gap-4 text-[#12305f] fit:h-[calc(100dvh-4rem)] fit:gap-2.5 tall:gap-3">
      <BudgetDashboardHeader title="MASTER DATA ANGGARAN" icon={IconTableList} showYearPicker={false} />
      <section className="grid gap-4 fit:min-h-0 fit:grid-cols-[minmax(0,0.6fr)_minmax(0,1.7fr)] fit:flex-1 fit:gap-2.5 tall:gap-3">
        <MasterUploadForm
          file={file}
          parsing={parsing}
          saving={saving}
          error={error}
          fiscalYear={fiscalYear}
          periodMonth={periodMonth}
          onFile={handleFile}
          onYear={setFiscalYear}
          onMonth={setPeriodMonth}
          onSave={handleSave}
          canSave={Boolean(parsed) && !parsing}
          notices={notices}
        />
        <div className="flex min-w-0 flex-col gap-4 fit:min-h-0 fit:gap-2.5 tall:gap-3">
          <MasterReportPreview parsed={parsed} fiscalYear={fiscalYear} periodMonth={periodMonth} />
          <div className="grid fit:min-h-0 fit:flex-1 fit:grid-rows-[minmax(0,1fr)]">
            <MasterUploadHistory reports={reports} years={years} uploads={uploads} onDelete={setDeleteTarget} notice={deleteNotice} />
          </div>
        </div>
      </section>
      <MasterDeleteDialog report={deleteTarget} deleting={deleting} onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete} />
    </div>
  )
}
