import { useLayoutEffect, useRef, useState } from 'react'

// Ukuran piksel sebuah elemen, diperbarui saat elemen itu berubah ukuran.
// Dipakai grafik supaya kanvas SVG mengikuti ruang yang tersedia dan teksnya
// tetap berukuran asli, tidak ikut mengecil seperti skala viewBox.
//
// Ukuran pertama dibaca langsung saat dipasang, tidak menunggu ResizeObserver.
// ResizeObserver baru berbunyi pada langkah penggambaran berikutnya, jadi di
// tab yang sedang tidak digambar - jendela tertutup jendela lain, misalnya -
// grafiknya bisa tertinggal kosong selamanya. Setelah itu observer tetap yang
// mengurus perubahan ukuran berikutnya.
export function useElementSize() {
  const ref = useRef(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return undefined

    const terapkan = (width, height) => {
      setSize((current) => (current.width === width && current.height === height ? current : { width, height }))
    }

    const kotak = element.getBoundingClientRect()
    terapkan(Math.round(kotak.width), Math.round(kotak.height))

    if (typeof ResizeObserver === 'undefined') return undefined

    const observer = new ResizeObserver(([entry]) => {
      terapkan(Math.round(entry.contentRect.width), Math.round(entry.contentRect.height))
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return [ref, size]
}
