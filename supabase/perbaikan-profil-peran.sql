-- Perbaikan keamanan: pengguna tidak boleh mengubah peran atau bidangnya sendiri.
-- Jalankan di SQL Editor Supabase. Aman diulang.
--
-- Kebijakan "Users can update their profile" (schema.sql) mengizinkan setiap
-- pengguna mengubah barisnya sendiri tanpa batas kolom. Akibatnya siapa pun
-- yang login bisa menjalankan update role = 'admin' dari browser dan lolos
-- semua kebijakan RLS lain. Trigger ini mengunci role dan division_id: hanya
-- administrator yang bisa mengubahnya lewat aplikasi.
--
-- SQL Editor dan service role tidak membawa auth.uid(), jadi set-role.sql dan
-- pengaturan peran oleh pengelola tetap berjalan seperti biasa.

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
  return new;
end;
$$;

drop trigger if exists protect_profile_role on public.profiles;

create trigger protect_profile_role
  before update on public.profiles
  for each row execute function public.protect_profile_role();
