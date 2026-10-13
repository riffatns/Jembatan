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

// Satuan yang mengikuti besar angkanya: "Rp2,36 Miliar", "Rp215,49 Juta",
// "Rp37.000". Satu-satunya cara menulis angka ringkas di aplikasi ini.
//
// Memaksa semuanya ke miliar membuat angka kecil rata jadi "Rp0,19 Miliar" -
// pembaca harus menghitung sendiri bahwa itu seratus sembilan puluh juta, dan
// deretan "Rp0,02 / Rp0,03 / Rp0,02" tidak lagi bisa dibedakan satu sama lain.
//
// Di bawah satu juta angkanya ditulis utuh, tidak dibulatkan ke ribuan: pada
// besaran itu angka penuhnya justru lebih pendek sekaligus tepat - "Rp37.000"
// lebih baik daripada "Rp37 Ribu", dan "Rp13.189" tidak kehilangan apa pun.
export function formatCompactRupiah(value) {
  const amount = Math.abs(value || 0)
  const sign = value < 0 ? '-' : ''
  const decimals = (digits) => ({ minimumFractionDigits: digits, maximumFractionDigits: digits })
  if (amount >= 1e9) return `${sign}Rp${(amount / 1e9).toLocaleString('id-ID', decimals(2))} Miliar`
  if (amount >= 1e6) return `${sign}Rp${(amount / 1e6).toLocaleString('id-ID', decimals(2))} Juta`
  return `${sign}Rp${THOUSANDS.format(Math.round(amount))}`
}
