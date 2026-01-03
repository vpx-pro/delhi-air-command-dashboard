import { NextResponse } from 'next/server';

const STATIONS_URL =
  process.env.AQIIN_STATIONS_URL || process.env.AQIIN_API_URL;
const AQI_TOKEN = process.env.AQIIN_API_KEY;

type NormalisedStation = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  aqi: number | null;
  updatedAt: string | null;
  region: string | null;
};

function normaliseStations(json: any): NormalisedStation[] {
  const raw = Array.isArray(json)
    ? json
    : Array.isArray(json?.data)
      ? json.data
      : json?.data
        ? [json.data]
        : [];

  return raw
    .map((item: any) => {
      // WAQI map/bounds style
      const uid = item.uid ?? item.idx ?? item.id ?? item.station_id ?? item.code;
      const stationName =
        item.station?.name ??
        item.city?.name ??
        item.name ??
        (uid != null ? `Station ${uid}` : 'Unnamed station');

      const lat =
        item.lat ??
        item.latitude ??
        (Array.isArray(item.geo) ? item.geo[0] : undefined);
      const lon =
        item.lon ??
        item.longitude ??
        (Array.isArray(item.geo) ? item.geo[1] : undefined);

      const aqiRaw = item.aqi ?? item.AQI;
      const aqi =
        typeof aqiRaw === 'number'
          ? aqiRaw
          : typeof aqiRaw === 'string'
            ? Number(aqiRaw)
            : null;

      const updatedAt =
        item.time?.iso ??
        item.time?.s ??
        item.updatedAt ??
        item.updated_at ??
        null;

      const region =
        item.area ??
        (typeof stationName === 'string' && stationName.includes('Delhi')
          ? 'Delhi'
          : item.city ?? null);

      if (lat == null || lon == null || uid == null) return null;

      return {
        id: String(uid),
        name: String(stationName),
        lat: Number(lat),
        lon: Number(lon),
        aqi: Number.isFinite(aqi as number) ? (aqi as number) : null,
        updatedAt,
        region,
      } as NormalisedStation;
    })
    .filter(Boolean) as NormalisedStation[];
}

export async function GET() {
  if (!STATIONS_URL) {
    return NextResponse.json(
      { error: 'AQIIN_STATIONS_URL or AQIIN_API_URL is not configured' },
      { status: 500 },
    );
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (AQI_TOKEN) {
    headers.Authorization = `Bearer ${AQI_TOKEN}`;
  }

  const res = await fetch(STATIONS_URL, { headers, cache: 'no-store' });
  if (!res.ok) {
    return NextResponse.json(
      { error: `Upstream stations API error: ${res.status} ${res.statusText}` },
      { status: 502 },
    );
  }

  const json = await res.json();
  const stations = normaliseStations(json);
  return NextResponse.json({ stations });
}


