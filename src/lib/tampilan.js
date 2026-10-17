// Saklar tampilan yang berlaku untuk seluruh bidang.
//
// Keterangan sumber angka - "Jumlah riil pada berkas bezetting", "45 dari 85
// formasi", "Seluruh angka dibaca dari berkas bezetting terbaru", "Diperbarui
// 3 Oktober 2026" - untuk sementara tidak ditampilkan. Keterangan itu menjawab
// pertanyaan "angka ini datang dari mana", yang berguna saat datanya masih
// diragukan tetapi jadi ramai di layar begitu datanya sudah dipercaya.
//
// Kodenya sengaja tidak dihapus, hanya dilewati, supaya bisa dihidupkan lagi
// tanpa menulis ulang: ubah nilai di bawah menjadi true.
export const TAMPILKAN_SUMBER_ANGKA = false

// Dashboard Subbagian Keuangan memakai Dashboard Anggaran yang baru. Dashboard
// lama tidak dihapus, hanya disembunyikan: ubah menjadi false untuk kembali.
export const USE_NEW_FINANCE_DASHBOARD = true

// Menu Belanja Pegawai/Barang/Modal di Subbagian Keuangan memakai tampilan
// akun dari Master Data Anggaran. Tampilan lama (angka + daftar dokumen) tidak
// dihapus: ubah menjadi false untuk kembali. Bidang lain tidak terpengaruh.
export const USE_NEW_ACCOUNT_VIEWS = true

// Menu Bezetting di Bidang SDM memakai tampilan dari Master Data SDM, dan
// sidebar SDM mengikuti pola Keuangan. Tampilan lama tidak dihapus: ubah
// menjadi false untuk kembali.
export const USE_NEW_HR_VIEWS = true

// Dashboard Subbagian SDM memakai Dashboard SDM bergaya Dashboard Anggaran.
// Ringkasan SDM yang lama tidak dihapus: ubah menjadi false untuk kembali.
export const USE_NEW_HR_DASHBOARD = true

// Dashboard Subbagian Hukum, bergaya sama dengan Dashboard Anggaran. Bidang
// Hukum sebelumnya memakai kartu jumlah dokumen bawaan; itu kembali bila
// saklar ini diubah menjadi false.
export const USE_NEW_LEGAL_DASHBOARD = true

// Dashboard Subbagian Umum dan TI, bergaya sama dengan Dashboard Anggaran.
// Angkanya dari daftar BMN layanan Aset dan dokumen bidang ini. Tampilan lama
// kembali bila saklar ini diubah menjadi false.
export const USE_NEW_IT_DASHBOARD = true

// Dashboard Subbagian Humas dan TU Kalan, bergaya sama dengan Dashboard
// Anggaran. Angkanya dari agenda pimpinan dan dokumen bidang ini. Tampilan
// lama kembali bila saklar ini diubah menjadi false.
export const USE_NEW_PR_DASHBOARD = true

// Menu Aset di Subbagian Umum dan TI memakai Master Data Aset, dan sidebar
// Umum dan TI mengikuti pola Keuangan/SDM. Halaman layanan Aset yang lama
// (unggah dokumen + daftar dokumen) tidak dihapus: ubah menjadi false untuk
// kembali.
export const USE_NEW_ASSET_VIEWS = true

// Marka kata "JEMBATAN" di halaman pilih bidang. Sejak marka kata itu tampil
// besar di halaman masuk, menampilkannya dua kali berturut-turut jadi
// mengulang. Kodenya tidak dihapus: ubah menjadi true untuk menampilkannya
// lagi di halaman pilih bidang.
export const TAMPILKAN_MARKA_TRANSISI = false
