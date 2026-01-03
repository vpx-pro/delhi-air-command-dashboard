'use client';

import { useEffect, useState } from 'react';

const REFRESH_MS = 60 * 60 * 1000; // 60 minutes

type PollutantKey = 'pm25' | 'pm10' | 'no2' | 'so2' | 'co' | 'o3';

type PollutantValue = {
  key: PollutantKey;
  label: string;
  unit: string;
  value: number | null;
};

function parseFromLive(json: any): PollutantValue[] {
  const data = json?.data;
  const iaqi = data?.iaqi ?? {};

  const fromIaqi = (k: string) =>
    iaqi[k]?.v ?? iaqi[k.toUpperCase()]?.v ?? null;

  const vals: Record<PollutantKey, number | null> = {
    pm25:
      fromIaqi('pm25') ??
      fromIaqi('pm2.5') ??
      data?.pm25 ??
      data?.pm_25 ??
      null,
    pm10: fromIaqi('pm10') ?? data?.pm10 ?? data?.pm_10 ?? null,
    no2: fromIaqi('no2') ?? data?.no2 ?? null,
    so2: fromIaqi('so2') ?? data?.so2 ?? null,
    co: fromIaqi('co') ?? data?.co ?? null,
    o3: fromIaqi('o3') ?? data?.o3 ?? null,
  };

  const meta: Omit<PollutantValue, 'value'>[] = [
    { key: 'pm25', label: 'PM2.5', unit: 'µg/m³' },
    { key: 'pm10', label: 'PM10', unit: 'µg/m³' },
    { key: 'no2', label: 'NO₂', unit: 'ppb' },
    { key: 'so2', label: 'SO₂', unit: 'ppb' },
    { key: 'co', label: 'CO', unit: 'ppm' },
    { key: 'o3', label: 'O₃', unit: 'ppb' },
  ];

  return meta.map((m) => ({
    ...m,
    value: vals[m.key],
  }));
}

const accentClasses: Record<PollutantKey, string> = {
  pm25: 'from-rose-500/90 to-orange-400/80',
  pm10: 'from-amber-400/90 to-yellow-300/80',
  no2: 'from-sky-400/90 to-cyan-300/80',
  so2: 'from-violet-400/90 to-fuchsia-400/80',
  co: 'from-emerald-400/90 to-lime-300/80',
  o3: 'from-blue-400/90 to-indigo-400/80',
};

export function PollutantBreakdown({
  selectedStationId,
}: {
  selectedStationId: string | null;
}) {
  const [pollutants, setPollutants] = useState<PollutantValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (!isMounted) return;
      setLoading(true);
      setError(null);
      try {
        const url = selectedStationId
          ? `/api/aqi/live?uid=${encodeURIComponent(selectedStationId)}`
          : '/api/aqi/live';
        const res = await fetch(url, { cache: 'no-store' });
        if (!isMounted) return;
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? `HTTP ${res.status}`);
        }
        const json = await res.json();
        const vals = parseFromLive(json);
        setPollutants(vals);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Unknown error';
        setError(msg);
      }
      setLoading(false);
    };

    load();
    const id = window.setInterval(load, REFRESH_MS);

    return () => {
      isMounted = false;
      window.clearInterval(id);
    };
  }, [selectedStationId]);

  return (
    <section className="glass-panel flex flex-col gap-3 p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="section-title mb-0">Pollutant breakdown</p>
        <span className="text-[11px] text-slate-400">
          Live from the same station as the headline AQI.
        </span>
      </div>
      {error && (
        <p className="text-xs text-rose-300">
          Failed to load pollutant details: {error}
        </p>
      )}
      <div className="grid grid-cols-2 gap-3 text-xs text-slate-100 sm:grid-cols-3 xl:grid-cols-6">
        {(loading && !pollutants.length
          ? [
              'pm25',
              'pm10',
              'no2',
              'so2',
              'co',
              'o3',
            ].map((k) => ({
              key: k as PollutantKey,
              label: k.toUpperCase(),
              unit: '',
              value: null,
            }))
          : pollutants
        ).map((p) => (
          <div
            key={p.key}
            className="relative overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900/80 px-3 py-3 shadow-md shadow-slate-950/60"
          >
            <div
              className={`pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${accentClasses[p.key]}`}
            />
            <div className="mt-2 flex items-baseline justify-between gap-2">
              <div>
                <p className="text-[11px] font-semibold tracking-wide text-slate-300">
                  {p.label}
                </p>
                <p className="mt-1 text-[10px] text-slate-400">{p.unit}</p>
              </div>
              <p className="text-base font-semibold tracking-tight text-slate-50">
                {p.value != null && !Number.isNaN(p.value)
                  ? p.value.toFixed(1)
                  : '—'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}


