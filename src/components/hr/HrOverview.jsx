import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, CalendarDays, FileSpreadsheet, LoaderCircle, TrendingDown, UserRound, Users } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { hasDocumentFile, resolveDocumentFileUrl } from '../../lib/documentStorage'
import { parseExcelABK } from '../../lib/parseExcelABK'
import { agendaCoversDate, sortAgendaEvents, toDateKey } from '../../lib/agendaStorage'

const KATEGORI_BEZETTING = 'bezetting'
const HARI_KE_DEPAN = 7

const WARNA_GOLONGAN = { PNS: '#2563eb', TTT: '#7c3aed', OB: '#0ea5e9' }
const WARNA_CADANGAN = ['#16a34a', '#f59e0b', '#64748b']

// Susunannya mengikuti rancangan: ikon bulat di kiri, judul di sebelahnya,
// angka besar di bawahnya, lalu keterangan, dan bilah dengan persentasenya di
// ujung kanan. Angka maupun panjang bilahnya dihitung dari data, bukan nilai
// tetap - persentase di rancangan hanya contoh tampilan.
function Kartu({ label, nilai, keterangan, persen, warna, ikon: Ikon }) {
  const terbatas = Math.max(0, Math.min(100, Math.round(persen)))

  return (
    <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
      <div className="flex items-center gap-2.5">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white"
          style={{ backgroundColor: warna }}
        >
          <Ikon className="h-4 w-4" />
        </span>
        <p className="min-w-0 truncate text-sm font-semibold text-[#233b84]">{label}</p>
      </div>

      <p className="mt-2.5 text-3xl font-bold tabular-nums tracking-tight text-[#233b84]">{nilai}</p>
      <p className="mt-0.5 text-xs text-slate-500">{keterangan}</p>

      <div className="mt-3 flex items-center gap-2">
        <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full" style={{ width: `${terbatas}%`, backgroundColor: warna }} />
        </div>
        <span className="shrink-0 text-[11px] font-semibold tabular-nums text-slate-400">{terbatas}%</span>
      </div>
    </div>
  )
}

