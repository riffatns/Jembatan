-- Ringkasan anggaran boleh dibaca tanpa login.
--
-- Halaman masuk menampilkan kartu Realisasi dan Sisa Anggaran, dan halaman itu
-- tampil sebelum siapa pun login. Selama ini angkanya datang dari salinan Excel
-- yang ikut terbundel di aplikasi, yang membeku sejak di-commit dan sudah
-- meleset jauh dari angka Master Data.
--
-- Supaya angkanya ikut Master Data, pembacanya harus boleh menjangkau
-- budget_snapshots tanpa sesi login.
--
-- YANG TERBUKA: hanya baris ringkasan - tahun anggaran, total pagu, total
-- realisasi, total sisa, dan persentasenya. Angka itu memang sudah dipajang di
-- halaman masuk selama ini, jadi tidak ada yang baru terlihat; yang berubah
-- angkanya menjadi benar.
--
-- YANG TETAP TERTUTUP: public.budget_reports, yaitu laporan realisasi SP2D per
-- akun beserta rinciannya, dan seluruh tabel lain. Kebijakan ini sengaja hanya
-- menyentuh tabel ringkasan.
--
-- Kebijakan lama untuk pengguna yang sudah masuk tidak diubah. Keduanya
-- berdampingan: kebijakan select bersifat permisif, jadi yang berlaku adalah
-- gabungannya.
--
-- Untuk menutupnya kembali, cukup jalankan baris drop di bawah tanpa create-nya.

drop policy if exists "Anyone can read budget snapshots" on public.budget_snapshots;

create policy "Anyone can read budget snapshots"
  on public.budget_snapshots for select to anon using (true);
