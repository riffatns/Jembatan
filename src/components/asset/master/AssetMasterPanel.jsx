import { useState } from 'react'
import { useMasterDataset } from '../../../context/MasterDatasetContext'
import { parseAssetWorkbook } from '../../../lib/assetWorkbook'
import { ASSET_DATASET, IT_DIVISION_ID, MONTH_NAMES, buildAssetPayload } from './assetMasterModel'
import { AssetMasterPreview } from './AssetMasterPreview'
import { IconTrash } from '../../icons/DuotoneIcons'
import { FileDropzone, validateExcelFile } from '../../master-data/FileDropzone'
import { UploadProgress } from '../../master-data/UploadProgress'
import { VersionHistory } from '../../master-data/VersionHistory'
import { useVersionDeletion } from '../../master-data/useVersionDeletion'
import { Button } from '../../ui/button'
import { CARD_CLASS, CARD_TITLE_CLASS } from '../../ui/cardStyles'
import { ConfirmDialog } from '../../ui/ConfirmDialog'

const FIELD = 'h-11 w-full min-w-0 rounded-xl border border-[#d6dfec] bg-white px-3 text-sm font-semibold text-[#12305f] outline-none focus:border-[#2f7fe8]'
const currentYear = new Date().getFullYear()
const YEARS = [currentYear + 1, currentYear, currentYear - 1, currentYear - 2]

// Master Data Aset. Satu unggahan daftar BMN menjadi satu-satunya data aktif
// menu Aset dan Dashboard Umum dan TI. Berkasnya disimpan apa adanya untuk
// diunduh ulang - berbeda dengan Bezetting, daftar BMN tidak memuat kolom
// pribadi yang perlu dikosongkan lebih dulu.
const STAGES = {
  read: { label: 'Membaca daftar BMN...', detail: 'Mencari tabel dengan kolom Kode Barang dan Nama Barang.', progress: null },
  file: { label: 'Mengunggah berkas...', detail: 'Disimpan agar bisa diunduh ulang dari riwayat.', progress: null },
  data: { label: 'Menyimpan data BMN...', detail: 'Setelah ini menu Aset langsung memakai data baru.', progress: null }
}

