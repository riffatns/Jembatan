// Pembacaan waktu untuk halaman Akses. Murni, tanpa impor React, supaya bisa
// diuji dengan Node - halaman itu sendiri terkunci di balik penanda pengelola
// teknis, jadi logikanya tidak praktis diuji lewat antarmuka.

const WAKTU = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
})

export const MENIT = 60 * 1000
export const JAM = 60 * MENIT
export const HARI = 24 * JAM

export function formatWaktu(iso) {
  if (!iso) return '-'
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '-' : WAKTU.format(d)
}

// "Berapa lama lalu" lebih cepat dibaca daripada tanggal mentah ketika yang
// dicari adalah siapa yang baru saja memakai portal. Warnanya menandai
// kebaruan, bukan baik/buruk: hijau = baru, abu = lama, merah = belum pernah.
export function jarakWaktu(iso, sekarang = Date.now()) {
  if (!iso) return { teks: 'Belum pernah masuk', warna: 'text-[#c0262d]' }

  const waktu = new Date(iso).getTime()
  if (Number.isNaN(waktu)) return { teks: '-', warna: 'text-[#7a8aa8]' }

  const selisih = sekarang - waktu
  // Waktu di depan hari ini (jam mesin yang meleset) tetap terbaca wajar.
  if (selisih < MENIT) return { teks: 'Baru saja', warna: 'text-[#0b7a4f]' }
  if (selisih < JAM) return { teks: `${Math.round(selisih / MENIT)} menit lalu`, warna: 'text-[#0b7a4f]' }
  if (selisih < HARI) return { teks: `${Math.round(selisih / JAM)} jam lalu`, warna: 'text-[#0b7a4f]' }

  const hari = Math.round(selisih / HARI)
  return { teks: `${hari} hari lalu`, warna: hari <= 7 ? 'text-[#3f557d]' : 'text-[#7a8aa8]' }
}

// Urutan menurut waktunya, bukan menurut tulisannya.
export function nilaiWaktu(iso) {
  const waktu = iso ? new Date(iso).getTime() : 0
  return Number.isNaN(waktu) ? 0 : waktu
}

// Berapa akun yang masuk dalam rentang terakhir.
export function ringkasAkses(rows, sekarang = Date.now()) {
  const dalam = (ms) => rows.filter((r) => nilaiWaktu(r.terakhir_masuk) > 0 && sekarang - nilaiWaktu(r.terakhir_masuk) < ms).length
  return {
    total: rows.length,
    jam: dalam(JAM),
    hari: dalam(HARI),
    belum: rows.filter((r) => !r.terakhir_masuk).length
  }
}
