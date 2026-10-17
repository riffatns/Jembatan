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

// Label jabatan yang tampil di samping nama pengguna (menu akun, topbar,
// halaman Profil). Sebelumnya yang tampil nama peran teknis - "Employee",
// "Administrator" - yang tidak berarti apa-apa bagi pembacanya.
//
// Sengaja kasar, hanya empat kemungkinan. Jabatan asli di profiles.position
// terlalu rinci untuk label sesempit ini ("Penata Kelola Sistem dan Teknologi
// Informasi" tidak akan muat), dan yang ingin diketahui pembaca cuma: ini
// pimpinan kantor, kepala sekretariat, kepala subbagian, atau staf.
//
// Dua jabatan teratas ditulis utuh karena memang hanya ada satu orang untuk
// masing-masing; sisanya diringkas jadi Kepala Divisi / Staff Divisi.
//
// Peran (admin/employee/viewer) tidak ikut berubah - ini label tampilan, dan
// hak akses tetap ditegakkan RLS di Supabase, bukan oleh tulisan ini.
// Ketiga polanya terpaku di awal teks: tanpa itu jabatan seperti
// "Staf Pendukung Kepala Perwakilan" ikut terbaca sebagai pimpinan kantor.
export function getPositionLabel(user) {
  const position = String(user?.position || '').trim()

  if (/^kepala\s+perwakilan/i.test(position)) return 'Kepala Perwakilan'
  if (/^kepala\s+sekretariat/i.test(position)) return 'Kepala Sekretariat Perwakilan'
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
