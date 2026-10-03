import { MONTH_NAMES } from './budgetReportParser'

// Laporan Master Data Anggaran per tahun anggaran: pemetaan ke/dari tabel
// budget_reports, cadangan localStorage untuk mode tanpa Supabase, dan
// adaptor ke bentuk `budget` lama supaya dashboard dan menu lama ikut sama.

const REPORTS_KEY = 'bpk-dashboard-budget-reports'

export function periodLabel(periodMonth, fiscalYear) {
  return `${MONTH_NAMES[periodMonth - 1] || '-'} ${fiscalYear}`
}

export function loadStoredReports() {
  try {
    const saved = JSON.parse(localStorage.getItem(REPORTS_KEY) || '{}')
    return saved && typeof saved === 'object' ? saved : {}
  } catch {
    return {}
  }
}

export function saveStoredReports(reports) {
  try {
    localStorage.setItem(REPORTS_KEY, JSON.stringify(reports))
  } catch {
    // Kuota penuh atau diblokir: laporan tetap hidup di memori sesi ini.
  }
}

export function mapRemoteReport(row) {
  return {
    fiscalYear: row.fiscal_year,
    periodMonth: row.period_month,
    periodLabel: row.period_label || periodLabel(row.period_month, row.fiscal_year),
    satker: row.satker,
    accounts: Array.isArray(row.accounts) ? row.accounts : [],
    groups: row.groups || {},
    totals: row.totals || {},
    sourceFileName: row.source_file_name,
    uploadedByName: row.uploaded_by_name,
    updatedAt: row.updated_at
  }
}

export function toRemoteReport(report, user) {
  return {
    fiscal_year: report.fiscalYear,
    period_month: report.periodMonth,
    period_label: report.periodLabel,
    satker: report.satker,
    accounts: report.accounts,
    groups: report.groups,
    totals: report.totals,
    source_file_name: report.sourceFileName,
    uploaded_by: user.id,
    uploaded_by_name: user.name || null,
    updated_at: report.updatedAt
  }
}

export function toRemoteUpload(report, user, action = 'upload') {
  return {
    // Kolom action baru ada setelah anggaran-master-hapus.sql; unggahan biasa
    // memakai nilai bawaan 'upload' supaya tetap jalan sebelum SQL itu dijalankan.
    ...(action !== 'upload' && { action }),
    fiscal_year: report.fiscalYear,
    period_month: report.periodMonth,
    source_file_name: report.sourceFileName,
    account_count: report.accounts.length,
    totals: report.totals,
    uploaded_by: user.id,
    uploaded_by_name: user.name || null
  }
}

export function mapRemoteUpload(row) {
  return {
    id: row.id,
    action: row.action || 'upload',
    fiscalYear: row.fiscal_year,
    periodMonth: row.period_month,
    sourceFileName: row.source_file_name,
    accountCount: row.account_count,
    totals: row.totals || {},
    uploadedByName: row.uploaded_by_name,
    createdAt: row.created_at
  }
}

// Bentuk `budget` lama (budgetStorage.js) dari laporan: total seluruh akun
// 51/52/53 dan rincian per kode, supaya Dashboard dan menu lama memakai angka
// yang sama persis dengan menu akun.
export function reportToBudget(report) {
  const breakdown = ['51', '52', '53'].map((code) => {
    const group = report.groups?.[code] || {}
    return { code, pagu: group.pagu || 0, realisasi: group.realisasi || 0, sisa: group.sisa || 0 }
  })
  const totalPagu = breakdown.reduce((sum, row) => sum + row.pagu, 0)
  const totalRealisasi = breakdown.reduce((sum, row) => sum + row.realisasi, 0)
  const totalSisa = breakdown.reduce((sum, row) => sum + row.sisa, 0)

  return {
    fiscalYear: report.fiscalYear,
    totalPagu,
    totalRealisasi,
    totalSisa,
    realisasiPercent: totalPagu ? (totalRealisasi / totalPagu) * 100 : 0,
    sisaPercent: totalPagu ? (totalSisa / totalPagu) * 100 : 0,
    updatedAt: report.updatedAt,
    breakdown
  }
}
