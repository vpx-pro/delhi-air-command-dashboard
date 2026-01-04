import { NextResponse } from 'next/server';
import { ENV } from '@/config/env';

type FirePoint = {
  latitude: number;
  longitude: number;
  detectedAt: string;
  confidence: string | null;
  frp: number | null;
};

function parseFirmsCsv(text: string): FirePoint[] {
  const lines = text.split('\n').filter((l) => l.trim().length > 0);
  if (!lines.length) return [];
  const [headerLine, ...rows] = lines;
  const headers = headerLine.split(',').map((h) => h.trim());

  const points: FirePoint[] = [];

  for (const line of rows) {
    const cols = line.split(',');
    const record: Record<string, string> = {};
    headers.forEach((h, i) => {
      record[h] = cols[i];
    });

    const lat = Number(record.latitude ?? record.lat);
    const lon = Number(record.longitude ?? record.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;

    const date = record.acq_date;
    const time = record.acq_time;
    const detectedAt =
      date && time ? `${date}T${time.padStart(4, '0')}Z` : new Date().toISOString();

    points.push({
      latitude: lat,
      longitude: lon,
      detectedAt,
      confidence: record.confidence ?? null,
      frp: record.frp ? Number(record.frp) : null,
    });
  }

  return points;
}

export async function GET() {
  const apiKey = ENV.firmsApiKey;
  const days = ENV.firmsDays || '3';

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          'FIRMS_API_KEY is not configured. Set it in your environment to enable live VIIRS data.',
      },
      { status: 500 },
    );
  }

  const url = `https://firms.modaps.eosdis.nasa.gov/api/country/csv/${apiKey}/VNP14IMGTDL_NRT/IND/${days}`;

  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return NextResponse.json(
        {
          error: `FIRMS API error: ${res.status} ${res.statusText}`,
          body: text.slice(0, 500),
        },
        { status: 502 },
      );
    }

    const csv = await res.text();
    const points = parseFirmsCsv(csv);

    return NextResponse.json({
      count: points.length,
      fires: points,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: `Failed to fetch FIRMS data: ${error?.message ?? String(error)}`,
      },
      { status: 500 },
    );
  }
}


