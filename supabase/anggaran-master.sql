-- Master Data Anggaran: laporan realisasi SP2D per akun, satu per tahun anggaran.
-- Jalankan di SQL Editor Supabase, setelah anggaran.sql. Aman diulang.
--
-- Administrator mengunggah "Laporan Realisasi SP2D — Akun Based" lewat menu
-- Master Data. Aplikasi memilah angkanya per akun 6 digit dan per kelompok
-- 51/52/53, lalu menyimpannya di sini. Unggahan berikutnya untuk tahun yang
-- sama menimpa baris tahun itu, jadi yang tampil selalu laporan terbaru.

create table if not exists public.budget_reports (
  id uuid primary key default gen_random_uuid(),
  fiscal_year integer not null unique,
  period_month integer not null check (period_month between 1 and 12),
  period_label text,
  satker text,
  accounts jsonb not null default '[]'::jsonb,
  groups jsonb not null default '{}'::jsonb,
  totals jsonb not null default '{}'::jsonb,
  source_file_name text,
  uploaded_by uuid references public.profiles(id) on delete set null,
  uploaded_by_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Riwayat setiap unggahan: siapa, kapan, berkas apa, totalnya berapa.
create table if not exists public.budget_report_uploads (
  id uuid primary key default gen_random_uuid(),
  fiscal_year integer not null,
  period_month integer not null check (period_month between 1 and 12),
  source_file_name text,
  account_count integer not null default 0,
  totals jsonb not null default '{}'::jsonb,
  uploaded_by uuid references public.profiles(id) on delete set null,
  uploaded_by_name text,
  created_at timestamptz not null default now()
);

alter table public.budget_reports enable row level security;
alter table public.budget_report_uploads enable row level security;

drop policy if exists "Authenticated users can read budget reports" on public.budget_reports;
drop policy if exists "Admins can insert budget reports" on public.budget_reports;
drop policy if exists "Admins can update budget reports" on public.budget_reports;
drop policy if exists "Authenticated users can read budget report uploads" on public.budget_report_uploads;
drop policy if exists "Admins can insert budget report uploads" on public.budget_report_uploads;

-- Semua yang login boleh membaca: angka ini tampil di dashboard dan menu akun.
create policy "Authenticated users can read budget reports"
  on public.budget_reports for select to authenticated using (true);

-- Hanya administrator yang boleh mengubah master data. Tidak ada kebijakan
-- delete: menghapus laporan hanya lewat SQL Editor.
create policy "Admins can insert budget reports"
  on public.budget_reports for insert to authenticated
  with check (public.current_profile_role() = 'admin');

create policy "Admins can update budget reports"
  on public.budget_reports for update to authenticated
  using (public.current_profile_role() = 'admin')
  with check (public.current_profile_role() = 'admin');

create policy "Authenticated users can read budget report uploads"
  on public.budget_report_uploads for select to authenticated using (true);

create policy "Admins can insert budget report uploads"
  on public.budget_report_uploads for insert to authenticated
  with check (public.current_profile_role() = 'admin' and uploaded_by = auth.uid());

-- Dashboard dan menu akun yang sedang terbuka ikut berubah begitu laporan baru disimpan.
do $do$
begin
  alter publication supabase_realtime add table public.budget_reports;
exception
  when duplicate_object then null;
  when undefined_object then null;
end
$do$;

notify pgrst, 'reload schema';
