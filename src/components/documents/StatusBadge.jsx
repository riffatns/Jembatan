import { Badge } from '../ui/badge'

// Unggahan kini langsung masuk, jadi "Pending" dan "Approved" tidak lagi
// membedakan apa pun. Hanya dokumen lama yang pernah ditolak yang masih diberi
// tanda, karena penolakan itu tetap keterangan yang perlu terbaca.
export function StatusBadge({ status, className }) {
  if (status !== 'rejected') return null

  return (
    <Badge variant="destructive" className={className}>
      Ditolak
    </Badge>
  )
}
