import { MONTH_NAMES } from '../../../lib/budgetReportParser'

// Judul tiap kelompok belanja; sama dengan nama layanannya di sidebar Keuangan.
export const ACCOUNT_GROUPS = {
  51: { title: 'Belanja Pegawai' },
  52: { title: 'Belanja Barang' },
  53: { title: 'Belanja Modal' }
}

// Ambang warna status realisasi, mengikuti rancangan: hijau >= 60%,
// kuning 30-60%, merah < 30%. Warna selalu didampingi angka persennya.
export const STATUS_STYLES = {
  good: { bar: '#1fae7a', chipBg: '#dcf5e8', chipText: '#0b7a4f' },
  warning: { bar: '#f5b81c', chipBg: '#fff1cc', chipText: '#9a6400' },
  critical: { bar: '#ef4444', chipBg: '#fde2e2', chipText: '#c0262d' }
}

export function statusOf(percent) {
  if (percent >= 60) return 'good'
  if (percent >= 30) return 'warning'
  return 'critical'
}

function toPercent(part, whole) {
  return whole ? (part / whole) * 100 : 0
}

// "Belanja Tunj. Beras PNS" -> "Tunj. Beras PNS" untuk daftar yang sempit.
export function shortAccountName(name) {
  return String(name || '').replace(/^Belanja\s+/i, '')
}

export function buildAccountModel(report, groupCode) {
  const group = report?.groups?.[groupCode]
  const accounts = (report?.accounts || [])
    .filter((account) => account.group === groupCode)
    .map((account) => {
      const absorption = toPercent(account.realisasi, account.pagu)
      return { ...account, absorption, status: statusOf(absorption) }
    })
    .sort((a, b) => b.pagu - a.pagu || a.code.localeCompare(b.code))

  const total = {
    pagu: group?.pagu || 0,
    realisasi: group?.realisasi || 0,
    realisasiIni: group?.realisasiIni || 0,
    sisa: group?.sisa || 0
  }

  return {
    hasData: Boolean(report) && accounts.length > 0,
    groupCode,
    title: ACCOUNT_GROUPS[groupCode]?.title || `Akun ${groupCode}`,
    fiscalYear: report?.fiscalYear || null,
    monthName: report ? MONTH_NAMES[report.periodMonth - 1] : null,
    total,
    absorption: toPercent(total.realisasi, total.pagu),
    accounts
  }
}
