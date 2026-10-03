import { isSupabaseConfigured, supabase } from './supabaseClient'

// Berkas asli unggahan Master Data (bucket privat 'master-files', hanya admin;
// lihat supabase/master-berkas.sql). Dipakai Master Data Anggaran dan Master
// Data generik supaya admin bisa mengunduh ulang berkas yang pernah diparsing.
// Mode lokal: berkas hanya disimpan di memori sesi, tidak di localStorage.

const BUCKET = 'master-files'
const LOCAL_PREFIX = 'local:'
const MIME_TYPES = {
  pdf: 'application/pdf',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  xls: 'application/vnd.ms-excel'
}
const localFiles = new Map()

export function fileExtension(fileName) {
  return /\.([a-z0-9]+)$/i.exec(String(fileName || ''))?.[1]?.toLowerCase() || ''
}

function randomId() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

// folder: 'anggaran/2026', 'dataset/hr-bezetting', ... Hasil { path } atau { error }.
export async function storeMasterFile(folder, file, fileName) {
  const extension = fileExtension(fileName)
  const contentType = MIME_TYPES[extension]
  if (!file || !contentType) return { error: new Error('Jenis berkas tidak didukung untuk disimpan.') }
  const safeFolder = String(folder).replace(/[^a-z0-9/_-]/gi, '-')
  if (!isSupabaseConfigured) {
    const path = `${LOCAL_PREFIX}${safeFolder}/${randomId()}.${extension}`
    localFiles.set(path, file)
    return { path }
  }
  const path = `${safeFolder}/${randomId()}.${extension}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType, upsert: false })
  return error ? { error } : { path }
}

// Pembersihan sesudah versi dihapus; kegagalan tidak membatalkan penghapusan data.
export async function removeMasterFile(path) {
  if (!path) return
  if (path.startsWith(LOCAL_PREFIX)) {
    localFiles.delete(path)
    return
  }
  if (isSupabaseConfigured) await supabase.storage.from(BUCKET).remove([path]).catch(() => {})
}

function saveBlob(blob, fileName) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName || 'berkas'
  link.rel = 'noopener noreferrer'
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10000)
}

// Mengunduh berkas versi ke komputer pengguna. Hasil { ok } atau { ok:false, message }.
export async function downloadMasterFile(path, fileName) {
  if (!path) return { ok: false, message: 'Berkas asli versi ini tidak tersimpan (diunggah sebelum fitur unduh ulang ada).' }
  if (path.startsWith(LOCAL_PREFIX)) {
    const blob = localFiles.get(path)
    if (!blob) return { ok: false, message: 'Mode lokal: berkas hanya tersedia selama sesi browser saat diunggah.' }
    saveBlob(blob, fileName)
    return { ok: true }
  }
  const { data, error } = await supabase.storage.from(BUCKET).download(path)
  if (error || !data) return { ok: false, message: `Berkas tidak dapat diunduh${error?.message ? `: ${error.message}` : '.'}` }
  saveBlob(data, fileName)
  return { ok: true }
}
