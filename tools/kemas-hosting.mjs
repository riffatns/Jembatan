// Membuat paket siap unggah ke Hostinger:
//
//     npm run kemas      ->  jembatan-hosting.zip di akar repo
//
// Isinya diekstrak ke public_html. Vercel tidak memerlukan ini - ia membangun
// sendiri dari main; skrip ini hanya untuk Hostinger, yang tidak tahu apa-apa
// soal GitHub dan harus diunggah manual setiap kali ada perubahan.
//
// Yang membuat skrip ini bukan sekadar kenyamanan adalah pemeriksaannya.
// Dua cara gagal yang paling sering, keduanya diam-diam:
//
//   1. Build tanpa .env.local. Alamat dan kunci Supabase ditanam ke dalam JS
//      saat build, bukan dibaca saat dijalankan. Hasilnya tetap terbuka di
//      peramban, tetapi jatuh ke mode contoh: semua data kosong, tanpa satu
//      pun pesan galat.
//
//   2. .htaccess tidak ikut. Halaman depan jalan, tetapi menekan refresh di
//      /dashboard menghasilkan 404.
//
// Keduanya baru ketahuan setelah portalnya terpasang dan dibuka orang. Skrip
// ini menolak membuat paket bila salah satunya terjadi.
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs'
import { join } from 'node:path'

const AKAR = process.cwd()
const DIST = join(AKAR, 'dist')
const KELUARAN = join(AKAR, 'jembatan-hosting.zip')

const merah = (t) => `\x1b[31m${t}\x1b[0m`
const hijau = (t) => `\x1b[32m${t}\x1b[0m`
const abu = (t) => `\x1b[90m${t}\x1b[0m`

function berhenti(pesan, saran) {
  console.error(`\n${merah('GAGAL')} ${pesan}`)
  if (saran) console.error(`\n${saran}\n`)
  process.exit(1)
}

function langkah(nomor, teks) {
  console.log(`\n${abu(`[${nomor}/5]`)} ${teks}`)
}

// --------------------------------------------------- 1. periksa .env.local
langkah(1, 'Memeriksa .env.local')

const envPath = join(AKAR, '.env.local')
if (!existsSync(envPath)) {
  berhenti('.env.local tidak ada.',
    'Alamat dan kunci Supabase ditanam ke dalam JS saat build. Tanpa berkas ini\n' +
    'paketnya akan jadi, tetapi portalnya kosong tanpa pesan galat.\n' +
    'Salin .env.example menjadi .env.local lalu isi nilainya.')
}

const env = readFileSync(envPath, 'utf8')
const ambil = (nama) => (env.match(new RegExp(`^${nama}=(.+)$`, 'm')) || [])[1]?.trim()

const url = ambil('VITE_SUPABASE_URL')
const kunci = ambil('VITE_SUPABASE_ANON_KEY')

if (!url || !/^https:\/\/\S+\.supabase\.co/.test(url) || url.includes('your-project-ref')) {
  berhenti('VITE_SUPABASE_URL di .env.local belum diisi alamat Supabase yang sah.',
    'Nilainya sekarang: ' + (url || '(kosong)'))
}
if (!kunci || kunci.length < 40 || kunci.includes('your-supabase')) {
  berhenti('VITE_SUPABASE_ANON_KEY di .env.local belum diisi.',
    'Pakai kunci anon (publishable), bukan service role - kunci service role\n' +
    'tidak boleh pernah masuk ke berkas yang dikirim ke peramban.')
}

const inangSupabase = new URL(url).host
console.log(`      Supabase: ${inangSupabase}`)

// ------------------------------------------------------------- 2. build
langkah(2, 'Membangun aplikasi (npm run build)')

if (existsSync(DIST)) rmSync(DIST, { recursive: true, force: true })

const build = spawnSync('npm', ['run', 'build'], { cwd: AKAR, stdio: 'inherit', shell: true })
if (build.status !== 0) berhenti('npm run build gagal. Perbaiki galatnya lebih dulu.')

// ----------------------------------------------- 3. periksa hasil build
langkah(3, 'Memeriksa hasil build')

if (!existsSync(join(DIST, 'index.html'))) berhenti('dist/index.html tidak terbentuk.')

if (!existsSync(join(DIST, '.htaccess'))) {
  berhenti('dist/.htaccess tidak ada.',
    'Berkas itu seharusnya disalin dari public/.htaccess oleh Vite.\n' +
    'Tanpa itu, menekan refresh di /dashboard akan menghasilkan 404 di Hostinger.')
}

// Bukti bahwa .env.local benar-benar terbaca saat build: alamat Supabase
// harus muncul di dalam berkas JS yang dihasilkan.
const assets = join(DIST, 'assets')
const berkasJs = existsSync(assets) ? readdirSync(assets).filter((n) => n.endsWith('.js')) : []
const tertanam = berkasJs.some((n) => readFileSync(join(assets, n), 'utf8').includes(inangSupabase))

if (!tertanam) {
  berhenti('Alamat Supabase tidak ditemukan di dalam hasil build.',
    'Artinya .env.local tidak terbaca saat build, dan portalnya akan jalan\n' +
    'dalam mode contoh: terbuka, tetapi semua data kosong.')
}
console.log(`      ${hijau('OK')} index.html, .htaccess, dan alamat Supabase tertanam`)

// -------------------------------------------------------------- 4. kemas
langkah(4, 'Mengemas menjadi jembatan-hosting.zip')

if (existsSync(KELUARAN)) rmSync(KELUARAN, { force: true })

try {
  if (process.platform === 'win32') {
    execFileSync('powershell', ['-NoProfile', '-Command',
      `Compress-Archive -Path 'dist\\*' -DestinationPath '${KELUARAN}' -Force`],
    { cwd: AKAR, stdio: 'inherit' })
  } else {
    execFileSync('zip', ['-qr', KELUARAN, '.'], { cwd: DIST, stdio: 'inherit' })
  }
} catch {
  berhenti('Pengemasan gagal.',
    process.platform === 'win32'
      ? 'PowerShell tidak bisa dijalankan. Kemas manual: pilih seluruh isi dist/,\nklik kanan, Send to > Compressed (zipped) folder.'
      : 'Perintah zip tidak ada. Pasang dulu: sudo apt install zip')
}

// ------------------------------------------------------------ 5. verifikasi
langkah(5, 'Memeriksa isi paket')

if (!existsSync(KELUARAN)) berhenti('Berkas zip tidak terbentuk.')

// Nama berkas tersimpan apa adanya di dalam zip, jadi bisa diperiksa tanpa
// membongkarnya - cukup untuk memastikan berkas tersembunyi ikut terbawa.
const isi = readFileSync(KELUARAN)
if (!isi.includes('.htaccess')) {
  berhenti('.htaccess tidak ikut ke dalam zip.',
    'Kemas manual dan pastikan berkas tersembunyi ikut terpilih.')
}

const mb = (statSync(KELUARAN).size / 1024 / 1024).toFixed(2)
console.log(`      ${hijau('OK')} .htaccess ikut di dalam paket`)

console.log(`
${hijau('Paket siap:')} jembatan-hosting.zip  (${mb} MB)

Langkah di Hostinger:
  1. hPanel > File Manager > public_html, kosongkan isinya
  2. Unggah zip ini, lalu Extract di situ
     Hasilnya harus public_html/index.html, bukan public_html/dist/index.html
  3. Settings > Show hidden files, pastikan .htaccess benar-benar ada
  4. Aktifkan SSL dan paksa HTTPS

Lalu uji: buka /dashboard dan tekan refresh, login dengan username,
login dengan email, dan buka satu menu berisi angka.
`)
