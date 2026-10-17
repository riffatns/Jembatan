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
