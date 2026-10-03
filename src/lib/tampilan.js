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
