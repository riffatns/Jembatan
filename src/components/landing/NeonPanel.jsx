// Panel kaca. Bingkainya satu garis rambut, ditambah sorot tipis di tepi atas
// seperti tepi kaca yang menangkap cahaya.
//
// Sebelumnya ada bingkai kedua di dalam panel, sejajar sejarak sepuluh piksel.
// Dua garis sejajar sama-sama terbaca sebagai tepi, jadi batas panelnya jadi
// kabur. Satu garis saja lebih tegas.
export function NeonPanel({ className = '', children }) {
  return (
    <div
      className={`relative overflow-hidden rounded-[30px] bg-[#071429]/90 shadow-[0_28px_80px_-24px_rgba(2,10,26,0.95)] ring-1 ring-white/10 backdrop-blur-xl ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.11),transparent_36%)]" />
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-sky-200/55 to-transparent" />
      <div className="relative">{children}</div>
    </div>
  )
}

// Label kecil berhuruf besar di atas nominal. Memberi hierarki tanpa menambah
// warna, sehingga angkanya tetap yang paling menonjol. Dipakai di kartu
// anggaran maupun panel masuk, supaya ketiganya terbaca satu keluarga.
export function FieldLabel({ children, className = '' }) {
  return (
    <p className={`text-[10px] font-medium uppercase tracking-[0.22em] text-sky-200/60 ${className}`}>
      {children}
    </p>
  )
}
