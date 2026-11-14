import { FireCalendarPlaceholder } from './features/fire-calendar/FireCalendarPlaceholder'
import { FireMapPlaceholder } from './features/fire-map/FireMapPlaceholder'
import { FiltersPlaceholder } from './features/filters/FiltersPlaceholder'

function App() {
  return (
    <div className="min-h-screen bg-stone-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white/90">
        <div className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8">
          <h1 className="text-lg font-semibold tracking-tight sm:text-xl">Historical Wildfire Activity Explorer</h1>
        </div>
      </header>
      <main className="mx-auto grid max-w-[1600px] gap-4 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <section className="relative min-h-[34rem]">
          <FireMapPlaceholder />
          <div className="absolute inset-x-4 top-24 z-10 sm:left-auto sm:right-5 sm:top-5 sm:w-[28rem] sm:max-w-[calc(100%_-_2.5rem)]">
            <FiltersPlaceholder />
          </div>
        </section>
        <FireCalendarPlaceholder />
      </main>
    </div>
  )
}

export default App

