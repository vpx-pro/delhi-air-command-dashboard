'use client';

import { useState } from 'react';
import { AqiSummaryCard } from './AqiSummaryCard';
import { AqiTimelineChart } from './AqiTimelineChart';
import { StationMap } from './StationMap';
import { SignupForm } from './SignupForm';
import { PollutantBreakdown } from './PollutantBreakdown';

type SourceKey = 'air' | 'fires';

const SOURCE_CONFIG: Record<
  SourceKey,
  { label: string; description: string }
> = {
  air: {
    label: 'Air quality',
    description: 'AQI, PM2.5 and station history',
  },
  fires: {
    label: 'Fire hotspots',
    description: 'VIIRS fire detections near Delhi',
  },
};

export default function DashboardPage() {
  const [enabledSources, setEnabledSources] = useState<Record<SourceKey, boolean>>({
    air: true,
    fires: true,
  });
  const [selectedStation, setSelectedStation] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const toggleSource = (key: SourceKey) => {
    setEnabledSources((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const showAir = enabledSources.air;
  const showFires = enabledSources.fires;

  return (
    <div className="page-grid">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="section-title mb-1">Delhi · NCR</p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-50 md:text-3xl">
            Delhi Pollution Crisis Dashboard
          </h1>
          <p className="mt-2 max-w-xl text-sm text-slate-300">
            A community-maintained view of Delhi&apos;s air quality and nearby open-fire
            hotspots, backed by Supabase so you can extend the data and analysis.
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 text-xs text-slate-300 md:items-end">
          <div className="pill">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>Open-source. No ads. No tracking.</span>
          </div>
          <p className="max-w-xs text-[11px]">
            Use the data source switches below to focus on just air quality, just fires,
            or both together.
          </p>
        </div>
      </div>

      <section className="glass-panel flex flex-wrap items-center justify-between gap-3 p-4 text-xs text-slate-100">
        <div className="flex items-center gap-2">
          <p className="section-title mb-0">Data sources</p>
          <p className="text-[11px] text-slate-300">
            Select which data feeds the dashboard tiles below.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(SOURCE_CONFIG) as SourceKey[]).map((key) => {
            const cfg = SOURCE_CONFIG[key];
            const active = enabledSources[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleSource(key)}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] transition ${
                  active
                    ? 'border-sky-400 bg-sky-500/20 text-sky-100 shadow-sm shadow-sky-900/70'
                    : 'border-slate-700 bg-slate-900/80 text-slate-300 hover:border-sky-500/70'
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    key === 'air' ? 'bg-emerald-400' : 'bg-orange-400'
                  }`}
                />
                <span className="font-semibold">{cfg.label}</span>
                <span className="hidden text-[10px] text-slate-300 md:inline">
                  {cfg.description}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Spatial view as the primary focus */}
      <div className="flex flex-col gap-6">
        <div>
          {(showAir || showFires) && (
            <StationMap
              selectedStationId={selectedStation?.id ?? null}
              onSelectStation={(s) => setSelectedStation(s)}
            />
          )}
          {!showAir && !showFires && (
            <div className="glass-panel flex h-[360px] items-center justify-center p-6 text-xs text-slate-300">
              Enable at least one data source above to see the spatial map.
            </div>
          )}
        </div>

        {/* Supporting metrics under the map */}
        <div className="grid gap-6 lg:grid-cols-[1.2fr,1.3fr]">
          <div>
            {showAir && (
              <div className="flex flex-col gap-4">
                <AqiSummaryCard
                  selectedStationId={selectedStation?.id ?? null}
                  selectedStationName={selectedStation?.name ?? null}
                />
                <PollutantBreakdown selectedStationId={selectedStation?.id ?? null} />
              </div>
            )}
            {!showAir && (
              <div className="glass-panel p-5 text-xs text-slate-300">
                Air quality tiles are hidden. Toggle{' '}
                <span className="font-semibold">Air quality</span> above to bring them
                back.
              </div>
            )}
          </div>
          <div className="flex flex-col gap-4">
            {showAir && (
              <div className="glass-panel h-full p-0">
                <AqiTimelineChart />
              </div>
            )}
            {!showAir && (
              <div className="glass-panel p-5 text-xs text-slate-300">
                The 7‑day AQI timeline appears here when the air quality source is
                enabled.
              </div>
            )}
          </div>
        </div>
      </div>

      <SignupForm />
    </div>
  );
}



