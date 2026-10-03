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

### Ikon

- Ikon baru **wajib** SVG duotone dari `src/components/icons/DuotoneIcons.jsx`:
  bentuk terisi (`fill="currentColor"`), lapisan belakang opasitas 0,35,
  **tanpa garis tepi (stroke/outline) dan tanpa bingkai/border** di sekitarnya.
  Warna ikut `text-*` induknya; latar bulat berwarna boleh, garis lingkar tidak.
- Ikon yang belum ada ditambahkan ke berkas itu dengan grid 24×24 yang sama
  dan nama `Icon<Nama>` (`IconDatabase`, `IconChartBars`). Jangan menggambar
  ikon SVG sebaris di dalam komponen.
- `lucide-react` (ikon bergaris) tetap dipakai di kode lama dan tidak diganti
  massal. Dalam satu komponen jangan mencampur ikon lucide dengan ikon duotone.

## Aturan 2 — Batas ukuran dan modularitas

| Ukuran | Batas |
|---|---|
| Berkas komponen / halaman | sasaran ≤ 250 baris, maksimum 300 |
| Berkas `lib` / `data` | maksimum 300 baris (kecuali data contoh `seed.js`) |
| Satu fungsi / komponen | ≤ 80 baris; lebih dari itu pecah jadi subkomponen |
| Satu baris | ≤ 160 karakter; `className` panjang boleh, logika jangan |

- Halaman = komposisi tipis. Logika hitung ditaruh di model murni
  (contoh `components/budget/dashboard/budgetDashboardModel.js`), tampilan di
  komponen kecil, gaya kartu dari `src/components/ui/cardStyles.js`.
- Satu fitur baru = satu folder (`components/<domain>/<fitur>/`), bukan
  tambahan ratusan baris ke berkas yang sudah besar.
- Berkas yang **sudah** melewati batas — jangan ditambah lagi kecuali
  beberapa baris penyambung (rute, tombol menu, satu callback):
  `seed.js` 858, `HrOverview.jsx` 634, `Sidebar.jsx` 520, `DataContext.jsx` 495,
  `agendaStorage.js` 475, `DivisionWorkspace.jsx` 473, `DocumentUploadModal.jsx` 405.
  Kalau sebuah tugas harus mengubah banyak di sana, keluarkan bagian yang
  diubah ke modul baru dulu, dalam commit terpisah.
- Halaman yang harus muat satu layar memakai varian Tailwind `fit:` (desktop
  ≥ 1360×600), `fitwide:` (≥ 1440×600), dan `tall:` (tinggi ≥ 900) dari
  `tailwind.config.js`, bukan angka tinggi tetap. Di bawah `fit` halaman boleh
  di-scroll (ponsel, tablet).
- **Jangan** memakai varian `min-[…px]:` / `max-[…px]:`: tidak didukung bila
  `screens` berisi objek (build hanya memberi peringatan, kelasnya diam-diam
  hilang). Tambahkan screen bernama di `tailwind.config.js`. Jangan pula merakit
  nama kelas dari variabel (`${X}:grid`) — Tailwind tidak bisa menemukannya.
- Animasi angka dan grafik memakai `useAnimatedProgress` / `useCountUp`
  (`src/hooks/useAnimatedProgress.js`) yang sudah menghormati
  `prefers-reduced-motion`. Jangan menambah library animasi.
- Cek cepat sebelum commit:
  `find src -name '*.js*' | xargs wc -l | sort -rn | awk '$1>300'`

## Modul bersama (wajib dipakai ulang)

Sebelum membuat komponen, hook, atau formatter baru, cek daftar ini. Kalau
kebutuhannya sudah tercakup, **pakai yang ada**; kalau hampir tercakup,
perluas modulnya (tanpa mengubah perilaku pemakai lama), jangan menyalin.

