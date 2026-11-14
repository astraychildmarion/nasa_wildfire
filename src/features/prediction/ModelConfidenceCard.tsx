import type { ModelConfidence } from '../../shared/types'

export function ModelConfidenceCard({ confidence }: { confidence: ModelConfidence }) {
  const score = Math.max(0, Math.min(100, confidence.scorePercent))

  return (
    <section className="w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="model-confidence-title">
      <h2 id="model-confidence-title" className="text-lg font-semibold text-slate-900">Model Confidence</h2>
      <div className="mt-4 flex items-end gap-3">
        <strong className="text-5xl font-semibold tracking-tight text-emerald-600">{score}%</strong>
        <span className="pb-1 text-xs text-slate-500">{confidence.metric}</span>
      </div>
      <div className="mt-4" role="progressbar" aria-label="Model confidence" aria-valuemin={0} aria-valuemax={100} aria-valuenow={score}>
        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${score}%` }} /></div>
      </div>
      <ul className="mt-5 space-y-2 text-sm text-slate-600">
        {confidence.factors.map((factor) => <li key={factor} className="flex items-start gap-2"><span className="mt-0.5 text-emerald-600" aria-hidden="true">✓</span><span>{factor}</span></li>)}
      </ul>
    </section>
  )
}

