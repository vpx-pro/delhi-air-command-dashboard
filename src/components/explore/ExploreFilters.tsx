'use client';

import { useState } from 'react';

export type ExploreFilterState = {
  from: string;
  to: string;
  pollutant: 'pm25' | 'pm10';
  lagDays: number;
};

export function getInitialExploreFilters(): ExploreFilterState {
  const today = new Date();
  const to = today.toISOString().slice(0, 10);
  const fromDate = new Date(today);
  fromDate.setDate(fromDate.getDate() - 14);
  const from = fromDate.toISOString().slice(0, 10);
  return {
    from,
    to,
    pollutant: 'pm25',
    lagDays: 2,
  };
}

export function ExploreFilters({
  value,
  onChange,
}: {
  value: ExploreFilterState;
  onChange: (value: ExploreFilterState) => void;
}) {
  const [local, setLocal] = useState<ExploreFilterState>(value);

  const apply = () => {
    onChange(local);
  };

  return (
    <section className="glass-panel flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="section-title mb-1">Filters</p>
          <h2 className="text-sm font-semibold tracking-tight text-slate-50 md:text-base">
            Time window, pollutant & lag
          </h2>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 text-xs text-slate-100 md:grid-cols-4">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] uppercase tracking-wide text-slate-400">
            From
          </label>
          <input
            type="date"
            value={local.from}
            onChange={(e) => setLocal((v) => ({ ...v, from: e.target.value }))}
            className="rounded-lg border border-slate-600/70 bg-slate-900/70 px-2 py-1.5 text-xs outline-none ring-1 ring-transparent focus:border-sky-400/70 focus:ring-sky-500/40"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] uppercase tracking-wide text-slate-400">
            To
          </label>
          <input
            type="date"
            value={local.to}
            onChange={(e) => setLocal((v) => ({ ...v, to: e.target.value }))}
            className="rounded-lg border border-slate-600/70 bg-slate-900/70 px-2 py-1.5 text-xs outline-none ring-1 ring-transparent focus:border-sky-500/40 focus:border-sky-400/70"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] uppercase tracking-wide text-slate-400">
            Pollutant
          </label>
          <select
            value={local.pollutant}
            onChange={(e) =>
              setLocal((v) => ({
                ...v,
                pollutant: e.target.value as ExploreFilterState['pollutant'],
              }))
            }
            className="rounded-lg border border-slate-600/70 bg-slate-900/70 px-2 py-1.5 text-xs outline-none ring-1 ring-transparent focus:border-sky-400/70 focus:ring-sky-500/40"
          >
            <option value="pm25">PM2.5</option>
            <option value="pm10">PM10 (planned)</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] uppercase tracking-wide text-slate-400">
            Fire lag (days)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={0}
              max={5}
              step={1}
              value={local.lagDays}
              onChange={(e) =>
                setLocal((v) => ({ ...v, lagDays: Number(e.target.value) }))
              }
              className="flex-1 accent-orange-400"
            />
            <span className="w-8 text-right text-xs text-slate-200">
              {local.lagDays}d
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 text-[11px] text-slate-300">
        <p>
          Lag shifts fire counts backwards in time. A 2-day lag compares pollution on a
          given day to fires detected 2 days earlier.
        </p>
        <button
          type="button"
          onClick={apply}
          className="inline-flex items-center justify-center rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-md shadow-sky-900/70 transition hover:bg-sky-400"
        >
          Apply
        </button>
      </div>
    </section>
  );
}


