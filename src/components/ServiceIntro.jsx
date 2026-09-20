import { Check, Info } from 'lucide-react'
import { getServiceContent } from '../data/serviceContent'

// Panduan singkat di tiap layanan. Tanpa ini, semua layanan terlihat sama dan
// pengguna harus menebak berkas apa yang seharusnya masuk ke sana.
export function ServiceIntro({ categoryId, categoryName }) {
  const content = getServiceContent(categoryId)
  if (!content.expects.length) return null

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_1px_10px_rgba(15,23,42,0.06)]">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#eff5ff] text-[#1f63d3]">
          <Info className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-bold text-[#233b84]">{categoryName}</h2>
          <p className="mt-1 text-sm text-[#61739b]">{content.summary}</p>

          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">Yang dicatat di sini</p>
          <ul className="mt-2 grid gap-1.5 sm:grid-cols-2 xl:grid-cols-3">
            {content.expects.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#16a34a]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
