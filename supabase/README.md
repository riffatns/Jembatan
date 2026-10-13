# SQL portal JEMBATAN

Mulai sekarang perubahan basis data ditulis sebagai **migrasi berversi** di
`supabase/migrations/`, bukan lagi ditempel satu per satu ke SQL Editor.

Alasannya bukan kerapian. Dengan cara lama tidak ada catatan apa pun tentang
SQL mana yang sudah dijalankan di proyek mana. Selama pengerjanya satu orang
dan proyeknya satu, itu masih bisa diingat. Begitu ada proyek kedua — misalnya
Supabase baru di akun lain — tidak ada cara memastikan keduanya sama selain
membandingkan tabel satu per satu.

## Isi `migrations/`

Berurutan, dan urutannya mengikat:

| Berkas | Isi | Asal |
|---|---|---|
| `…000100_skema_awal.sql` | Tabel inti: divisions, profiles, document_categories, documents, content, indeks, RLS, kebijakan baca | `schema.sql` |
| `…000200_data_acuan.sql` | Daftar bidang dan kategori layanan, tabel `budget_snapshots` | `seed.sql` |
| `…000300_kebijakan_akses.sql` | Fungsi `current_profile_role()`/`current_profile_division()`, kebijakan tulis, bucket `documents` | `policies.sql` |
| `…000400_migrasi_susulan.sql` | Semua yang menyusul: status arsip, agenda, aset BMN, Master Data Anggaran, Master Data generik, bucket `master-files`, angka bidang, pengunci peran profil | `jalankan-semua.sql` bagian 0–9 |

Seluruhnya idempoten — aman dijalankan ulang di basis data yang isinya sudah
ada.

**Yang sengaja tidak ikut:** dokumen dan konten contoh dari `seed.sql`. Itu data
pajangan untuk mencoba tampilan, dan tidak pantas ada di basis data sungguhan.
Kalau memang ingin mengisinya saat mencoba, jalankan `seed.sql` apa adanya.

## Proyek yang sudah jalan

Basis data yang sekarang dipakai **sudah berisi semua ini**. Jangan jalankan
migrasinya — cukup beri tahu CLI bahwa keempatnya sudah terpasang, supaya ke
depan hanya migrasi baru yang dikirim:

```bash
npx supabase@latest link --project-ref <ref-proyek-anda>
npx supabase@latest migration repair --status applied 20260920000100
npx supabase@latest migration repair --status applied 20260920000200
npx supabase@latest migration repair --status applied 20260920000300
npx supabase@latest migration repair --status applied 20261013000400
npx supabase@latest migration list
```

`migration list` harus menampilkan keempatnya sebagai sudah terpasang, di sisi
lokal maupun remote. Setelah itu basis datanya tidak tersentuh sama sekali —
yang berubah hanya catatan CLI tentang apa yang sudah berjalan.

Ref proyek ada di URL dasbor Supabase (`https://supabase.com/dashboard/project/<ref>`).

## Proyek baru dari nol

```bash
npx supabase@latest link --project-ref <ref-proyek-baru>
npx supabase@latest db push
```

Lalu buat akunnya dengan `users.sql` lewat SQL Editor. Berkas itu sengaja tidak
dijadikan migrasi: isinya butuh kata sandi yang Anda ketik sendiri saat
menjalankannya, dan kata sandi tidak boleh masuk repo.

## Menambah perubahan baru

```bash
npx supabase@latest migration new nama_singkat_perubahan
```

Tulis SQL-nya di berkas yang terbentuk, lalu:

```bash
npx supabase@latest db push
```

Tetap tulis SQL yang idempoten (`if not exists`, `drop policy if exists`) dan
akhiri dengan `notify pgrst, 'reload schema';` bila ada kolom yang berubah.

## Berkas lama

`schema.sql`, `seed.sql`, `policies.sql`, `jalankan-semua.sql`, dan berkas per
fitur lainnya **dibiarkan apa adanya**. Isinya sudah tersalin ke migrasi di
atas, tetapi berkasnya tidak dihapus karena masih dirujuk README proyek dan
repo serah-terima.

Untuk perubahan baru, pakai `migrations/`. Berkas lama tidak lagi perlu
ditambah.

`users.sql`, `set-role.sql`, dan `create-employee-finance.sql` tetap dipakai
seperti biasa — ketiganya mengurus akun dan butuh kata sandi yang diketik saat
dijalankan.
