-- Layanan JDIH pada Bidang Hukum berganti nama menjadi "Kajian Hukum".
--
-- Yang berubah hanya namanya. Id layanannya tetap 'jdih' karena id itu dirujuk
-- kolom category_id pada setiap dokumen yang sudah tersimpan; menggantinya akan
-- memutus dokumen-dokumen itu dari layanannya.
--
-- Nama layanan dibaca aplikasi dari tabel ini, bukan dari kode, sehingga tanpa
-- migrasi ini pengguna yang terhubung ke Supabase tetap melihat "JDIH".
--
-- Layanan "Manajemen Risiko Perwakilan" tidak dihapus di sini. Ia hanya
-- disembunyikan dari tampilan lewat HIDDEN_CATEGORIES di src/data/seed.js,
-- mengikuti cara yang sudah dipakai untuk Peminjaman Aset. Barisnya beserta
-- dokumen yang sudah tersimpan di dalamnya dibiarkan utuh: menghapusnya akan
-- memutus dokumen itu dari kategorinya, dan memunculkannya kembali cukup
-- dengan menghapus satu baris di berkas tadi.

update public.document_categories
set name = 'Kajian Hukum',
    description = 'Telaah dan kajian hukum perwakilan.'
where division_id = 'legal'
  and id = 'jdih';
