import { formatPercent, formatRupiah } from '../../../lib/budgetFormat'
import { IconCoins, IconDocument, IconTarget, IconTrendUp } from '../../icons/DuotoneIcons'
import { CARD_CLASS, CARD_TITLE_CLASS } from '../../ui/cardStyles'
import { useAnimatedProgress } from '../../../hooks/useAnimatedProgress'
import { STATUS_STYLES, shortAccountName } from './accountModel'

const MAX_ROWS = 8

function ProgressBar({ percent, status, progress, thick }) {
  return (
    <span className={`block overflow-hidden rounded-full bg-[#e9eef6] ${thick ? 'h-4' : 'h-2.5'}`}>
      <span className="block h-full rounded-full" style={{ width: `${Math.min(percent, 100) * progress}%`, backgroundColor: STATUS_STYLES[status].bar }} />
    </span>
  )
}

// Catatan otomatis untuk kelompok yang hanya punya satu akun (mis. Belanja Modal).
function buildInsights(model) {
  const { absorption, total, accounts, title } = model
  const sisaShare = total.pagu ? (total.sisa / total.pagu) * 100 : 0
  return [
    absorption >= 90
      ? { tone: 'green', icon: IconTrendUp, title: 'Realisasi hampir penuh', text: 'Pagu telah terealisasi secara optimal.' }
      : { tone: 'green', icon: IconTrendUp, title: `Realisasi ${formatPercent(absorption)}`, text: `${formatRupiah(total.realisasi)} dari pagu ${formatRupiah(total.pagu)}.` },
    sisaShare < 1
      ? { tone: 'orange', icon: IconCoins, title: 'Sisa anggaran sangat kecil', text: `Sisa anggaran hanya ${formatRupiah(total.sisa)}.` }
      : { tone: 'orange', icon: IconCoins, title: `Sisa ${formatPercent(sisaShare)} dari pagu`, text: `Sisa anggaran ${formatRupiah(total.sisa)}.` },
    { tone: 'blue', icon: IconDocument, title: `${accounts.length} jenis akun 6 digit`, text: `${title} terdiri dari ${accounts.length} akun utama.` }
  ]
}

const INSIGHT_TONES = {
  green: 'bg-[#eefaf3] text-[#137a52] [&_svg]:text-[#1fae7a]',
  orange: 'bg-[#fff6ea] text-[#c2620a] [&_svg]:text-[#f08a1c]',
  blue: 'bg-[#eef4fd] text-[#1d5fd0] [&_svg]:text-[#2f7fe8]'
}

function SingleAccountStatus({ model, progress }) {
  const account = model.accounts[0]
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 tall:gap-3">
      <div>
        <p className="text-sm font-bold text-[#12305f]">{account.code}</p>
        <p className="text-[13px] text-[#3f557d]">{account.name}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1"><ProgressBar percent={account.absorption} status={account.status} progress={progress} thick /></div>
        <b className="text-lg tabular-nums" style={{ color: STATUS_STYLES[account.status].chipText }}>{formatPercent(account.absorption * progress, 2)}</b>
      </div>
      <div className="grid min-h-0 flex-1 gap-2.5 sm:grid-cols-3">
        {buildInsights(model).map((insight) => (
          <div key={insight.title} className={`flex min-h-0 flex-col gap-1 rounded-xl p-2.5 tall:gap-1.5 tall:p-3 ${INSIGHT_TONES[insight.tone]}`}>
            <p className="flex items-start gap-1.5 text-[13px] font-bold leading-tight">
              <insight.icon className="h-5 w-5 shrink-0" />
              {insight.title}
            </p>
            <p className="text-[12px] leading-snug text-[#3f557d]">{insight.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function AccountStatusList({ accounts, progress }) {
  return (
    <ul className="flex min-h-0 flex-1 flex-col justify-around gap-1">
      {accounts.slice(0, MAX_ROWS).map((account) => (
        <li key={account.code} className="grid grid-cols-[52px_minmax(0,1fr)_minmax(80px,36%)_58px] items-center gap-2.5 text-[12.5px]">
          <span className="font-semibold tabular-nums text-[#12305f]">{account.code}</span>
          <span className="truncate text-[#3f557d]" title={account.name}>{shortAccountName(account.name)}</span>
          <ProgressBar percent={account.absorption} status={account.status} progress={progress} />
          <b className="text-right tabular-nums" style={{ color: STATUS_STYLES[account.status].chipText }}>{formatPercent(account.absorption * progress, 2)}</b>
        </li>
      ))}
    </ul>
  )
}

export function AccountStatusPanel({ model }) {
  const isSingle = model.accounts.length === 1
  const progress = useAnimatedProgress(model.accounts.map((account) => `${account.code}:${account.realisasi}`).join('|'))

  return (
    <div className={CARD_CLASS}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 className={`${CARD_TITLE_CLASS} flex items-center gap-2`}>
          <IconTarget className="h-5 w-5 text-[#2f7fe8]" />
          {isSingle ? 'Status Realisasi' : 'Status Realisasi per Akun Utama'}
        </h2>
        <span className="text-xs text-[#7a8aa8]">Persentase Realisasi</span>
      </div>
      {isSingle ? <SingleAccountStatus model={model} progress={progress} /> : <AccountStatusList accounts={model.accounts} progress={progress} />}
    </div>
  )
}