| Kebutuhan | Modul | Catatan |
|---|---|---|
| Tabel/daftar data (cari, urut, halaman) | `src/components/data-table/DataTable.jsx` (+ `useDataTable.js`, `TablePagination.jsx`) | Pencarian realtime di semua kolom ala DataTables, klik judul untuk urut, 20 baris/halaman, tinggi mengikuti isi. Opsi `searchable`, `paginated`, `dense`. Kolom: `{ key, label, align, width, value(row), text(row), render(row), title(row) }`. Contoh: `components/budget/accounts/AccountDetailTable.jsx`. **Semua tabel data baru wajib memakai ini.** |
| Ikon | `src/components/icons/DuotoneIcons.jsx` | Duotone, tanpa garis tepi. Ikon baru ditambahkan di sini. |
| Gaya kartu & judul | `src/components/ui/cardStyles.js` (`CARD_CLASS`, `CARD_TITLE_CLASS`, `LABEL_CLASS`) | Sudah termasuk varian `fit:`/`tall:`. |
| Tombol, dialog, input dasar | `src/components/ui/*` (`Button` varian `teal`/`outline`/`destructive`, `Dialog`) | Dasar untuk komponen di bawah. |
| Konfirmasi aksi berisiko (hapus, kosongkan) | `src/components/ui/ConfirmDialog.jsx` | Props `open`, `title`, `description` (sebutkan akibatnya pada data), `confirmLabel`, `busy`, `onCancel`, `onConfirm`. Jangan `window.confirm`. |
| Kepala halaman dashboard | `src/components/budget/dashboard/BudgetDashboardHeader.jsx` | Props `title`, `subtitle`, `icon`, pemilih TA (`years`, `fiscalYear`, `onFiscalYearChange`), `showYearPicker`, `actions` (kontrol tambahan di kanan, mis. pemilih triwulan). |
| Tooltip grafik | `src/components/charts/ChartTooltip.jsx` (`useChartTooltip`) | Isi berupa node React; mendukung tetikus dan keyboard. |
| Animasi angka & grafik | `src/hooks/useAnimatedProgress.js` (`useAnimatedProgress`, `useCountUp`) | Menghormati `prefers-reduced-motion`. |
| Ukuran elemen (grafik responsif) | `src/hooks/useElementSize.js` | ResizeObserver; teks SVG tetap ukuran asli. |
| Format Rupiah & persen | `src/lib/budgetFormat.js` | `formatRupiah`, `formatBillion`, `formatBillionFirst`, `formatCompactRupiah`, `formatTableBillion`, `formatPercent`, `formatAbsorption`. |
| Data anggaran Keuangan | `src/context/BudgetReportContext.jsx` (`useBudgetReports`) | Sumber tunggal dashboard & menu akun (lihat bagian Master Data). |
| Keadaan kosong master data | `src/components/budget/MasterDataEmptyState.jsx` | Tombol ke Master Data hanya untuk admin. |
| Grafik donat / kolom / batang horizontal | `src/components/charts/DonutChart.jsx`, `ColumnChart.jsx`, `BarList.jsx` | Generik, beranimasi, tooltip; sumbu dari `src/lib/chartAxis.js` (`buildAxis`). |
| Master Data berversi (tanpa tahun) | `src/context/MasterDatasetContext.jsx` (`useMasterDataset(dataset, { ownerDivision, loadDetails })`, `useMasterDatasetGroup(prefix)` untuk dataset per periode) | Lihat bagian "Master Data generik". Aturan versi murni di `src/lib/masterDatasetVersions.js`. |
| Unggah berkas Excel / PDF | `src/components/master-data/FileDropzone.jsx` (+ `validateExcelFile`, `validatePdfFile`, `isPdfSignature`) | Pilih/seret, maks. 5 MB; props `accept`, `label`. Berkas yang sama bisa dipilih ulang. |
| Riwayat versi + hapus/kosongkan | `src/components/master-data/VersionHistory.jsx`, `useVersionDeletion.js` | Status Aktif/Dikosongkan, rollback, pesan akibat di `ConfirmDialog`. |
| Kolom Aksi riwayat (unduh berkas asli, hapus) | `src/components/master-data/VersionActions.jsx` + `useSourceDownload.js` | Ikon saja (aria-label + title). Berkas di `src/lib/masterFileStorage.js` (bucket privat `master-files`, admin). |
| Tabel bergaris dari PDF teks | `src/lib/pdfTable.js` (`readPdfTablePages`, `rowLinesForColumn`, `columnOf`, `cellText`) + `src/lib/pdfjsLoader.js` | pdf.js disuntikkan pemanggil (browser: `loadPdfjs()` malas; Node: build legacy), `isEvalSupported: false`. |
| Kalender bulan | `src/components/calendar/MonthCalendar.jsx` (+ `src/lib/calendarLayout.js`) | Bilah berhari-hari per minggu, lajur mengikuti tinggi, "+N" bisa dipilih, `event.priority` untuk kegiatan panjang, slot `title`/`aside`. |
| Kartu KPI & filter pilihan | `KpiCard` (`components/hr/bezetting/BezettingKpiCards.jsx`), `FilterSelect` (`BezettingFilters.jsx`, opsi teks atau `{ value, label }`, `inset`) | Dipakai Bezetting dan Kalender Diklat. |
| Sidebar per bidang | `src/data/sidebarConfig.js` (`getDivisionSidebar`) | Layanan tampil, hitungan, Monitoring/Integrasi, tautan Master Data. |
| Satu layar tanpa scroll | screen Tailwind `fit`, `fitwide`, `tall` (`tailwind.config.js`) | Lihat Aturan 2. |

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

