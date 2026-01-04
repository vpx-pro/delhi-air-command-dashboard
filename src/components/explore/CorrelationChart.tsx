'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { supabaseBrowserClient } from '@/lib/supabaseClient';

const REFRESH_MS = 60 * 60 * 1000; // 60 minutes

type CorrelationFilters = {
  from: string;
  to: string;
  lagDays: number;
};

type CorrelationPoint = {
  date: string;
  pm25: number;
  fireCount: number;
};

type AqiRow = {
  pm25: number | null;
  observed_at: string;
};

type FireRow = {
  detected_at: string;
};

function groupByDate<T extends { observed_at?: string; detected_at?: string }>(
  rows: T[],
  key: 'observed_at' | 'detected_at',
): Map<string, number> {
  const map = new Map<string, number>();
  for (const row of rows) {
    const raw = row[key];
    if (!raw) continue;
    const d = new Date(raw);
    const dateKey = d.toISOString().slice(0, 10);
    map.set(dateKey, (map.get(dateKey) ?? 0) + 1);
  }
  return map;
}

export function CorrelationChart({ filters }: { filters: CorrelationFilters }) {
  const [data, setData] = useState<CorrelationPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (!isMounted) return;
      setLoading(true);
      setError(null);

      const fromDate = new Date(filters.from);
      const toDate = new Date(filters.to);
      const lagMax = 5;
      const extendedFrom = new Date(fromDate);
      extendedFrom.setDate(extendedFrom.getDate() - lagMax);

      const [aqiRes, fireRes] = await Promise.all([
        supabaseBrowserClient
          .from('aqi_readings')
          .select('pm25, observed_at')
          .gte('observed_at', extendedFrom.toISOString())
          .lte('observed_at', toDate.toISOString())
          .limit(5000),
        supabaseBrowserClient
          .from('fire_hotspots')
          .select('detected_at')
          .gte('detected_at', extendedFrom.toISOString())
          .lte('detected_at', toDate.toISOString())
          .limit(5000),
      ]);

      if (!isMounted) return;

      if (aqiRes.error || fireRes.error) {
        setError(aqiRes.error?.message ?? fireRes.error?.message ?? 'Unknown error');
        setLoading(false);
        return;
      }

      const aqiRows = (aqiRes.data ?? []) as AqiRow[];
      const fireRows = (fireRes.data ?? []) as FireRow[];

      const pm25ByDay = new Map<string, { sum: number; count: number }>();
      for (const row of aqiRows) {
        if (row.pm25 == null) continue;
        const d = new Date(row.observed_at);
        const key = d.toISOString().slice(0, 10);
        const agg = pm25ByDay.get(key) ?? { sum: 0, count: 0 };
        agg.sum += row.pm25;
        agg.count += 1;
        pm25ByDay.set(key, agg);
      }

      const firesByDay = groupByDate(fireRows, 'detected_at');

      const lag = filters.lagDays;
      const result: CorrelationPoint[] = [];
      const dayMs = 24 * 60 * 60 * 1000;
      for (
        let t = fromDate.getTime();
        t <= toDate.getTime();
        t += dayMs
      ) {
        const date = new Date(t);
        const dateKey = date.toISOString().slice(0, 10);

        const pmAgg = pm25ByDay.get(dateKey);
        if (!pmAgg) continue;

        const shifted = new Date(t - lag * dayMs);
        const shiftedKey = shifted.toISOString().slice(0, 10);
        const fires = firesByDay.get(shiftedKey) ?? 0;

        result.push({
          date: dateKey,
          pm25: Number((pmAgg.sum / Math.max(1, pmAgg.count)).toFixed(1)),
          fireCount: fires,
        });
      }

      setData(result);
      setLoading(false);
    };

    if (filters.from && filters.to) {
      load();
      const id = window.setInterval(load, REFRESH_MS);
      return () => {
        isMounted = false;
        window.clearInterval(id);
      };
    }

    return () => {
      isMounted = false;
    };
  }, [filters.from, filters.to, filters.lagDays]);

  const chartContent = useMemo(() => {
    if (loading) return <p className="text-xs text-slate-300">Loading…</p>;
    if (error)
      return (
        <p className="text-xs text-rose-300">
          Error loading correlation data from Supabase: {error}
        </p>
      );
    if (!data.length)
      return (
        <p className="text-xs text-slate-300">
          No overlapping PM2.5 and fire hotspot data for this range yet. Try broadening
          the window once ingestion has run for a few days.
        </p>
      );

    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="pm25"
              name="PM2.5"
              unit=" µg/m³"
              tickLine={false}
              axisLine={false}
              tickMargin={6}
              tick={{ fontSize: 11, fill: '#9ca3af' }}
            />
            <YAxis
              type="number"
              dataKey="fireCount"
              name="Fire hotspots"
              tickLine={false}
              axisLine={false}
              tickMargin={6}
              tick={{ fontSize: 11, fill: '#9ca3af' }}
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3', stroke: '#64748b' }}
              contentStyle={{
                backgroundColor: '#020617',
                border: '1px solid rgba(148, 163, 184, 0.5)',
                borderRadius: 10,
                fontSize: 12,
                padding: '8px 10px',
              }}
              labelFormatter={(label, payload) => {
                const point = (payload?.[0]?.payload as CorrelationPoint | undefined)
                  ?.date;
                return point ? `Date: ${point}` : String(label);
              }}
              formatter={(value: number, name: string) => {
                if (name === 'pm25') return [`${value} µg/m³`, 'PM2.5'];
                if (name === 'fireCount') return [value, 'Fire hotspots'];
                return [value, name];
              }}
            />
            <Scatter data={data} fill="#f97316" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    );
  }, [data, loading, error]);

  return (
    <section className="glass-panel flex flex-col gap-3 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="section-title mb-1">Fire vs pollution</p>
          <h2 className="text-sm font-semibold tracking-tight text-slate-50 md:text-base">
            Daily PM2.5 vs fire hotspot counts
          </h2>
        </div>
        <span className="pill hidden md:inline-flex">
          <span className="h-2 w-2 rounded-full bg-orange-400" />
          <span>Each dot = one day in the selected window</span>
        </span>
      </div>
      <p className="text-xs text-slate-300">
        Adjust the lag to see whether open fires appear to precede higher PM2.5 in the
        following days. This is a simple exploratory view, not a causal model.
      </p>
      {chartContent}
    </section>
  );
}


