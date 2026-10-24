-- Pegawai SDM/Keuangan boleh mengunggah master data sesuai kelompok bidangnya.
-- Penghapusan versi, rollback, dan pengosongan tetap khusus administrator.
-- Aman dijalankan ulang melalui SQL Editor Supabase.

create or replace function public.current_profile_can_access_division(target_division text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.current_profile_role() = 'admin'
    or public.current_profile_division() = target_division
    or (
      public.current_profile_division() in ('hr', 'finance')
      and target_division in ('hr', 'finance')
    );
$$;

create or replace function public.current_profile_can_upload_master_dataset(target_dataset text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.current_profile_role() = 'admin'
    or (
      public.current_profile_role() = 'employee'
      and public.current_profile_division() in ('hr', 'finance')
      and target_dataset like 'hr-%'
    );
$$;

drop policy if exists "Admins can insert master dataset versions"
  on public.master_dataset_versions;
create policy "Admins can insert master dataset versions"
  on public.master_dataset_versions for insert to authenticated
  with check (
    public.current_profile_can_upload_master_dataset(dataset)
    and uploaded_by = auth.uid()
  );

drop policy if exists "Admins can insert master dataset private"
  on public.master_dataset_private;
create policy "Admins can insert master dataset private"
  on public.master_dataset_private for insert to authenticated
  with check (
    public.current_profile_role() = 'admin'
    or (
      public.current_profile_role() = 'employee'
      and public.current_profile_can_access_division(owner_division)
      and owner_division = 'hr'
    )
  );

drop policy if exists "Admins can insert budget reports"
  on public.budget_reports;
create policy "Admins can insert budget reports"
  on public.budget_reports for insert to authenticated
  with check (
    public.current_profile_role() = 'admin'
    or (
      public.current_profile_role() = 'employee'
      and public.current_profile_division() in ('hr', 'finance')
    )
  );

drop policy if exists "Admins can update budget reports"
  on public.budget_reports;
create policy "Admins can update budget reports"
  on public.budget_reports for update to authenticated
  using (
    public.current_profile_role() = 'admin'
    or (
      public.current_profile_role() = 'employee'
      and public.current_profile_division() in ('hr', 'finance')
    )
  )
  with check (
    public.current_profile_role() = 'admin'
    or (
      public.current_profile_role() = 'employee'
      and public.current_profile_division() in ('hr', 'finance')
    )
  );

drop policy if exists "Admins can insert budget report uploads"
  on public.budget_report_uploads;
create policy "Admins can insert budget report uploads"
  on public.budget_report_uploads for insert to authenticated
  with check (
    uploaded_by = auth.uid()
    and (
      public.current_profile_role() = 'admin'
      or (
        public.current_profile_role() = 'employee'
        and public.current_profile_division() in ('hr', 'finance')
      )
    )
  );

drop policy if exists "Finance and admin can write budget snapshots"
  on public.budget_snapshots;
create policy "Finance and admin can write budget snapshots"
  on public.budget_snapshots for insert to authenticated
  with check (
    public.current_profile_role() = 'admin'
    or (
      public.current_profile_role() = 'employee'
      and public.current_profile_division() in ('hr', 'finance')
    )
  );

drop policy if exists "Finance and admin can update budget snapshots"
  on public.budget_snapshots;
create policy "Finance and admin can update budget snapshots"
  on public.budget_snapshots for update to authenticated
  using (
    public.current_profile_role() = 'admin'
    or (
      public.current_profile_role() = 'employee'
      and public.current_profile_division() in ('hr', 'finance')
    )
  )
  with check (
    public.current_profile_role() = 'admin'
    or (
      public.current_profile_role() = 'employee'
      and public.current_profile_division() in ('hr', 'finance')
    )
  );

drop policy if exists "Admins can upload master files" on storage.objects;
create policy "Admins can upload master files"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'master-files'
    and (
      public.current_profile_role() = 'admin'
      or (
        public.current_profile_role() = 'employee'
        and public.current_profile_division() in ('hr', 'finance')
        and (
          (storage.foldername(name))[1] = 'dataset'
          or (storage.foldername(name))[1] = 'anggaran'
        )
      )
    )
  );

notify pgrst, 'reload schema';
