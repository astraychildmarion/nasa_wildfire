export function PredictionAboutCard({ isMock }: { isMock: boolean }) {
  return (
    <section className="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" aria-labelledby="about-forecast-title">
      <div className="flex items-start justify-between gap-3">
        <h2 id="about-forecast-title" className="text-lg font-semibold text-slate-900">About Forecast Results</h2>
        {isMock && <span className="rounded-full bg-slate-100 px-2 py-1 text-[0.65rem] font-medium uppercase tracking-wide text-slate-500">Mock preview</span>}
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-600">Use these probabilistic estimates with current weather, satellite monitoring, and field information.</p>
      <details id="forecast-methodology" className="mt-3 border-t border-slate-200 pt-3 text-sm text-slate-600">
        <summary className="cursor-pointer font-medium text-slate-800">Methodology &amp; limitations</summary>
        <div className="mt-2 space-y-2 leading-6">
          <p>The monthly outlook uses same-month historical distributions. The 1–7 day forecast uses an LSTM to estimate satellite fire-detection probability for each 0.5° grid cell.</p>
          <p>Sudden extreme weather and other unforeseen factors are not included.</p>
        </div>
      </details>
    </section>
  )
}

