#!/usr/bin/env node

/**
 * Ingest basic weather snapshots for the Delhi region into Supabase.
 *
 * Suggested external API: Open-Meteo or similar free weather APIs.
 * This script uses Open-Meteo as an example but you can swap in IMD or other sources.
 *
 * Configure:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 *
 * Example:
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/ingest-weather.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SERVICE_ROLE_KEY, assertScriptEnv } from './config.mjs';

assertScriptEnv();

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const DELHI_LAT = 28.6139;
const DELHI_LON = 77.209;

async function fetchWeather() {
  const params = new URLSearchParams({
    latitude: String(DELHI_LAT),
    longitude: String(DELHI_LON),
    hourly: [
      'temperature_2m',
      'relative_humidity_2m',
      'surface_pressure',
      'wind_speed_10m',
      'wind_direction_10m',
    ].join(','),
    past_days: '1',
    forecast_days: '1',
    timezone: 'auto',
  });

  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch Open-Meteo weather: ${res.status} ${res.statusText}`);
  }
  const json = await res.json();
  return json;
}

async function main() {
  try {
    // eslint-disable-next-line no-console
    console.log('Fetching Open-Meteo weather for Delhi…');
    const data = await fetchWeather();
    const hourly = data.hourly ?? {};

    const times = hourly.time ?? [];
    const temps = hourly.temperature_2m ?? [];
    const rh = hourly.relative_humidity_2m ?? [];
    const pressure = hourly.surface_pressure ?? [];
    const windSpeed = hourly.wind_speed_10m ?? [];
    const windDir = hourly.wind_direction_10m ?? [];

    const rows = [];
    for (let i = 0; i < times.length; i += 1) {
      rows.push({
        observed_at: new Date(times[i]).toISOString(),
        latitude: DELHI_LAT,
        longitude: DELHI_LON,
        temperature_c: temps[i] ?? null,
        humidity_pct: rh[i] ?? null,
        pressure_hpa: pressure[i] ?? null,
        wind_speed_ms: windSpeed[i] != null ? windSpeed[i] / 3.6 : null, // km/h → m/s
        wind_dir_deg: windDir[i] ?? null,
        source: 'Open-Meteo',
      });
    }

    if (!rows.length) {
      // eslint-disable-next-line no-console
      console.log('No weather rows to insert.');
      return;
    }

    const { error } = await supabase.from('weather_snapshots').insert(rows);
    if (error) throw error;

    // eslint-disable-next-line no-console
    console.log('Inserted weather snapshots into Supabase.');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Weather ingestion failed:', err);
    process.exit(1);
  }
}

main();


