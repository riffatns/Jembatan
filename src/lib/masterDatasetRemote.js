import { supabase } from './supabaseClient'

// Operasi Supabase untuk Master Data generik berversi (master-dataset.sql).
// RLS yang menolak delete tidak memberi galat, hanya 0 baris; karena itu
// delete meminta baris yang terhapus dan menghitungnya.

const LEGACY_COLUMNS = 'id, dataset, action, period_month, period_year, period_label, payload, source_file_name, uploaded_by_name, created_at'
// source_file_path ada setelah master-berkas.sql; sebelum itu dibaca tanpa kolom ini.
const VERSION_COLUMNS = `${LEGACY_COLUMNS}, source_file_path`
const COLUMN_UNKNOWN = ['42703', 'PGRST204']
const isColumnUnknown = (error) => COLUMN_UNKNOWN.includes(error?.code)
const MAX_VERSIONS = 100

export function mapRemoteVersion(row) {
  return {
    id: row.id,
    dataset: row.dataset,
    action: row.action || 'upload',
    periodMonth: row.period_month,
    periodYear: row.period_year,
    periodLabel: row.period_label,
    payload: row.payload || {},
    sourceFileName: row.source_file_name,
    sourceFilePath: row.source_file_path || null,
    uploadedByName: row.uploaded_by_name,
    createdAt: row.created_at
  }
}

// key = nama dataset ('hr-bezetting'), atau awalan kelompok berakhiran ':'
// ('hr-diklat:') untuk memuat semua dataset per periode sekaligus.
export async function fetchVersions(key) {
  const select = (columns) => {
    const query = supabase.from('master_dataset_versions').select(columns)
    const filtered = key.endsWith(':') ? query.like('dataset', `${key}%`) : query.eq('dataset', key)
    return filtered.order('created_at', { ascending: false }).limit(MAX_VERSIONS)
  }
  let { data, error } = await select(VERSION_COLUMNS)
  if (isColumnUnknown(error)) ({ data, error } = await select(LEGACY_COLUMNS))
  if (error) return { error }
  return { error: null, versions: data.map(mapRemoteVersion) }
}

// Data rinci versi tertentu; null bila tidak ada atau pengguna tidak berhak (RLS).
export async function fetchPrivatePayload(versionId) {
  const { data, error } = await supabase.from('master_dataset_private').select('payload').eq('version_id', versionId).maybeSingle()
  if (error || !data) return null
  return data.payload
}

export async function insertVersion({ dataset, action, period, payload, privatePayload, ownerDivision, fileName, filePath, user }) {
  const row = {
    dataset,
    action,
    period_month: period?.month || null,
    period_year: period?.year || null,
    period_label: period?.label || null,
    payload: payload || {},
    source_file_name: fileName || null,
    ...(filePath && { source_file_path: filePath }),
    uploaded_by: user.id,
    uploaded_by_name: user.name || null
  }
  const { data, error } = await supabase
    .from('master_dataset_versions')
    .insert(row)
    .select(filePath ? VERSION_COLUMNS : LEGACY_COLUMNS)
    .single()
  if (error) return { error }

  if (privatePayload && ownerDivision) {
    const result = await supabase.from('master_dataset_private').insert({
      version_id: data.id,
      dataset,
      owner_division: ownerDivision,
      payload: privatePayload
    })
    // Atomik: tanpa data rinci, versi umum yang baru dibuat dibatalkan lagi.
    if (result.error) {
      await supabase.from('master_dataset_versions').delete().eq('id', data.id)
      return { error: result.error }
    }
  }
  return { error: null, version: mapRemoteVersion(data) }
}

export async function deleteVersionRow(id) {
  const { data, error } = await supabase.from('master_dataset_versions').delete().eq('id', id).select('id')
  if (error) return { error }
  return { error: null, deleted: Boolean(data?.length) }
}