## Master Data Anggaran (Subbagian Keuangan)

Sumber angka tunggal untuk Dashboard Keuangan dan menu Belanja Pegawai (51),
Belanja Barang (52), Belanja Modal (53).

- **Masukan**: "Laporan Realisasi SP2D — Fa Detail 16 Segmen, Akun Based" (Excel
  cetakan aplikasi resmi), diunggah administrator di `/dashboard/master-anggaran`
  dengan pilihan Tahun Anggaran + Bulan. Tanpa approval.
- **Parser**: `src/lib/budgetReportParser.js` (murni, tanpa import lokal, bisa diuji
  dengan Node terhadap berkas asli). Baris akun = kode `^5\d{5}$`; tujuh angka dibaca
  menurut urutan (posisi kolom bergeser karena sel gabungan). Berkas **ditolak** bila
  jumlah seluruh akun ≠ baris `JUMLAH SELURUHNYA` atau lalu + ini ≠ s.d. periode.
- **Penyimpanan**: tabel `budget_reports` (satu baris per `fiscal_year`, unggahan
  berikutnya menimpa) + riwayat `budget_report_uploads`; ringkasan 51/52/53 juga ditulis ke
  `budget_snapshots` agar menu lama sama. SQL: `supabase/anggaran-master.sql`,
  `anggaran-master-hapus.sql`, `anggaran-master-versi.sql` (semuanya juga di `jalankan-semua.sql`).
- **Versi**: setiap baris riwayat (`action = 'upload'`) menyimpan isi laporan (`report`).
  Versi aktif = unggahan terbaru TA itu (`src/lib/budgetReportVersions.js`). Hapus versi aktif
  -> data kembali ke unggahan sebelumnya, atau kosong bila tidak ada; hapus versi lama -> angka
  tetap. Hapus per TA mengosongkan data dan dicatat `action = 'delete'`. Operasi Supabase ada di
  `src/lib/budgetReportRemote.js`; delete selalu menghitung baris terhapus (RLS yang menolak = 0 baris).
- **State**: `src/context/BudgetReportContext.jsx` (`useBudgetReports`): TA aktif,
  pemilih TA, realtime, `saveReport`.
- **Korelasi**: Dashboard = `reportToBudget(laporan)` = jumlah grup 51 + 52 + 53;
  menu akun = `buildAccountModel(laporan, '51'|'52'|'53')`. Keduanya dari laporan yang
  sama, jadi total tiga menu akun selalu = total dashboard. Jangan menghitung ulang
  dari sumber lain.
- Saklar `USE_NEW_FINANCE_DASHBOARD` dan `USE_NEW_ACCOUNT_VIEWS` (`src/lib/tampilan.js`)
  mengembalikan tampilan lama tanpa menghapus kode.