export function AssetMasterPanel() {
  const dataset = useMasterDataset(ASSET_DATASET, { ownerDivision: IT_DIVISION_ID })
  const deletion = useVersionDeletion({
    versions: dataset.versions,
    deleteVersion: dataset.deleteVersion,
    clear: dataset.clear,
    dataLabel: 'data BMN'
  })
  const [file, setFile] = useState(null)
  const [parsed, setParsed] = useState(null)
  const [error, setError] = useState(null)
  const [stage, setStage] = useState(null)
  const busy = Boolean(stage)
  const [saved, setSaved] = useState(null)
  const [periodMonth, setPeriodMonth] = useState(() => new Date().getMonth() + 1)
  const [periodYear, setPeriodYear] = useState(currentYear)

  const handleFile = async (nextFile) => {
    setSaved(null); setParsed(null); setError(null); deletion.clearNotice()
    if (!nextFile) return
    setFile(nextFile)
    const invalid = validateExcelFile(nextFile)
    if (invalid) return setError(invalid)
    setStage(STAGES.read)
    try {
      setParsed(await parseAssetWorkbook(nextFile))
    } catch (parseError) {
      setError(parseError.message || 'Berkas tidak dapat dibaca.')
    } finally {
      setStage(null)
    }
  }

  const handleSave = async () => {
    if (!parsed) return
    const { period, payload } = buildAssetPayload(parsed, { periodMonth, periodYear })
    const result = await dataset.upload({
      period,
      payload,
      fileName: file?.name || null,
      sourceFile: file,
      onStage: (key) => setStage(STAGES[key])
    })
    setStage(null)
    setSaved(result.ok
      ? { ok: true, text: `Tersimpan. Menu Aset kini memakai data ${period.label}.${result.message ? ` ${result.message}` : ''}${result.shared ? '' : ' (mode lokal)'}` }
      : { ok: false, text: result.message })
  }

  const periodLabel = `${MONTH_NAMES[periodMonth - 1]} ${periodYear}`

  return (
    <>
      <section className="grid items-start gap-4 fit:grid-cols-[minmax(0,0.62fr)_minmax(0,1.7fr)] fit:gap-2.5">
        <div className={`${CARD_CLASS} gap-3`}>
          <h2 className={CARD_TITLE_CLASS}>Unggah Daftar BMN</h2>
          <FileDropzone
            id="aset-master-file"
            file={file}
            onFile={handleFile}
            disabled={busy}
            hint="Daftar aset berformat Excel dengan kolom Kode Barang dan Nama Barang (.xlsx/.xls, maks. 5 MB)"
          />
          <div className="grid grid-cols-2 items-end gap-3">
            <div className="min-w-0">
              <label htmlFor="aset-period-month" className="mb-1 block whitespace-nowrap text-xs font-semibold text-[#3f557d]">Bulan Data</label>
              <select id="aset-period-month" value={periodMonth} onChange={(event) => setPeriodMonth(Number(event.target.value))} className={FIELD}>
                {MONTH_NAMES.map((name, index) => <option key={name} value={index + 1}>{name}</option>)}
              </select>
            </div>
            <div className="min-w-0">
              <label htmlFor="aset-period-year" className="mb-1 block whitespace-nowrap text-xs font-semibold text-[#3f557d]">Tahun Data</label>
              <select id="aset-period-year" value={periodYear} onChange={(event) => setPeriodYear(Number(event.target.value))} className={FIELD}>
                {[...new Set([periodYear, ...YEARS])].sort((a, b) => b - a).map((year) => <option key={year} value={year}>{year}</option>)}
              </select>
            </div>
          </div>
          <UploadProgress stage={stage} />
          {error && <p className="rounded-xl bg-[#fde2e2] px-3 py-2 text-sm font-medium text-[#c0262d]">{error}</p>}
          {saved && <p className={`rounded-xl px-3 py-2 text-[13px] ${saved.ok ? 'bg-[#dcf5e8] text-[#0b7a4f]' : 'bg-[#fde2e2] text-[#c0262d]'}`}>{saved.text}</p>}
          {parsed && dataset.active && !saved && (
            <p className="rounded-xl bg-[#fff6ea] px-3 py-2 text-[13px] text-[#9a4d00]">
              Data aktif ({dataset.active.periodLabel}) akan digantikan; versi lama tetap bisa dikembalikan.
            </p>
          )}
          <Button variant="teal" onClick={handleSave} disabled={!parsed || busy || Boolean(saved?.ok)} className="mt-2 shrink-0 rounded-full">
            Simpan &amp; Terapkan
          </Button>
          <p className="text-xs leading-snug text-[#7a8aa8]">
            Kolom yang dibaca: Kode Barang, NUP, Nama Barang, Jenis BMN, Merk, Tipe, Kondisi, Umur, Tanggal Perolehan,
            Nilai Perolehan, Penyusutan, Nilai Buku, Status Penggunaan, dan PSP. Isi berkas diperlakukan sebagai data,
            tidak pernah dijalankan.
          </p>
        </div>

        <div className="flex min-w-0 flex-col gap-4 fit:gap-2.5">
          <AssetMasterPreview parsed={parsed} periodLabel={periodLabel} />
          <div className={`${CARD_CLASS} gap-3`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className={CARD_TITLE_CLASS}>Data Aktif &amp; Riwayat Versi</h2>
              <span className="text-[13px] text-[#3f557d]">
                {dataset.active ? <>Aktif: <b className="text-[#12305f]">{dataset.active.periodLabel || '-'}</b></> : 'Belum ada data aktif'}
              </span>
              <Button variant="outline" size="sm" onClick={deletion.askClear} disabled={!dataset.active} className="rounded-full text-[#c0262d]">
                <IconTrash className="h-4 w-4" /> Kosongkan data
              </Button>
            </div>
            {deletion.notice && (
              <p className={`rounded-xl px-3 py-2 text-[13px] ${deletion.notice.ok ? 'bg-[#dcf5e8] text-[#0b7a4f]' : 'bg-[#fde2e2] text-[#c0262d]'}`}>
                {deletion.notice.text}
              </p>
            )}
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
    </>
  )
}
