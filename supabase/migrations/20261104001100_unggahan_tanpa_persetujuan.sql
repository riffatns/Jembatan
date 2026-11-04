-- Unggahan dokumen langsung masuk, tanpa antrean persetujuan.
--
-- Aplikasi sudah selalu menulis status = 'approved'. Migrasi ini merapikan sisa
-- di basis data: dokumen yang masih terjebak 'pending' dianggap sudah masuk,
-- karena halaman untuk menyetujuinya tidak ada lagi. Nilai bawaan kolom ikut
-- diganti supaya penulisan dari luar aplikasi tidak membuat antrean baru.
--
-- Dokumen 'rejected' sengaja tidak diubah: penolakan itu keputusan yang pernah
-- diambil, dan alasannya masih ditampilkan di rincian dokumen.
--
-- Kebijakan RLS tidak berubah: siapa yang boleh mengunggah ke bidang mana tetap
-- sama, dan jalur pegawai memang hanya menerima status 'approved'.

alter table public.documents
  alter column status set default 'approved';

update public.documents
  set status = 'approved'
  where status = 'pending';
