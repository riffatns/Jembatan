import { Button } from './button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './dialog'

// Dialog konfirmasi global untuk aksi yang tidak bisa dibatalkan (hapus,
// kosongkan, ganti). Pakai ini, bukan window.confirm. Lihat CLAUDE.md.
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Hapus',
  busyLabel = 'Memproses...',
  variant = 'destructive',
  busy = false,
  onCancel,
  onConfirm
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next && !busy) onCancel() }}>
      <DialogContent className="max-w-md">
        <DialogHeader onClose={busy ? undefined : onCancel}>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel} disabled={busy}>Batal</Button>
          <Button variant={variant} onClick={onConfirm} disabled={busy}>{busy ? busyLabel : confirmLabel}</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
