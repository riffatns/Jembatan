export const ROLE_DEFINITIONS = {
  admin: {
    label: 'Administrator',
    variant: 'default',
    canApprove: true,
    canUpload: true,
    canManageAllDocuments: true
  },
  employee: {
    label: 'Employee',
    variant: 'teal',
    canApprove: false,
    canUpload: true,
    canManageAllDocuments: false
  },
  viewer: {
    label: 'Viewer',
    variant: 'outline',
    canApprove: false,
    canUpload: false,
    canManageAllDocuments: false
  }
}

export function getRoleInfo(role) {
  return ROLE_DEFINITIONS[role] || ROLE_DEFINITIONS.viewer
}

// Akun yang masuk dengan username saja (bpkpbd1, superadmin, keuangan, ...)
// tetap wajib punya alamat email di Supabase Auth - itu satu-satunya cara
// signInWithPassword mengenali mereka. AuthContext membuatkannya otomatis
// dengan domain penampung di bawah ini.
//
// Alamat itu tidak pernah bisa menerima surat, jadi menampilkannya hanya
// membingungkan pemakainya: yang dia ketik saat masuk adalah username-nya.
export const INTERNAL_EMAIL_DOMAIN = '@jembatan.local'

export function isInternalEmail(email) {
  return String(email || '').toLowerCase().endsWith(INTERNAL_EMAIL_DOMAIN)
}

// Yang ditampilkan sebagai identitas akun: email sungguhan bila ada,
// username bila alamatnya cuma penampung.
export function accountIdentity(user) {
  if (isInternalEmail(user?.email)) return user?.username || ''
  return user?.email || ''
}

// Label jabatan yang tampil di samping nama pengguna (menu akun, topbar,
// halaman Profil). Sebelumnya yang tampil nama peran teknis - "Employee",
// "Administrator" - yang tidak berarti apa-apa bagi pembacanya.
//
// Sengaja kasar. Jabatan asli di profiles.position terlalu rinci untuk label
// sesempit ini ("Penata Kelola Sistem dan Teknologi Informasi" tidak akan
// muat), dan yang ingin diketahui pembaca cuma: ini pimpinan kantor, kepala
// sekretariat, kepala subbagian, atau staf.
//
// Dua jabatan teratas ditulis utuh karena memang hanya ada satu orang untuk
// masing-masing. Kepala Subbagian disebut Verifikator, mengikuti sebutan
// jabatannya di BPK; sisanya Staff Divisi.
//
// Seluruhnya label tampilan belaka. Peran (admin/employee/viewer) tidak ikut
// berubah, dan hak akses tetap ditegakkan RLS di Supabase - termasuk
// "Verifikator", yang di portal ini tidak punya apa pun untuk diverifikasi.
//
// Polanya terpaku di awal teks: tanpa itu jabatan seperti "Staf Pendukung
// Kepala Perwakilan" ikut terbaca sebagai pimpinan kantor.
export function getPositionLabel(user) {
  const position = String(user?.position || '').trim()

  if (/^kepala\s+perwakilan/i.test(position)) return 'Kepala Perwakilan'
  if (/^kepala\s+sekretariat/i.test(position)) return 'Kepala Sekretariat Perwakilan'
  if (/^kepala\s+subbagian/i.test(position)) return 'Verifikator'
  if (/^kepala\b/i.test(position)) return 'Kepala Divisi'
  if (user?.division) return 'Staff Divisi'

  // Tanpa bidang dan tanpa jabatan "Kepala": akun layanan seperti
  // superadmin. Pakai nama perannya, yang memang menerangkannya.
  return getRoleInfo(user?.role).label
}

// Label jabatan beserta warna lencananya. Warnanya tetap mengikuti peran,
// supaya admin tetap terbaca berbeda dari pegawai biasa.
export function getPositionInfo(user) {
  return { ...getRoleInfo(user?.role), label: getPositionLabel(user) }
}
