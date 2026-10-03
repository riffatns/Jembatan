import { useEffect, useState } from 'react'
import { useMasterDataset } from '../context/MasterDatasetContext'
import { MONTH_NAMES, parseBezettingWorkbook } from '../lib/bezettingParser'
import { BudgetDashboardHeader } from '../components/budget/dashboard/BudgetDashboardHeader'
import { BEZETTING_DATASET, HR_DIVISION_ID, buildBezettingPayloads } from '../components/hr/bezetting/bezettingModel'
import { HrMasterPreview } from '../components/hr/master/HrMasterPreview'
import { IconTableList, IconTrash } from '../components/icons/DuotoneIcons'
import { FileDropzone, validateExcelFile } from '../components/master-data/FileDropzone'
import { VersionHistory } from '../components/master-data/VersionHistory'
import { useVersionDeletion } from '../components/master-data/useVersionDeletion'
import { Button } from '../components/ui/button'
import { CARD_CLASS, CARD_TITLE_CLASS } from '../components/ui/cardStyles'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'

const FIELD = 'h-11 w-full min-w-0 rounded-xl border border-[#d6dfec] bg-white px-3 text-sm font-semibold text-[#12305f] outline-none focus:border-[#2f7fe8]'
const currentYear = new Date().getFullYear()
const YEARS = [currentYear + 1, currentYear, currentYear - 1, currentYear - 2]

