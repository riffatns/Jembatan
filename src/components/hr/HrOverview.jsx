import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  LoaderCircle,
  Star,
  TrendingDown,
  User,
  UserRound,
  Users
} from 'lucide-react'
import { useData } from '../../context/DataContext'
import { hasDocumentFile, resolveDocumentFileUrl } from '../../lib/documentStorage'
import { parseExcelABK } from '../../lib/parseExcelABK'
import {
  AGENDA_STATUSES,
  agendaCoversDate,
  getAgendaTypeMeta,
  sortAgendaEvents,
  toDateKey
} from '../../lib/agendaStorage'

const KATEGORI_BEZETTING = 'bezetting'
const HARI_KE_DEPAN = 7

const WARNA_GOLONGAN = { PNS: '#2563eb', TTT: '#7c3aed', OB: '#0ea5e9' }
const WARNA_CADANGAN = ['#16a34a', '#f59e0b', '#64748b']

// Susunannya mengikuti rancangan: ikon bulat di kiri, judul di sebelahnya,
// angka besar di bawahnya, lalu keterangan, dan bilah dengan persentasenya di
// ujung kanan. Angka maupun panjang bilahnya dihitung dari data, bukan nilai
// tetap - persentase di rancangan hanya contoh tampilan.
function Kartu({ label, nilai, keterangan, persen, warna, ikon: Ikon, kosong = false }) {
  const terbatas = kosong ? 0 : Math.max(0, Math.min(100, Math.round(persen)))

  return (
    <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
      <div className="flex items-center gap-2.5">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white"
          style={{ backgroundColor: kosong ? '#cbd5e1' : warna }}
        >
          <Ikon className="h-4 w-4" />
        </span>
        <p className="min-w-0 truncate text-sm font-semibold text-[#233b84]">{label}</p>
      </div>

      <p
        className={`mt-2.5 text-3xl font-bold tabular-nums tracking-tight ${kosong ? 'text-slate-300' : 'text-[#233b84]'}`}
      >
        {kosong ? '–' : nilai}
      </p>
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
  const navigate = useNavigate()
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

  // Angka cuti dan diklat tidak ada di sheet ABK maupun rekap - keduanya diisi
  // manual sebagai baris label dan nilai pada sheet "JUMLAH SDM". Dicari lewat
  // kata kuncinya, bukan posisi barisnya, supaya penulisan labelnya boleh
  // berbeda. Kalau belum ada barisnya, kartunya tampil kosong, bukan nol -
  // "belum diisi" dan "tidak ada yang cuti" dua hal yang berbeda.
  const angka = (pola) => (data?.daftarAngka || []).find((item) => pola.test(item.label))
  const cuti = angka(/cuti/i)
  const diklat = angka(/diklat|pelatihan/i)

  // Unit yang kekurangan orang paling banyak. Menggantikan daftar "jabatan
  // prioritas" yang tidak punya sumber data: ini dihitung dari selisih pada
  // berkas bezetting itu sendiri.
  // Berapa banyak unit yang jumlah riilnya di bawah kebutuhan. Dipakai sebagai
  // penanda berapa titik yang perlu ditindaklanjuti.
  const unitKurang = useMemo(() => {
    if (!data?.rows?.length) return 0
    return data.rows.filter(
      (row) => row.unitKerja && !/jumlah/i.test(row.unitKerja) && (row.selisih ?? 0) < 0
    ).length
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
          label="Cuti Aktif"
          nilai={cuti?.nilai ?? 0}
          keterangan={cuti ? cuti.label : 'Belum ada barisnya di berkas bezetting'}
          persen={cuti && riil ? (cuti.nilai / riil) * 100 : 0}
          warna="#7c3aed"
          ikon={UserRound}
          kosong={!cuti}
        />
        <Kartu
          label="Diklat Berjalan"
          nilai={diklat?.nilai ?? 0}
          keterangan={diklat ? diklat.label : 'Belum ada barisnya di berkas bezetting'}
          persen={diklat && riil ? (diklat.nilai / riil) * 100 : 0}
          warna="#f97316"
          ikon={GraduationCap}
          kosong={!diklat}
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
                { label: 'Laki-laki', nilai: rekap.laki, warna: '#2563eb', ikon: User },
                { label: 'Perempuan', nilai: rekap.perempuan, warna: '#db2777', ikon: UserRound }
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 rounded-2xl bg-[#f8fbff] px-4 py-3">
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white"
                    style={{ backgroundColor: item.warna }}
                  >
                    <item.ikon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs text-slate-500">{item.label}</p>
                    <p className="flex items-baseline gap-2">
                      <span className="text-xl font-bold tabular-nums text-[#233b84]">{item.nilai}</span>
                      <span className="text-xs tabular-nums text-slate-400">
                        {rekap.total ? Math.round((item.nilai / rekap.total) * 100) : 0}%
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Kebutuhan dan kekurangan dipindah ke sini dari deretan kartu atas,
            mengikuti rancangan: kartu atas untuk angka harian, panel ini untuk
            kondisi formasinya. */}
        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] sm:p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#eff5ff] text-[#1f63d3]">
              <TrendingDown className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-[#233b84]">Ringkasan SDM</h2>
              <p className="text-sm text-slate-500">Kondisi formasi terhadap kebutuhan</p>
            </div>
          </div>

          <dl className="mt-5 space-y-3">
            {[
              {
                label: 'Pegawai Aktif',
                nilai: riil,
                sisi: riil && rekap?.total ? `${Math.round((riil / rekap.total) * 100)}%` : '100%',
                keterangan: 'dari total pegawai',
                warna: '#16a34a',
                ikon: Users
              },
              {
                label: 'Kebutuhan ABK',
                nilai: standar,
                sisi: '100%',
                keterangan: 'total formasi',
                warna: '#2563eb',
                ikon: FileText
              },
              {
                label: 'Kekurangan Pegawai',
                nilai: kekurangan,
                sisi: `${standar ? Math.round((kekurangan / standar) * 100) : 0}%`,
                keterangan: 'dari kebutuhan ABK',
                warna: '#dc2626',
                ikon: AlertTriangle
              },
              {
                label: 'Unit Kekurangan',
                nilai: unitKurang,
                sisi: '',
                keterangan: 'perlu tindak lanjut',
                warna: '#7c3aed',
                ikon: Star
              }
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 rounded-2xl bg-[#f8fbff] px-4 py-3">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white"
                  style={{ backgroundColor: item.warna }}
                >
                  <item.ikon className="h-4 w-4" />
                </span>
                <dt className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium" style={{ color: item.warna }}>
                    {item.label}
                  </span>
                  <span className="block text-xl font-bold tabular-nums text-[#233b84]">{item.nilai}</span>
                </dt>
                <dd className="shrink-0 text-right">
                  {item.sisi ? (
                    <span className="block text-sm font-bold tabular-nums" style={{ color: item.warna }}>
                      {item.sisi}
                    </span>
                  ) : null}
                  <span className="block text-xs text-slate-500">{item.keterangan}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Jadwal sepekan ke depan dalam bentuk tabel. Kalender tetap ada di
          bawahnya, tetapi untuk menengok agenda terdekat beserta jenis dan
          penanggung jawabnya, daftar seperti ini lebih cepat dibaca daripada
          mencarinya satu per satu di kotak tanggal. */}
      <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#eff5ff] text-[#1f63d3]">
              <CalendarDays className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-[#233b84]">Jadwal SDM {HARI_KE_DEPAN} Hari ke Depan</h2>
              <p className="text-sm text-slate-500">Kegiatan bidang ini pada pekan berjalan</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/dashboard/kalender')}
            className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-[#1f63d3] transition-colors hover:bg-[#eff5ff]"
          >
            Lihat Semua <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {agendaTerdekat.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-slate-500">
            Tidak ada kegiatan terjadwal pada {HARI_KE_DEPAN} hari ke depan.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-[#f8fbff]">
                <tr className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3">Tanggal</th>
                  <th className="px-5 py-3">Agenda</th>
                  <th className="px-5 py-3">Jenis</th>
                  <th className="px-5 py-3">PIC</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {agendaTerdekat.map((event) => {
                  const jenis = getAgendaTypeMeta(event.eventType)
                  const status = AGENDA_STATUSES.find((item) => item.id === event.status) || AGENDA_STATUSES[0]
                  const warnaStatus =
                    status.id === 'done'
                      ? 'bg-emerald-50 text-emerald-700'
                      : status.id === 'cancelled'
                        ? 'bg-red-50 text-red-700'
                        : 'bg-[#eff5ff] text-[#1f3f89]'

                  return (
                    <tr key={event.id} className="transition-colors hover:bg-[#f8fbff]">
                      <td className="whitespace-nowrap px-5 py-3 tabular-nums text-slate-600">
                        {new Date(event.eventDate).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-5 py-3 font-medium text-[#233b84]">{event.title}</td>
                      <td className="whitespace-nowrap px-5 py-3">
                        <span className="inline-flex items-center gap-1.5 text-slate-600">
                          <span
                            aria-hidden="true"
                            className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
                            style={{ backgroundColor: jenis.color }}
                          />
                          {jenis.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-600">{event.organizer || '-'}</td>
                      <td className="px-5 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${warnaStatus}`}>
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
