import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUpRight,
  Eye,
  EyeOff,
  Lock,
  Sparkles,
  User,
  Wallet,
  Activity,
  ShieldCheck,
  Building2
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'

const DEMO_ACCOUNTS = [
  { role: 'Administrator', username: 'admin', password: 'admin123' },
  { role: 'Employee', username: 'employee', password: 'employee123' },
  { role: 'Viewer', username: 'viewer', password: 'viewer123' }
]

function formatCurrency(value) {
  return `Rp ${new Intl.NumberFormat('id-ID').format(Math.round(value))}`
}

function NeonPanel({ className = '', children }) {
  return (
    <div
      className={`relative overflow-hidden rounded-[30px] border border-sky-400/25 bg-[#071429]/90 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.12),transparent_34%)]" />
      <div className="pointer-events-none absolute inset-[10px] rounded-[24px] border border-sky-400/15" />
      <div className="relative">{children}</div>
    </div>
  )
}

function BudgetGauge({ label, subtitle, icon: Icon, percentage, accent, primaryValue, secondaryValue, secondaryLabel }) {
  const clamped = Math.max(0, Math.min(100, percentage))

  return (
    <NeonPanel className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white sm:text-[2rem]">{label}</h2>
          <p className="mt-1 text-sm text-slate-300">{subtitle}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-sky-300/30 bg-white/5 text-sky-200 shadow-[0_0_24px_rgba(59,130,246,0.35)]">
          <Sparkles className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-5 xl:flex-row xl:items-center">
        <div className="flex items-center justify-center xl:w-56">
          <div
            className="relative flex h-44 w-44 items-center justify-center rounded-full"
            style={{
              background: `conic-gradient(${accent} ${clamped}%, rgba(148, 163, 184, 0.15) ${clamped}% 100%)`
            }}
          >
            <div className="absolute inset-4 rounded-full border border-sky-300/20 bg-[#05101f] shadow-[inset_0_0_28px_rgba(9,132,255,0.18)]" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-sky-300/15 bg-[#071429] text-sky-200 shadow-[0_0_20px_rgba(0,168,255,0.2)]">
              <Icon className="h-10 w-10" />
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-baseline gap-1">
            <span className="text-6xl font-semibold tracking-tight text-white sm:text-7xl">{Math.round(clamped)}</span>
            <span className="text-3xl font-medium text-sky-300">%</span>
          </div>

          <div className="mt-4 h-4 overflow-hidden rounded-full border border-sky-400/25 bg-slate-900/70">
            <div
              className="h-full rounded-full shadow-[0_0_18px_rgba(56,189,248,0.45)]"
              style={{ width: `${clamped}%`, background: `linear-gradient(90deg, ${accent}, #4fa3ff)` }}
            />
          </div>

          <div className="mt-4 space-y-2 text-sm text-slate-200 sm:text-base">
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-28 text-slate-400">{secondaryLabel}</span>
              <span className="font-medium text-white">{formatCurrency(secondaryValue)}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-28 text-slate-400">Pagu</span>
              <span className="font-medium text-white">{formatCurrency(primaryValue)}</span>
            </div>
          </div>
        </div>
      </div>
    </NeonPanel>
  )
}

function LoginPanel({ onLogin, onFillDemo, username, setUsername, password, setPassword, showPassword, setShowPassword, error, submitting }) {
  return (
    <NeonPanel className="p-5 sm:p-6">
      <div className="flex flex-col">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-18 w-18 items-center justify-center rounded-2xl border border-sky-300/30 bg-white/5 text-center shadow-[0_0_35px_rgba(56,189,248,0.25)]">
            <img src="/jembatan-logo.png" alt="Logo Jembatan" className="h-1/2 w-1/2 object-contain" />
          </div>

          <h2 className="mt-5 text-2xl font-semibold text-sky-300">Selamat Datang</h2>
          <p className="mt-1 text-sm text-slate-300">Silakan login untuk melanjutkan</p>
        </div>

        <form onSubmit={onLogin} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-200">Username</label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-300" />
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="h-12 rounded-xl border-sky-400/25 bg-[#04101d]/85 pl-10 pr-10 text-white placeholder:text-slate-500 focus-visible:border-sky-300 focus-visible:ring-sky-300/30"
                required
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sky-300/80">
                <ShieldCheck className="h-4 w-4" />
              </span>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-200">Password</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-300" />
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="h-12 rounded-xl border-sky-400/25 bg-[#04101d]/85 pl-10 pr-11 text-white placeholder:text-slate-500 focus-visible:border-sky-300 focus-visible:ring-sky-300/30"
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
            <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          <Button
            type="submit"
            variant="teal"
            className="h-12 w-full rounded-xl border border-sky-300/30 bg-gradient-to-r from-[#2f8cff] to-[#12c5d5] text-base font-semibold shadow-[0_0_30px_rgba(56,189,248,0.45)] hover:from-[#3f97ff] hover:to-[#15d8ea]"
            disabled={submitting}
          >
            {submitting ? 'Memproses...' : 'LOGIN'}
          </Button>
        </form>

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
        </div>
      </div>
    </NeonPanel>
  )
}

export default function Landing() {
  const { login, isAuthenticated } = useAuth()
  const { stats } = useData()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
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

    setTimeout(() => {
      const result = login(username, password)
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

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col gap-5 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex items-center gap-3 self-start rounded-full border border-sky-400/20 bg-white/5 px-4 py-2 backdrop-blur-xl">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-400/15 text-sky-200 shadow-[0_0_20px_rgba(59,130,246,0.25)]">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.42em] text-sky-300/80">Portal Internal</p>
              <p className="text-sm text-white/85">BPK Dashboard Jembatan</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-sky-100/80">
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-[#061429]/70 px-3 py-1.5 backdrop-blur-xl">
              <Activity className="h-3.5 w-3.5 text-sky-300" />
              Data real-time dari local storage
            </span>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/')}
              className="hidden rounded-full border-sky-300/25 bg-white/5 px-4 text-white hover:bg-sky-300/10 hover:text-white sm:inline-flex"
            >
              Buka Login
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_360px] lg:items-start">
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