// Master Data SDM (khusus administrator, tanpa approval). Satu unggahan berkas
// Bezetting menjadi data aktif menu Bezetting Pegawai; tidak ada filter tahun.
export default function HrMasterData() {
  const dataset = useMasterDataset(BEZETTING_DATASET, { ownerDivision: HR_DIVISION_ID })
  const deletion = useVersionDeletion({ versions: dataset.versions, deleteVersion: dataset.deleteVersion, clear: dataset.clear, dataLabel: 'data SDM' })
  const [file, setFile] = useState(null)
  const [parsed, setParsed] = useState(null)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(null)
  const [periodMonth, setPeriodMonth] = useState(() => new Date().getMonth() + 1)
  const [periodYear, setPeriodYear] = useState(currentYear)

  useEffect(() => { sessionStorage.setItem('bpk-dashboard-selected-division', HR_DIVISION_ID) }, [])

  const handleFile = async (nextFile) => {
    setSaved(null); setParsed(null); setError(null); deletion.clearNotice()
    if (!nextFile) return
    setFile(nextFile)
    const invalid = validateExcelFile(nextFile)
    if (invalid) return setError(invalid)
    setBusy(true)
    try {
      const result = await parseBezettingWorkbook(nextFile)
      setParsed(result)
      if (result.periodMonth) setPeriodMonth(result.periodMonth)
      if (result.periodYear) setPeriodYear(result.periodYear)
    } catch (parseError) {
      setError(parseError.message || 'Berkas tidak dapat dibaca.')
    } finally {
      setBusy(false)
    }
  }

  const handleSave = async () => {
    if (!parsed) return
    setBusy(true)
    const { period, payload, privatePayload } = buildBezettingPayloads(parsed, { periodMonth, periodYear })
    const result = await dataset.upload({ period, payload, privatePayload, fileName: file?.name || null })
    setBusy(false)
    setSaved(result.ok
      ? { ok: true, text: `Tersimpan. Menu Bezetting Pegawai kini memakai data ${period.label}.${result.message ? ` ${result.message}` : ''}${result.shared ? '' : ' (mode lokal)'}` }
      : { ok: false, text: result.message })
  }

  const periodLabel = `${MONTH_NAMES[periodMonth - 1]} ${periodYear}`

  return (
    <div className="flex flex-col gap-4 text-[#12305f] fit:gap-2.5">
      <BudgetDashboardHeader title="MASTER DATA SDM" icon={IconTableList} showYearPicker={false} />
      <section className="grid items-start gap-4 fit:grid-cols-[minmax(0,0.62fr)_minmax(0,1.7fr)] fit:gap-2.5">
        <div className={`${CARD_CLASS} gap-3`}>
          <h2 className={CARD_TITLE_CLASS}>Unggah Bezetting Pegawai</h2>
          <FileDropzone id="hr-master-file" file={file} onFile={handleFile} hint="Berkas Bezetting berisi sheet ABK dan Lengkap_PBD (.xlsx/.xls, maks. 5 MB)" />
          <div className="grid grid-cols-2 items-end gap-3">
            <div className="min-w-0">
              <label htmlFor="hr-period-month" className="mb-1 block whitespace-nowrap text-xs font-semibold text-[#3f557d]">Bulan Data</label>
              <select id="hr-period-month" value={periodMonth} onChange={(event) => setPeriodMonth(Number(event.target.value))} className={FIELD}>
                {MONTH_NAMES.map((name, index) => <option key={name} value={index + 1}>{name}</option>)}
              </select>
            </div>
            <div className="min-w-0">
              <label htmlFor="hr-period-year" className="mb-1 block whitespace-nowrap text-xs font-semibold text-[#3f557d]">Tahun Data</label>
              <select id="hr-period-year" value={periodYear} onChange={(event) => setPeriodYear(Number(event.target.value))} className={FIELD}>
                {[...new Set([periodYear, ...YEARS])].sort((a, b) => b - a).map((year) => <option key={year} value={year}>{year}</option>)}
              </select>
            </div>
          </div>
          {busy && <p className="text-sm text-[#3f557d]">Memproses berkas...</p>}
          {error && <p className="rounded-xl bg-[#fde2e2] px-3 py-2 text-sm font-medium text-[#c0262d]">{error}</p>}
          {saved && <p className={`rounded-xl px-3 py-2 text-[13px] ${saved.ok ? 'bg-[#dcf5e8] text-[#0b7a4f]' : 'bg-[#fde2e2] text-[#c0262d]'}`}>{saved.text}</p>}
          {parsed && dataset.active && !saved && (
            <p className="rounded-xl bg-[#fff6ea] px-3 py-2 text-[13px] text-[#9a4d00]">Data aktif ({dataset.active.periodLabel}) akan digantikan; versi lama tetap bisa dikembalikan.</p>
          )}
          <Button variant="teal" onClick={handleSave} disabled={!parsed || busy || Boolean(saved?.ok)} className="mt-2 shrink-0 rounded-full">Simpan & Terapkan</Button>
          <p className="text-xs leading-snug text-[#7a8aa8]">Data pribadi pegawai dibaca hanya sampai kolom TMT Jabatan Tertentu. NIK, nomor HP, BPJS, Taspen, dan data keluarga tidak disimpan.</p>
        </div>

        <div className="flex min-w-0 flex-col gap-4 fit:gap-2.5">
          <HrMasterPreview parsed={parsed} periodLabel={periodLabel} />
          <div className={`${CARD_CLASS} gap-3`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className={CARD_TITLE_CLASS}>Data Aktif & Riwayat Versi</h2>
              <span className="text-[13px] text-[#3f557d]">
                {dataset.active ? <>Aktif: <b className="text-[#12305f]">{dataset.active.periodLabel || '-'}</b></> : 'Belum ada data aktif'}
              </span>
              <Button variant="outline" size="sm" onClick={deletion.askClear} disabled={!dataset.active} className="rounded-full text-[#c0262d]">
                <IconTrash className="h-4 w-4" /> Kosongkan data
              </Button>
            </div>
            {deletion.notice && <p className={`rounded-xl px-3 py-2 text-[13px] ${deletion.notice.ok ? 'bg-[#dcf5e8] text-[#0b7a4f]' : 'bg-[#fde2e2] text-[#c0262d]'}`}>{deletion.notice.text}</p>}
            <VersionHistory versions={dataset.versions} activeId={dataset.active?.id} onDelete={deletion.askDelete} />
          </div>
        </div>
      </section>
      <ConfirmDialog
        open={Boolean(deletion.dialog)}
        title={deletion.dialog?.title}
        description={deletion.dialog?.description}
        confirmLabel={deletion.dialog?.confirmLabel}
        busyLabel="Memproses..."
        busy={deletion.busy}
        onCancel={deletion.cancel}
        onConfirm={deletion.confirm}
      />
    </div>
  )
}
