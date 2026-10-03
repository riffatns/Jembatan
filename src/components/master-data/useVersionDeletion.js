import { useState } from 'react'
import { formatDateTime } from './VersionHistory'

function versionName(version) {
  return `${version.periodLabel || 'tanpa periode'} (${version.sourceFileName || 'tanpa nama berkas'}, diunggah ${formatDateTime(version.createdAt)})`
}

// Penjelasan dialog: selalu menyebut akibatnya pada data yang tampil.
function describe(target, versions, dataLabel) {
  if (target.kind === 'clear') {
    return {
      title: `Kosongkan ${dataLabel}?`,
      description: `Halaman yang memakai ${dataLabel} akan kosong sampai data baru diunggah. Riwayat tetap tersimpan; hapus baris "Kosongkan" untuk mengembalikan data.`,
      confirmLabel: 'Kosongkan'
    }
  }
  const { version } = target
  if (versions[0]?.id !== version.id) {
    return { title: 'Hapus versi ini?', description: 'Versi ini dihapus dari riwayat. Data yang tampil saat ini tidak berubah.', confirmLabel: 'Hapus versi' }
  }
  const previous = versions[1]
  return {
    title: version.action === 'clear' ? 'Batalkan pengosongan?' : 'Hapus versi aktif?',
    description: previous?.action === 'upload'
      ? `${dataLabel[0].toUpperCase()}${dataLabel.slice(1)} akan kembali ke versi sebelumnya: ${versionName(previous)}.`
      : `Tidak ada versi sebelumnya yang bisa dipakai, jadi ${dataLabel} akan kosong sampai data baru diunggah.`,
    confirmLabel: version.action === 'clear' ? 'Hapus pengosongan' : 'Hapus versi'
  }
}

function resultNotice(target, result, dataLabel) {
  if (!result.ok) return { ok: false, text: result.message }
  if (target.kind === 'clear') return { ok: true, text: `${dataLabel[0].toUpperCase()}${dataLabel.slice(1)} dikosongkan.` }
  if (result.outcome === 'restored') return { ok: true, text: `Versi dihapus. Data kembali ke ${versionName(result.current)}.` }
  if (result.outcome === 'emptied') return { ok: true, text: `Versi dihapus. Tidak ada versi sebelumnya, ${dataLabel} kini kosong.` }
  return { ok: true, text: 'Versi dihapus dari riwayat. Data yang tampil tidak berubah.' }
}

// Alur hapus versi / kosongkan untuk Master Data generik, selalu lewat
// ConfirmDialog. dataLabel mis. "data SDM".
export function useVersionDeletion({ versions, deleteVersion, clear, dataLabel }) {
  const [target, setTarget] = useState(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState(null)

  const confirm = async () => {
    if (!target) return
    setBusy(true)
    try {
      const result = target.kind === 'clear' ? await clear() : await deleteVersion(target.version)
      setNotice(resultNotice(target, result, dataLabel))
    } catch (error) {
      setNotice({ ok: false, text: error.message || 'Gagal menghapus.' })
    } finally {
      setBusy(false)
      setTarget(null)
    }
  }

  return {
    askClear: () => setTarget({ kind: 'clear' }),
    askDelete: (version) => setTarget({ kind: 'version', version }),
    dialog: target ? describe(target, versions, dataLabel) : null,
    busy,
    notice,
    clearNotice: () => setNotice(null),
    cancel: () => setTarget(null),
    confirm
  }
}
