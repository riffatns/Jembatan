# CLAUDE.md — Aturan kerja Portal JEMBATAN

Berkas ini dibaca oleh Claude Code (dan sebaiknya oleh siapa pun yang menulis
kode di repo ini) sebelum mengubah apa pun. Tujuannya satu: setiap perubahan,
siapa pun yang membuatnya, terasa ditulis oleh satu tim yang sama.

Kalau aturan di sini bertentangan dengan permintaan pengguna, ikuti pengguna
dan sebutkan bentroknya. Kalau aturan bertentangan dengan kode lama, kode lama
dibiarkan; aturan berlaku untuk kode yang baru ditulis atau sedang disentuh.

## Proyek singkat

- Portal internal kesekretariatan BPK Perwakilan Papua Barat Daya.
- React 18 + Vite 5 (JavaScript, bukan TypeScript), Tailwind 3, React Router 6,
  lucide-react, Recharts, xlsx. Backend Supabase (Postgres + RLS + Storage +
  Realtime). Deploy Vercel.
- **Push ke `main` = langsung rilis ke pengguna.** Selalu kerja di branch
  `feat/...` atau `fix/...`, cek preview Vercel, baru gabung ke `main`.
- Tanpa `.env.local` aplikasi jalan dalam mode contoh (localStorage, akun demo
  `admin`/`admin123`). Mode ini hanya untuk pengembangan lokal.

```bash
npm ci            # pasang dependensi persis sesuai lockfile
npm run dev       # http://localhost:5173
npm run build     # WAJIB lulus sebelum commit
```

Belum ada ESLint, Prettier, atau tes otomatis. Sampai ada, `npm run build`
lulus dan uji manual di browser adalah syarat minimum setiap perubahan.

## Peta kode

| Lokasi | Isi |
|---|---|
| `src/pages/` | Satu berkas per rute, default export, dimuat `lazy()` di `App.jsx` |
| `src/components/<domain>/` | Komponen per domain: `agenda`, `asset`, `budget`, `documents`, `hr`, `legal`, `layout`, `ui` |
| `src/components/ui/` | Primitif gaya shadcn (nama berkas huruf kecil: `button.jsx`) |
| `src/context/` | `AuthContext` (login, peran) dan `DataContext` (semua data + realtime) |
| `src/lib/*Storage.js` | Muat/simpan satu domain: localStorage, pemetaan baris Supabase (`mapRemoteX`/`toRemoteX`) |
| `src/lib/*Workbook.js`, `parseExcel*.js` | Membaca berkas Excel |
| `src/data/` | Konstanta, palet, metadata layanan, data contoh (`seed.js`) |
| `supabase/` | SQL manual. `jalankan-semua.sql` = gabungan semua migrasi susulan, idempoten |

## Aturan 1 — Penamaan konsisten

Repo ini dua bahasa. Pembagiannya sudah terbentuk dan harus dijaga:

| Hal | Aturan | Contoh |
|---|---|---|
| Komponen & berkasnya | PascalCase, bahasa Inggris, named export | `BudgetKpiCards.jsx` → `export function BudgetKpiCards` |
| Halaman | PascalCase, default export, tanpa akhiran `Page` | `BudgetDashboard.jsx` |
| Fungsi, variabel, hook | camelCase bahasa Inggris; hook diawali `use` | `buildBudgetModel`, `refreshBudget`, `useChartTooltip` |
| Konstanta | UPPER_SNAKE_CASE | `SERIES_COLORS`, `CARD_CLASS` |
| Berkas `lib` | camelCase; `<domain>Storage.js` untuk simpan/muat, `<domain>Workbook.js` untuk Excel | `budgetStorage.js`, `assetWorkbook.js` |
| Istilah domain di data | Tetap bahasa Indonesia, jangan diterjemahkan | `pagu`, `realisasi`, `sisa`, `bezetting`, `kode_barang` |
| Tabel & kolom Supabase | snake_case; nama tabel bahasa Inggris | `budget_snapshots.total_pagu` |
| Id bidang | Inggris, sudah tetap | `finance`, `hr`, `legal`, `pr`, `it` |
| Id layanan/kategori | slug Indonesia, sudah tetap | `realisasi-anggaran`, `arsip` |
| Komentar & teks UI | Bahasa Indonesia, menjelaskan **kenapa**, bukan apa | lihat `BudgetOverview.jsx` |
| Commit | Conventional Commits, subjek bahasa Indonesia | `feat(budget): dashboard anggaran baru` |
| Scope commit | Nama folder domain bahasa Inggris | `budget`, `asset`, `hr`, `documents`, `sidebar` |

- Jangan mengganti nama identifier lama hanya demi konsistensi. Kode lama yang
  memakai nama Indonesia (`bacaLokal`, `memuat`, `TAMPILKAN_SUMBER_ANGKA`)
  dibiarkan kecuali berkasnya memang sedang dirombak atas permintaan.
