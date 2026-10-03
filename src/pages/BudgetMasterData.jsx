import { useEffect, useMemo, useState } from 'react'
import { useBudgetReports } from '../context/BudgetReportContext'
import { MONTH_NAMES, parseBudgetReport } from '../lib/budgetReportParser'
import { IconTableList } from '../components/icons/DuotoneIcons'
import { BudgetDashboardHeader } from '../components/budget/dashboard/BudgetDashboardHeader'
import { MasterUploadForm } from '../components/budget/master/MasterUploadForm'
import { MasterReportPreview } from '../components/budget/master/MasterReportPreview'
import { MasterUploadHistory } from '../components/budget/master/MasterUploadHistory'
import { useMasterDeletion } from '../components/budget/master/useMasterDeletion'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_FILE = /\.(xlsx|xls)$/i

// Master Data Anggaran (khusus administrator, tanpa approval). Satu unggahan
// laporan realisasi SP2D membentuk angka Dashboard Keuangan dan menu akun
// 51/52/53 untuk tahun anggaran yang dipilih.
const STAGES = {
  read: { label: 'Membaca laporan realisasi...', detail: 'Mencocokkan setiap akun dengan baris JUMLAH SELURUHNYA.', progress: null },
  file: { label: 'Mengunggah berkas Excel asli...', detail: 'Disimpan agar bisa diunduh ulang dari riwayat.', progress: null },
  data: { label: 'Menyimpan laporan...', detail: 'Dashboard dan menu akun langsung memakai angka baru.', progress: null }
}

export default function BudgetMasterData() {
  const { reports, years, uploads, activeUploadIds, refreshUploads, refreshReports, saveReport, deleteReport, deleteUpload } = useBudgetReports()
  const [file, setFile] = useState(null)
  const [parsed, setParsed] = useState(null)
  const [error, setError] = useState(null)
  const [parsing, setParsing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(null)
  const [stage, setStage] = useState(null)
  const [fiscalYear, setFiscalYear] = useState(() => new Date().getFullYear())
  const [periodMonth, setPeriodMonth] = useState(() => new Date().getMonth() + 1)
  const deletion = useMasterDeletion({ deleteReport, deleteUpload, activeIds: activeUploadIds, uploads, onDeleted: () => setSaved(null) })

  useEffect(() => {
    sessionStorage.setItem('bpk-dashboard-selected-division', 'finance')
    refreshReports()
    refreshUploads()
  }, [refreshReports, refreshUploads])

  const handleFile = async (nextFile) => {
    setSaved(null)
    setParsed(null)
    setError(null)
    deletion.clearNotice()
    if (!nextFile) return
    setFile(nextFile)
    if (!ALLOWED_FILE.test(nextFile.name)) return setError('Berkas harus berformat Excel (.xlsx atau .xls).')
    if (nextFile.size > MAX_FILE_SIZE) return setError('Ukuran berkas melebihi 5 MB.')

    setParsing(true)
    setStage(STAGES.read)
    try {
      const result = await parseBudgetReport(nextFile)
      setParsed(result)
      if (result.fiscalYear) setFiscalYear(result.fiscalYear)
      if (result.periodMonth) setPeriodMonth(result.periodMonth)
    } catch (parseError) {
      setError(parseError.message || 'Berkas tidak dapat dibaca.')
    } finally {
      setParsing(false)
      setStage(null)
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
    setStage(STAGES.data)
    try {
      const result = await saveReport(parsed, { fiscalYear, periodMonth, fileName: file?.name || null, sourceFile: file, onStage: (key) => setStage(STAGES[key]) })
      const text = result.shared
        ? `Tersimpan. Dashboard dan menu akun TA ${fiscalYear} kini memakai laporan s.d. ${MONTH_NAMES[periodMonth - 1]}.${result.message ? ` ${result.message}` : ''}`
        : result.message || 'Laporan belum tersimpan ke server.'
      setSaved({ shared: result.shared, text })
    } catch (saveError) {
      setSaved({ shared: false, text: saveError.message || 'Gagal menyimpan laporan.' })
    } finally {
      setSaving(false)
      setStage(null)
    }
  }

  return (
    <div className="flex flex-col gap-4 text-[#12305f] fit:gap-2.5 tall:gap-3">
      <BudgetDashboardHeader title="MASTER DATA ANGGARAN" icon={IconTableList} showYearPicker={false} />
      {/* Riwayat tumbuh mengikuti jumlah unggahan, jadi halaman ini boleh di-scroll. */}
      <section className="grid items-start gap-4 fit:grid-cols-[minmax(0,0.6fr)_minmax(0,1.7fr)] fit:gap-2.5 tall:gap-3">
        <MasterUploadForm
          file={file}
          parsing={parsing}
          stage={stage}
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
        <div className="flex min-w-0 flex-col gap-4 fit:gap-2.5 tall:gap-3">
          <MasterReportPreview parsed={parsed} fiscalYear={fiscalYear} periodMonth={periodMonth} />
          <MasterUploadHistory
            reports={reports}
            years={years}
            uploads={uploads}
            activeIds={activeUploadIds}
            onDeleteYear={deletion.askYear}
            onDeleteUpload={deletion.askUpload}
            notice={deletion.notice}
          />
        </div>
      </section>
      <ConfirmDialog
        open={Boolean(deletion.dialog)}
        title={deletion.dialog?.title}
        description={deletion.dialog?.description}
        confirmLabel={deletion.dialog?.confirmLabel}
        busyLabel="Menghapus..."
        busy={deletion.busy}
        onCancel={deletion.cancel}
        onConfirm={deletion.confirm}
      />
    </div>
  )
}
