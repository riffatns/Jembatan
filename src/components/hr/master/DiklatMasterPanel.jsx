import { useState } from 'react'
import { useMasterDatasetGroup } from '../../../context/MasterDatasetContext'
import { parseKaldikPdf } from '../../../lib/kaldikParser'
import { loadPdfjs } from '../../../lib/pdfjsLoader'
import { FileDropzone, isPdfSignature, validatePdfFile } from '../../master-data/FileDropzone'
import { Button } from '../../ui/button'
import { CARD_CLASS, CARD_TITLE_CLASS } from '../../ui/cardStyles'
import { DIKLAT_PREFIX, buildDiklatPayload, diklatDatasetName, quarterLabel } from '../diklat/diklatModel'
import { DiklatMasterPreview } from './DiklatMasterPreview'
import { DiklatQuarterHistory } from './DiklatQuarterHistory'

const NOTICE = {
  ok: 'bg-[#dcf5e8] text-[#0b7a4f]',
  error: 'bg-[#fde2e2] text-[#c0262d]',
  warning: 'bg-[#fff6ea] text-[#9a4d00]'
}

// Membaca dan memvalidasi PDF Kaldik di browser. Melempar Error bila ditolak.
async function readKaldik(file) {
  const invalid = validatePdfFile(file)
  if (invalid) throw new Error(invalid)
  const bytes = new Uint8Array(await file.arrayBuffer())
  if (!isPdfSignature(bytes)) throw new Error('Isi berkas bukan PDF yang sah.')
  const pdfjs = await loadPdfjs()
  // pdf.js memindahkan buffer ke worker, jadi yang dikirim salinannya.
  return parseKaldikPdf(pdfjs, bytes.slice())
}

// Tab Kalender Diklat di Master Data SDM. Satu PDF Kaldik = satu triwulan
// (triwulan & tahun dari judul PDF); unggahan yang lolos validasi langsung
// menjadi data aktif triwulan itu, tanpa approval.
export function DiklatMasterPanel() {
  const group = useMasterDatasetGroup(DIKLAT_PREFIX)
  const [file, setFile] = useState(null)
  const [parsed, setParsed] = useState(null)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(null)
  const [selected, setSelected] = useState(null)

  const handleFile = async (nextFile) => {
    setSaved(null); setParsed(null); setError(null)
    if (!nextFile) return
    setFile(nextFile)
    setBusy(true)
    try {
      setParsed(await readKaldik(nextFile))
    } catch (parseError) {
      setError(parseError.message || 'PDF tidak dapat dibaca.')
    } finally {
      setBusy(false)
    }
  }

  const target = parsed ? diklatDatasetName(parsed.year, parsed.quarter) : null
  const replacing = target && group.partitions.find((partition) => partition.dataset === target)?.active

  const handleSave = async () => {
    if (!parsed) return
    setBusy(true)
    const { period, payload } = buildDiklatPayload(parsed)
    const result = await group.upload(target, { period, payload, fileName: file?.name || null, sourceFile: file })
    setBusy(false)
    if (result.ok) setSelected(target)
    setSaved(result.ok
      ? { tone: 'ok', text: `Tersimpan. Menu Kalender Diklat kini memakai ${period.label} (${parsed.programs.length} program).${result.message ? ` ${result.message}` : ''}${result.shared ? '' : ' (mode lokal)'}` }
      : { tone: 'error', text: result.message })
  }

  return (
    <section className="grid items-start gap-4 fit:grid-cols-[minmax(0,0.62fr)_minmax(0,1.7fr)] fit:gap-2.5">
      <div className={`${CARD_CLASS} gap-3`}>
        <h2 className={CARD_TITLE_CLASS}>Unggah Kalender Diklat</h2>
        <FileDropzone
          id="diklat-master-file"
          file={file}
          onFile={handleFile}
          accept=".pdf,application/pdf"
          label="Pilih atau seret PDF Kaldik"
          hint="PDF Kalender Pelatihan per triwulan dari aplikasi sumber (.pdf, maks. 5 MB)"
        />
        {parsed && (
          <p className="rounded-xl bg-[#f1f5fb] px-3 py-2 text-[13px] text-[#3f557d]">
            Disimpan sebagai <b className="text-[#12305f]">{quarterLabel(parsed.quarter, parsed.year)}</b> (dibaca dari judul PDF).
          </p>
        )}
        {busy && <p className="text-sm text-[#3f557d]">Memproses berkas...</p>}
        {error && <p className={`rounded-xl px-3 py-2 text-sm font-medium ${NOTICE.error}`}>{error}</p>}
        {saved && <p className={`rounded-xl px-3 py-2 text-[13px] ${NOTICE[saved.tone]}`}>{saved.text}</p>}
        {replacing && !saved && (
          <p className={`rounded-xl px-3 py-2 text-[13px] ${NOTICE.warning}`}>Data aktif {replacing.periodLabel} akan digantikan; versi lama tetap bisa dikembalikan.</p>
        )}
        <Button variant="teal" onClick={handleSave} disabled={!parsed || busy || Boolean(saved?.tone === 'ok')} className="mt-2 shrink-0 rounded-full">Simpan & Terapkan</Button>
        <p className="text-xs leading-snug text-[#7a8aa8]">
          Hanya PDF Kaldik asli. Berkas ditolak bila judul triwulan, grid tabel, atau nomor urut tidak cocok; tanggal yang belum pasti ditandai TBA, tidak ditebak.
        </p>
      </div>

      <div className="flex min-w-0 flex-col gap-4 fit:gap-2.5">
        <DiklatMasterPreview parsed={parsed} />
        <DiklatQuarterHistory partitions={group.partitions} selected={selected} onSelect={setSelected} group={group} />
      </div>
    </section>
  )
}
