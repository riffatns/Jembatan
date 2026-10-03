import { supabase } from './supabaseClient'

// Operasi Supabase untuk Master Data generik berversi (master-dataset.sql).
// RLS yang menolak delete tidak memberi galat, hanya 0 baris; karena itu
// delete meminta baris yang terhapus dan menghitungnya.

const VERSION_COLUMNS = 'id, dataset, action, period_month, period_year, period_label, payload, source_file_name, uploaded_by_name, created_at'
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
    uploadedByName: row.uploaded_by_name,
    createdAt: row.created_at
  }
}

export async function fetchVersions(dataset) {
  const { data, error } = await supabase
    .from('master_dataset_versions')
    .select(VERSION_COLUMNS)
    .eq('dataset', dataset)
    .order('created_at', { ascending: false })
    .limit(MAX_VERSIONS)
  if (error) return { error }
  return { error: null, versions: data.map(mapRemoteVersion) }
}

// Data rinci versi tertentu; null bila tidak ada atau pengguna tidak berhak (RLS).
export async function fetchPrivatePayload(versionId) {
  const { data, error } = await supabase.from('master_dataset_private').select('payload').eq('version_id', versionId).maybeSingle()
  if (error || !data) return null
  return data.payload
}

export async function insertVersion({ dataset, action, period, payload, privatePayload, ownerDivision, fileName, user }) {
  const { data, error } = await supabase
    .from('master_dataset_versions')
    .insert({
      dataset,
      action,
      period_month: period?.month || null,
      period_year: period?.year || null,
      period_label: period?.label || null,
      payload: payload || {},
      source_file_name: fileName || null,
      uploaded_by: user.id,
      uploaded_by_name: user.name || null
    })
    .select(VERSION_COLUMNS)
    .single()
  if (error) return { error }

  if (privatePayload && ownerDivision) {
    const result = await supabase.from('master_dataset_private').insert({
      version_id: data.id,
      dataset,
      owner_division: ownerDivision,
      payload: privatePayload
    })
    if (result.error) return { error: null, version: mapRemoteVersion(data), privateError: result.error }
  }
  return { error: null, version: mapRemoteVersion(data) }
}

export async function deleteVersionRow(id) {
  const { data, error } = await supabase.from('master_dataset_versions').delete().eq('id', id).select('id')
  if (error) return { error }
  return { error: null, deleted: Boolean(data?.length) }
}
