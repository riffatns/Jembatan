import { useEffect, useMemo, useState } from 'react'
import { DataTable } from '../data-table/DataTable'
import { FilterSelect } from '../hr/bezetting/BezettingFilters'
import { Button } from '../ui/button'
import { CARD_CLASS, CARD_TITLE_CLASS } from '../ui/cardStyles'
import { IconTableList } from '../icons/DuotoneIcons'
import { formatRupiah, punyaPsp, tahunDari } from '../../lib/assetWorkbook'
import { kondisiMeta } from '../../data/assetPalette'

// Daftar aset memakai DataTable bersama, sama dengan Daftar Pegawai di SDM:
// pencarian realtime di semua kolom, klik judul untuk mengurutkan, 20 baris
// per halaman, tinggi mengikuti isi.
//
// Sebelas kolom lama dipadatkan jadi delapan tanpa membuang satu nilai pun -
// Kode Barang dan NUP jadi satu kolom, Merk/Tipe jadi baris kedua di bawah
// nama barang, dan Status Penggunaan digabung dengan nomor PSP. Dengan begitu
// tabelnya muat selebar kartu dan tidak perlu digeser ke samping.

const FILTER_AWAL = { jenis: '', kondisi: '', tahun: '', psp: '' }

// Bulan disingkat ("28 Sep 2023", bukan "28 September 2023") supaya kolomnya
// cukup satu baris sempit. Tanggal lengkapnya tetap ada di rincian aset.
function formatTanggalSingkat(nilai) {
  const polos = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(nilai || ''))
  if (!polos) return '-'
  const tanggal = new Date(Number(polos[1]), Number(polos[2]) - 1, Number(polos[3]))
  if (Number.isNaN(tanggal.getTime())) return '-'
  return tanggal.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function KondisiBadge({ kondisi }) {
  const meta = kondisiMeta(kondisi)
  return (
    <span className="rounded-full px-2 py-0.5 text-[11.5px] font-semibold text-white" style={{ backgroundColor: meta.color }}>
      {meta.label}
    </span>
  )
}

// Lebar kolom dibagi dalam persen supaya tabelnya mengisi kartu, bukan memaksa
// kartunya melebar. Tiga kolom teks panjang - nama barang, jenis BMN, dan
// status/PSP - membungkus ke baris berikutnya, tidak dipotong: seluruh
// isinya memang harus terbaca tanpa menggeser tabel ke samping. Kolom angka
// dan tanggal tetap satu baris supaya kolomnya sejajar.
// Tanda seru penting: kelas dasar sel DataTable memasang whitespace-nowrap,
// dan Tailwind menaruh nowrap sesudah normal di berkas keluarannya, jadi tanpa
// ini kelas wrap-nya kalah dan tabelnya melebar sampai perlu digeser.
const WRAP = '!whitespace-normal break-words leading-snug'

const COLUMNS = [
  {
    key: 'kodeBarang',
    label: 'Kode / NUP',
    align: 'left',
    width: 'w-[10%]',
    render: (row) => (
      <>
        <span className="block">{row.kodeBarang || '-'}</span>
        <span className="block text-[11.5px] text-[#7a8aa8]">NUP {row.nup || '-'}</span>
      </>
    ),
    text: (row) => `${row.kodeBarang || ''} ${row.nup || ''}`,
    value: (row) => row.kodeBarang || '',
    className: WRAP
  },
  {
    key: 'namaBarang',
    label: 'Nama Barang',
    align: 'left',
    width: 'w-[19%]',
    render: (row) => {
      const merkTipe = [row.merk, row.tipe].filter(Boolean).join(' / ')
      return (
        <>
          <span className="block font-semibold">{row.namaBarang}</span>
          {merkTipe ? <span className="block text-[11.5px] font-normal text-[#7a8aa8]">{merkTipe}</span> : null}
        </>
      )
    },
    text: (row) => [row.namaBarang, row.merk, row.tipe].filter(Boolean).join(' '),
    value: (row) => row.namaBarang,
    className: WRAP
  },
  { key: 'jenisBmn', label: 'Jenis BMN', align: 'left', width: 'w-[13%]', className: WRAP },
  {
    key: 'kondisi',
    label: 'Kondisi',
    align: 'center',
    width: 'w-[9%]',
    render: (row) => <KondisiBadge kondisi={row.kondisi} />,
    text: (row) => kondisiMeta(row.kondisi).label
  },
  {
    key: 'tanggalPerolehan',
    label: 'Perolehan',
    align: 'center',
    width: 'w-[10%]',
    text: (row) => formatTanggalSingkat(row.tanggalPerolehan)
  },
  { key: 'nilaiPerolehan', label: 'Nilai Perolehan', align: 'right', width: 'w-[13%]', text: (row) => formatRupiah(row.nilaiPerolehan), className: WRAP },
  { key: 'nilaiBuku', label: 'Nilai Buku', align: 'right', width: 'w-[13%]', text: (row) => formatRupiah(row.nilaiBuku), className: WRAP },
  {
    key: 'noPsp',
    label: 'Status / PSP',
    align: 'left',
    width: 'w-[13%]',
    render: (row) => (
      <>
        <span className="block">{row.statusPenggunaan || '-'}</span>
        <span className={`block text-[11.5px] font-normal ${punyaPsp(row) ? 'text-[#7a8aa8]' : 'text-[#c98500]'}`}>
          {punyaPsp(row) ? row.noPsp : 'Belum ada PSP'}
        </span>
      </>
    ),
    text: (row) => `${row.statusPenggunaan || ''} ${punyaPsp(row) ? row.noPsp : 'Belum ada PSP'}`,
    value: (row) => (punyaPsp(row) ? row.noPsp : ''),
    className: WRAP
  }
]

