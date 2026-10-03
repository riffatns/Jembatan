-- Master Data generik berversi (dipakai Bidang SDM, bisa dipakai bidang lain).
-- Jalankan di SQL Editor Supabase. Aman diulang.
--
-- Satu dataset (mis. 'hr-bezetting') = deretan versi. Data aktif adalah baris
-- terbaru dataset itu: action 'upload' membawa isi data, action 'clear'
-- berarti data dikosongkan. Menghapus versi terbaru otomatis membuat versi
-- sebelumnya aktif lagi (rollback), tanpa menulis ulang apa pun.
--
-- Data rinci yang sensitif (mis. NIP, email, tanggal lahir pegawai) disimpan
-- terpisah di master_dataset_private dan hanya bisa dibaca admin atau pegawai
-- bidang pemiliknya (owner_division).

create table if not exists public.master_dataset_versions (
  id uuid primary key default gen_random_uuid(),
  dataset text not null,
  action text not null default 'upload' check (action in ('upload', 'clear')),
  period_month integer check (period_month between 1 and 12),
  period_year integer,
  period_label text,
  payload jsonb not null default '{}'::jsonb,
  source_file_name text,
  uploaded_by uuid references public.profiles(id) on delete set null,
  uploaded_by_name text,
  created_at timestamptz not null default now()
);

create index if not exists master_dataset_versions_dataset_idx
  on public.master_dataset_versions (dataset, created_at desc);

create table if not exists public.master_dataset_private (
  version_id uuid primary key references public.master_dataset_versions(id) on delete cascade,
  dataset text not null,
  owner_division text not null references public.divisions(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.master_dataset_versions enable row level security;
alter table public.master_dataset_private enable row level security;

drop policy if exists "Authenticated users can read master dataset versions" on public.master_dataset_versions;
drop policy if exists "Admins can insert master dataset versions" on public.master_dataset_versions;
drop policy if exists "Admins can delete master dataset versions" on public.master_dataset_versions;
drop policy if exists "Owner division can read master dataset private" on public.master_dataset_private;
drop policy if exists "Admins can insert master dataset private" on public.master_dataset_private;
drop policy if exists "Admins can delete master dataset private" on public.master_dataset_private;

-- Ringkasan dan data umum dibaca semua yang login (tampil di menu bidang).
create policy "Authenticated users can read master dataset versions"
  on public.master_dataset_versions for select to authenticated using (true);

-- Hanya administrator yang mengunggah dan menghapus master data, tanpa approval.
create policy "Admins can insert master dataset versions"
  on public.master_dataset_versions for insert to authenticated
  with check (public.current_profile_role() = 'admin' and uploaded_by = auth.uid());

create policy "Admins can delete master dataset versions"
  on public.master_dataset_versions for delete to authenticated
  using (public.current_profile_role() = 'admin');

-- Data rinci: admin, atau pegawai bidang pemilik data (mis. SDM untuk bezetting).
create policy "Owner division can read master dataset private"
  on public.master_dataset_private for select to authenticated
  using (
    public.current_profile_role() = 'admin'
    or public.current_profile_division() = owner_division
  );

create policy "Admins can insert master dataset private"
  on public.master_dataset_private for insert to authenticated
  with check (public.current_profile_role() = 'admin');

create policy "Admins can delete master dataset private"
  on public.master_dataset_private for delete to authenticated
  using (public.current_profile_role() = 'admin');

-- Menu yang sedang terbuka ikut berubah begitu versi baru disimpan atau dihapus.
do $do$
begin
  alter publication supabase_realtime add table public.master_dataset_versions;
exception
  when duplicate_object then null;
  when undefined_object then null;
end
$do$;

notify pgrst, 'reload schema';
