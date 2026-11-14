export function ActivitySummaryPlaceholder() {
  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
      <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-500">Overview</p>
      <h2 className="mt-1 text-lg font-semibold">Activity summary</h2>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-slate-800/70 p-4"><p className="text-xs text-slate-500">Detections</p><p className="mt-2 text-xl font-semibold text-slate-300">—</p></div>
        <div className="rounded-xl bg-slate-800/70 p-4"><p className="text-xs text-slate-500">Peak day</p><p className="mt-2 text-xl font-semibold text-slate-300">—</p></div>
      </div>
    </section>
  )
}

