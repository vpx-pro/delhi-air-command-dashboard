export default function DataSourcesPage() {
  return (
    <div className="page-grid">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="section-title mb-1">Data catalog</p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-50 md:text-3xl">
            What powers this dashboard?
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            All data lands in Supabase tables with explicit schemas so you can reuse it in
            your own analysis notebooks, dashboards, or teaching material.
          </p>
        </div>
        <div className="pill">
          <span className="h-2 w-2 rounded-full bg-sky-400" />
          <span>See `supabase-schema.sql` for the full DDL</span>
        </div>
      </div>

      <section className="glass-panel flex flex-col gap-4 p-5 text-xs text-slate-100">
        <h2 className="text-sm font-semibold tracking-tight text-slate-50 md:text-base">
          Air quality
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.3fr,1.7fr]">
          <div className="space-y-2">
            <p className="text-xs text-slate-300">
              We ingest station-level snapshots for Delhi and nearby regions. Each record
              includes AQI plus pollutant fractions where available.
            </p>
            <ul className="list-disc space-y-1 pl-5 text-xs">
              <li>
                <span className="font-semibold text-sky-200">
                  Source examples
                </span>{' '}
                – OpenAQ, CPCB/DPCC feeds, or your own CSV exports.
              </li>
              <li>
                <span className="font-semibold text-sky-200">Refresh</span> – you
                control the schedule via cron / CI; scripts are in{' '}
                <code className="rounded bg-slate-800 px-1 py-0.5">
                  scripts/ingest-aqi.mjs
                </code>
                .
              </li>
            </ul>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-700/80 bg-slate-900/80 p-3">
              <h3 className="mb-1 text-xs font-semibold text-slate-50">
                `stations`
              </h3>
              <p className="text-[11px] text-slate-300">
                Geocoded monitoring locations used to anchor maps and join readings.
              </p>
              <ul className="mt-2 space-y-1 text-[11px]">
                <li>
                  <code>id</code> – UUID primary key
                </li>
                <li>
                  <code>name</code>, <code>region</code>
                </li>
                <li>
                  <code>latitude</code>, <code>longitude</code>
                </li>
              </ul>
            </div>
            <div className="rounded-xl border border-slate-700/80 bg-slate-900/80 p-3">
              <h3 className="mb-1 text-xs font-semibold text-slate-50">
                `aqi_readings`
              </h3>
              <p className="text-[11px] text-slate-300">
                Time series of AQI & pollutant snapshots per station.
              </p>
              <ul className="mt-2 space-y-1 text-[11px]">
                <li>
                  <code>station_id</code> → <code>stations.id</code>
                </li>
                <li>
                  <code>observed_at</code> – timestamp
                </li>
                <li>
                  <code>aqi</code>, <code>pm25</code>, <code>pm10</code>,{' '}
                  <code>no2</code>, <code>so2</code>, <code>o3</code>, <code>co</code>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="glass-panel flex flex-col gap-4 p-5 text-xs text-slate-100">
        <h2 className="text-sm font-semibold tracking-tight text-slate-50 md:text-base">
          Fire hotspots
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.3fr,1.7fr]">
          <div className="space-y-2">
            <p className="text-xs text-slate-300">
              Fire detections come from satellite products such as NASA FIRMS (MODIS /
              VIIRS). We only store basic geometry and intensity—no imagery—to keep the
              schema light.
            </p>
            <ul className="list-disc space-y-1 pl-5 text-xs">
              <li>
                <span className="font-semibold text-sky-200">
                  Scripts
                </span>{' '}
                – see{' '}
                <code className="rounded bg-slate-800 px-1 py-0.5">
                  scripts/ingest-fires.mjs
                </code>
                .
              </li>
              <li>
                <span className="font-semibold text-sky-200">
                  Typical cadence
                </span>{' '}
                – 3–6 hours, depending on satellite overpass.
              </li>
            </ul>
          </div>
          <div className="rounded-xl border border-slate-700/80 bg-slate-900/80 p-3">
            <h3 className="mb-1 text-xs font-semibold text-slate-50">
              `fire_hotspots`
            </h3>
            <p className="text-[11px] text-slate-300">
              Point-like events that can be plotted alongside stations to inspect
              spatial overlap.
            </p>
            <ul className="mt-2 space-y-1 text-[11px]">
              <li>
                <code>latitude</code>, <code>longitude</code>, <code>detected_at</code>
              </li>
              <li>
                <code>confidence</code>, <code>frp</code> (fire radiative power)
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="glass-panel flex flex-col gap-4 p-5 text-xs text-slate-100">
        <h2 className="text-sm font-semibold tracking-tight text-slate-50 md:text-base">
          Weather
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.3fr,1.7fr]">
          <div className="space-y-2">
            <p className="text-xs text-slate-300">
              Lightweight weather snapshots (temperature, wind, humidity) help frame AQI
              and fire behaviour. Any API that can provide hourly data for Delhi&apos;s
              bounding box will work.
            </p>
            <ul className="list-disc space-y-1 pl-5 text-xs">
              <li>
                <span className="font-semibold text-sky-200">
                  Source examples
                </span>{' '}
                – Open-Meteo, IMD APIs, or your own station data.
              </li>
              <li>
                Ingestion lives in{' '}
                <code className="rounded bg-slate-800 px-1 py-0.5">
                  scripts/ingest-weather.mjs
                </code>
                .
              </li>
            </ul>
          </div>
          <div className="rounded-xl border border-slate-700/80 bg-slate-900/80 p-3">
            <h3 className="mb-1 text-xs font-semibold text-slate-50">
              `weather_snapshots`
            </h3>
            <ul className="mt-2 space-y-1 text-[11px]">
              <li>
                <code>observed_at</code>, <code>latitude</code>, <code>longitude</code>
              </li>
              <li>
                <code>temperature_c</code>, <code>wind_speed_ms</code>,{' '}
                <code>wind_dir_deg</code>
              </li>
              <li>
                <code>humidity_pct</code>, <code>pressure_hpa</code>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="glass-panel flex flex-col gap-4 p-5 text-xs text-slate-100">
        <h2 className="text-sm font-semibold tracking-tight text-slate-50 md:text-base">
          Signups & collaboration
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <h3 className="mb-1 text-xs font-semibold text-slate-50">
              `signups`
            </h3>
            <p className="text-[11px] text-slate-300">
              Stores general email signups from the dashboard footer.
            </p>
          </div>
          <div>
            <h3 className="mb-1 text-xs font-semibold text-slate-50">
              `contributor_signups` & `good_first_issues`
            </h3>
            <p className="text-[11px] text-slate-300">
              Power the Contribute page: who wants to help, and curated starter issues.
            </p>
          </div>
        </div>
        <p className="text-[11px] text-slate-400">
          All RLS policies are defined in <code>supabase-schema.sql</code>. By default,
          anonymous inserts are allowed into signup tables, and anonymous reads are
          allowed for <code>good_first_issues</code>.
        </p>
      </section>
    </div>
  );
}


