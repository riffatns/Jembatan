import { IconAlert } from '../icons/DuotoneIcons'
import { CARD_CLASS } from '../ui/cardStyles'
import { Button } from '../ui/button'
import { formatCompactRupiah } from '../../lib/budgetFormat'

// Empat catatan yang membuat daftar BMN bermasalah saat diperiksa. Dulu empat
// kartu setinggi kartu KPI, yang membuat halaman ini punya dua baris kartu
// besar berturut-turut padahal isinya cuma empat angka. Sekarang satu kartu
// mendatar: angka, label, dan pemisah tipis di antaranya.
//
// Tiap bagian tetap jadi pintasan - mengubah filter tabel, atau membuka daftar
// asetnya. Bagian yang jumlahnya nol tidak bisa diklik: membuka daftar kosong
// hanya membuat pengguna mengira pintasannya rusak.

function Bagian({ kartu, aktif, onClick }) {
  const jumlah = kartu.items.length
  const kosong = jumlah === 0

  return (
    <button
      type="button"
      disabled={kosong}
      onClick={onClick}
      title={kartu.keterangan}
      className={`flex min-w-0 flex-1 items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left transition-colors ${
        kosong
          ? 'cursor-default opacity-55'
          : aktif
            ? 'cursor-pointer bg-[#eaf2ff] ring-1 ring-[#1f63d3]'
            : 'cursor-pointer hover:bg-[#f2f6fd]'
      }`}
    >
      <span
        className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-white"
        style={{ backgroundColor: kartu.warna }}
      >
        <IconAlert className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-[17px] font-extrabold leading-none tabular-nums text-[#12305f]">
          {jumlah.toLocaleString('id-ID')}
          <span className="ml-1 text-[0.55em] font-semibold uppercase tracking-[0.08em] text-[#7a8aa8]">unit</span>
        </span>
        <span className="mt-0.5 block truncate text-[12.5px] text-[#3f557d]">{kartu.label}</span>
      </span>
    </button>
  )
}

function DaftarSorotan({ label, items, onSelect }) {
  return (
    <div className={`${CARD_CLASS} gap-0 !p-0`}>
      <div className="flex items-center gap-2 rounded-t-2xl border-b border-[#e1e8f4] bg-[#fffbeb] px-5 py-2.5 fit:rounded-t-xl">
        <IconAlert className="h-4 w-4 shrink-0 text-[#c98500]" />
        <p className="text-sm font-semibold text-[#8a5a00]">
          {label} &middot; {items.length} aset
        </p>
      </div>
      <ul className="max-h-[260px] divide-y divide-slate-100 overflow-y-auto">
        {items.map((asset) => (
          <li key={asset.id}>
            <button
              type="button"
              onClick={() => onSelect(asset)}
              className="flex w-full cursor-pointer items-center justify-between gap-3 px-5 py-2 text-left transition-colors hover:bg-slate-50"
            >
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-medium text-[#233b84]">{asset.namaBarang}</span>
                <span className="block truncate text-[11.5px] text-slate-500">
                  {asset.jenisBmn} &middot; Kode {asset.kodeBarang || '-'} &middot; NUP {asset.nup || '-'}
                </span>
              </span>
              <span className="shrink-0 text-[13px] tabular-nums text-slate-600">{formatCompactRupiah(asset.nilaiBuku)}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function AssetAttentionCards({ perhatian, sorotan, onSorot, onFilter, onSelect }) {
  const kartuSorotan = sorotan ? perhatian.find((kartu) => kartu.id === sorotan) : null

  return (
    <section className="flex flex-col gap-3 fit:gap-2.5">
      <div className={`${CARD_CLASS} !flex-row flex-wrap items-center gap-1 !py-2.5`}>
        <p className="mr-1 shrink-0 pl-1 pr-2 text-[12.5px] font-semibold uppercase tracking-[0.03em] text-[#3f557d]">
          Perlu Perhatian
        </p>
        {perhatian.map((kartu) => (
          <Bagian
            key={kartu.id}
            kartu={kartu}
            aktif={sorotan === kartu.id}
            onClick={() => (kartu.filter ? onFilter(kartu) : onSorot(sorotan === kartu.id ? null : kartu.id))}
          />
        ))}
        {kartuSorotan && (
          <Button variant="outline" size="sm" onClick={() => onSorot(null)} className="shrink-0 rounded-full px-3">
            Tutup
          </Button>
        )}
      </div>

      {kartuSorotan && kartuSorotan.items.length > 0 && (
        <DaftarSorotan label={kartuSorotan.label} items={kartuSorotan.items} onSelect={onSelect} />
      )}
    </section>
  )
}
