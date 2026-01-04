import { GoodFirstIssuesList } from '@/components/contribute/GoodFirstIssuesList';

export default function BuildPage() {
  return (
    <div className="page-grid">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="section-title mb-1">Build</p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-50 md:text-3xl">
            Build on top of Delhi&apos;s air data
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            A lightweight starting point for developers, data teams, and startups who want to
            ship tools, alerts, and products on top of this open stack.
          </p>
        </div>
        <div className="pill">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span>Developer‑friendly • MIT‑licensed • Supabase‑backed</span>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="glass-panel flex flex-col gap-2 p-5 text-xs text-slate-100">
          <header>
            <p className="section-title mb-1">For builders</p>
            <h2 className="text-sm font-semibold tracking-tight text-slate-50 md:text-base">
              Datasets &amp; tables
            </h2>
          </header>
          <p className="mt-1 text-xs text-slate-300">
            Supabase hosts structured tables for stations, AQI readings, fire hotspots, and
            basic weather. Each table is designed to be easy to query and join.
          </p>
          <ul className="mt-2 space-y-1 text-[11px] text-slate-300">
            <li>• <code className="rounded bg-slate-900/80 px-1">stations</code> – CPCB / WAQI station metadata</li>
            <li>• <code className="rounded bg-slate-900/80 px-1">aqi_readings</code> – AQI + pollutants by time</li>
            <li>• <code className="rounded bg-slate-900/80 px-1">fire_hotspots</code> – VIIRS FIRMS fire detections</li>
          </ul>
        </article>

        <article className="glass-panel flex flex-col gap-2 p-5 text-xs text-slate-100">
          <header>
            <p className="section-title mb-1">For builders</p>
            <h2 className="text-sm font-semibold tracking-tight text-slate-50 md:text-base">
              API endpoints
            </h2>
          </header>
          <p className="mt-1 text-xs text-slate-300">
            The app already exposes a small set of HTTP endpoints that proxy or aggregate key
            data. You can call these directly from other tools or dashboards.
          </p>
          <ul className="mt-2 space-y-1 text-[11px] text-slate-300">
            <li>• <code className="rounded bg-slate-900/80 px-1">GET /api/aqi/live</code> – latest AQI snapshot</li>
            <li>• <code className="rounded bg-slate-900/80 px-1">GET /api/aqi/stations</code> – WAQI / Delhi station map</li>
            <li>• More endpoints can be added for weather, aggregations, and exports.</li>
          </ul>
        </article>

        <article className="glass-panel flex flex-col gap-2 p-5 text-xs text-slate-100 md:col-span-1 md:row-span-1">
          <header>
            <p className="section-title mb-1">For builders</p>
            <h2 className="text-sm font-semibold tracking-tight text-slate-50 md:text-base">
              Open problems / good first issues
            </h2>
          </header>
          <p className="mt-1 text-xs text-slate-300">
            Pick an issue that matches your skills and constraints, or open a new one if you
            spot a sharp edge in the UX, data, or infrastructure.
          </p>
        </article>
      </section>

      {/* Reuse the contributor issues list so builders see concrete ways to help. */}
      <GoodFirstIssuesList />
    </div>
  );
}


