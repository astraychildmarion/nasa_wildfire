import type { PredictionInsights } from '../../shared/types'

function InsightIcon({ kind }: { kind: 'bars' | 'calendar' | 'trend' }) {
  if (kind === 'calendar') {
    return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4M17 3v4M3 10h18M7 14h.01M12 14h.01M17 14h.01M7 18h.01M12 18h.01" /></svg>
  }
  if (kind === 'trend') {
    return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 19h18M5 16l4-5 3 2 6-7" /><path d="M14 6h4v4" /></svg>
  }
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 19V9M10 19V5M16 19v-8M22 19V3" /></svg>
}

function formatPercent(value: number | null): string {
  if (value === null) return 'Unavailable'
  return `${value > 0 ? '+' : ''}${value}%`
}

function directionTone(value: number | null): string {
  if (value === null) return 'text-slate-500'
  if (value > 0) return 'text-orange-600'
  if (value < 0) return 'text-blue-700'
  return 'text-slate-600'
}

export function PredictionInsightsCard({ insights }: { insights: PredictionInsights }) {
  const items = [
    { icon: 'bars' as const, value: formatPercent(insights.nextThreeMonthsChangePercent), label: 'Next 3 months vs historical period', tone: directionTone(insights.nextThreeMonthsChangePercent) },
    { icon: 'calendar' as const, value: insights.highRiskPeriod, label: 'Highest-risk period in the next year', tone: 'text-red-600' },
    { icon: 'trend' as const, value: formatPercent(insights.longTermTrendPercent), label: 'Long-term activity trend', tone: directionTone(insights.longTermTrendPercent) },
  ]

  return (
    <section className="w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="prediction-insights-title">
      <h2 id="prediction-insights-title" className="text-lg font-semibold text-slate-900">Key Insights</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {items.map((item) => (
          <article key={item.label} className="rounded-xl bg-slate-50 p-4 text-center">
            <div className={`${item.tone} flex flex-col items-center gap-2`}><InsightIcon kind={item.icon} /><strong className="text-2xl tracking-tight">{item.value}</strong></div>
            <p className="mt-3 text-[0.7rem] leading-4 text-slate-600">{item.label}</p>
          </article>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-3 text-[0.7rem] text-slate-500" aria-label="Insight direction colour legend">
        <span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-orange-500" />Increase</span>
        <span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-blue-700" />Decrease</span>
        <span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-slate-400" />No change</span>
      </div>
    </section>
  )
}

