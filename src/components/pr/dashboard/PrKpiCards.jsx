import { IconCalendar, IconClock, IconFolderDocuments } from '../../icons/DuotoneIcons'
import { CountCard, KPI_ROW_CLASS, RingCard } from '../../dashboard/DashboardKpiCards'

// Tiga kartu angka lalu dua cincin persentase - susunan yang sama dengan
// Dashboard Anggaran, SDM, Hukum, dan Umum dan TI.

export function PrKpiCards({ model }) {
  const { total, terlaksanaShare, disetujuiShare, terdekat, tahunIni } = model
  const berikutnya = terdekat[0]

  return (
    <section className={KPI_ROW_CLASS}>
      <CountCard
        icon={IconCalendar}
        label={`Agenda ${tahunIni}`}
        value={total.tahunIni}
        note={total.agenda === total.tahunIni ? 'Seluruh agenda tercatat' : `${total.agenda} agenda sepanjang catatan`}
        color="#2a78d6"
        satuan="kegiatan"
      />
      <CountCard
        icon={IconClock}
        label="Akan Datang"
        value={total.akanDatang}
        note={berikutnya ? `Terdekat: ${berikutnya.title}` : 'Belum ada agenda mendatang'}
        color="#6d4fe0"
        satuan="kegiatan"
      />
      <CountCard
        icon={IconFolderDocuments}
        label="Dokumen Layanan"
        value={total.dokumen}
        note={total.menunggu ? `${total.menunggu} menunggu persetujuan` : 'Tidak ada yang menunggu persetujuan'}
        color="#1fae7a"
        satuan="berkas"
      />
      <RingCard label="Agenda Terlaksana" percent={terlaksanaShare} color="#1fae7a" keterangan="dari agenda yang sudah lewat" />
      <RingCard label="Dokumen Disetujui" percent={disetujuiShare} color="#2a78d6" keterangan="dari seluruh dokumen layanan" />
    </section>
  )
}
