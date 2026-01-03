'use client';

import { useState } from 'react';
import {
  ExploreFilterState,
  ExploreFilters,
  getInitialExploreFilters,
} from './ExploreFilters';
import { CorrelationChart } from './CorrelationChart';

export default function ExplorePage() {
  const [filters, setFilters] = useState<ExploreFilterState>(
    getInitialExploreFilters(),
  );

  return (
    <div className="page-grid">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="section-title mb-1">Explore</p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-50 md:text-3xl">
            How do fires and PM2.5 move together?
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            Use filters to look at specific windows and experiment with lags between open
            fires and PM2.5 levels over Delhi. This view is intentionally simple and
            meant as a starting point for more rigorous analysis.
          </p>
        </div>
        <div className="pill">
          <span className="h-2 w-2 rounded-full bg-sky-400" />
          <span>Data is aggregated daily on the fly from Supabase</span>
        </div>
      </div>

      <ExploreFilters value={filters} onChange={setFilters} />
      <CorrelationChart
        filters={{
          from: filters.from,
          to: filters.to,
          lagDays: filters.lagDays,
        }}
      />
    </div>
  );
}


