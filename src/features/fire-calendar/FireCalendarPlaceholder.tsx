const cells = Array.from({ length: 28 })

export function FireCalendarPlaceholder() {
  return (
    <section className="w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid grid-cols-7 gap-1.5 sm:grid-cols-14 lg:grid-cols-28" aria-hidden="true">
        {cells.map((_, index) => <span className="aspect-square rounded-sm bg-slate-100 ring-1 ring-inset ring-slate-200" key={index} />)}
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-500">Daily historical activity will be displayed as a calendar heatmap.</p>
    </section>
  )
}

