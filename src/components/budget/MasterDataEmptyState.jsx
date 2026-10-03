import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { IconChartBars } from '../icons/DuotoneIcons'
import { Button } from '../ui/button'

// Ditampilkan Dashboard Keuangan dan menu akun 51/52/53 selama belum ada
// Master Data Anggaran untuk tahun yang dipilih.
export function MasterDataEmptyState() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="rounded-[24px] border border-dashed border-slate-300 bg-white p-8 text-center">
      <IconChartBars className="mx-auto h-10 w-10 text-slate-300" />
      <h2 className="mt-3 text-lg font-bold text-[#233b84]">Belum ada Master Data Anggaran</h2>
      <p className="mx-auto mt-1 max-w-lg text-sm text-slate-500">
        Angka dashboard dan menu Belanja Pegawai, Belanja Barang, dan Belanja Modal dibentuk dari laporan
        realisasi SP2D yang diunggah administrator di menu Master Data.
      </p>
      {isAdmin ? (
        <Button variant="teal" onClick={() => navigate('/dashboard/master-anggaran')} className="mt-4 rounded-full px-5">
          Buka Master Data
        </Button>
      ) : (
        <p className="mt-3 text-sm font-medium text-slate-600">Hubungi administrator untuk mengunggah laporan.</p>
      )}
    </div>
  )
}