export function AssetTable({ assets, onSelect, filterAwal }) {
  const [filter, setFilter] = useState({ ...FILTER_AWAL, ...filterAwal })

  // Pintasan dari strip "Perlu Perhatian" mengubah filter dari luar.
  useEffect(() => {
    if (filterAwal) setFilter({ ...FILTER_AWAL, ...filterAwal })
  }, [filterAwal])

  const opsi = useMemo(
    () => ({
      jenis: [...new Set(assets.map((a) => a.jenisBmn).filter(Boolean))].sort(),
      kondisi: [...new Set(assets.map((a) => a.kondisi).filter(Boolean))].sort(),
      tahun: [...new Set(assets.map((a) => tahunDari(a.tanggalPerolehan)).filter(Boolean))]
        .sort((a, b) => b - a)
        .map(String)
    }),
    [assets]
  )

  const tersaring = useMemo(
    () =>
      assets.filter((a) => {
        if (filter.jenis && a.jenisBmn !== filter.jenis) return false
        if (filter.kondisi && a.kondisi !== filter.kondisi) return false
        if (filter.tahun && String(tahunDari(a.tanggalPerolehan)) !== filter.tahun) return false
        if (filter.psp && (filter.psp === 'sudah') !== punyaPsp(a)) return false
        return true
      }),
    [assets, filter]
  )

  const adaFilterAktif = Object.values(filter).some(Boolean)
  const set = (kunci) => (nilai) => setFilter((current) => ({ ...current, [kunci]: nilai }))

  return (
    <div className={CARD_CLASS}>
      <DataTable
        rows={tersaring}
        columns={COLUMNS}
        getRowKey={(row) => row.id}
        initialSort={{ key: 'nilaiPerolehan', direction: 'desc' }}
        onRowClick={onSelect}
        itemLabel="aset"
        fixedLayout
        minWidth="min-w-[880px]"
        searchPlaceholder="Cari nama, kode, NUP, merk, PSP..."
        title={
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h3 className={`${CARD_TITLE_CLASS} mr-1 flex shrink-0 items-center gap-2`}>
              <IconTableList className="h-5 w-5 text-[#2f7fe8]" />
              Data Aset
            </h3>
            <div className="w-[132px]">
              <FilterSelect id="aset-jenis" label="Jenis BMN" value={filter.jenis} options={opsi.jenis} onChange={set('jenis')} allLabel="Semua Jenis" inset />
            </div>
            <div className="w-[128px]">
              <FilterSelect id="aset-kondisi" label="Kondisi" value={filter.kondisi} options={opsi.kondisi} onChange={set('kondisi')} allLabel="Semua Kondisi" inset />
            </div>
            <div className="w-[112px]">
              <FilterSelect id="aset-tahun" label="Tahun" value={filter.tahun} options={opsi.tahun} onChange={set('tahun')} allLabel="Semua Tahun" inset />
            </div>
            <div className="w-[122px]">
              <FilterSelect
                id="aset-psp"
                label="PSP"
                value={filter.psp}
                options={[{ value: 'sudah', label: 'Sudah ada' }, { value: 'belum', label: 'Belum ada' }]}
                onChange={set('psp')}
                allLabel="Semua PSP"
                inset
              />
            </div>
            {adaFilterAktif && (
              <Button type="button" variant="outline" size="sm" onClick={() => setFilter(FILTER_AWAL)} className="h-11 shrink-0 rounded-xl">
                Reset
              </Button>
            )}
          </div>
        }
      />
    </div>
  )
}
