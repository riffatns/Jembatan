import { MONTH_NAMES } from '../../../lib/budgetReportParser'
import { FileDropzone } from '../../master-data/FileDropzone'
import { Button } from '../../ui/button'
import { CARD_CLASS, CARD_TITLE_CLASS } from '../../ui/cardStyles'

const FIELD = 'h-11 w-full min-w-0 rounded-xl border border-[#d6dfec] bg-white px-3 text-sm font-semibold text-[#12305f] outline-none focus:border-[#2f7fe8]'

function yearOptions(...extra) {
  const current = new Date().getFullYear()
  const years = new Set([current - 2, current - 1, current, current + 1, ...extra.filter(Boolean)])
  return [...years].sort((a, b) => b - a)
}

// Formulir unggah: berkas, Tahun Anggaran, dan Bulan. Keduanya terisi dari
// kepala laporan dan tetap bisa diubah administrator.
export function MasterUploadForm({ file, parsing, saving, error, fiscalYear, periodMonth, onFile, onYear, onMonth, onSave, canSave, notices }) {
  return (
    <div className={`${CARD_CLASS} gap-3`}>
      <h2 className={CARD_TITLE_CLASS}>Unggah Laporan Realisasi</h2>

      <FileDropzone id="master-file" file={file} onFile={onFile} hint="Laporan Realisasi SP2D — Akun Based (.xlsx/.xls, maks. 5 MB)" />

      <div className="grid grid-cols-2 items-end gap-3">
        <div className="min-w-0">
          <label htmlFor="master-year" className="mb-1 block whitespace-nowrap text-xs font-semibold text-[#3f557d]">Tahun Anggaran</label>
          <select id="master-year" value={fiscalYear} onChange={(event) => onYear(Number(event.target.value))} className={FIELD}>
            {yearOptions(fiscalYear).map((year) => <option key={year} value={year}>{year}</option>)}
          </select>
        </div>
        <div className="min-w-0">
          <label htmlFor="master-month" className="mb-1 block whitespace-nowrap text-xs font-semibold text-[#3f557d]">Bulan Laporan</label>
          <select id="master-month" value={periodMonth} onChange={(event) => onMonth(Number(event.target.value))} className={FIELD}>
            {MONTH_NAMES.map((name, index) => <option key={name} value={index + 1}>{name}</option>)}
          </select>
        </div>
      </div>

      {parsing && <p className="text-sm text-[#3f557d]">Membaca dan mencocokkan berkas...</p>}
      {error && <p className="rounded-xl bg-[#fde2e2] px-3 py-2 text-sm font-medium text-[#c0262d]">{error}</p>}
      {notices.map((notice) => (
        <p key={notice.text} className={`rounded-xl px-3 py-2 text-[13px] ${notice.tone === 'success' ? 'bg-[#dcf5e8] text-[#0b7a4f]' : 'bg-[#fff6ea] text-[#9a4d00]'}`}>
          {notice.text}
        </p>
      ))}

      <Button variant="teal" onClick={onSave} disabled={!canSave || saving} className="mt-2 shrink-0 rounded-full">
        {saving ? 'Menyimpan...' : 'Simpan & Terapkan'}
      </Button>
      <p className="text-xs leading-snug text-[#7a8aa8]">
        Unggahan untuk tahun anggaran yang sama menimpa data sebelumnya, sehingga dashboard dan menu akun
        selalu menampilkan laporan terbaru.
      </p>
    </div>
  )
}
