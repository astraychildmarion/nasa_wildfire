export function PredictionAboutCard({ isMock }: { isMock: boolean }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="about-forecast-title">
      <div className="flex items-start justify-between gap-3">
        <h2 id="about-forecast-title" className="text-lg font-semibold text-slate-900">About Forecast Results</h2>
        {isMock && <span className="rounded-full bg-slate-100 px-2 py-1 text-[0.65rem] font-medium uppercase tracking-wide text-slate-500">Mock preview</span>}
      </div>
      <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
        <p>Forecasts are probability-based estimates generated from historical observations and a statistical model.</p>
        <p>They do not include sudden extreme weather or other factors that cannot be predicted from the historical record.</p>
        <p>Combine these results with current weather, satellite monitoring, and field information before making decisions.</p>
      </div>
      <details id="forecast-methodology" className="mt-4 border-t border-slate-200 pt-4 text-sm text-slate-600">
        <summary className="cursor-pointer font-medium text-slate-800">Detailed methodology</summary>
        <p className="mt-2 leading-6">The dashboard separates historical observations from forecast medians and uncertainty intervals. Replaceable repository data will define the final model and interval semantics when the backend contract is confirmed.</p>
      </details>
      <a href="#forecast-methodology" className="mt-4 inline-flex text-sm font-medium text-blue-700 underline decoration-blue-200 underline-offset-4 hover:text-blue-900">Learn more</a>
    </section>
  )
}

