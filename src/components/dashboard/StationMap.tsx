'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { supabaseBrowserClient } from '@/lib/supabaseClient';
import { ENV } from '@/config/env';

const MapContainer = dynamic(
  async () => (await import('react-leaflet')).MapContainer,
  { ssr: false },
) as any;
const TileLayer = dynamic(
  async () => (await import('react-leaflet')).TileLayer,
  { ssr: false },
) as any;
const CircleMarker = dynamic(
  async () => (await import('react-leaflet')).CircleMarker,
  { ssr: false },
) as any;
const Tooltip = dynamic(
  async () => (await import('react-leaflet')).Tooltip,
  { ssr: false },
) as any;

type Station = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  region: string | null;
};

type StationReading = {
  station_id: string;
  aqi: number | null;
};

type FireHotspot = {
  id: string;
  latitude: number;
  longitude: number;
  detected_at: string;
  confidence: string | null;
};

const REFRESH_MS = 60 * 60 * 1000; // 60 minutes

const DEMO_STATIONS: Station[] = [
  {
    id: 'demo-1',
    name: 'Anand Vihar (Demo)',
    latitude: 28.646,
    longitude: 77.315,
    region: 'East Delhi',
  },
  {
    id: 'demo-2',
    name: 'RK Puram (Demo)',
    latitude: 28.566,
    longitude: 77.183,
    region: 'South Delhi',
  },
  {
    id: 'demo-3',
    name: 'Gurugram Sector 51 (Demo)',
    latitude: 28.432,
    longitude: 77.063,
    region: 'Gurugram',
  },
];

const DEMO_FIRES: FireHotspot[] = [
  {
    id: 'demo-fire-1',
    latitude: 28.9,
    longitude: 76.9,
    detected_at: new Date().toISOString(),
    confidence: 'demo',
  },
  {
    id: 'demo-fire-2',
    latitude: 29.1,
    longitude: 77.2,
    detected_at: new Date().toISOString(),
    confidence: 'demo',
  },
  {
    id: 'demo-fire-3',
    latitude: 28.7,
    longitude: 77.5,
    detected_at: new Date().toISOString(),
    confidence: 'demo',
  },
];

function colorForAqi(aqi: number | null | undefined): string {
  // NAQI-aligned colour scale (approximate) for map markers.
  if (aqi == null) return '#64748b'; // unknown
  if (aqi <= 50) return '#16a34a'; // Good
  if (aqi <= 100) return '#65a30d'; // Satisfactory
  if (aqi <= 200) return '#eab308'; // Moderate
  if (aqi <= 300) return '#f97316'; // Poor
  if (aqi <= 400) return '#ef4444'; // Very Poor
  return '#a855f7'; // Severe
}

const defaultCenter: [number, number] = [ENV.mapDefaultLat, ENV.mapDefaultLng];

