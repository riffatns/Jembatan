-- =====================================================================
-- Bukti akun pengguna Portal JEMBATAN
--
-- Dijalankan di Supabase Dashboard > SQL Editor, bukan dari aplikasi:
-- auth.users tidak pernah terbuka lewat PostgREST, jadi kunci anon di
-- peramban memang tidak bisa membacanya. Itu disengaja.
--
-- Query ini hanya SELECT - tidak mengubah, menambah, atau menghapus
-- apa pun, jadi aman dijalankan berulang kali.
--
-- Kolom auth.users.encrypted_password sengaja TIDAK diambil. Yang perlu
-- dibuktikan adalah akunnya ada dan bisa dipakai, bukan isi sandinya.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. Daftar lengkap akun  (ini bukti utamanya)
-- ---------------------------------------------------------------------
select
  row_number() over (order by d.name nulls first, p.name)  as "No",
  coalesce(p.name, '(tanpa profil)')                       as "Nama",

  -- Akun viewer (bpkpbd1-5) tidak punya email sungguhan; alamat
  -- penampungnya @jembatan.local tidak perlu ditampilkan sebagai bukti.
  case
    when u.email like '%@jembatan.local' then p.username
    else u.email
  end                                                      as "Login",

  coalesce(p.position, '-')                                as "Jabatan",
  coalesce(d.name, '(seluruh bidang)')                     as "Bidang",
  coalesce(p.role, '-')                                    as "Peran",

  case
    when u.email_confirmed_at is not null then 'Aktif'
    else 'Belum dikonfirmasi'
  end                                                      as "Status",

  -- Waktu disetel ke WIT (Sorong), bukan UTC, supaya langsung terbaca.
  to_char(u.created_at at time zone 'Asia/Jayapura',
          'DD-MM-YYYY HH24:MI')                            as "Dibuat",

  coalesce(
    to_char(u.last_sign_in_at at time zone 'Asia/Jayapura',
            'DD-MM-YYYY HH24:MI'),
    'Belum pernah'
  )                                                        as "Terakhir Masuk"

from auth.users u
left join public.profiles  p on p.id = u.id
left join public.divisions d on d.id = p.division_id
order by d.name nulls first, p.name;


-- ---------------------------------------------------------------------
-- 2. Ringkasan angka  (untuk kalimat pembuka laporan)
-- ---------------------------------------------------------------------
select
  count(*)                                                   as "Total Akun",
  count(*) filter (where u.email_confirmed_at is not null)    as "Aktif",
  count(*) filter (where u.last_sign_in_at is not null)       as "Sudah Pernah Masuk",
  count(*) filter (where u.last_sign_in_at is null)           as "Belum Pernah Masuk"
from auth.users u;


-- ---------------------------------------------------------------------
-- 3. Rekap per bidang  (memperlihatkan sebarannya sudah lengkap)
-- ---------------------------------------------------------------------
select
  coalesce(d.name, '(seluruh bidang)')                       as "Bidang",
  count(*)                                                   as "Jumlah",
  string_agg(coalesce(p.name, u.email), ', ' order by p.name) as "Nama Pengguna"
from auth.users u
left join public.profiles  p on p.id = u.id
left join public.divisions d on d.id = p.division_id
group by d.name
order by d.name nulls first;
