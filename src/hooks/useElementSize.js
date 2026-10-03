import { useEffect, useRef, useState } from 'react'

// Ukuran piksel sebuah elemen, diperbarui saat elemen itu berubah ukuran.
// Dipakai grafik supaya kanvas SVG mengikuti ruang yang tersedia dan teksnya
// tetap berukuran asli, tidak ikut mengecil seperti skala viewBox.
export function useElementSize() {
  const ref = useRef(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const element = ref.current
    if (!element || typeof ResizeObserver === 'undefined') return undefined

    const observer = new ResizeObserver(([entry]) => {
      const width = Math.round(entry.contentRect.width)
      const height = Math.round(entry.contentRect.height)
      setSize((current) => (current.width === width && current.height === height ? current : { width, height }))
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return [ref, size]
}