export function HrOverview({ divisionId }) {
  const { documents, agendaEvents } = useData()
  const [data, setData] = useState(null)
  const [memuat, setMemuat] = useState(true)
  const [galat, setGalat] = useState('')

  // Angka pegawai tidak disimpan di basis data - sumbernya berkas bezetting
  // yang diunggah di layanan Bezetting. Yang dibaca selalu dokumen terbaru,
  // jadi begitu berkas periode berikutnya diunggah, dashboard ikut berubah.
  const dokumenBezetting = useMemo(() => {
    return documents
      .filter((item) => item.divisionId === divisionId && item.categoryId === KATEGORI_BEZETTING && hasDocumentFile(item))
      .sort((a, b) => new Date(b.uploadedAt || b.documentDate || 0) - new Date(a.uploadedAt || a.documentDate || 0))[0]
  }, [documents, divisionId])

  useEffect(() => {
    if (!dokumenBezetting) {
      setData(null)
      setGalat('')
      setMemuat(false)
      return undefined
    }

    let dibatalkan = false
    setMemuat(true)
    setGalat('')

    resolveDocumentFileUrl(dokumenBezetting)
      .then((url) => {
        if (!url) throw new Error('Berkas bezetting gagal diambil dari penyimpanan.')
        return parseExcelABK(url)
      })
      .then((hasil) => { if (!dibatalkan) setData(hasil) })
      .catch((error) => {
        if (dibatalkan) return
        setData(null)
        setGalat(error.message)
      })
      .finally(() => { if (!dibatalkan) setMemuat(false) })

    return () => { dibatalkan = true }
  }, [dokumenBezetting])

  const agendaTerdekat = useMemo(() => {
    const hariIni = new Date()
    const kunci = Array.from({ length: HARI_KE_DEPAN }, (_, i) => {
      const tanggal = new Date(hariIni.getFullYear(), hariIni.getMonth(), hariIni.getDate() + i)
      return toDateKey(tanggal)
    })

    return sortAgendaEvents(
      agendaEvents.filter(
        (event) => event.divisionId === divisionId && kunci.some((k) => agendaCoversDate(event, k))
      )
    )
  }, [agendaEvents, divisionId])

  const total = data?.total
  const standar = total?.standar ?? 0
  const riil = total?.riil ?? 0
  const kekurangan = Math.abs(total?.selisih ?? 0)
  const ketersediaan = standar ? Math.round((riil / standar) * 100) : 0

  const rekap = data?.rekap
  const golongan = useMemo(() => {
    if (!rekap?.golongan?.length) return []
    return rekap.golongan.map((item, index) => ({
      ...item,
      warna: WARNA_GOLONGAN[item.nama] || WARNA_CADANGAN[index % WARNA_CADANGAN.length],
      persen: rekap.total ? (item.jumlah / rekap.total) * 100 : 0
    }))
  }, [rekap])

  // Unit yang kekurangan orang paling banyak. Menggantikan daftar "jabatan
  // prioritas" yang tidak punya sumber data: ini dihitung dari selisih pada
  // berkas bezetting itu sendiri.
  const kekuranganTerbesar = useMemo(() => {
    if (!data?.rows?.length) return []
    return data.rows
      .filter((row) => row.unitKerja && !/jumlah/i.test(row.unitKerja) && (row.selisih ?? 0) < 0)
      .sort((a, b) => a.selisih - b.selisih)
      .slice(0, 5)
  }, [data])

  if (memuat) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-[24px] border border-slate-200 bg-white p-10 text-sm text-slate-500">
        <LoaderCircle className="h-5 w-5 animate-spin text-[#1f63d3]" /> Membaca data pegawai...
      </div>
    )
  }

  if (!dokumenBezetting || galat) {
    return (
      <div className="rounded-[24px] border border-dashed border-slate-300 bg-white p-8 text-center">
        <FileSpreadsheet className="mx-auto h-10 w-10 text-slate-300" />
        <h2 className="mt-3 text-lg font-bold text-[#233b84]">Data pegawai belum tersedia</h2>
        <p className="mx-auto mt-1 max-w-xl text-sm text-slate-500">
          {galat
            ? galat
            : 'Unggah berkas bezetting pada layanan Bezetting. Angka di halaman ini dibaca langsung dari sheet ABK dan Rekap Jenis Klmn pada berkas itu, jadi begitu berkasnya diperbarui, tampilan ini ikut berubah.'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kartu
          label="Total Pegawai"
          nilai={riil}
          keterangan="Jumlah riil pada berkas bezetting"
          persen={ketersediaan}
          warna="#2563eb"
          ikon={Users}
        />
        <Kartu
          label="Kebutuhan ABK"
          nilai={standar}
          keterangan="Standar kebutuhan SDM aparatur"
          persen={100}
          warna="#7c3aed"
          ikon={UserRound}
        />
        <Kartu
          label="Kekurangan Pegawai"
          nilai={kekurangan}
          keterangan="Selisih riil terhadap kebutuhan"
          persen={standar ? (kekurangan / standar) * 100 : 0}
          warna="#dc2626"
          ikon={TrendingDown}
        />
        <Kartu
          label="Ketersediaan Formasi"
          nilai={`${ketersediaan}%`}
          keterangan={`${riil} dari ${standar} formasi`}
          persen={ketersediaan}
          warna="#16a34a"
          ikon={AlertTriangle}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        {golongan.length > 0 && (
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] sm:p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#eff5ff] text-[#1f63d3]">
                <Users className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-[#233b84]">Komposisi Pegawai</h2>
                <p className="text-sm text-slate-500">Menurut golongan dan jenis kelamin</p>
              </div>
            </div>

            <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row">
              <div
                aria-hidden="true"
                className="relative flex h-36 w-36 shrink-0 items-center justify-center rounded-full"
                style={{
                  background: `conic-gradient(${golongan
                    .reduce(
                      (hasil, item) => {
                        const akhir = hasil.posisi + item.persen
                        hasil.bagian.push(`${item.warna} ${hasil.posisi}% ${akhir}%`)
                        hasil.posisi = akhir
                        return hasil
                      },
                      { posisi: 0, bagian: [] }
                    )
                    .bagian.join(', ')})`
                }}
              >
                <div className="absolute inset-[22px] flex flex-col items-center justify-center rounded-full bg-white">
                  <span className="text-2xl font-bold tabular-nums text-[#233b84]">{rekap.total}</span>
                  <span className="text-[11px] leading-tight text-slate-500">Total Pegawai</span>
                </div>
              </div>

              <dl className="min-w-0 flex-1 space-y-2.5">
                {golongan.map((item) => (
                  <div key={item.nama} className="flex items-center justify-between gap-3">
                    <dt className="flex min-w-0 items-center gap-2 text-sm text-slate-600">
                      <span
                        aria-hidden="true"
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: item.warna }}
                      />
                      {item.nama}
                    </dt>
                    <dd className="flex shrink-0 items-baseline gap-2">
                      <span className="text-lg font-bold tabular-nums text-[#233b84]">{item.jumlah}</span>
                      <span className="text-xs tabular-nums text-slate-400">{Math.round(item.persen)}%</span>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
              {[
                { label: 'Laki-laki', nilai: rekap.laki, warna: '#2563eb' },
                { label: 'Perempuan', nilai: rekap.perempuan, warna: '#db2777' }
              ].map((item) => (
                <div key={item.label} className="rounded-2xl bg-[#f8fbff] px-4 py-3">
                  <p className="flex items-center gap-2 text-xs text-slate-500">
                    <span
                      aria-hidden="true"
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: item.warna }}
                    />
                    {item.label}
                  </p>
                  <p className="mt-1 flex items-baseline gap-2">
                    <span className="text-xl font-bold tabular-nums text-[#233b84]">{item.nilai}</span>
                    <span className="text-xs tabular-nums text-slate-400">
                      {rekap.total ? Math.round((item.nilai / rekap.total) * 100) : 0}%
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {kekuranganTerbesar.length > 0 && (
          <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-lg font-bold text-[#233b84]">Kekurangan Terbesar</h2>
              <p className="text-sm text-slate-500">Unit dengan selisih terbanyak terhadap kebutuhan</p>
            </div>
            <ul className="divide-y divide-slate-100">
              {kekuranganTerbesar.map((row) => (
                <li key={`${row.index}-${row.unitKerja}`} className="flex items-center justify-between gap-4 px-5 py-3">
                  <p className="min-w-0 truncate text-sm text-slate-700">{row.unitKerja}</p>
                  <span className="flex shrink-0 items-center gap-3 text-sm tabular-nums">
                    <span className="text-slate-400">
                      {row.riil ?? 0} / {row.standar ?? 0}
                    </span>
                    <span className="rounded-full bg-red-50 px-2 py-0.5 font-semibold text-red-700">
                      {row.selisih}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {agendaTerdekat.length > 0 && (
        <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
          <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
            <CalendarDays className="h-4 w-4 shrink-0 text-[#1f63d3]" />
            <div>
              <h2 className="text-lg font-bold text-[#233b84]">Agenda SDM {HARI_KE_DEPAN} Hari ke Depan</h2>
              <p className="text-sm text-slate-500">Kegiatan bidang ini pada pekan berjalan</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-[#f8fbff]">
                <tr className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3">Tanggal</th>
                  <th className="px-5 py-3">Agenda</th>
                  <th className="px-5 py-3">Lokasi</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {agendaTerdekat.map((event) => (
                  <tr key={event.id}>
                    <td className="whitespace-nowrap px-5 py-3 tabular-nums text-slate-600">
                      {new Date(event.eventDate).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-5 py-3 font-medium text-[#233b84]">{event.title}</td>
                    <td className="px-5 py-3 text-slate-600">{event.location || '-'}</td>
                    <td className="px-5 py-3">
                      <span className="rounded-full bg-[#eff5ff] px-2.5 py-0.5 text-xs font-medium text-[#1f3f89]">
                        {event.status === 'done' ? 'Selesai' : event.status === 'cancelled' ? 'Dibatalkan' : 'Terjadwal'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
