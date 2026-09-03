import { useMemo } from 'react'
import { Download } from 'lucide-react'
import { cn } from '../../lib/utils'
import { createDownloadUrl, getDocumentFileExtension } from '../../lib/documentStorage'

export function DocumentPreview({ document }) {
  const downloadUrl = useMemo(() => createDownloadUrl(document), [document])
  const extension = getDocumentFileExtension(document.fileName)
  const isImage = ['jpg', 'jpeg', 'png'].includes(extension)
  const isPdf = extension === 'pdf'

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
        {isPdf && document.fileDataUrl ? (
          <iframe title={document.title} src={document.fileDataUrl} className="h-[420px] w-full" />
        ) : isImage && document.fileDataUrl ? (
          <img src={document.fileDataUrl} alt={document.title} className="max-h-[420px] w-full object-contain" />
        ) : (
          <div className="flex min-h-[280px] flex-col items-center justify-center px-6 py-12 text-center">
            <p className="text-sm font-medium text-navy">Preview tidak tersedia untuk file ini.</p>
            <p className="mt-2 text-sm text-slate-500">Gunakan download untuk membuka file asli.</p>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <a
          href={downloadUrl}
          download={document.fileName || document.title}
          className={cn(
            'inline-flex h-10 items-center justify-center gap-2 rounded-md bg-teal px-4 text-sm font-medium text-white transition-colors hover:bg-teal-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-200'
          )}
        >
          <Download className="h-4 w-4" /> Download
        </a>
      </div>
    </div>
  )
}
