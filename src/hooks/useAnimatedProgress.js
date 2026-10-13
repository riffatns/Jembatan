import { useEffect, useState } from 'react'

const DEFAULT_DURATION = 1000

function prefersReducedMotion() {
  return typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
}

// Menjalankan kemajuan 0 -> 1 dengan pelandaian ease-out, lalu memanggil
// onProgress tiap frame. Mengembalikan fungsi pembatal.
//
// Peramban menghentikan requestAnimationFrame pada tab yang tidak terlihat.
// Tanpa penjagaan ini, halaman yang dibuka di tab latar mandek pada frame
// pertama - bilah kosong dan angkanya nol - sampai tabnya dibuka. Untuk bilah
// itu sekadar jelek; untuk angka rupiah itu salah, karena "Rp 0" terbaca
// sebagai nilai, bukan sebagai animasi yang belum mulai.
//
// Karena itu halaman yang tersembunyi langsung diberi nilai akhirnya tanpa
// animasi, sama seperti perlakuan untuk yang meminta gerak dikurangi. Sempat
// dicoba menunda animasinya sampai halaman terlihat, tetapi itu menggantungkan
// kebenaran angka pada satu peristiwa yang belum tentu datang. Animasi hanya
// hiasan; angka yang benar tidak.
function runProgress(duration, onProgress) {
  const tanpaAnimasi = prefersReducedMotion() || (typeof document !== 'undefined' && document.hidden)
  if (tanpaAnimasi) {
    onProgress(1, 1)
    return () => {}
  }

  let frame = 0
  let start = 0
  let dibatalkan = false

  const tick = (now) => {
    if (dibatalkan) return
    if (!start) start = now
    const elapsed = Math.min(1, (now - start) / duration)
    onProgress(1 - (1 - elapsed) ** 3, elapsed)
    if (elapsed < 1) frame = requestAnimationFrame(tick)
  }

  frame = requestAnimationFrame(tick)

  return () => {
    dibatalkan = true
    cancelAnimationFrame(frame)
  }
}

// Kemajuan animasi 0 -> 1 (ease-out), diputar ulang setiap kali `key` berubah,
// misalnya saat angka anggaran baru diunggah. Pengguna yang meminta gerak
// dikurangi di sistem operasinya langsung mendapat 1 tanpa animasi.
export function useAnimatedProgress(key, duration = DEFAULT_DURATION) {
  const [progress, setProgress] = useState(() => (prefersReducedMotion() ? 1 : 0))

  useEffect(() => {
    setProgress(prefersReducedMotion() ? 1 : 0)
    return runProgress(duration, setProgress)
  }, [key, duration])

  return progress
}

// Angka yang "berlari" dari 0 ke nilai akhirnya.
export function useCountUp(target, duration = DEFAULT_DURATION) {
  const progress = useAnimatedProgress(target, duration)
  return (target || 0) * progress
}

// Angka yang teracak dulu lalu mengunci di nilai aslinya.
//
// Bukan acak lalu melompat ke angka benar, melainkan satu gerak: nilainya
// berlari naik seperti useCountUp, ditambah derau yang amplitudonya menyusut
// mengikuti (1 - eased)^2. Di awal deraunya jauh lebih besar daripada angkanya
// sehingga terbaca teracak; menjelang akhir deraunya habis dan angkanya
// mendarat tepat di sasaran, bukan sekadar mendekat.
//
// Nilainya dihitung di dalam frame, bukan saat render, supaya render tetap
// murni - Math.random() di badan komponen akan membuat hasilnya berbeda antara
// satu render dan render berikutnya tanpa sebab yang bisa ditelusuri.
export function useScrambledNumber(target, duration = DEFAULT_DURATION) {
  const [nilai, setNilai] = useState(() => (prefersReducedMotion() ? target || 0 : 0))

  useEffect(() => {
    const akhir = target || 0
    if (!akhir) {
      setNilai(0)
      return undefined
    }

    setNilai(prefersReducedMotion() ? akhir : 0)
    return runProgress(duration, (eased, elapsed) => {
      if (elapsed === undefined || elapsed >= 1) {
        setNilai(akhir)
        return
      }
      const amplitudo = (1 - eased) ** 2 * akhir * 0.65
      setNilai(Math.max(0, Math.round(akhir * eased + (Math.random() - 0.5) * 2 * amplitudo)))
    })
  }, [target, duration])

  return nilai
}
