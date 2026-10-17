-- =====================================================================
-- Halaman Akses: riwayat masuk pengguna, khusus pengelola teknis
--
-- Dua hal yang membuat ini tidak bisa dikerjakan di sisi React saja:
--
-- 1. Waktu masuk tersimpan di auth.users, yang tidak pernah terbuka lewat
--    PostgREST. Kunci anon di browser tidak bisa membacanya.
-- 2. Kebijakan select pada public.profiles hanya mengizinkan membaca baris
--    sendiri (id = auth.uid()), jadi daftar seluruh pengguna pun tertutup.
--
-- Karena itu datanya diambil lewat satu fungsi security definer yang
-- memeriksa haknya sendiri di dalam, dan hanya mengembalikan kolom yang
-- memang boleh dilihat. Tidak ada tabel baru dan tidak ada kebijakan yang
-- dilonggarkan.
--
-- Idempoten: aman dijalankan berulang.
-- =====================================================================

-- Penanda pengelola teknis. Sengaja terpisah dari role: peran menentukan
-- siapa boleh mengubah data bidang, penanda ini menentukan siapa boleh
-- melihat riwayat masuk. Kepala Perwakilan berperan admin tetapi belum tentu
-- orang yang mengurus sistemnya, dan sebaliknya.
alter table public.profiles
  add column if not exists is_teknis boolean not null default false;

comment on column public.profiles.is_teknis is
  'Pengelola teknis portal. Hanya menentukan akses ke halaman Akses; tidak menambah hak apa pun atas data bidang.';


create or replace function public.current_profile_is_teknis()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select is_teknis from public.profiles where id = auth.uid()), false);
$$;

comment on function public.current_profile_is_teknis() is
  'True bila profil yang sedang login ditandai sebagai pengelola teknis.';


-- Pengguna tidak boleh menandai dirinya sendiri sebagai pengelola teknis.
-- Trigger yang sudah ada mengunci role dan division_id; is_teknis ikut
-- dikunci di sini, dengan cara dan pengecualian yang sama (SQL Editor dan
-- service role tidak membawa auth.uid(), jadi pengaturan oleh pengelola
-- tetap berjalan).
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and coalesce(public.current_profile_role(), '') <> 'admin' then
    new.role := old.role;
    new.division_id := old.division_id;
  end if;

  -- is_teknis tidak bisa diubah dari aplikasi oleh siapa pun, termasuk admin.
  -- Penandaannya dilakukan pengelola lewat SQL Editor, supaya daftar orang
  -- yang bisa melihat riwayat masuk tidak bisa bertambah lewat antarmuka.
  if auth.uid() is not null then
    new.is_teknis := old.is_teknis;
  end if;

  return new;
end;
$$;

drop trigger if exists protect_profile_role on public.profiles;

create trigger protect_profile_role
  before update on public.profiles
  for each row execute function public.protect_profile_role();


-- Riwayat masuk seluruh pengguna. Yang dikembalikan hanya kolom yang perlu
-- untuk menjawab "siapa memakai portal ini dan kapan terakhir" - bukan data
-- pribadi pegawai, yang tetap tinggal di master_dataset_private.
create or replace function public.daftar_akses()
returns table (
  id              uuid,
  nama            text,
  username        text,
  email           text,
  peran           text,
  bidang_id       text,
  bidang          text,
  jabatan         text,
  is_teknis       boolean,
  terakhir_masuk  timestamptz,
  dibuat_pada     timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.current_profile_is_teknis() then
    raise exception 'Halaman Akses hanya untuk pengelola teknis portal.'
      using errcode = 'insufficient_privilege';
  end if;

  return query
    select
      u.id,
      coalesce(p.name, '(tanpa profil)')::text,
      p.username::text,
      u.email::text,
      coalesce(p.role, '-')::text,
      p.division_id::text,
      d.name::text,
      p.position::text,
      coalesce(p.is_teknis, false),
      u.last_sign_in_at,
      u.created_at
    from auth.users u
    left join public.profiles p on p.id = u.id
    left join public.divisions d on d.id = p.division_id
    order by u.last_sign_in_at desc nulls last, coalesce(p.name, u.email::text);
end;
$$;

comment on function public.daftar_akses() is
  'Riwayat masuk seluruh pengguna. Menolak pemanggil yang bukan pengelola teknis.';

-- Hanya pengguna yang sudah masuk yang boleh memanggil; penyaring
-- sesungguhnya ada di dalam fungsi.
revoke execute on function public.daftar_akses() from anon;
revoke execute on function public.current_profile_is_teknis() from anon;


notify pgrst, 'reload schema';


-- =====================================================================
-- Menandai pengelola teknis
--
-- Jalankan terpisah di SQL Editor, sesuaikan daftarnya. Tidak bisa
-- dilakukan lewat aplikasi - itu disengaja.
--
--   update public.profiles
--      set is_teknis = true, updated_at = now()
--    where username in ('helmi.fanfani', 'mariam.isir', 'randy.prayogi');
--
-- Melihat siapa saja yang sudah ditandai:
--
--   select username, name, role, is_teknis
--     from public.profiles where is_teknis order by username;
-- =====================================================================
