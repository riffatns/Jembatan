import { isSupabaseConfigured, supabase } from './supabaseClient'

// Riwayat masuk pengguna untuk halaman Akses.
//
// Datanya tidak bisa diambil dengan query biasa: waktu masuk ada di
// auth.users yang tidak terbuka lewat PostgREST, dan kebijakan select pada
// profiles hanya mengizinkan membaca baris sendiri. Satu-satunya jalan
// adalah fungsi daftar_akses() di Supabase, yang memeriksa haknya sendiri
// (lihat migrasi 20261017000900_akses_teknis.sql).
//
// Karena itu penolakan datang dari database, bukan dari React - menyembunyikan
// menunya saja tidak akan menutup apa pun.

export async function fetchDaftarAkses() {
  if (!isSupabaseConfigured) {
    return { rows: [], error: 'Halaman Akses hanya tersedia bila portal terhubung ke Supabase.' }
  }

  const { data, error } = await supabase.rpc('daftar_akses')

  if (error) {
    // Fungsi belum ada: migrasinya belum dijalankan.
    if (/function .*daftar_akses.* does not exist|schema cache/i.test(error.message)) {
      return {
        rows: [],
        error: 'Fungsi daftar_akses belum ada di Supabase. Jalankan supabase/migrations/20261017000900_akses_teknis.sql di SQL Editor.'
      }
    }
    return { rows: [], error: error.message }
  }

  return { rows: data || [], error: null }
}
