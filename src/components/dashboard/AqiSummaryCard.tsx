'use client';

import { useEffect, useState } from 'react';
import { getAqiBadgeClass, getAqiCategory } from './AqiUtils';

const REFRESH_MS = 60 * 60 * 1000; // 60 minutes

type AqiSummary = {
  aqi: number | null;
  pm25: number | null;
  observed_at: string | null;
  stationName: string | null;
};

function parseWaqiPayload(json: any): AqiSummary | null {
  const data = json?.data;
  if (!data) return null;

  const aqi =
    typeof data.aqi === 'number'
      ? data.aqi
      : typeof data.aqi === 'string'
        ? Number(data.aqi)
        : null;

  const pm25 =
    data.iaqi?.pm25?.v ??
    data.iaqi?.['pm2.5']?.v ??
    data.pm25 ??
    data.pm_25 ??
    null;

  const observed =
    data.time?.iso ??
    data.time?.s ??
    data.updatedAt ??
    data.updated_at ??
    null;

  return {
    aqi: Number.isFinite(aqi as number) ? (aqi as number) : null,
    pm25: pm25 != null ? Number(pm25) : null,
    observed_at: observed,
    stationName: data.city?.name ?? null,
  };
}

export function AqiSummaryCard({
  selectedStationId,
  selectedStationName,
  onLatestObservedAt,
}: {
  selectedStationId: string | null;
  selectedStationName: string | null;
  onLatestObservedAt?: (ts: string | null) => void;
}) {
  const [summary, setSummary] = useState<AqiSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchLatest = async () => {
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
        const parsed = parseWaqiPayload(json);
        if (!parsed) {
          throw new Error('Unexpected AQI payload shape');
        }

        if (!isMounted) return;

        const nextSummary: AqiSummary = {
          ...parsed,
          stationName: selectedStationName ?? parsed.stationName,
        };

        setSummary(nextSummary);
        onLatestObservedAt?.(nextSummary.observed_at);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Unknown error';
        setError(msg);
      }
      setLoading(false);
    };

    fetchLatest();
    const id = window.setInterval(fetchLatest, REFRESH_MS);

    return () => {
      isMounted = false;
      window.clearInterval(id);
    };
  }, [selectedStationId, selectedStationName, onLatestObservedAt]);

  const aqi = summary?.aqi ?? null;
  const category = getAqiCategory(aqi);
  const badgeClass = getAqiBadgeClass(aqi);

  return (
    <section className="glass-panel flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="section-title mb-1">Current snapshot</p>
          <h1 className="text-xl font-semibold tracking-tight text-slate-50 md:text-2xl">
            Delhi AQI overview
          </h1>
          <p className="mt-1 text-xs text-slate-300">
            Live reading fetched directly from the configured AQI API (e.g. WAQI / AQI.in).
          </p>
        </div>
        <div className="text-right">
          <span className={`inline-flex items-baseline gap-1 ${badgeClass}`}>
            <span className="text-[10px] uppercase tracking-wide text-slate-900">
              AQI
            </span>
            <span className="text-lg font-semibold text-slate-900">
              {loading ? '—' : aqi ?? '—'}
            </span>
          </span>
          <p className="mt-1 text-[11px] text-slate-300">{category}</p>
        </div>
      </div>
      {error && (
        <p className="text-xs text-rose-300">
          Failed to load latest AQI from Supabase: {error}
        </p>
      )}
      <div className="mt-1 grid grid-cols-3 gap-3 text-xs text-slate-300 md:max-w-md">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-slate-400">
            PM2.5 (µg/m³)
          </p>
          <p className="mt-0.5 text-sm font-medium text-slate-50">
            {summary?.pm25 != null ? summary.pm25.toFixed(1) : '—'}
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-slate-400">
            Last sample
          </p>
          <p className="mt-0.5 text-xs">
            {summary?.observed_at
              ? new Date(summary.observed_at).toLocaleString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Waiting for first ingestion run…'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-wide text-slate-400">
            Station
          </p>
          <p className="mt-0.5 text-xs">
            {summary?.stationName ?? 'Configured AQI feed'}
          </p>
        </div>
      </div>
    </section>
  );
}


