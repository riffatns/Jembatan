-- Master Data Anggaran: setiap unggahan disimpan sebagai versi yang bisa dihapus.
-- Jalankan di SQL Editor Supabase, setelah anggaran-master-hapus.sql. Aman diulang.
--
-- Setiap baris riwayat unggah kini menyimpan isi laporannya (kolom report).
-- Administrator bisa menghapus satu baris riwayat dari menu Master Data:
-- - baris yang sedang aktif (unggahan terbaru TA itu) -> data TA kembali ke
--   unggahan sebelumnya, atau kosong bila tidak ada;
-- - baris lama -> hanya versi itu yang hilang, angka yang tampil tidak berubah.
-- Unggahan dari sebelum berkas ini dijalankan tidak menyimpan isi laporan,
-- sehingga tidak bisa dijadikan tujuan kembali.

alter table public.budget_report_uploads
  add column if not exists report jsonb;

drop policy if exists "Admins can delete budget report uploads" on public.budget_report_uploads;

create policy "Admins can delete budget report uploads"
  on public.budget_report_uploads for delete to authenticated
  using (public.current_profile_role() = 'admin');

notify pgrst, 'reload schema';
