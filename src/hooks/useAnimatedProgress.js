import { useEffect, useState } from 'react'

const DEFAULT_DURATION = 1000

function prefersReducedMotion() {
  return typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
}

// Kemajuan animasi 0 -> 1 (ease-out), diputar ulang setiap kali `key` berubah,
// misalnya saat angka anggaran baru diunggah. Pengguna yang meminta gerak
// dikurangi di sistem operasinya langsung mendapat 1 tanpa animasi.
export function useAnimatedProgress(key, duration = DEFAULT_DURATION) {
  const [progress, setProgress] = useState(() => (prefersReducedMotion() ? 1 : 0))

  useEffect(() => {
    if (prefersReducedMotion()) {
      setProgress(1)
      return undefined
    }

    let frame = 0
    const start = performance.now()
    const tick = (now) => {
      const elapsed = Math.min(1, (now - start) / duration)
      setProgress(1 - (1 - elapsed) ** 3)
      if (elapsed < 1) frame = requestAnimationFrame(tick)
    }
    setProgress(0)
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [key, duration])

  return progress
}

// Angka yang "berlari" dari 0 ke nilai akhirnya.
export function useCountUp(target, duration = DEFAULT_DURATION) {
  const progress = useAnimatedProgress(target, duration)
  return (target || 0) * progress
}
