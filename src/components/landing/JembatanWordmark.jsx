// Marka kata "JEMBATAN" beserta garis pemisah dan taglinenya.
//
// `eyebrow` berbeda di tiap halaman karena menerangkan halaman itu sendiri,
// bukan nama portalnya.
//
// Dua ukuran:
//
// - "lg" memakai tangga kelas Tailwind yang tetap (48 / 72 / 96 piksel).
//   Dipakai halaman pilih bidang.
//
// - "hero" memakai satu nilai lentur. Besarnya mengikuti lebar layar supaya
//   di desktop sebesar halaman pilih bidang, tetapi dibatasi tinggi layar
//   juga: tanpa batas itu, judul 96 piksel di laptop 1366x657 mendorong kartu
//   anggaran dan panel masuk keluar layar. Jadi yang dipakai yang terkecil
//   di antara ukuran menurut lebar dan menurut tinggi, dengan lantai 40
//   piksel supaya di ponsel tetap terbaca sebagai judul, dan langit-langit
//   96 piksel supaya tidak pernah melampaui halaman pilih bidang.
const HERO_TITLE = 'clamp(2.5rem, min(6.6vw, 9.5vh), 6rem)'

const SIZES = {
  lg: {
    title: 'mt-4 text-5xl sm:text-7xl sm:tracking-[0.14em] lg:text-8xl',
    rule: 'mt-5',
    tagline: 'mt-4 text-sm sm:text-base'
  },
  hero: {
    title: 'mt-2 tracking-[0.1em] sm:mt-3 sm:tracking-[0.14em]',
    titleStyle: { fontSize: HERO_TITLE },
    rule: 'mt-3 sm:mt-4',
    tagline: 'mt-2 text-xs sm:mt-3 sm:text-sm tall:text-base'
  }
}

export function JembatanWordmark({ eyebrow, size = 'lg', as: Heading = 'h1', className = '' }) {
  // Ukuran yang tidak dikenal jatuh ke "lg", bukan membuat seluruh halaman
  // mati. Marka kata ini dipakai di halaman masuk - satu salah ketik di sini
  // berarti tidak ada yang bisa masuk sama sekali.
  const style = SIZES[size] || SIZES.lg

  return (
    <header className={`text-center ${className}`}>
      {eyebrow && (
        <p className="text-[10px] font-medium uppercase tracking-[0.5em] text-sky-200/70 sm:text-[11px]">{eyebrow}</p>
      )}
      <Heading
        style={style.titleStyle}
        className={`font-black uppercase leading-none tracking-[0.1em] text-white drop-shadow-[0_10px_28px_rgba(0,0,0,0.55)] ${style.title}`}
      >
        Jembatan
      </Heading>
      <div
        className={`mx-auto h-px w-24 bg-gradient-to-r from-transparent via-white/45 to-transparent shadow-[0_0_18px_rgba(255,255,255,0.18)] sm:w-32 ${style.rule}`}
      />
      <p className={`mx-auto max-w-lg text-balance font-light leading-relaxed tracking-wide text-slate-200/80 ${style.tagline}`}>
        Jendela Manajemen dan Kolaborasi Kesekretariatan
      </p>
    </header>
  )
}
