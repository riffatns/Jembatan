import { IconAlert, IconDatabase, IconFolderDocuments } from '../../icons/DuotoneIcons'
import { CountCard, KPI_ROW_CLASS, RingCard } from '../../dashboard/DashboardKpiCards'
import { formatPercent } from '../../../lib/budgetFormat'

// Tiga kartu angka lalu dua cincin persentase - susunan yang sama dengan
// Dashboard Anggaran, SDM, dan Hukum.

export function ItKpiCards({ model }) {
  const { total, pspShare, nilaiBukuShare, jenisCount } = model

  return (
    <section className={KPI_ROW_CLASS}>
      <CountCard
        icon={IconDatabase}
        label="Aset Tercatat"
        value={total.aset}
        note={jenisCount ? `${jenisCount} jenis BMN` : 'Belum ada daftar BMN'}
        color="#2a78d6"
        satuan="unit"
      />
      <CountCard
        icon={IconAlert}
        label="Belum ber-PSP"
        value={total.belumPsp}
        note={total.aset ? `${formatPercent(100 - pspShare)} dari aset tercatat` : 'Belum ada daftar BMN'}
        color="#eda100"
        satuan="unit"
      />
      <CountCard
        icon={IconFolderDocuments}
        label="Dokumen Layanan"
        value={total.dokumen}
        note={total.menunggu ? `${total.menunggu} menunggu persetujuan` : 'Tidak ada yang menunggu persetujuan'}
        color="#6d4fe0"
        satuan="berkas"
      />
      <RingCard label="Aset Ber-PSP" percent={pspShare} color="#1fae7a" keterangan="dari aset tercatat" />
      <RingCard label="Nilai Buku Tersisa" percent={nilaiBukuShare} color="#2a78d6" keterangan="dari nilai perolehan" />
    </section>
  )
}
