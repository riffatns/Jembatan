import { useState } from 'react'
import { MONTH_NAMES } from '../../../lib/budgetReportParser'
import { previousVersion } from '../../../lib/budgetReportVersions'
import { formatTime } from './MasterUploadHistory'

function monthOf(item) {
  return MONTH_NAMES[item.periodMonth - 1] || '-'
}

// Judul dan penjelasan dialog: selalu menyebut akibatnya pada angka yang tampil.
function describe(target, activeIds, uploads) {
  if (target.kind === 'year') {
    const { fiscalYear: year } = target.report
    return {
      title: `Kosongkan data TA ${year}?`,
      description: `Laporan s.d. ${monthOf(target.report)} dihapus. Dashboard Keuangan dan menu Belanja Pegawai, Belanja Barang, dan Belanja Modal TA ${year} kembali kosong sampai laporan baru diunggah. Riwayat unggah tetap tersimpan.`,
      confirmLabel: 'Hapus data'
    }
  }

  const { upload } = target
  const year = upload.fiscalYear
  if (upload.action === 'delete') {
    return { title: 'Hapus catatan ini?', description: `Catatan penghapusan TA ${year} dibuang dari riwayat. Angka yang tampil tidak berubah.`, confirmLabel: 'Hapus catatan' }
  }
  if (!activeIds.has(upload.id)) {
    return {
      title: 'Hapus versi unggahan ini?',
      description: `Unggahan ${upload.sourceFileName || ''} (TA ${year} s.d. ${monthOf(upload)}) dihapus dari riwayat. Angka yang tampil saat ini tidak berubah.`,
      confirmLabel: 'Hapus versi'
    }
  }
  const previous = previousVersion(uploads, upload)
  return {
    title: `Hapus unggahan aktif TA ${year}?`,
    description: previous
      ? `Data TA ${year} akan kembali ke unggahan sebelumnya: s.d. ${monthOf(previous)} (${previous.sourceFileName || 'tanpa nama berkas'}, diunggah ${formatTime(previous.createdAt)}).`
      : `Tidak ada unggahan sebelumnya yang tersimpan, jadi data TA ${year} akan kosong sampai laporan baru diunggah.`,
    confirmLabel: 'Hapus unggahan'
  }
}

function resultNotice(target, result) {
  if (!result.ok) return { ok: false, text: result.message }
  const year = target.kind === 'year' ? target.report.fiscalYear : target.upload.fiscalYear
  if (target.kind === 'year') return { ok: true, text: `Data TA ${year} dihapus. Dashboard dan menu akun TA ${year} kini kosong.` }
  if (result.outcome === 'restored') return { ok: true, text: `Unggahan dihapus. Data TA ${year} kembali ke laporan s.d. ${monthOf(result.restored)}.` }
  if (result.outcome === 'emptied') return { ok: true, text: `Unggahan dihapus. Tidak ada unggahan sebelumnya, data TA ${year} kini kosong.` }
  return { ok: true, text: 'Dihapus dari riwayat. Angka yang tampil tidak berubah.' }
}

// Alur hapus di Master Data: per TA (deleteReport) atau per unggahan
// (deleteUpload), selalu lewat dialog konfirmasi.
export function useMasterDeletion({ deleteReport, deleteUpload, activeIds, uploads, onDeleted }) {
  const [target, setTarget] = useState(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState(null)

  const confirm = async () => {
    if (!target) return
    setBusy(true)
    try {
      const result = target.kind === 'year' ? await deleteReport(target.report.fiscalYear) : await deleteUpload(target.upload)
      setNotice(resultNotice(target, result))
      if (result.ok) onDeleted?.()
    } catch (deleteError) {
      setNotice({ ok: false, text: deleteError.message || 'Gagal menghapus.' })
    } finally {
      setBusy(false)
      setTarget(null)
    }
  }

  return {
    askYear: (report) => setTarget({ kind: 'year', report }),
    askUpload: (upload) => setTarget({ kind: 'upload', upload }),
    dialog: target ? describe(target, activeIds, uploads) : null,
    busy,
    notice,
    clearNotice: () => setNotice(null),
    cancel: () => setTarget(null),
    confirm
  }
}