- Uji wajib bila parser/master data diubah: skrip Node terhadap berkas asli (total =
  JUMLAH SELURUHNYA, 51 = 60,77 %, 52 = 46,41 %, 53 sisa Rp1.004 untuk laporan Oktober 2026)
  dan uji berkas rusak harus ditolak.

## Master Data generik (dataset berversi, tanpa tahun)

Untuk data bidang yang tidak dipilah per tahun anggaran (contoh: Bezetting SDM).
Data Keuangan tetap memakai `BudgetReportContext` (per TA).

- **Tabel**: `master_dataset_versions` (`dataset`, `action` upload/clear, `payload`, periode, berkas,
  `source_file_path`, pengunggah) dan `master_dataset_private` (data rinci, RLS: admin atau `owner_division`).
  SQL: `supabase/master-dataset.sql` + `supabase/master-berkas.sql` (keduanya juga di `jalankan-semua.sql`).
- **Aturan**: data aktif = versi terbaru dataset; `clear` = dikosongkan; hapus versi terbaru =
  rollback otomatis ke versi sebelumnya; hanya satu versi aktif. Unggah/hapus hanya admin, tanpa approval.
  Simpan data rinci gagal = versi umum dibatalkan (atomik); daftar versi diambil ulang sebelum dan sesudah hapus.
- **Dataset per periode**: nama `awalan:periode` (mis. `hr-diklat:2026-TW4`); tiap periode punya versi aktif,
  rollback, dan kosongkan sendiri; `useMasterDatasetGroup('hr-diklat:')` memuat semuanya sekaligus.
- **Berkas asli**: setiap unggahan (juga Master Data Anggaran) menyimpan berkasnya di bucket privat
  `master-files` (hanya admin, maks. 5 MB, Excel/PDF) agar bisa diunduh ulang dari kolom Aksi riwayat.
  Gagal menyimpan berkas tidak membatalkan data (pesan ditampilkan); hapus versi ikut menghapus berkasnya.
- **Dataset**: `hr-bezetting` (Bidang SDM) — parser `src/lib/bezettingParser.js` (sheet `ABK` +
  `Lengkap_PBD`, rekonsiliasi jumlah per tingkat ABK), model `components/hr/bezetting/bezettingModel.js`,
  halaman `src/pages/HrMasterData.jsx` (`/dashboard/master-sdm`) dan menu Bezetting (`BezettingPage`).
- **Data pribadi pegawai**: kolom Lengkap_PBD dibaca hanya sampai "TMT Jabatan Tertentu" (NIK, HP,
  BPJS, Taspen, keluarga tidak pernah dibaca). Kolom umum (nama, unit, jabatan, golongan,
  pendidikan, L/P, rentang usia) di `payload`; kolom rinci (NIP, email, tanggal lahir, agama, SK, ...)
  hanya di `master_dataset_private`. Data rinci tidak pernah ditulis ke localStorage, log, atau `public/`.
- Berkas Bezetting yang disimpan untuk diunduh ulang adalah **salinan bersih** (`src/lib/bezettingSanitizer.js`):
  di Lengkap_PBD semua kolom sesudah "TMT Jabatan Tertentu" dikosongkan; batas kolom memakai
  `findEmployeeColumns` yang sama dengan parser. Hasil parsing salinan harus identik dengan aslinya.
- Uji wajib bila parser diubah: Node terhadap berkas asli (85/45/−40, 52,9 %, L29/P16, S1 38/S2 6/D4 1),
  tidak ada kolom terlarang di keluaran, berkas rusak ditolak, salinan bersih tanpa NIK/HP/BPJS.
