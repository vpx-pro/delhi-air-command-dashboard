'use client';

import { useState } from 'react';
import {
  ExploreFilterState,
  ExploreFilters,
  getInitialExploreFilters,
} from './ExploreFilters';
import { CorrelationChart } from './CorrelationChart';
import { AudienceSelector } from '@/components/common/AudienceSelector';

export default function ExplorePage() {
  const [filters, setFilters] = useState<ExploreFilterState>(
    getInitialExploreFilters(),
  );

  return (
    <div className="page-grid">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="section-title mb-1">Understand</p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-50 md:text-3xl">
            Understand how Delhi&apos;s air behaves over time
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            Explore simple trends and relationships between open fires and PM2.5 to build an
            intuition before doing heavier analysis elsewhere.
          </p>
        </div>
        <div className="pill">
          <span className="h-2 w-2 rounded-full bg-sky-400" />
          <span>Daily aggregates are computed on the fly from Supabase</span>
        </div>
      </div>

      <AudienceSelector context="understand" />

      <ExploreFilters value={filters} onChange={setFilters} />

      {/* Section A: What changed over time? */}
      <section className="glass-panel flex flex-col gap-3 p-5 text-xs text-slate-100">
        <div>
          <p className="section-title mb-1">What changed over time?</p>
          <h2 className="text-sm font-semibold tracking-tight text-slate-50 md:text-base">
            Daily patterns and longer-term shifts
          </h2>
          <p className="mt-1 text-xs text-slate-300">
            This section will show rolling views of AQI, PM2.5, and fire activity so you can
            quickly see if today is typical or part of a longer episode.
          </p>
        </div>
        <div className="mt-2 rounded-lg border border-dashed border-slate-700/80 bg-slate-900/60 px-4 py-3 text-xs text-slate-300">
          Coming soon: time-series views for PM2.5, AQI, and fires, with simple seasonality
          overlays.
        </div>
      </section>

      {/* Section B: What might be driving PM2.5? */}
      <section className="glass-panel flex flex-col gap-3 p-5 text-xs text-slate-100">
        <div>
          <p className="section-title mb-1">What might be driving PM2.5?</p>
          <h2 className="text-sm font-semibold tracking-tight text-slate-50 md:text-base">
            Fire hotspots vs PM2.5 by day
          </h2>
          <p className="mt-1 text-xs text-slate-300">
            Use the lag control to see whether spikes in fire hotspots appear to lead higher
            PM2.5 on subsequent days. This is exploratory, not a causal model.
          </p>
        </div>
        <CorrelationChart
          filters={{
            from: filters.from,
            to: filters.to,
            lagDays: filters.lagDays,
          }}
        />
      </section>

      {/* Section C: Compare locations */}
      <section className="glass-panel flex flex-col gap-3 p-5 text-xs text-slate-100">
        <div>
          <p className="section-title mb-1">Compare locations</p>
          <h2 className="text-sm font-semibold tracking-tight text-slate-50 md:text-base">
            Station-to-station differences across NCR
          </h2>
          <p className="mt-1 text-xs text-slate-300">
            This section will let you compare distributions and extremes across stations so
            you can see which neighbourhoods are consistently worse.
          </p>
        </div>
        <div className="mt-1 rounded-lg border border-dashed border-slate-700/80 bg-slate-900/60 px-4 py-3 text-xs text-slate-300">
          Coming soon: side‑by‑side station comparison and maps coloured by long‑term PM2.5
          exposure.
        </div>
      </section>
    </div>
  );
}



