// Marka kata "JEMBATAN" beserta garis pemisah dan taglinenya.
//
// Dipakai halaman masuk dan halaman pilih bidang, jadi bentuknya satu dan
// tidak perlu disalin. `eyebrow` berbeda di tiap halaman karena menerangkan
// halaman itu sendiri, bukan nama portalnya.
//
// Dua ukuran:
// - "lg" untuk halaman pilih bidang, yang judulnya memang pusat perhatian;
// - "md" untuk halaman masuk, yang di bawahnya masih ada kartu anggaran dan
//   panel masuk. Di sana marka kata merapat sendiri pada layar yang tidak
//   cukup tinggi (di bawah varian `tall`), supaya halaman masuk tetap muat
//   satu layar di laptop 1366x657 - tanpa itu ia menambah sekitar 170px dan
//   halamannya mulai bisa di-scroll.
const SIZES = {
  lg: {
    title: 'mt-4 text-5xl sm:text-7xl sm:tracking-[0.14em] lg:text-8xl',
    rule: 'mt-5',
    tagline: 'mt-4 text-sm sm:text-base'
  },
  md: {
    title: 'mt-1.5 text-3xl sm:text-4xl sm:tracking-[0.13em] tall:mt-4 tall:text-6xl',
    rule: 'mt-2 tall:mt-5',
    tagline: 'mt-1.5 text-xs tall:mt-4 tall:text-base'
  }
}

export function JembatanWordmark({ eyebrow, size = 'lg', as: Heading = 'h1', className = '' }) {
  const style = SIZES[size]

  return (
    <header className={`text-center ${className}`}>
      {eyebrow && (
        <p className="text-[10px] font-medium uppercase tracking-[0.5em] text-sky-200/70 sm:text-[11px]">{eyebrow}</p>
      )}
      <Heading
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
