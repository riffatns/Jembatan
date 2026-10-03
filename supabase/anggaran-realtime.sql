-- Realtime untuk angka anggaran.
-- Jalankan di SQL Editor Supabase, setelah anggaran.sql. Aman diulang.
--
-- Tanpa ini, angka yang diunggah admin baru terlihat oleh pengguna lain
-- setelah mereka memuat ulang halaman. Dengan ini, Dashboard Anggaran yang
-- sedang terbuka ikut berubah begitu berkas anggaran baru disimpan.
-- Realtime tetap tunduk pada RLS: hanya yang boleh membaca budget_snapshots
-- yang menerima kabarnya.

do $do$
begin
  alter publication supabase_realtime add table public.budget_snapshots;
exception
  when duplicate_object then null;
  when undefined_object then null;
end
$do$;
