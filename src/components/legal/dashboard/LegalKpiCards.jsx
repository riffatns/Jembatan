import { IconAlert, IconDocument, IconFolderDocuments } from '../../icons/DuotoneIcons'
import { CountCard, KPI_ROW_CLASS, RingCard } from '../../dashboard/DashboardKpiCards'
import { REVIEW_WINDOW_DAYS } from './legalDashboardModel'

// Tiga kartu angka lalu dua cincin persentase - susunan yang sama dengan
// Dashboard Anggaran dan Dashboard SDM. Bentuk kartunya di
// components/dashboard/DashboardKpiCards.jsx.

export function LegalKpiCards({ model }) {
  const { total, aktifShare, perluTindakanShare } = model

  return (
    <section className={KPI_ROW_CLASS}>
      <CountCard
        icon={IconFolderDocuments}
        label="Kerja Sama Berjangka"
        value={total.kerjaSama}
        note={total.tanpaMasaBerlaku ? `${total.tanpaMasaBerlaku} belum dicatat masa berlakunya` : 'Seluruhnya punya masa berlaku'}
        color="#2a78d6"
        satuan="berkas"
      />
      <CountCard
        icon={IconAlert}
        label="Perlu Ditinjau"
        value={total.review}
        note={`Berakhir dalam ${REVIEW_WINDOW_DAYS} hari`}
        color="#f59e0b"
        satuan="berkas"
      />
      <CountCard
        icon={IconDocument}
        label="Sudah Berakhir"
        value={total.berakhir}
        note="Masa berlakunya sudah lewat"
        color="#dc2626"
        satuan="berkas"
      />
      <RingCard label="Masih Aktif" percent={aktifShare} color="#16a34a" keterangan="dari kerja sama berjangka" />
      <RingCard label="Perlu Tindakan" percent={perluTindakanShare} color="#f59e0b" keterangan="ditinjau atau sudah berakhir" />
    </section>
  )
}
