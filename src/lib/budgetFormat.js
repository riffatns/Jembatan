// Cara menulis angka anggaran di Dashboard Anggaran. Satu tempat, supaya
// kartu, grafik, dan tabel selalu menulis angka yang sama dengan cara yang sama.

const THOUSANDS = new Intl.NumberFormat('id-ID')

export function formatRupiah(value) {
  return `Rp ${THOUSANDS.format(Math.round(value || 0))}`
}

// Satuan miliar untuk label grafik. Nilai di bawah sepuluh juta ditulis penuh:
// sisa Rp 1.004 yang tampil sebagai "Rp 0,00 M" terbaca seperti nol.
export function formatBillion(value) {
  if (Math.abs(value || 0) < 1e7) return formatRupiah(value)
  const billions = (value / 1e9).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return `Rp ${billions} M`
}

export function formatPercent(value, digits = 1) {
  return `${(value || 0).toLocaleString('id-ID', { minimumFractionDigits: digits, maximumFractionDigits: digits })}%`
}

// 99,9999% tidak boleh dibulatkan jadi "100,0%" selama sisanya masih ada.
export function formatAbsorption(percent) {
  if (percent >= 99.95 && percent < 100) return '99,99%'
  return formatPercent(percent)
}
