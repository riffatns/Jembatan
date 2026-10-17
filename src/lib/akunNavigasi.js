// Halaman akun (Profil, Akses Pengguna) berdiri di luar alur bidang: keduanya
// tidak punya layanan, tidak punya dashboard, dan tidak ada hubungannya dengan
// bidang mana yang sedang dibuka. Karena itu keduanya memakai sidebar sendiri.
//
// Tombol kembali di sidebar itu harus mengembalikan pengguna ke tempat ia
// berangkat, bukan ke dashboard secara membabi buta: orang yang membuka
// profilnya dari menu Aset ingin kembali ke Aset.
//
// Dipakai navigate(-1)? Tidak: riwayat peramban bisa membawa keluar aplikasi
// bila halaman akun dibuka langsung dari tautan, dan bisa memantul bolak-balik
// antara dua halaman akun. Yang diingat di sini hanya satu: halaman bukan-akun
// terakhir yang benar-benar dibuka.

export const RUTE_AKUN = ['/profile', '/dashboard/akses']

const KUNCI = 'bpk-dashboard-sebelum-akun'
const BAWAAN = '/dashboard'

export function isRuteAkun(path) {
  return RUTE_AKUN.includes(path)
}

export function ingatHalamanSebelumAkun(path) {
  if (!path || isRuteAkun(path)) return
  try {
    sessionStorage.setItem(KUNCI, path)
  } catch {
    // Penyimpanan diblokir: tombol kembali jatuh ke dashboard. Tidak fatal.
  }
}

export function halamanKembali() {
  try {
    const tersimpan = sessionStorage.getItem(KUNCI)
    // Jangan pernah kembali ke halaman akun lain - itu bukan "kembali".
    if (tersimpan && !isRuteAkun(tersimpan)) return tersimpan
  } catch {
    // jatuh ke bawaan
  }
  return BAWAAN
}