- **Dataset `hr-diklat:<tahun>-TW<n>`** (Kalender Diklat per triwulan): masukan **hanya PDF** Kaldik dari aplikasi
  sumber. Parser `src/lib/kaldikParser.js` membaca grid vektor (10 kolom: garis penuh = program, garis parsial =
  tahap) lewat `pdfTable.js`; tanggal bebas lewat `src/lib/kaldikDates.js` (tidak terbaca = TBA, tidak ditebak).
  **Ditolak** bila bukan PDF (ekstensi + MIME + `%PDF-` + 5 MB), judul "Triwulan … Tahun …" tidak ada, grid bukan
  10 kolom, nomor urut per jenis tidak berurutan, atau program tanpa nama/metode/penyelenggara. Model menu
  `components/hr/diklat/diklatModel.js` (gabung triwulan tanpa duplikat, status menurut tanggal hari ini).
  Uji wajib: Node terhadap PDF TW IV 2026 (41 program = 2/2/12/2/20/3, tahap 8/8/6/6, JP 905/908 hanya di
  program, Internasional SL/DL/KL, TBA hanya #3) + PDF terpotong/tanpa judul/bukan PDF ditolak.

## Alur kerja per perubahan

1. Baca berkas yang akan diubah dan pemanggilnya. Ikuti gaya berkas itu.
2. Buat branch dari `main` terbaru.
3. Tulis kode sesuai aturan di atas.
4. `npm run build` lulus.
5. Uji manual di browser: alur yang diubah **dan** alur lama di sekitarnya
   (mis. ubah dashboard → cek juga unggah berkas, sidebar, Dashboard lama).
6. **Uji responsif wajib** di lima ukuran viewport: 1920×945, 1536×730,
   1366×657 (laptop umum), 1280×620, dan ponsel 390×844. Dashboard dan halaman
   ringkasan harus muat satu layar tanpa scroll di ukuran `fit` (≥ 1360×600),
   tanpa teks terpotong, tanpa kartu yang isinya meluap, dan tanpa scroll
   horizontal halaman. Di bawah `fit` boleh scroll, tetapi tetap rapi bertumpuk.
7. Commit kecil per langkah logis, pesan Conventional Commits bahasa Indonesia.
8. Push branch → cek preview Vercel → gabung ke `main` setelah disetujui.
9. Bila ada SQL baru, tulis di deskripsi PR: berkas mana yang harus dijalankan
   di SQL Editor Supabase dan urutannya.

## Temuan terbuka (audit 2026-10-03, belum diperbaiki)

Ditemukan saat analisis. Belum disentuh karena butuh perubahan di database
atau perilaku login, dan perlu persetujuan pemilik proyek. Perbaiki
satu per satu dalam branch tersendiri.

| # | Tingkat | Temuan | Lokasi |
|---|---|---|---|
| 1 | Kritis | Pengguna bisa mengubah `role`/`division_id` miliknya sendiri jadi admin. **Perbaikan sudah ditulis** (`supabase/perbaikan-profil-peran.sql` + `updateProfile` membuang kolom itu); tertutup setelah owner menjalankan SQL-nya | `supabase/schema.sql`; `AuthContext.updateProfile` |
| 2 | Tinggi | Kata sandi tersimpan polos di localStorage (`bpk-dashboard-last-login`) dan tidak dihapus saat logout | `AuthContext.jsx` `rememberLogin` |
| 3 | Tinggi | `xlsx@0.18.5` punya advisory prototype pollution + ReDoS, tanpa perbaikan di npm (versi aman hanya dari CDN SheetJS) | `package.json` |
| 4 | Sedang | Peran `viewer` tidak ditegakkan di RLS maupun klien; pemilik konten bisa menyetujui kontennya sendiri | `supabase/policies.sql` |
| 5 | Sedang | Tidak ada security header (CSP, `frame-ancestors`, `nosniff`, Referrer-Policy) | `vercel.json` |
| 6 | Sedang | Validasi unggahan hanya di klien, tanpa batas ukuran; bucket tanpa batas MIME/ukuran | `documentStorage.js`, `policies.sql` |
| 7 | Sedang | `public/data/anggaran.xlsx` dan angka di halaman masuk bisa dilihat tanpa login | `public/data/`, `Landing.jsx` |
| 8 | Rendah | `react-router-dom` 6.30.x dalam rentang advisory sedang; ada versi perbaikan | `package.json` |
| 9 | Rendah | `fiscalYear` anggaran diambil dari tanggal hari ini, bukan dari berkas; `updated_at` snapshot tidak pernah diperbarui | `budgetStorage.js` |
