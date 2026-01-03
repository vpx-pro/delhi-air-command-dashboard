#!/usr/bin/env node

/**
 * Ingest AQI & pollutant data for Delhi into Supabase.
 *
 * This script is deliberately simple and meant as a starting point. It:
 * - fetches recent measurements from an external AQI provider (e.g. AQI.in)
 * - upserts stations into `stations`
 * - inserts snapshots into `aqi_readings`
 *
 * Configure:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 *
 * Example:
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/ingest-aqi.mjs
 */

import { createClient } from '@supabase/supabase-js';
import {
  SUPABASE_URL,
  SERVICE_ROLE_KEY,
  AQIIN_API_URL,
  AQIIN_API_KEY,
  assertScriptEnv,
} from './config.mjs';

assertScriptEnv();

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

/**
 * Fetch AQI data for all Delhi stations from an external provider.
 *
 * This is intentionally generic: you configure `AQIIN_API_URL` and `AQIIN_API_KEY`
 * (or equivalent) in `.env.local`. For example, if your provider exposes:
 *
 *   GET https://api.your-provider.com/v1/city/delhi/stations
 *   Headers: Authorization: Bearer <AQIIN_API_KEY>
 *
 * and returns JSON like:
 *
 *   {
 *     "data": [
 *       {
 *         "id": "delhi-anand-vihar",
 *         "name": "Anand Vihar, Delhi",
 *         "lat": 28.646,
 *         "lon": 77.315,
 *         "area": "East Delhi",
 *         "aqi": 275,
 *         "pm25": 180,
 *         "pm10": 260,
 *         "no2": 40,
 *         "so2": 8,
 *         "o3": 12,
 *         "co": 0.7,
 *         "updatedAt": "2026-01-03T08:15:00Z"
 *       },
 *       ...
 *     ]
 *   }
 *
 * then you only need to adapt the field names in the mapping below.
 */
async function fetchDelhiStationsFromProvider() {
  if (!AQIIN_API_URL) {
    throw new Error(
      'AQIIN_API_URL is not set. Configure your AQI provider endpoint in .env.local.',
    );
  }

  const headers = {
    Accept: 'application/json',
  };
  if (AQIIN_API_KEY) {
    // Adjust the header name/value to match your provider (Bearer, X-API-Key, etc.)
    headers.Authorization = `Bearer ${AQIIN_API_KEY}`;
  }

  const res = await fetch(AQIIN_API_URL, { headers });
  if (!res.ok) {
    throw new Error(
      `Failed to fetch AQI provider data: ${res.status} ${res.statusText}`,
    );
  }

  const json = await res.json();

  // Normalise into an array of station records.
  // Supports:
  // - AQI.in-style `{ data: [...] }`
  // - WAQI feed-style `{ status: 'ok', data: { ...single station... } }`
  if (Array.isArray(json)) {
    return json;
  }
  if (Array.isArray(json.data)) {
    return json.data;
  }
  if (json.data && typeof json.data === 'object') {
    return [json.data];
  }
  return [];
}

async function upsertStationsFromMeasurements(stationsFromApi) {
  // Map provider fields into our `stations` schema.
  const stations = stationsFromApi.map((item) => {
    // WAQI-style
    const waqiIdx = item.idx;
    const waqiCity = item.city;
    const waqiGeo = waqiCity?.geo;

    const externalId = waqiIdx != null
      ? `waqi:${waqiIdx}`
      : String(item.id ?? item.station_id ?? item.code);

    const name =
      waqiCity?.name ??
      item.name ??
      item.station_name ??
      (waqiIdx != null ? `Station ${waqiIdx}` : 'Unnamed station');

    const latitude =
      (Array.isArray(waqiGeo) ? waqiGeo[0] : undefined) ??
      item.lat ??
      item.latitude;
    const longitude =
      (Array.isArray(waqiGeo) ? waqiGeo[1] : undefined) ??
      item.lon ??
      item.longitude;

    const region =
      item.area ??
      (typeof waqiCity?.name === 'string' && waqiCity.name.includes('Delhi')
        ? 'Delhi'
        : item.city ?? 'Delhi');

    return {
      external_id: String(externalId),
      name: String(name),
      latitude: Number(latitude),
      longitude: Number(longitude),
      region,
    };
  });

  const uniqueStations = Array.from(
    new Map(stations.map((s) => [s.external_id, s])).values(),
  ).filter((s) => s.latitude != null && s.longitude != null);

  if (!uniqueStations.length) return {};

  const { data, error } = await supabase
    .from('stations')
    .upsert(uniqueStations, {
      onConflict: 'external_id',
    })
    .select('id, external_id');

  if (error) throw error;

  const idByExternal = {};
  for (const row of data ?? []) {
    idByExternal[row.external_id] = row.id;
  }
  return idByExternal;
}

async function insertAqiReadings(stationsFromApi, stationIds) {
  const rows = [];

  for (const item of stationsFromApi) {
    const externalId = String(
      item.idx != null
        ? `waqi:${item.idx}`
        : item.id ?? item.station_id ?? item.code,
    );
    const stationId = stationIds[externalId];
    if (!stationId) continue;

    const observedAt =
      item.updatedAt ??
      item.updated_at ??
      item.last_updated ??
      item.time?.iso ??
      item.time?.s ??
      new Date().toISOString();
    if (!observedAt) continue;

    // Map pollutant fields – supports both generic and WAQI `iaqi` structure.
    const iaqi = item.iaqi ?? {};
    const pm25 =
      iaqi.pm25?.v ??
      iaqi['pm2.5']?.v ??
      item.pm25 ??
      item.pm_25 ??
      null;
    const pm10 = iaqi.pm10?.v ?? item.pm10 ?? item.pm_10 ?? null;
    const no2 = iaqi.no2?.v ?? item.no2 ?? null;
    const so2 = iaqi.so2?.v ?? item.so2 ?? null;
    const o3 = iaqi.o3?.v ?? item.o3 ?? null;
    const co = iaqi.co?.v ?? item.co ?? null;

    // Prefer provider AQI if present (e.g. WAQI's `data.aqi`), fall back to a simple PM2.5 proxy.
    const aqiValue =
      typeof item.aqi === 'number'
        ? item.aqi
        : pm25 != null
          ? Math.round(pm25)
          : null;

    rows.push({
      station_id: stationId,
      observed_at: observedAt,
      aqi: aqiValue,
      pm25,
      pm10,
      no2,
      so2,
      o3,
      co,
      source: item.idx != null ? 'WAQI' : 'AQI.in',
    });
  }

  if (!rows.length) return;

  const { error } = await supabase.from('aqi_readings').insert(rows);
  if (error) throw error;
}

async function main() {
  try {
    // eslint-disable-next-line no-console
    console.log('Fetching Delhi AQI measurements from external provider…');
    const results = await fetchDelhiStationsFromProvider();
    // eslint-disable-next-line no-console
    console.log(`Fetched ${results.length} station snapshots from provider.`);

    const stationIds = await upsertStationsFromMeasurements(results);
    // eslint-disable-next-line no-console
    console.log(`Upserted stations, got ${Object.keys(stationIds).length} IDs.`);

    await insertAqiReadings(results, stationIds);
    // eslint-disable-next-line no-console
    console.log('Inserted AQI/pollutant readings into Supabase.');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Ingestion failed:', err);
    process.exit(1);
  }
}

main();


