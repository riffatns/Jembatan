import { IconAlert } from '../icons/DuotoneIcons'
import { CARD_CLASS, CARD_TITLE_CLASS } from '../ui/cardStyles'
import { Button } from '../ui/button'
import { useCountUp } from '../../hooks/useAnimatedProgress'
import { formatCompactRupiah } from '../../lib/budgetFormat'

// Empat catatan yang membuat daftar BMN bermasalah saat diperiksa. Tiap kartu
// tetap menjadi pintasan - mengubah filter tabel, atau membuka daftar asetnya -
// hanya bentuknya kini sama dengan kartu KPI di atasnya.
//
// Kartu yang jumlahnya nol tidak bisa diklik: membuka daftar kosong hanya
// membuat pengguna mengira pintasannya rusak.

function Kartu({ kartu, aktif, onClick }) {
  const jumlah = kartu.items.length
  const shown = useCountUp(jumlah)
  const kosong = jumlah === 0

  return (
    <button
      type="button"
      disabled={kosong}
      onClick={onClick}
      className={`${CARD_CLASS} justify-center gap-2 !py-3 text-left transition-all tall:!py-4 ${
        kosong
          ? 'cursor-default opacity-60'
          : aktif
            ? 'cursor-pointer !border-[#1f63d3] ring-2 ring-blue-100'
            : 'cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(15,23,42,0.1)]'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <span
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-white tall:h-10 tall:w-10"
          style={{ backgroundColor: kartu.warna }}
        >
          <IconAlert className="h-5 w-5" />
        </span>
        <p className="min-w-0 text-[13px] font-medium leading-tight text-[#3f557d] tall:text-sm">{kartu.label}</p>
      </div>
      <p className="font-extrabold tabular-nums tracking-[-0.01em] text-[#12305f]" style={{ fontSize: 'clamp(18px, 5cqi, 26px)' }}>
        {Math.round(shown).toLocaleString('id-ID')}
        <span className="ml-1.5 text-[0.46em] font-semibold uppercase tracking-[0.08em] text-[#7a8aa8]">unit</span>
      </p>
      <p className="text-xs leading-snug text-[#7a8aa8]">{kartu.keterangan}</p>
    </button>
  )
}

function DaftarSorotan({ label, items, onSelect }) {
  return (
    <div className={`${CARD_CLASS} gap-0 !p-0`}>
      <div className="flex items-center gap-2 rounded-t-2xl border-b border-[#e1e8f4] bg-[#fffbeb] px-5 py-3 fit:rounded-t-xl">
        <IconAlert className="h-4 w-4 shrink-0 text-[#c98500]" />
        <p className="text-sm font-semibold text-[#8a5a00]">
          {label} &middot; {items.length} aset
        </p>
      </div>
      <ul className="divide-y divide-slate-100">
        {items.map((asset) => (
          <li key={asset.id}>
            <button
              type="button"
              onClick={() => onSelect(asset)}
              className="flex w-full cursor-pointer items-center justify-between gap-3 px-5 py-3 text-left transition-colors hover:bg-slate-50"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-[#233b84]">{asset.namaBarang}</span>
                <span className="block truncate text-xs text-slate-500">
                  {asset.jenisBmn} &middot; Kode {asset.kodeBarang || '-'} &middot; NUP {asset.nup || '-'}
                </span>
              </span>
              <span className="shrink-0 text-sm tabular-nums text-slate-600">{formatCompactRupiah(asset.nilaiBuku)}</span>
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
    <section className="flex flex-col gap-4 fit:gap-2.5 tall:gap-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className={CARD_TITLE_CLASS}>Perlu Perhatian</h2>
          <p className="text-sm text-[#61739b]">Catatan yang sebaiknya ditindaklanjuti sebelum pemeriksaan</p>
        </div>
        {kartuSorotan && (
          <Button variant="outline" onClick={() => onSorot(null)} className="rounded-full px-4">
            Tutup daftar
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 fit:gap-2.5 tall:gap-3">
        {perhatian.map((kartu) => (
          <Kartu
            key={kartu.id}
            kartu={kartu}
            aktif={sorotan === kartu.id}
            onClick={() => (kartu.filter ? onFilter(kartu) : onSorot(sorotan === kartu.id ? null : kartu.id))}
          />
        ))}
      </div>

      {kartuSorotan && kartuSorotan.items.length > 0 && (
        <DaftarSorotan label={kartuSorotan.label} items={kartuSorotan.items} onSelect={onSelect} />
      )}
    </section>
  )
}
