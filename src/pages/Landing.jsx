import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import {
  ArrowUpRight,
  Eye,
  EyeOff,
  Lock,
  User,
  Wallet,
  ShieldCheck
} from 'lucide-react'
import { getRememberedLogin, useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { BudgetGauge } from '../components/landing/BudgetGauge'
import { FieldLabel, NeonPanel } from '../components/landing/NeonPanel'

const DEMO_ACCOUNTS = [
  { role: 'Administrator', username: 'admin', password: 'admin123' },
  { role: 'Employee', username: 'employee', password: 'employee123' },
  { role: 'Viewer', username: 'viewer', password: 'viewer123' }
]

function LoginPanel({ onLogin, onFillDemo, username, setUsername, password, setPassword, showPassword, setShowPassword, error, submitting }) {
  return (
    <NeonPanel className="p-5 sm:p-6">
      <div className="flex flex-col">
        <div className="flex flex-col items-center text-center">
          {/* Marka berlatar transparan, bukan logo lockup penuh: di kotak
              sekecil ini wordmark dan taglinenya tidak terbaca, dan latar
              hitamnya tampil sebagai kotak gelap di dalam panel kaca.
              Wadahnya dulu memakai h-18/w-18 yang tidak ada di skala Tailwind,
              jadi ukurannya tidak pernah benar-benar ditetapkan. */}
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-sky-300/25">
            <img src="/favicon-jembatan.png" alt="Logo Jembatan" className="h-14 w-14 object-contain" />
          </div>

          <h2 className="mt-5 text-2xl font-semibold tracking-tight text-sky-300">Selamat Datang</h2>
          <p className="mt-1.5 text-sm text-slate-400">Silakan login untuk melanjutkan</p>
        </div>

        {/* Pemisah yang sama dengan kartu anggaran, supaya ketiganya terbaca
            memakai susunan kepala-isi yang sama. */}
        <div className="mt-5 h-px bg-white/10" />

        <form onSubmit={onLogin} className="mt-5 space-y-4">
          <div>
            <FieldLabel className="mb-1.5">Username</FieldLabel>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-300" />
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="h-12 rounded-xl border-white/10 bg-[#04101d]/85 pl-10 pr-10 text-white placeholder:text-slate-500 focus-visible:border-sky-300 focus-visible:ring-sky-300/30"
                required
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sky-300/80">
                <ShieldCheck className="h-4 w-4" />
              </span>
            </div>
          </div>

          <div>
            <FieldLabel className="mb-1.5">Password</FieldLabel>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-300" />
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="h-12 rounded-xl border-white/10 bg-[#04101d]/85 pl-10 pr-11 text-white placeholder:text-slate-500 focus-visible:border-sky-300 focus-visible:ring-sky-300/30"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sky-300/80 transition-colors hover:text-white"
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error ? (
            <div className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-200 ring-1 ring-red-400/30">
              {error}
            </div>
          ) : null}

          <Button
            type="submit"
            variant="teal"
            className="h-12 w-full rounded-xl bg-gradient-to-r from-[#2f8cff] to-[#12c5d5] text-base font-semibold tracking-[0.12em] shadow-[0_10px_30px_-8px_rgba(47,140,255,0.85)] ring-1 ring-sky-300/30 transition-all hover:from-[#3f97ff] hover:to-[#15d8ea] hover:shadow-[0_14px_38px_-8px_rgba(47,140,255,1)]"
            disabled={submitting}
          >
            {submitting ? 'Memproses...' : 'LOGIN'}
          </Button>
        </form>

        {/* 
        <div className="mt-6 rounded-2xl border border-sky-400/15 bg-[#04101d]/70 p-4">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.35em] text-sky-200/70">
            Quick Demo Access
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.username}
                type="button"
                onClick={() => onFillDemo(account)}
                className="rounded-xl border border-sky-300/20 bg-white/5 px-2 py-2 text-xs font-medium text-sky-100 transition-colors hover:border-sky-300/40 hover:bg-sky-300/10"
              >
                {account.role}
              </button>
            ))}
          </div>
          <p className="mt-3 text-center text-xs text-slate-400">Pilih role untuk autofill, lalu login.</p>
        </div>*/}
      </div>
    </NeonPanel>
  )
}

export default function Landing() {
  const { login, isAuthenticated } = useAuth()
  const { stats } = useData()
  const navigate = useNavigate()
  const rememberedLogin = getRememberedLogin()
  const [username, setUsername] = useState(rememberedLogin.username)
  // Sandi selalu mulai kosong - lihat getRememberedLogin.
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const budget = stats.budget

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    setTimeout(async () => {
      const result = await login(username, password)
      if (result.success) {
        navigate('/transition', { replace: true })
      } else {
        setError(result.message)
      }
      setSubmitting(false)
    }, 320)
  }

  const fillDemo = (account) => {
    setUsername(account.username)
    setPassword(account.password)
    setError('')
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <style>{`\
        @keyframes bgZoom {\
          0% {\
            transform: scale(1) translate3d(0, 0, 0);\
          }\
          100% {\
            transform: scale(1.08) translate3d(-1.5%, -1%, 0);\
          }\
        }\
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
        <div className="absolute inset-0 bg-gradient-to-b from-[#021122]/35 via-[#061326]/80 to-slate-950/95" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.16),transparent_32%),radial-gradient(circle_at_bottom,rgba(16,185,129,0.08),transparent_28%)]" />
        <div className="absolute inset-0 opacity-[0.1]">
          <div className="h-full w-full bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-[length:24px_24px]" />
        </div>
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1600px] flex-col justify-center gap-5 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        {/* items-start: tiap kartu berhenti di tinggi isinya sendiri, jadi
            kartu anggaran tetap ringkas dan tidak ikut setinggi panel masuk. */}
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1.2fr)_340px] xl:items-start">
          <BudgetGauge
            label="Realisasi Anggaran"
            subtitle="Persentase Realisasi Anggaran"
            icon={ArrowUpRight}
            percentage={budget.realisasiPercent}
            accent="#46a7ff"
            primaryValue={budget.totalPagu}
            secondaryValue={budget.totalRealisasi}
            secondaryLabel="Realisasi"
          />

          <BudgetGauge
            label="Sisa Anggaran"
            subtitle="Persentase Sisa Anggaran"
            icon={Wallet}
            percentage={budget.sisaPercent}
            accent="#2fe0e8"
            primaryValue={budget.totalPagu}
            secondaryValue={budget.totalSisa}
            secondaryLabel="Sisa Anggaran"
          />

          <LoginPanel
            onLogin={handleSubmit}
            onFillDemo={fillDemo}
            username={username}
            setUsername={setUsername}
            password={password}
            setPassword={setPassword}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            error={error}
            submitting={submitting}
          />
        </div>

      </div>
    </div>
  )
}
