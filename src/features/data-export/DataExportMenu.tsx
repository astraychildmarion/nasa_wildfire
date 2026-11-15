import { useRef, useState } from 'react'
import type { MonthRange } from '../../shared/lib'
import type { AreaOfInterest } from '../../shared/types'
import { getExportUrls } from './exportUrls'

function ExportItem({ href, title, description }: { href: string | null; title: string; description: string }) {
  const classes = 'block rounded-lg px-3 py-2 text-left transition'
  if (!href) {
    return <div className={`${classes} cursor-not-allowed bg-slate-50 opacity-50`} aria-disabled="true"><strong className="block text-xs text-slate-700">{title}</strong><span className="mt-0.5 block text-[0.68rem] text-slate-500">{description}</span></div>
  }
  return <a href={href} className={`${classes} hover:bg-slate-100`}><strong className="block text-xs text-slate-800">{title}</strong><span className="mt-0.5 block text-[0.68rem] text-slate-500">{description}</span></a>
}

function PredictionExportItem({ available, exporting, onDownload }: { available: boolean; exporting: boolean; onDownload: () => Promise<void> }) {
  const disabled = !available || exporting
  return <button type="button" disabled={disabled} onClick={() => void onDownload()} className={`block w-full rounded-lg px-3 py-2 text-left transition ${disabled ? 'cursor-not-allowed bg-slate-50 opacity-50' : 'hover:bg-slate-100'}`}>
    <strong className="block text-xs text-slate-800">{exporting ? 'Preparing Prediction PNG…' : 'Download Prediction PNG'}</strong>
    <span className="mt-0.5 block text-[0.68rem] text-slate-500">{available ? 'Complete prediction dashboard at 2× resolution.' : 'Open the prediction page and wait for its data to load.'}</span>
  </button>
}

export interface DataExportMenuProps {
  aoi: AreaOfInterest | null
  range: MonthRange | null
  predictionPngAvailable: boolean
  onDownloadPredictionPng: () => Promise<void>
}

export function DataExportMenu({ aoi, range, predictionPngAvailable, onDownloadPredictionPng }: DataExportMenuProps) {
  const urls = getExportUrls(aoi, range)
  const detailsRef = useRef<HTMLDetailsElement>(null)
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  async function handlePredictionDownload() {
    if (!predictionPngAvailable || exporting) return
    setExporting(true)
    setExportError(null)
    try {
      await onDownloadPredictionPng()
      if (detailsRef.current) detailsRef.current.open = false
    } catch {
      setExportError('Prediction PNG could not be created. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <details ref={detailsRef} className="relative">
      <summary className="cursor-pointer list-none rounded-lg border border-slate-300 px-3 py-2 font-medium text-slate-600 transition marker:hidden hover:bg-slate-100 hover:text-slate-900">Download Data</summary>
      <div className="absolute right-0 z-[1000] mt-2 w-72 rounded-xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10">
        <ExportItem href={urls.calendar} title="Download Calendar CSV" description={aoi ? 'Historical monthly activity for the selected AOI.' : 'Select an AOI on the map first.'} />
        <ExportItem href={urls.hotspots} title="Download Activity Grid CSV" description={!aoi ? 'Select an AOI on the map first.' : range ? `${range.start} through ${range.end}, inclusive.` : 'Wait for the available date range to load.'} />
        <PredictionExportItem available={predictionPngAvailable} exporting={exporting} onDownload={handlePredictionDownload} />
        {exportError && <p className="px-3 py-2 text-[0.68rem] text-red-700" role="alert">{exportError}</p>}
      </div>
    </details>
  )
}
