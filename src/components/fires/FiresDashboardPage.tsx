import { ViirsFiresMap } from './ViirsFiresMap';

export default function FiresDashboardPage() {
  return (
    <div className="page-grid">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="section-title mb-1">Fires · VIIRS</p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-50 md:text-3xl">
            Live satellite fire hotspots around Delhi
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            A focused view on NASA VIIRS fire detections over India, centred on Delhi / NCR.
            Use this alongside the main Overview map when you want to zoom in on fire activity
            specifically.
          </p>
        </div>
        <div className="pill">
          <span className="h-2 w-2 rounded-full bg-orange-400" />
          <span>Feeds from NASA FIRMS APIs · Auto‑refresh every 60 minutes</span>
        </div>
      </div>

      <ViirsFiresMap />
    </div>
  );
}


