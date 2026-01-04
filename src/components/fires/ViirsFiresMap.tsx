'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
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

type FirePoint = {
  latitude: number;
  longitude: number;
  detectedAt: string;
  confidence: string | null;
  frp: number | null;
};

const REFRESH_MS = 60 * 60 * 1000; // 60 minutes

const defaultCenter: [number, number] = [ENV.mapDefaultLat, ENV.mapDefaultLng];

export function ViirsFiresMap() {
  const [fires, setFires] = useState<FirePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (!isMounted) return;
      setLoading(true);
      setError(null);

      try {
        const res = await fetch('/api/fires/live', { cache: 'no-store' });
        if (!isMounted) return;
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? `HTTP ${res.status}`);
        }
        const json = await res.json();
        setFires(Array.isArray(json.fires) ? json.fires : []);
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
  }, []);

  return (
    <section className="glass-panel flex h-[520px] flex-col overflow-hidden p-0 md:h-[560px]">
      <div className="flex items-center justify-between gap-3 px-4 pb-3 pt-4">
        <div>
          <p className="section-title mb-1">NASA VIIRS</p>
          <h2 className="text-sm font-semibold tracking-tight text-slate-50 md:text-base">
            Live fire hotspots – last {ENV.firmsDays || 'few'} days
          </h2>
          <p className="mt-1 text-[11px] text-slate-300">
            Points from the VIIRS 375m NRT product over India. Use this to see where open
            fires are currently being detected.
          </p>
        </div>
        <div className="text-right text-[11px] text-slate-300">
          <p>
            Total detections:{' '}
            <span className="font-semibold text-orange-200">
              {loading ? '—' : fires.length.toLocaleString('en-IN')}
            </span>
          </p>
          <p className="mt-0.5 text-[10px]">
            Data: NASA FIRMS VIIRS 375m (VNP14IMGTDL_NRT)
          </p>
        </div>
      </div>
      {error && (
        <p className="px-4 pb-2 text-[11px] text-rose-300">
          Failed to load live VIIRS data: {error}
        </p>
      )}
      {loading && (
        <p className="px-4 pb-3 text-[11px] text-slate-300">
          Loading recent VIIRS detections from NASA FIRMS…
        </p>
      )}
      <div className="flex flex-1">
        <MapContainer
          center={defaultCenter}
          zoom={6}
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
          {fires.map((f, idx) => (
            <CircleMarker
              key={`${f.latitude}-${f.longitude}-${idx}`}
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
                  <div className="font-semibold text-orange-200">Fire hotspot</div>
                  <div className="mt-0.5">
                    Detected:{' '}
                    {new Date(f.detectedAt).toLocaleString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                  {f.confidence && <div>Confidence: {f.confidence}</div>}
                  {typeof f.frp === 'number' && (
                    <div>FRP: {f.frp.toFixed(1)} MW</div>
                  )}
                </div>
              </Tooltip>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </section>
  );
}


