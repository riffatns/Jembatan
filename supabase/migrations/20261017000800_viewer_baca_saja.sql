-- =====================================================================
-- Peran "viewer" benar-benar hanya membaca
--
-- Temuan terbuka #4 di CLAUDE.md: peran viewer tidak pernah ditegakkan.
-- Seluruh kebijakan tulis memeriksa bidang atau kepemilikan, tidak pernah
-- peran - sehingga viewer yang kebetulan punya bidang bisa mengunggah
-- dokumen, mencatat agenda, dan menulis angka anggaran seperti pegawai
-- biasa. Pada tabel content bahkan tanpa syarat apa pun selain "penulisnya
-- saya", jadi viewer tanpa bidang sekalipun bisa menyisipkan baris.
--
-- Menyembunyikan tombol di React tidak menutup ini: yang menjaga adalah
-- RLS (CLAUDE.md, Aturan 3).
--
-- Perbaikannya satu syarat tambahan pada tiap kebijakan tulis. Kebijakan
-- yang memang sudah "admin saja" tidak disentuh - viewer tidak mungkin
-- lolos ke sana.
--
-- Idempoten: aman dijalankan berulang.
-- =====================================================================

-- Gagal-tertutup: profil tanpa baris (atau peran kosong) diperlakukan
-- sebagai viewer. Lebih baik menolak orang yang berhak lalu ketahuan,
-- daripada diam-diam mengizinkan yang tidak berhak.
create or replace function public.current_profile_can_write()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_profile_role(), 'viewer') <> 'viewer';
$$;

comment on function public.current_profile_can_write() is
  'True bila peran profil yang sedang login boleh menulis (admin atau employee). Dipakai seluruh kebijakan tulis.';


-- ---------------------------------------------------------------------
-- content - sebelumnya syaratnya hanya "author_id = saya", tanpa peran
-- ---------------------------------------------------------------------
drop policy if exists "Users can create content" on public.content;
create policy "Users can create content"
  on public.content for insert to authenticated
  with check (author_id = auth.uid() and public.current_profile_can_write());

drop policy if exists "Authors and admins can update content" on public.content;
create policy "Authors and admins can update content"
  on public.content for update to authenticated
  using (
    public.current_profile_role() = 'admin'
    or (author_id = auth.uid() and public.current_profile_can_write())
  )
  with check (
    public.current_profile_role() = 'admin'
    or (author_id = auth.uid() and public.current_profile_can_write())
  );

drop policy if exists "Authors and admins can delete content" on public.content;
create policy "Authors and admins can delete content"
  on public.content for delete to authenticated
  using (
    public.current_profile_role() = 'admin'
    or (author_id = auth.uid() and public.current_profile_can_write())
  );


-- ---------------------------------------------------------------------
-- documents
-- ---------------------------------------------------------------------
drop policy if exists "Users can upload documents" on public.documents;
create policy "Users can upload documents"
  on public.documents for insert to authenticated
  with check (
    uploaded_by = auth.uid()
    and (
      public.current_profile_role() = 'admin'
      or (
        division_id = public.current_profile_division()
        and status = 'approved'
        and public.current_profile_can_write()
      )
    )
  );

drop policy if exists "Users can update permitted documents" on public.documents;
create policy "Users can update permitted documents"
  on public.documents for update to authenticated
  using (
    public.current_profile_role() = 'admin'
    or (
      uploaded_by = auth.uid()
      and division_id = public.current_profile_division()
      and public.current_profile_can_write()
    )
  )
  with check (
    public.current_profile_role() = 'admin'
    or (
      uploaded_by = auth.uid()
      and division_id = public.current_profile_division()
      and status = 'approved'
      and public.current_profile_can_write()
    )
  );

drop policy if exists "Users can delete permitted documents" on public.documents;
create policy "Users can delete permitted documents"
  on public.documents for delete to authenticated
  using (
    public.current_profile_role() = 'admin'
    or (
      uploaded_by = auth.uid()
      and division_id = public.current_profile_division()
      and public.current_profile_can_write()
    )
  );


-- ---------------------------------------------------------------------
-- Berkas dokumen di Storage
-- ---------------------------------------------------------------------
drop policy if exists "Users can upload document files" on storage.objects;
create policy "Users can upload document files"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'documents'
    and (
      public.current_profile_role() = 'admin'
      or (
        (storage.foldername(name))[1] = public.current_profile_division()
        and public.current_profile_can_write()
      )
    )
  );

drop policy if exists "Owners and admins can update document files" on storage.objects;
create policy "Owners and admins can update document files"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'documents'
    and (
      public.current_profile_role() = 'admin'
      or (
        (storage.foldername(name))[1] = public.current_profile_division()
        and public.current_profile_can_write()
      )
    )
  )
  with check (bucket_id = 'documents');

drop policy if exists "Owners and admins can delete document files" on storage.objects;
create policy "Owners and admins can delete document files"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'documents'
    and (
      public.current_profile_role() = 'admin'
      or (
        (storage.foldername(name))[1] = public.current_profile_division()
        and public.current_profile_can_write()
      )
    )
  );


-- ---------------------------------------------------------------------
-- agenda_events - tabel opsional, dilewati bila belum dipasang
-- ---------------------------------------------------------------------
do $do$
begin
  drop policy if exists "Users can create agenda" on public.agenda_events;
  create policy "Users can create agenda"
    on public.agenda_events for insert to authenticated
    with check (
      created_by = auth.uid()
      and (
        public.current_profile_role() = 'admin'
        or (division_id = public.current_profile_division() and public.current_profile_can_write())
      )
    );

  drop policy if exists "Owners and admins can update agenda" on public.agenda_events;
  create policy "Owners and admins can update agenda"
    on public.agenda_events for update to authenticated
    using (
      public.current_profile_role() = 'admin'
      or (created_by = auth.uid() and public.current_profile_can_write())
    )
    with check (
      public.current_profile_role() = 'admin'
      or (created_by = auth.uid() and public.current_profile_can_write())
    );

  drop policy if exists "Owners and admins can delete agenda" on public.agenda_events;
  create policy "Owners and admins can delete agenda"
    on public.agenda_events for delete to authenticated
    using (
      public.current_profile_role() = 'admin'
      or (created_by = auth.uid() and public.current_profile_can_write())
    );
exception
  when undefined_table then
    raise notice 'Tabel agenda_events belum ada, bagian agenda dilewati.';
end
$do$;


-- ---------------------------------------------------------------------
-- budget_snapshots - tabel opsional
-- ---------------------------------------------------------------------
do $do$
begin
  drop policy if exists "Finance and admin can write budget snapshots" on public.budget_snapshots;
  create policy "Finance and admin can write budget snapshots"
    on public.budget_snapshots for insert to authenticated
    with check (
      public.current_profile_role() = 'admin'
      or (public.current_profile_division() = 'finance' and public.current_profile_can_write())
    );

  drop policy if exists "Finance and admin can update budget snapshots" on public.budget_snapshots;
  create policy "Finance and admin can update budget snapshots"
    on public.budget_snapshots for update to authenticated
    using (
      public.current_profile_role() = 'admin'
      or (public.current_profile_division() = 'finance' and public.current_profile_can_write())
    )
    with check (
      public.current_profile_role() = 'admin'
      or (public.current_profile_division() = 'finance' and public.current_profile_can_write())
    );
exception
  when undefined_table then
    raise notice 'Tabel budget_snapshots belum ada, bagian anggaran dilewati.';
end
$do$;


notify pgrst, 'reload schema';
