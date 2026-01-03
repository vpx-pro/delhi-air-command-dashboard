import { NextResponse } from 'next/server';

const DEFAULT_AQI_URL = process.env.AQIIN_API_URL;
const AQI_TOKEN = process.env.AQIIN_API_KEY;
const WAQI_TOKEN = process.env.WAQI_TOKEN;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get('uid');

  let targetUrl = DEFAULT_AQI_URL;

  if (uid && (WAQI_TOKEN || DEFAULT_AQI_URL)) {
    const token =
      WAQI_TOKEN ||
      (DEFAULT_AQI_URL ? new URL(DEFAULT_AQI_URL).searchParams.get('token') : null);
    if (!token) {
      return NextResponse.json(
        { error: 'WAQI token not configured for station-specific requests.' },
        { status: 500 },
      );
    }
    targetUrl = `https://api.waqi.info/feed/@${uid}/?token=${token}`;
  }

  if (!targetUrl) {
    return NextResponse.json(
      { error: 'AQIIN_API_URL is not configured' },
      { status: 500 },
    );
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (AQI_TOKEN && !uid) {
    headers.Authorization = `Bearer ${AQI_TOKEN}`;
  }

  const res = await fetch(targetUrl, { headers, cache: 'no-store' });
  if (!res.ok) {
    return NextResponse.json(
      { error: `Upstream AQI API error: ${res.status} ${res.statusText}` },
      { status: 502 },
    );
  }

  const json = await res.json();
  return NextResponse.json(json);
}

