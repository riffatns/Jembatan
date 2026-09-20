import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'

export default function TransitionToDashboard() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { divisions } = useData()

  const handleExit = () => {
    logout()
    navigate('/', { replace: true })
  }

  const selectDivision = (divisionId) => {
    sessionStorage.setItem('bpk-dashboard-selected-division', divisionId)
    navigate('/dashboard', { replace: true })
  }

  const bubbleOrder = [
    { id: 'finance', title: 'Keuangan', image: '/keuangan.jpeg' },
    { id: 'hr', title: 'SDM', image: '/sdm.jpeg' },
    { id: 'legal', title: 'Hukum', image: '/hukum.jpeg' },
    { id: 'pr', title: 'Humas dan TU Kalan', image: '/humas-tukalan.jpeg' },
    { id: 'it', title: 'Umum dan TI', image: '/umum-ti.jpeg' }
  ]

  const bubbleDivisions = bubbleOrder
    .map((item) => {
      const division = divisions.find((entry) => entry.id === item.id)
      if (!division) return null
      return {
        ...division,
        title: item.title,
        image: item.image
      }
    })
    .filter(Boolean)

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <style>{`
        @keyframes bgZoom {
          0% {
            transform: scale(1) translate3d(0, 0, 0);
          }
          100% {
            transform: scale(1.08) translate3d(-1.5%, -1%, 0);
          }
        }
        @keyframes floatBubble {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        @keyframes pulseRing {
          0% {
            transform: scale(0.96);
            opacity: 0.25;
          }
          70% {
            transform: scale(1.08);
            opacity: 0;
          }
          100% {
            transform: scale(1.08);
            opacity: 0;
          }
        }
      `}</style>

      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/background-jembatan.jpeg')",
            animation: 'bgZoom 18s ease-in-out infinite alternate',
            transformOrigin: 'center center'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy/30 via-navy/60 to-slate-950/90" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(15,23,42,0.14),rgba(15,23,42,0.68))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_42%)]" />
        <div className="absolute inset-0 opacity-[0.08]">
          <div className="h-full w-full bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-[length:24px_24px]" />
        </div>
      </div>

      <div className="relative z-10 min-h-screen px-6 py-10 sm:px-8 lg:px-12">
        <button
          type="button"
          onClick={handleExit}
          className="absolute right-6 top-6 z-20 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white shadow-[0_8px_24px_rgba(0,0,0,0.28)] backdrop-blur-xl transition-all hover:border-white/30 hover:bg-white/10 sm:right-8 lg:right-12"
        >
          <LogOut className="h-4 w-4" />
          Keluar
        </button>

        <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-between gap-10">
          <div className="pt-4 text-center">
            <p className="text-[11px] uppercase tracking-[0.45em] text-slate-300/75">
              Main Dashboard
            </p>
            <p className="mt-4 text-5xl font-black uppercase tracking-[0.18em] text-white drop-shadow-[0_10px_28px_rgba(0,0,0,0.55)] sm:text-7xl lg:text-8xl">
              JEMBATAN
            </p>
            <div className="mx-auto mt-5 h-px w-28 bg-white/30 shadow-[0_0_18px_rgba(255,255,255,0.18)]" />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-8">
            {bubbleDivisions.map((division, index) => (
              <button
                key={division.id}
                type="button"
                onClick={() => selectDivision(division.id)}
                className="group relative mx-auto aspect-square w-full max-w-[270px] overflow-hidden rounded-[50px] border border-white/10 bg-slate-900/40 shadow-[0_24px_80px_rgba(0,0,0,0.32)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.015] hover:border-white/20"
                style={{ animation: `floatBubble ${6 + index * 0.8}s ease-in-out infinite` }}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url('${division.image}')` }}
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.08),rgba(0,0,0,0.5))]" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/78 via-slate-950/18 to-transparent" />
                <div className="absolute inset-0 rounded-[50px] border border-white/10" />

                <div className="absolute inset-x-0 bottom-0 z-10 p-6 text-center sm:p-7">
                  <p className="text-xl font-black uppercase tracking-[0.22em] text-white drop-shadow-[0_10px_24px_rgba(0,0,0,0.65)] sm:text-2xl">
                    {division.title}
                  </p>
                </div>
              </button>
            ))}
          </div>

          <div className="pb-4 text-center">
            <p className="text-[11px] uppercase tracking-[0.35em] text-slate-300/70">
              6 divisions connected through Jembatan
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}