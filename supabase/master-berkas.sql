-- Berkas asli unggahan Master Data, supaya admin bisa mengunduh ulang berkas
-- yang pernah diunggah dan diparsing (Anggaran, Bezetting, Kalender Diklat).
-- Jalankan di SQL Editor Supabase. Aman diulang.
--
-- Bucket privat 'master-files': maks. 5 MB, hanya Excel dan PDF. Baca, unggah,
-- dan hapus hanya administrator (sama dengan halaman Master Data). Untuk
-- Bezetting yang disimpan adalah salinan bersih: kolom setelah "TMT Jabatan
-- Tertentu" (NIK, HP, BPJS, Taspen, keluarga) sudah dikosongkan di browser.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'master-files', 'master-files', false, 5242880,
  array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ]
)
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Admins can read master files" on storage.objects;
drop policy if exists "Admins can upload master files" on storage.objects;
drop policy if exists "Admins can delete master files" on storage.objects;

create policy "Admins can read master files"
  on storage.objects for select to authenticated
  using (bucket_id = 'master-files' and public.current_profile_role() = 'admin');

create policy "Admins can upload master files"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'master-files' and public.current_profile_role() = 'admin');

create policy "Admins can delete master files"
  on storage.objects for delete to authenticated
  using (bucket_id = 'master-files' and public.current_profile_role() = 'admin');

-- Lokasi berkas per versi; kosong untuk versi lama dan baris kosongkan/hapus TA.
alter table public.budget_report_uploads add column if not exists source_file_path text;
alter table public.master_dataset_versions add column if not exists source_file_path text;

notify pgrst, 'reload schema';
