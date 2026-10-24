-- =====================================================================
-- Merapikan akun: menyisakan daftar di bawah, menghapus sisanya
--
-- PERINGATAN: penghapusan akun TIDAK BISA DIBATALKAN. Jalankan
-- LANGKAH 1 lebih dulu dan baca hasilnya. Baru jalankan LANGKAH 2
-- kalau daftarnya memang sudah benar.
--
-- Yang TIDAK ikut terhapus (sudah dipastikan dari skema):
--   - dokumen, laporan anggaran, master data, agenda yang pernah
--     diunggah akun itu  -> FK-nya "on delete set null", jadi datanya
--     tetap, hanya nama pengunggah di riwayat menjadi kosong.
-- Yang ikut terhapus:
--   - baris profiles-nya  -> FK "on delete cascade". Ini memang benar.
-- =====================================================================


-- ---------------------------------------------------------------------
-- DAFTAR YANG DIPERTAHANKAN
--
-- Diambil dari tangkapan layar. BELUM LENGKAP: baris 9, 10, 11, 13, 15,
-- 16, dan 17 tidak ikut terpotret, dan menurut urutan abjad bidang itu
-- adalah akun bidang HUKUM dan KEUANGAN. Tambahkan login mereka di sini
-- lebih dulu, kalau memang mau dipertahankan.
--
-- Akun username-saja (admin, bpkpbd1-5) ditulis username-nya.
-- Akun ber-email ditulis alamat lengkapnya.
-- ---------------------------------------------------------------------


-- =====================  LANGKAH 1 - LIHAT DULU  ======================
with dipertahankan (login) as (
  values
    ('admin'),
    ('dodi.haryadi@bpk.go.id'),
    ('bpkpbd1'), ('bpkpbd2'), ('bpkpbd3'), ('bpkpbd4'), ('bpkpbd5'),
    ('rahmadi@bpk.go.id'),
    ('fernandes.silab@bpk.go.id'),
    ('titus.fbk@bpk.go.id'),
    ('dien.kartiko@bpk.go.id'),
    ('fatchun.naim@bpk.go.id'),
    ('nur.jamin@bpk.go.id'),
    ('akunsdm@test.com'),
    ('helmi.fanfani@bpk.go.id'),
    ('mariam.isir@bpk.go.id'),
    ('randy.prayogi@bpk.go.id')
    -- <<< tambahkan baris 9, 10, 11, 13, 15, 16, 17 di sini
),
akun as (
  select
    u.id,
    coalesce(p.name, '(tanpa profil)')                     as nama,
    case when u.email like '%@jembatan.local'
         then p.username else u.email end                  as login,
    coalesce(d.name, '(seluruh bidang)')                   as bidang,
    coalesce(p.role, '-')                                  as peran
  from auth.users u
  left join public.profiles  p on p.id = u.id
  left join public.divisions d on d.id = p.division_id
)
select
  nama    as "AKAN DIHAPUS - Nama",
  login   as "Login",
  bidang  as "Bidang",
  peran   as "Peran"
from akun
where login is null
   or login not in (select login from dipertahankan)
order by bidang, nama;

-- Berhenti di sini. Periksa hasilnya.
-- Kalau ada nama bidang Hukum atau Keuangan yang muncul padahal masih
-- dipakai, tambahkan dulu login-nya ke daftar di atas, lalu ulangi.


-- =====================  LANGKAH 2 - HAPUS  ===========================
-- Jalankan HANYA setelah daftar di LANGKAH 1 benar-benar sesuai.
-- Hapus tanda komentar (--) di seluruh blok ini untuk menjalankannya.
--
-- with dipertahankan (login) as (
--   values
--     ('admin'),
--     ('dodi.haryadi@bpk.go.id'),
--     ('bpkpbd1'), ('bpkpbd2'), ('bpkpbd3'), ('bpkpbd4'), ('bpkpbd5'),
--     ('rahmadi@bpk.go.id'),
--     ('fernandes.silab@bpk.go.id'),
--     ('titus.fbk@bpk.go.id'),
--     ('dien.kartiko@bpk.go.id'),
--     ('fatchun.naim@bpk.go.id'),
--     ('nur.jamin@bpk.go.id'),
--     ('akunsdm@test.com'),
--     ('helmi.fanfani@bpk.go.id'),
--     ('mariam.isir@bpk.go.id'),
--     ('randy.prayogi@bpk.go.id')
--     -- <<< daftar ini HARUS sama persis dengan LANGKAH 1
-- ),
-- akun as (
--   select
--     u.id,
--     case when u.email like '%@jembatan.local'
--          then p.username else u.email end as login
--   from auth.users u
--   left join public.profiles p on p.id = u.id
-- )
-- delete from auth.users
-- where id in (
--   select id from akun
--   where login is null
--      or login not in (select login from dipertahankan)
-- )
-- returning email, id;
