import { supabase } from './supabaseClient'
import { toRemoteBudget } from './budgetStorage'
import { mapRemoteUpload, reportToBudget, toRemoteReport } from './budgetReportStorage'

// Operasi Supabase untuk Master Data Anggaran yang dipakai BudgetReportContext.
// RLS yang menolak delete tidak memberi galat, hanya 0 baris; karena itu
// setiap delete meminta baris yang terhapus dan menghitungnya.

const COLUMN_MISSING = 'PGRST204'

// Mencatat riwayat unggah. Bila kolom baru (report/action) belum ada karena
// SQL-nya belum dijalankan, catatan tetap disimpan tanpa kolom itu.
export async function insertUploadLog(row) {
  const result = await supabase.from('budget_report_uploads').insert(row)
  if (result.error?.code !== COLUMN_MISSING) return result
  const { report: _report, action: _action, source_file_path: _path, ...legacyRow } = row
  return supabase.from('budget_report_uploads').insert(legacyRow)
}

// Menjadikan laporan sebagai data aktif TA-nya, termasuk ringkasan 51/52/53
// di budget_snapshots untuk menu lama.
export async function applyReport(report, user) {
  const { error } = await supabase.from('budget_reports').upsert(toRemoteReport(report, user), { onConflict: 'fiscal_year' })
  if (error) return { error }
  const snapshot = await supabase.from('budget_snapshots').upsert(toRemoteBudget(reportToBudget(report)), { onConflict: 'fiscal_year' })
  return { error: null, followUpError: snapshot.error }
}

export async function deleteActiveReport(fiscalYear) {
  const { data, error } = await supabase.from('budget_reports').delete().eq('fiscal_year', fiscalYear).select('fiscal_year')
  if (error) return { error }
  return { error: null, deleted: Boolean(data?.length) }
}

export async function deleteUploadRow(id) {
  const { data, error } = await supabase.from('budget_report_uploads').delete().eq('id', id).select('id')
  if (error) return { error }
  return { error: null, deleted: Boolean(data?.length) }
}

// Unggahan terbaru yang tersisa (dan menyimpan isi laporan) untuk satu TA.
export async function fetchLatestVersion(fiscalYear) {
  const { data, error } = await supabase
    .from('budget_report_uploads')
    .select('*')
    .eq('fiscal_year', fiscalYear)
    .eq('action', 'upload')
    .not('report', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1)
  if (error || !data?.length) return null
  return mapRemoteUpload(data[0])
}
