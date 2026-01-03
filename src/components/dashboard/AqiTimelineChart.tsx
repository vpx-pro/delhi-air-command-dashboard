'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const REFRESH_MS = 60 * 60 * 1000; // 60 minutes

type TimelinePoint = {
  date: string;
  aqi: number;
};

/**
 * For now, with a single live station feed, we show a very small timeline:
 * last few ISO timestamps grouped to dates. If you later ingest history into
 * Supabase, you can swap this back to the Supabase-backed version.
 */
function buildMiniTimelineFromLive(json: any): TimelinePoint[] {
  const data = json?.data;
  if (!data) return [];
  const aqi =
    typeof data.aqi === 'number'
      ? data.aqi
      : typeof data.aqi === 'string'
        ? Number(data.aqi)
        : null;
  const observed = data.time?.iso ?? data.time?.s ?? null;
  if (aqi == null || !observed) return [];
  const dateKey = new Date(observed).toISOString().slice(0, 10);
  return [{ date: dateKey, aqi: Math.round(aqi) }];
}

export function AqiTimelineChart() {
  const [data, setData] = useState<TimelinePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!isMounted) return;
      setLoading(true);
      setError(null);

      try {
        const res = await fetch('/api/aqi/live', { cache: 'no-store' });
        if (!isMounted) return;
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? `HTTP ${res.status}`);
        }
        const json = await res.json();
        const points = buildMiniTimelineFromLive(json);
        setData(points);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Unknown error';
        setError(msg);
      }
      setLoading(false);
    };

    fetchData();
    const id = window.setInterval(fetchData, REFRESH_MS);

    return () => {
      isMounted = false;
      window.clearInterval(id);
    };
  }, []);

  const content = useMemo(() => {
    if (loading) return <p className="text-xs text-slate-300">Loading timeline…</p>;
    if (error)
      return (
        <p className="text-xs text-rose-300">Failed to load AQI history: {error}</p>
      );
    if (!data.length)
      return (
        <p className="text-xs text-slate-300">
          No AQI data yet. Once the live API is reachable, a small recent trend will
          appear here.
        </p>
      );

    return (
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.9} />
                <stop offset="70%" stopColor="#38bdf8" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#0f172a" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1e293b"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 11, fill: '#9ca3af' }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={6}
              tick={{ fontSize: 11, fill: '#9ca3af' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#020617',
                border: '1px solid rgba(148, 163, 184, 0.5)',
                borderRadius: 10,
                fontSize: 12,
                padding: '8px 10px',
              }}
              labelStyle={{ color: '#e5e7eb', marginBottom: 4 }}
              formatter={(value) => [`AQI ${value}`, 'Daily mean']}
            />
            <Area
              type="monotone"
              dataKey="aqi"
              stroke="#38bdf8"
              strokeWidth={2}
              fill="url(#aqiGradient)"
              dot={{ r: 2, strokeWidth: 0 }}
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }, [data, loading, error]);

  return (
    <section className="glass-panel flex flex-col gap-3 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="section-title mb-1">Past 7 days</p>
          <h2 className="text-sm font-semibold tracking-tight text-slate-50 md:text-base">
            City-wide AQI trend
          </h2>
        </div>
        <span className="pill hidden md:inline-flex">
          <span className="h-2 w-2 rounded-full bg-sky-400" />
          <span>Mean across all stations (daily)</span>
        </span>
      </div>
      {content}
    </section>
  );
}


