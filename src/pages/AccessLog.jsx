import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { BudgetDashboardHeader } from '../components/budget/dashboard/BudgetDashboardHeader'
import { DataTable } from '../components/data-table/DataTable'
import { IconAlert, IconClock, IconSearch, IconUsers } from '../components/icons/DuotoneIcons'
import { KpiCard } from '../components/hr/bezetting/BezettingKpiCards'
import { Button } from '../components/ui/button'
import { CARD_CLASS, CARD_TITLE_CLASS } from '../components/ui/cardStyles'
import { getPositionLabel, isInternalEmail } from '../data/accessControl'
import { JAM, formatWaktu, jarakWaktu, nilaiWaktu, ringkasAkses } from '../lib/aksesFormat'
import { fetchDaftarAkses } from '../lib/aksesRemote'

const WRAP = '!whitespace-normal break-words leading-snug'

// Akun username-saja tidak punya email sungguhan; alamat penampungnya tidak
// perlu ditampilkan di sini juga.
function identitas(baris) {
  return isInternalEmail(baris.email) ? baris.username || '-' : baris.email || '-'
}

const KOLOM = [
  {
    key: 'nama',
    label: 'Nama',
    align: 'left',
    width: 'w-[24%]',
    className: WRAP,
    render: (row) => (
      <>
        <span className="block font-semibold">{row.nama}</span>
        <span className="block text-[11.5px] font-normal text-[#7a8aa8]">{identitas(row)}</span>
      </>
    ),
    text: (row) => `${row.nama} ${row.username || ''} ${row.email || ''}`,
    value: (row) => row.nama
  },
  {
    key: 'jabatan',
    label: 'Jabatan',
    align: 'left',
    width: 'w-[16%]',
    className: WRAP,
    text: (row) => getPositionLabel({ position: row.jabatan, division: row.bidang_id, role: row.peran })
  },
  { key: 'peran', label: 'Peran', align: 'center', width: 'w-[10%]', className: WRAP },
  {
    key: 'bidang',
    label: 'Bidang',
    align: 'left',
    width: 'w-[16%]',
    className: WRAP,
    text: (row) => row.bidang || '(seluruh bidang)'
  },
  {
    key: 'terakhir_masuk',
    label: 'Terakhir Masuk',
    align: 'left',
    width: 'w-[20%]',
    className: WRAP,
    render: (row) => {
      const { teks, warna } = jarakWaktu(row.terakhir_masuk)
      return (
        <>
          <span className={`block font-semibold ${warna}`}>{teks}</span>
          {row.terakhir_masuk && (
            <span className="block text-[11.5px] font-normal text-[#7a8aa8]">{formatWaktu(row.terakhir_masuk)}</span>
          )}
        </>
      )
    },
    text: (row) => `${jarakWaktu(row.terakhir_masuk).teks} ${formatWaktu(row.terakhir_masuk)}`,
    // Diurutkan menurut waktunya, bukan menurut tulisannya.
    value: (row) => nilaiWaktu(row.terakhir_masuk)
  },
  {
    key: 'dibuat_pada',
    label: 'Akun Dibuat',
    align: 'left',
    width: 'w-[14%]',
    className: WRAP,
    text: (row) => formatWaktu(row.dibuat_pada),
    value: (row) => nilaiWaktu(row.dibuat_pada)
  }
]

// Halaman Akses: riwayat masuk seluruh pengguna, untuk pengelola teknis.
//
// Penolakannya ditegakkan database lewat daftar_akses(), bukan oleh halaman
// ini. Menyembunyikan menu hanya kenyamanan - pengguna yang tidak ditandai
// pengelola teknis akan ditolak walaupun membuka alamatnya langsung.
export default function AccessLog() {
  const { user } = useAuth()
  const [rows, setRows] = useState([])
  const [galat, setGalat] = useState('')
  const [memuat, setMemuat] = useState(true)

  const muat = useCallback(async () => {
    setMemuat(true)
    const hasil = await fetchDaftarAkses()
    setRows(hasil.rows)
    setGalat(hasil.error || '')
    setMemuat(false)
  }, [])

  useEffect(() => { muat() }, [muat])

  const ringkas = useMemo(() => ringkasAkses(rows), [rows])

  return (
    <div className="flex flex-col gap-4 text-[#12305f] fit:gap-2.5">
      <BudgetDashboardHeader
        title="AKSES PENGGUNA"
        subtitle="RIWAYAT MASUK PORTAL - KHUSUS PENGELOLA TEKNIS"
        icon={IconSearch}
        showYearPicker={false}
        actions={
          <Button variant="outline" onClick={muat} disabled={memuat} className="rounded-full px-4">
            {memuat ? 'Memuat...' : 'Muat ulang'}
          </Button>
        }
      />

      {galat ? (
        <div className={`${CARD_CLASS} items-center gap-3 py-10 text-center`}>
          <IconAlert className="h-10 w-10 text-[#eda100]" />
          <h2 className={CARD_TITLE_CLASS}>Tidak bisa menampilkan daftar</h2>
          <p className="mx-auto max-w-xl text-sm text-[#5a6f93]">{galat}</p>
        </div>
      ) : (
        <>
          <section className="grid shrink-0 grid-cols-2 gap-3 md:grid-cols-4 fit:gap-2.5">
            <KpiCard icon={IconUsers} tone="blue" label="Akun Terdaftar" value={ringkas.total} />
            <KpiCard icon={IconClock} tone="green" label="Masuk 1 Jam Terakhir" value={ringkas.jam} />
            <KpiCard icon={IconClock} tone="orange" label="Masuk Hari Ini" value={ringkas.hari} />
            <KpiCard icon={IconAlert} tone="purple" label="Belum Pernah Masuk" value={ringkas.belum} />
          </section>

          <div className={CARD_CLASS}>
            <DataTable
              rows={rows}
              columns={KOLOM}
              getRowKey={(row) => row.id}
              initialSort={{ key: 'terakhir_masuk', direction: 'desc' }}
              fixedLayout
              minWidth="min-w-[820px]"
              itemLabel="akun"
              searchPlaceholder="Cari nama, username, atau bidang..."
              title={<h2 className={CARD_TITLE_CLASS}>Riwayat Masuk</h2>}
            />
          </div>

          <p className="text-xs leading-relaxed text-[#7a8aa8]">
            Yang tercatat adalah waktu <b>masuk</b>, bukan waktu keluar - portal tidak tahu kapan
            seseorang menutup perambannya, jadi daftar ini bukan daftar siapa yang sedang online.
            Akun bersama dipakai beberapa orang, sehingga satu baris tidak selalu berarti satu
            orang. Jangan dipakai sebagai dasar absensi.
            {user?.name ? ` Dibuka oleh ${user.name}.` : ''}
          </p>
        </>
      )}
    </div>
  )
}
