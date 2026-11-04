import { IconCalendar, IconDocument, IconFolderDocuments } from '../../icons/DuotoneIcons'
import { formatPercent } from '../../../lib/budgetFormat'
import { CARD_CLASS, LABEL_CLASS } from '../../ui/cardStyles'
import { useCountUp } from '../../../hooks/useAnimatedProgress'

// Ringkasan berkas satu layanan, dengan bentuk kartu yang sama dengan
// Dashboard Anggaran dan menu akun Keuangan: ikon bulat berwarna di samping
// label, angka besar di bawahnya, keterangan kecil di bawahnya lagi.
//
// Angkanya dihitung dari dokumen yang sedang tampil, jadi ikut menyesuaikan
// saat penyaring tahun atau pencarian diubah - kartunya menerangkan yang sedang
// dilihat, bukan yang ada di basis data.

const WARNA = {
  biru: '#2a78d6',
  hijau: '#1fae7a',
  oren: '#eda100'
}

function Kartu({ icon: Icon, label, value, note, color }) {
  const shown = useCountUp(value)

  return (
    <div className={`${CARD_CLASS} col-span-2 !flex-row items-center gap-3.5 lg:col-span-1`}>
      <div className="min-w-0 flex-1" style={{ containerType: 'inline-size' }}>
        <p className={`${LABEL_CLASS} flex items-center gap-2`}>
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-white" style={{ backgroundColor: color }}>
            <Icon className="h-4 w-4" />
          </span>
          {label}
        </p>
        <p
          className="mt-1.5 whitespace-nowrap font-extrabold tabular-nums tracking-[-0.01em] text-[#12305f]"
          style={{ fontSize: 'clamp(15px, 9.4cqi, 26px)' }}
        >
          {Math.round(shown).toLocaleString('id-ID')}
          <span className="ml-1.5 text-[0.46em] font-semibold uppercase tracking-[0.08em] text-[#7a8aa8]">berkas</span>
        </p>
        <p className="mt-0.5 text-xs text-[#7a8aa8]">{note}</p>
      </div>
    </div>
  )
}

export function ServiceKpiCards({ documents }) {
  const total = documents.length
  const today = new Date()
  const tanggalUnggah = (document) => new Date(document.uploadedAt || document.documentDate)
  const tahunIni = documents.filter((document) => tanggalUnggah(document).getFullYear() === today.getFullYear())
  const bulanIni = tahunIni.filter((document) => tanggalUnggah(document).getMonth() === today.getMonth())
  const bagian = (jumlah) => (total ? `${formatPercent((jumlah / total) * 100, 0)} dari seluruhnya` : 'Belum ada berkas')

  return (
    <section className="grid shrink-0 grid-cols-2 gap-4 lg:grid-cols-3 fit:gap-2.5 tall:gap-3">
      <Kartu
        icon={IconFolderDocuments}
        label="Seluruh Berkas"
        value={total}
        note={total ? 'Sesuai penyaring yang dipilih' : 'Belum ada berkas di layanan ini'}
        color={WARNA.biru}
      />
      <Kartu icon={IconCalendar} label="Diunggah Tahun Ini" value={tahunIni.length} note={bagian(tahunIni.length)} color={WARNA.hijau} />
      <Kartu icon={IconDocument} label="Diunggah Bulan Ini" value={bulanIni.length} note={bagian(bulanIni.length)} color={WARNA.oren} />
    </section>
  )
}