- Satu konsep satu nama. Contoh yang sudah terlanjur ganda: objek user punya
  `division` dan `division_id`. Kode baru membaca `user.division`.
- Fungsi format angka anggaran untuk kode baru ada di `src/lib/budgetFormat.js`
  (`formatRupiah`, `formatBillion`, `formatPercent`, `formatAbsorption`).
  Pakai itu, jangan menulis formatter baru.

## Aturan 2 — Batas ukuran dan modularitas

| Ukuran | Batas |
|---|---|
| Berkas komponen / halaman | sasaran ≤ 250 baris, maksimum 300 |
| Berkas `lib` / `data` | maksimum 300 baris (kecuali data contoh `seed.js`) |
| Satu fungsi / komponen | ≤ 80 baris; lebih dari itu pecah jadi subkomponen |
| Satu baris | ≤ 160 karakter; `className` panjang boleh, logika jangan |

- Halaman = komposisi tipis. Logika hitung ditaruh di model murni
  (contoh `components/budget/dashboard/budgetDashboardModel.js`), tampilan di
  komponen kecil, gaya bersama di satu berkas tema (`dashboardTheme.js`).
- Satu fitur baru = satu folder (`components/<domain>/<fitur>/`), bukan
  tambahan ratusan baris ke berkas yang sudah besar.
- Berkas yang **sudah** melewati batas — jangan ditambah lagi kecuali
  beberapa baris penyambung (rute, tombol menu, satu callback):
  `seed.js` 858, `HrOverview.jsx` 634, `Sidebar.jsx` 517, `DataContext.jsx` 495,
  `agendaStorage.js` 475, `DivisionWorkspace.jsx` 466, `DocumentUploadModal.jsx` 405.
  Kalau sebuah tugas harus mengubah banyak di sana, keluarkan bagian yang
  diubah ke modul baru dulu, dalam commit terpisah.
- Cek cepat sebelum commit:
  `find src -name '*.js*' | xargs wc -l | sort -rn | awk '$1>300'`

## Aturan 3 — Keamanan dulu

1. **Hak akses ditegakkan di Supabase (RLS), bukan di React.** Menyembunyikan
   tombol hanya kenyamanan. Setiap tabel atau bucket baru wajib punya kebijakan
   `select`, `insert`, `update`, `delete` yang eksplisit dalam SQL yang sama.
2. Hanya kunci **anon** di klien (`VITE_SUPABASE_ANON_KEY`). Kunci service role
   tidak boleh ada di kode, `.env*` yang di-commit, maupun variabel `VITE_*`.
3. Jangan menyimpan kata sandi, token, atau data pribadi di localStorage atau
   sessionStorage. (Ada pelanggaran lama, lihat Temuan terbuka.)
4. Tidak ada `dangerouslySetInnerHTML`, `innerHTML`, `eval`, atau `new Function`.
   Isi tooltip dan pesan berupa node React. `href` hanya dari URL bertanda tangan
   Supabase atau rute internal; tolak skema `javascript:`.
5. Setiap `target="_blank"` memakai `rel="noopener noreferrer"`.
6. Unggahan berkas: periksa ekstensi **dan** MIME **dan** ukuran di klien, dan
   batasi juga di bucket (`file_size_limit`, `allowed_mime_types`). Isi Excel
   diperlakukan sebagai data tak tepercaya: baca nilainya, jangan pernah
   dieksekusi atau disisipkan sebagai HTML.
7. Dependensi baru wajib dicek `npm audit --omit=dev`; jangan menambah paket
   yang punya advisory high/critical tanpa persetujuan.
8. Jangan menaruh data sensitif di `public/` — semua isinya bisa diunduh
   tanpa login.
9. Rahasia (kata sandi akun, kunci) tidak pernah ditulis di SQL yang
   di-commit. Pakai placeholder seperti `GANTI_SAYA` yang diisi saat dijalankan.

## Aturan 4 — RBAC yang sudah ada

Peran (`profiles.role`): `admin`, `employee`, `viewer`. Bidang pengguna:
`profiles.division_id`. Klien membacanya dari baris `profiles`; RLS membacanya
lewat fungsi `public.current_profile_role()` dan `public.current_profile_division()`.

| Aksi | Siapa (maksud desain) | Penegak |
|---|---|---|
| Baca data bidang | semua pengguna yang login | RLS `select to authenticated` |
| Unggah/ubah dokumen, agenda, aset, angka bidang | admin, atau pegawai bidang itu | RLS + `canUploadToDivision` |
| Ubah angka anggaran (`budget_snapshots`) | admin, atau bidang `finance` | RLS di `anggaran.sql` |
| Menyetujui/menolak | admin | rute `/approvals` (klien) + RLS |
| `viewer` | hanya membaca | **belum ditegakkan**, lihat Temuan terbuka |

