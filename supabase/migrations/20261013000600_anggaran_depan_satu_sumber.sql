-- Halaman masuk membaca laporan yang sama dengan Dashboard Keuangan.
--
-- Migrasi sebelumnya membuka public.budget_snapshots untuk anon. Itu keliru.
-- budget_snapshots hanya cermin turunan yang ditulis ulang setiap kali laporan
-- Master Data disimpan, dan isinya bisa melenceng dari laporannya: di basis
-- data yang berjalan ternyata ada baris TA 2027 yang tidak punya pasangan di
-- budget_reports, sehingga halaman masuk memajang angka tahun yang bahkan tidak
-- ada laporannya.
--
-- Pangkalnya satu sumber kebenaran. CLAUDE.md sudah menyebutkannya: angka
-- dashboard dan menu akun sama-sama berasal dari laporan yang sama, dan tidak
-- boleh dihitung ulang dari sumber lain. Halaman masuk sekarang mengikuti
-- aturan itu juga.
--
-- YANG TERBUKA: hanya tiga kolom - fiscal_year, groups, dan updated_at. groups
-- berisi pagu/realisasi/sisa per kelompok belanja 51, 52, dan 53, yaitu persis
-- angka yang dipakai kartu di halaman masuk.
--
-- YANG TETAP TERTUTUP: kolom accounts, yaitu rincian realisasi SP2D per akun.
-- Itu bagian paling rinci dari laporan dan tidak pernah dibutuhkan halaman
-- masuk. Kolom totals, satker, dan nama pengunggah juga tidak dibuka.
--
-- Pembatasan kolom ini ditegakkan hak akses kolom Postgres, bukan oleh kode
-- aplikasi. Perlu diingat bila suatu saat ada yang menjalankan grant select
-- menyeluruh pada tabel ini: pembatasannya akan hilang tanpa pesan apa pun.

-- 1. Tutup kembali budget_snapshots. Tidak ada lagi yang membacanya tanpa login.
drop policy if exists "Anyone can read budget snapshots" on public.budget_snapshots;

-- 2. Izinkan barisnya terbaca tanpa login.
drop policy if exists "Anyone can read budget report summary" on public.budget_reports;

create policy "Anyone can read budget report summary"
  on public.budget_reports for select to anon using (true);

-- 3. Batasi kolomnya. Urutannya penting: hak menyeluruh dicabut dulu, baru
--    diberikan per kolom.
revoke select on public.budget_reports from anon;

grant select (fiscal_year, groups, updated_at) on public.budget_reports to anon;

notify pgrst, 'reload schema';
