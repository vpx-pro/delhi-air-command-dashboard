export default function DecidePage() {
  return (
    <div className="page-grid">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="section-title mb-1">Decide</p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-50 md:text-3xl">
            Policy‑oriented view of Delhi&apos;s air
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            A placeholder policy dashboard for people who need to turn signals into
            interventions: GRAP stages, advisories, enforcement, and public messaging.
          </p>
        </div>
        <div className="pill">
          <span className="h-2 w-2 rounded-full bg-amber-400" />
          <span>Early concept – no live recommendations yet</span>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="glass-panel flex flex-col gap-2 p-5 text-xs text-slate-100">
          <header className="flex items-center justify-between gap-2">
            <div>
              <p className="section-title mb-1">Policy card</p>
              <h2 className="text-sm font-semibold tracking-tight text-slate-50">
                Hotspots to watch (next 24–48h)
              </h2>
            </div>
            <span className="rounded-full bg-slate-900/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-200 ring-1 ring-slate-700/80">
              Coming soon
            </span>
          </header>
          <p className="mt-1 text-xs text-slate-300">
            This card will surface areas where recent and forecast conditions suggest elevated
            risk – combining station AQI, fire plumes, and basic meteorology.
          </p>
        </article>

        <article className="glass-panel flex flex-col gap-2 p-5 text-xs text-slate-100">
          <header className="flex items-center justify-between gap-2">
            <div>
              <p className="section-title mb-1">Policy card</p>
              <h2 className="text-sm font-semibold tracking-tight text-slate-50">
                Threshold alerts (NAQI bands)
              </h2>
            </div>
            <span className="rounded-full bg-slate-900/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-200 ring-1 ring-slate-700/80">
              Coming soon
            </span>
          </header>
          <p className="mt-1 text-xs text-slate-300">
            Planned logic here will track which NAQI bands have been crossed, for how long,
            and where, to support GRAP stage checks and local advisories.
          </p>
        </article>

        <article className="glass-panel flex flex-col gap-2 p-5 text-xs text-slate-100">
          <header className="flex items-center justify-between gap-2">
            <div>
              <p className="section-title mb-1">Policy card</p>
              <h2 className="text-sm font-semibold tracking-tight text-slate-50">
                Intervention notes (GRAP / closures / advisories)
              </h2>
            </div>
            <span className="rounded-full bg-slate-900/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-200 ring-1 ring-slate-700/80">
              Coming soon
            </span>
          </header>
          <p className="mt-1 text-xs text-slate-300">
            This space will summarise actions taken or recommended – school closures, traffic
            curbs, construction limits – alongside the data that justified them.
          </p>
        </article>
      </section>
    </div>
  );
}


