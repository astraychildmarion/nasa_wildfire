export function PredictionAboutCard({ isMock }: { isMock: boolean }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="about-forecast-title">
      <div className="flex items-start justify-between gap-3">
        <h2 id="about-forecast-title" className="text-lg font-semibold text-slate-900">About Forecast Results</h2>
        {isMock && <span className="rounded-full bg-slate-100 px-2 py-1 text-[0.65rem] font-medium uppercase tracking-wide text-slate-500">Mock preview</span>}
      </div>
      <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
        <p>The monthly outlook uses historical distributions for the same calendar month. It is a climatology outlook, not an LSTM forecast.</p>
        <p>The 1–7 day forecast uses an LSTM to estimate daily satellite fire-detection probability for each 0.5° grid cell.</p>
        <p>They do not include sudden extreme weather or other factors that cannot be predicted from the historical record.</p>
        <p>Combine these results with current weather, satellite monitoring, and field information before making decisions.</p>
      </div>
      <details id="forecast-methodology" className="mt-4 border-t border-slate-200 pt-4 text-sm text-slate-600">
        <summary className="cursor-pointer font-medium text-slate-800">Detailed methodology</summary>
        <p className="mt-2 leading-6">Monthly ranges come from same-month historical distributions. The daily chart compares the LSTM regional mean detection probability with its historical climatology.</p>
      </details>
      <a href="#forecast-methodology" className="mt-4 inline-flex text-sm font-medium text-blue-700 underline decoration-blue-200 underline-offset-4 hover:text-blue-900">Learn more</a>
    </section>
  )
}

