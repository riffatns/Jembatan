import { MONTH_NAMES } from '../../../lib/budgetReportParser'
import { Button } from '../../ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../ui/dialog'

// Konfirmasi sebelum mengosongkan data satu tahun anggaran.
export function MasterDeleteDialog({ report, deleting, onCancel, onConfirm }) {
  return (
    <Dialog open={Boolean(report)} onOpenChange={(open) => { if (!open) onCancel() }}>
      <DialogContent className="max-w-md">
        <DialogHeader onClose={onCancel}>
          <DialogTitle>Kosongkan data TA {report?.fiscalYear}?</DialogTitle>
          <DialogDescription>
            Laporan s.d. {report ? MONTH_NAMES[report.periodMonth - 1] : '-'} akan dihapus. Dashboard Keuangan dan menu
            Belanja Pegawai, Belanja Barang, dan Belanja Modal TA {report?.fiscalYear} kembali kosong sampai laporan
            baru diunggah. Riwayat unggah tetap tersimpan.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel} disabled={deleting}>Batal</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={deleting}>
            {deleting ? 'Menghapus...' : 'Hapus data'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