Saat menambah fitur:
- Pakai helper yang ada (`useAuth().isAdmin`, `canUploadToDivision(divisionId)`,
  `ProtectedRoute roles={['admin']}`) untuk tampilan, lalu pastikan kebijakan
  RLS yang setara ada. Fitur yang hanya dijaga di klien = belum selesai.
- Fitur baca-saja (seperti Dashboard Anggaran) cukup memakai data yang sudah
  lolos RLS `select`; jangan membuka jalan tulis baru.
- Kebijakan RLS baru memakai pola yang sama:
  `public.current_profile_role() = 'admin' or public.current_profile_division() = <kolom bidang>`.

## Aturan 5 — Jangan mengganggu logika yang sudah ada

- Perubahan bersifat **menambah**. Fitur pengganti dibuat berdampingan dulu
  (contoh: menu "Dashboard Anggaran" baru di samping Dashboard lama), yang lama
  dilepas di commit terpisah setelah disetujui.
- Jangan mengubah tanda tangan fungsi/komponen yang diekspor, nama key
  localStorage/sessionStorage (`bpk-dashboard-*`), nama event
  (`bpk-dashboard-category-change`), id bidang/layanan, atau kolom tabel.
- Refaktor hanya bila perilakunya identik dan dibuktikan dengan uji manual
  alur yang sama sebelum dan sesudah.
- SQL: jangan mengubah isi migrasi lama. Tambah berkas baru yang idempoten
  (`if not exists`, `drop policy if exists`, blok `do ... exception`), lalu
  salin bagian yang sama ke `jalankan-semua.sql` beserta baris pemeriksaannya.
  Akhiri dengan `notify pgrst, 'reload schema';` bila kolom berubah.
- Realtime: tabel baru yang perlu sinkron harus ditambahkan ke publikasi
  `supabase_realtime` dan didengarkan di kanal `dashboard-data-sync` (`DataContext`).

## Alur kerja per perubahan

1. Baca berkas yang akan diubah dan pemanggilnya. Ikuti gaya berkas itu.
2. Buat branch dari `main` terbaru.
3. Tulis kode sesuai aturan di atas.
4. `npm run build` lulus.
5. Uji manual di browser: alur yang diubah **dan** alur lama di sekitarnya
   (mis. ubah dashboard → cek juga unggah berkas, sidebar, Dashboard lama).
   Cek lebar 1440 px, 1920 px, dan ponsel (390 px).
6. Commit kecil per langkah logis, pesan Conventional Commits bahasa Indonesia.
7. Push branch → cek preview Vercel → gabung ke `main` setelah disetujui.
8. Bila ada SQL baru, tulis di deskripsi PR: berkas mana yang harus dijalankan
   di SQL Editor Supabase dan urutannya.

## Temuan terbuka (audit 2026-10-03, belum diperbaiki)

Ditemukan saat analisis. Belum disentuh karena butuh perubahan di database
atau perilaku login, dan perlu persetujuan pemilik proyek. Perbaiki
satu per satu dalam branch tersendiri.

| # | Tingkat | Temuan | Lokasi |
|---|---|---|---|
| 1 | Kritis | Pengguna bisa mengubah `role`/`division_id` miliknya sendiri jadi admin: kebijakan update `profiles` tidak membatasi kolom | `supabase/schema.sql` kebijakan "Users can update their profile"; `AuthContext.updateProfile` |
| 2 | Tinggi | Kata sandi tersimpan polos di localStorage (`bpk-dashboard-last-login`) dan tidak dihapus saat logout | `AuthContext.jsx` `rememberLogin` |
| 3 | Tinggi | `xlsx@0.18.5` punya advisory prototype pollution + ReDoS, tanpa perbaikan di npm (versi aman hanya dari CDN SheetJS) | `package.json` |
| 4 | Sedang | Peran `viewer` tidak ditegakkan di RLS maupun klien; pemilik konten bisa menyetujui kontennya sendiri | `supabase/policies.sql` |
| 5 | Sedang | Tidak ada security header (CSP, `frame-ancestors`, `nosniff`, Referrer-Policy) | `vercel.json` |
| 6 | Sedang | Validasi unggahan hanya di klien, tanpa batas ukuran; bucket tanpa batas MIME/ukuran | `documentStorage.js`, `policies.sql` |
| 7 | Sedang | `public/data/anggaran.xlsx` dan angka di halaman masuk bisa dilihat tanpa login | `public/data/`, `Landing.jsx` |
| 8 | Rendah | `react-router-dom` 6.30.x dalam rentang advisory sedang; ada versi perbaikan | `package.json` |
| 9 | Rendah | `fiscalYear` anggaran diambil dari tanggal hari ini, bukan dari berkas; `updated_at` snapshot tidak pernah diperbarui | `budgetStorage.js` |
