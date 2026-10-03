-- Master Data Anggaran: izin mengosongkan data satu tahun anggaran.
-- Jalankan di SQL Editor Supabase, setelah anggaran-master.sql. Aman diulang.
--
-- Administrator bisa menghapus laporan satu TA dari menu Master Data. Setelah
-- dihapus, Dashboard Keuangan dan menu Belanja Pegawai/Barang/Modal TA itu
-- kosong sampai laporan baru diunggah. Riwayat unggah tidak ikut terhapus;
-- penghapusannya sendiri dicatat sebagai baris riwayat dengan action 'delete'.

drop policy if exists "Admins can delete budget reports" on public.budget_reports;

create policy "Admins can delete budget reports"
  on public.budget_reports for delete to authenticated
  using (public.current_profile_role() = 'admin');

alter table public.budget_report_uploads
  add column if not exists action text not null default 'upload';

do $do$
begin
  alter table public.budget_report_uploads
    add constraint budget_report_uploads_action_check check (action in ('upload', 'delete'));
exception
  when duplicate_object then null;
end
$do$;

notify pgrst, 'reload schema';
