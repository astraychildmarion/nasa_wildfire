export function FireMapPlaceholder() {
  return (
    <section className="flex min-h-[34rem] flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-orange-300 bg-[radial-gradient(circle_at_center,rgba(255,247,237,1),rgba(248,250,252,0.7)_60%)]">
        <p className="max-w-xs px-6 text-center text-sm leading-6 text-slate-500">
          Historical fire detections will appear here on an interactive map.
        </p>
      </div>
    </section>
  )
}