export function StationMap({
  selectedStationId,
  onSelectStation,
}: {
  selectedStationId: string | null;
  onSelectStation?: (s: { id: string; name: string }) => void;
}) {
  const [stations, setStations] = useState<Station[]>([]);
  const [readings, setReadings] = useState<Record<string, StationReading>>({});
  const [fires, setFires] = useState<FireHotspot[]>([]);
  const [showFires, setShowFires] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingDemoData, setUsingDemoData] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (!isMounted) return;
      setLoading(true);
      setError(null);

      const [fireRes, stationsApiRes] = await Promise.all([
        supabaseBrowserClient
          .from('fire_hotspots')
          .select('id, latitude, longitude, detected_at, confidence')
          .order('detected_at', { ascending: false })
          .limit(500),
        fetch('/api/aqi/stations', { cache: 'no-store' }),
      ]);

      if (!isMounted) return;

      let stationsData: Station[] = [];
      const latestByStation: Record<string, StationReading> = {};

      if (!stationsApiRes.ok) {
        const body = await stationsApiRes.json().catch(() => ({}));
        throw new Error(body.error ?? `Stations API HTTP ${stationsApiRes.status}`);
      }

      const stationsJson = await stationsApiRes.json();
      const apiStations = stationsJson?.stations ?? [];
      if (Array.isArray(apiStations) && apiStations.length) {
        stationsData = apiStations.map((s: any) => {
          const id = String(s.id);
          const aqi =
            typeof s.aqi === 'number'
              ? s.aqi
              : typeof s.aqi === 'string'
                ? Number(s.aqi)
                : null;
          latestByStation[id] = { station_id: id, aqi };
          return {
            id,
            name: String(s.name ?? `Station ${id}`),
            latitude: Number(s.lat),
            longitude: Number(s.lon),
            region: s.region ?? 'Delhi',
          } as Station;
        });
        setReadings(latestByStation);
      }

      if (fireRes.error) {
        setError(fireRes.error.message ?? 'Failed to load fire hotspots');
        setLoading(false);
        return;
      }

      let firesData: FireHotspot[] = fireRes.data ?? [];

      // If no real data yet, fall back to demo locations so the map is not empty.
      if (!stationsData.length && !firesData.length) {
        stationsData = DEMO_STATIONS;
        firesData = DEMO_FIRES;
        setUsingDemoData(true);
      }

      setStations(stationsData);
      setFires(firesData);
      setLoading(false);
    };

    load();
    const id = window.setInterval(load, REFRESH_MS);

    return () => {
      isMounted = false;
      window.clearInterval(id);
    };
  }, [onSelectStation, selectedStationId]);

  return (
    <section className="glass-panel flex h-[520px] flex-col overflow-hidden p-0 md:h-[560px]">
      <div className="flex items-center justify-between gap-3 px-4 pb-3 pt-4">
        <div>
          <p className="section-title mb-1">Spatial view</p>
          <h2 className="text-sm font-semibold tracking-tight text-slate-50 md:text-base">
            Stations & fire hotspots
          </h2>
          {usingDemoData && !error && (
            <p className="mt-1 text-[11px] text-slate-300">
              Showing demo markers until Supabase has real station and fire data
              (run the ingestion scripts to replace this).
            </p>
          )}
        </div>
        <label className="flex items-center gap-2 text-[11px] text-slate-200">
          <input
            type="checkbox"
            className="h-3.5 w-3.5 rounded border-slate-500 bg-slate-900 text-sky-400 focus:ring-sky-500"
            checked={showFires}
            onChange={(e) => setShowFires(e.target.checked)}
          />
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-orange-400" />
            <span>Show fire hotspots</span>
          </span>
        </label>
      </div>
      {error && (
        <p className="px-4 pb-3 text-[11px] text-rose-300">
          Failed to load map data: {error}
        </p>
      )}
      {loading && !stations.length ? (
        <p className="px-4 pb-4 text-xs text-slate-300">
          Loading station locations from Supabase…
        </p>
      ) : null}
      <div className="flex flex-1">
        <MapContainer
          center={defaultCenter}
          zoom={9}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            {...({
              attribution:
                '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
              url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            } as any)}
          />
          {stations.map((s) => {
            const reading = readings[s.id];
            const color = colorForAqi(reading?.aqi);
            const isSelected = selectedStationId === s.id;
            return (
              <CircleMarker
                key={s.id}
                center={[s.latitude, s.longitude]}
                radius={isSelected ? 13 : 9}
                pathOptions={{
                  color: isSelected ? '#e5e7eb' : color,
                  fillColor: color,
                  fillOpacity: isSelected ? 0.95 : 0.8,
                  weight: isSelected ? 2 : 1,
                }}
                eventHandlers={{
                  click: () => onSelectStation?.({ id: s.id, name: s.name }),
                }}
              >
                <Tooltip direction="top" offset={[0, -6]} opacity={0.9}>
                  <div className="text-xs">
                    <div className="font-semibold">{s.name}</div>
                    <div className="text-[11px] text-slate-200">
                      Region: {s.region ?? '—'}
                    </div>
                    <div className="mt-1 text-[11px]">
                      AQI:{' '}
                      <span className="font-semibold">
                        {reading?.aqi ?? 'No recent reading'}
                      </span>
                    </div>
                  </div>
                </Tooltip>
              </CircleMarker>
            );
          })}
          {showFires &&
            fires.map((f) => (
              <CircleMarker
                key={f.id}
                center={[f.latitude, f.longitude]}
                radius={3.5}
                pathOptions={{
                  color: '#fb923c',
                  fillColor: '#fb923c',
                  fillOpacity: 0.85,
                  weight: 0,
                }}
              >
                <Tooltip direction="top" offset={[0, -4]} opacity={0.9}>
                  <div className="text-[11px]">
                    <div className="font-semibold text-orange-200">
                      Fire hotspot
                    </div>
                    <div className="mt-0.5">
                      Detected:{' '}
                      {new Date(f.detected_at).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                    {f.confidence && <div>Confidence: {f.confidence}</div>}
                  </div>
                </Tooltip>
              </CircleMarker>
            ))}
        </MapContainer>
      </div>
    </section>
  );
}


