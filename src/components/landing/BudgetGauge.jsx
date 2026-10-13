import { formatRupiah } from '../../lib/budgetFormat'
import { useAnimatedProgress, useScrambledNumber } from '../../hooks/useAnimatedProgress'
import { FieldLabel, NeonPanel } from './NeonPanel'

// Animasi masuk kartu anggaran.
//
// Satu kemajuan 0 -> 1 menggerakkan tiga hal sekaligus: cincin terisi dari
// kosong, bilah melebar dari nol, dan persentasenya berlari naik. Dipakai satu
// sumber supaya ketiganya tiba bersamaan - kalau masing-masing punya durasi
// sendiri, cincin dan bilahnya akan selesai pada saat yang berbeda dan terbaca
// seperti tiga animasi yang kebetulan berdekatan.
//
// Nominal rupiahnya lain perlakuan: ia teracak dulu sebelum mengunci. Angka
// belasan digit yang sekadar berlari naik terbaca seperti pengukur bensin,
// sedangkan yang teracak terbaca seperti sedang dihitung.
//
// Kuncinya persentase, bukan nominal. Keduanya datang dari baris laporan yang
// sama, jadi ketika angkanya diperbarui dari Master Data seluruh kartu
// memainkan animasinya sekali lagi, bukan berpindah angka diam-diam.
const DURASI_UTAMA = 1100
const DURASI_NOMINAL = 1400

export function BudgetGauge({
  label,
  subtitle,
  icon: Icon,
  percentage,
  accent,
  primaryValue,
  secondaryValue,
  secondaryLabel,
  siap = true
}) {
  const clamped = Math.max(0, Math.min(100, percentage))

  // Animasi baru dimulai setelah angka sungguhannya datang.
  //
  // Sebelumnya kartu langsung memainkan animasi memakai angka contoh bawaan
  // (BUDGET_SUMMARY, pagu 9,76 triliun), lalu mengulang dari nol begitu angka
  // aslinya tiba. Yang terlihat: animasi tersendat di awal, sempat memajang
  // angka yang bukan angka kantor ini, baru kemudian yang benar.
  //
  // Kuncinya ikut berubah saat siap, jadi animasinya berjalan satu kali dengan
  // angka yang sudah pasti. Selama belum siap, nominalnya ditulis sebagai garis
  // - bukan Rp 0, karena nol itu angka dan garis itu "belum ada".
  const kunci = siap ? clamped : 'menunggu'
  const progress = useAnimatedProgress(kunci, DURASI_UTAMA)
  const terisi = siap ? clamped * progress : 0

  const nominalKedua = useScrambledNumber(siap ? secondaryValue : 0, DURASI_NOMINAL)
  const nominalPagu = useScrambledNumber(siap ? primaryValue : 0, DURASI_NOMINAL)

  return (
    <NeonPanel className="p-5 sm:p-6">
      <div className="min-w-0">
        <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-[1.9rem]">{label}</h2>
        <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
      </div>

      {/* Garis pemisah kepala dan isi. Sisa tinggi kartu jadi terbaca sebagai
          struktur, bukan ruang yang kebetulan kosong. */}
      <div className="mt-4 h-px bg-white/10" />

      {/* Cincin dan angkanya dipasangkan - sejajar tengah, bukan direntang ke
          dua ujung. Merentangkannya sempat membuat jaraknya acak: seratus
          piksel di satu celah, lima puluh di celah berikutnya. */}
      <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="flex shrink-0 items-center justify-center lg:w-52">
          <div
            aria-hidden="true"
            className="relative flex h-48 w-48 items-center justify-center rounded-full"
            style={{
              background: `conic-gradient(${accent} ${terisi}%, rgba(148, 163, 184, 0.14) ${terisi}% 100%)`,
              // Sorotnya ikut menyala seiring cincin terisi, jadi kartunya
              // terbaca menyala pelan, bukan langsung terang sejak frame awal.
              filter: `drop-shadow(0 0 ${20 * progress}px ${accent}40)`
            }}
          >
            <div className="absolute inset-5 rounded-full bg-[#05101f] ring-1 ring-inset ring-white/10" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-[#071429] text-sky-200 ring-1 ring-white/10">
              <Icon className="h-9 w-9" />
            </div>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          {/* tabular-nums supaya 57 dan 43 sama lebar dan tidak bergeser dari
              satu kartu ke kartu sebelahnya, juga selama angkanya masih
              berjalan naik. */}
          <div className="flex items-baseline gap-1.5">
            <span className="text-5xl font-bold tabular-nums tracking-tighter text-white sm:text-6xl">
              {Math.round(terisi)}
            </span>
            <span className="text-2xl font-medium text-sky-300/90">%</span>
          </div>

          <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-900/80 ring-1 ring-inset ring-white/10">
            <div
              className="h-full rounded-full"
              style={{
                width: `${terisi}%`,
                background: `linear-gradient(90deg, ${accent}, #7cc4ff)`,
                boxShadow: `0 0 ${14 * progress}px ${accent}88`
              }}
            />
          </div>

          {/* Daftar nominal: label di kiri, angka rata kanan, dipisah garis
              dengan tinggi baris yang sama. Tepi kanan yang sejajar itu yang
              membuatnya terbaca tertata - sebelumnya label dan angka bertumpuk
              dengan jarak yang berbeda-beda. */}
          <dl className="mt-6">
            <div className="flex items-center justify-between gap-4 border-t border-white/10 py-4">
              <dt><FieldLabel>{secondaryLabel}</FieldLabel></dt>
              <dd className="whitespace-nowrap text-lg font-semibold tabular-nums tracking-tight text-white">
                {siap ? formatRupiah(nominalKedua) : '–'}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-white/10 py-4">
              <dt><FieldLabel>Pagu</FieldLabel></dt>
              <dd className="whitespace-nowrap text-lg font-semibold tabular-nums tracking-tight text-white">
                {siap ? formatRupiah(nominalPagu) : '–'}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </NeonPanel>
  )
}
