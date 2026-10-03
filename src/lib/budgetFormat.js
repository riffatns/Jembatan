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

// Satuan ringkas untuk kartu menu akun: "Rp2,36 Miliar", "Rp215,49 Juta",
// "Rp1 Ribu", "Rp0". Angka penuh tetap tersedia lewat formatRupiah.
export function formatCompactRupiah(value) {
  const amount = Math.abs(value || 0)
  const sign = value < 0 ? '-' : ''
  const decimals = (digits) => ({ minimumFractionDigits: digits, maximumFractionDigits: digits })
  if (amount >= 1e9) return `${sign}Rp${(amount / 1e9).toLocaleString('id-ID', decimals(2))} Miliar`
  if (amount >= 1e6) return `${sign}Rp${(amount / 1e6).toLocaleString('id-ID', decimals(2))} Juta`
  if (amount >= 1e3) return `${sign}Rp${Math.round(amount / 1e3).toLocaleString('id-ID')} Ribu`
  return `${sign}Rp${THOUSANDS.format(Math.round(amount))}`
}

// Satuan miliar seragam untuk tabel rincian akun ("Rp0,45 Miliar"). Nilai
// kecil di atas nol ditulis penuh supaya tidak terbaca nol ("Rp1.004").
export function formatTableBillion(value) {
  const amount = value || 0
  if (amount !== 0 && Math.abs(amount) < 1e7) return `Rp${THOUSANDS.format(Math.round(amount))}`
  return `Rp${(amount / 1e9).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Miliar`
}

// Kartu pagu/realisasi/sisa menu akun: satuan Miliar mulai sepuluh juta
// ("Rp0,92 Miliar"), di bawahnya satuan ringkas ("Rp1 Ribu").
export function formatBillionFirst(value) {
  if (Math.abs(value || 0) >= 1e7) {
    return `${value < 0 ? '-' : ''}Rp${(Math.abs(value) / 1e9).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Miliar`
  }
  return formatCompactRupiah(value)
}
