#!/usr/bin/env node

/**
 * Ingest fire hotspot data (e.g., NASA FIRMS) into Supabase.
 *
 * This script is intentionally minimal and fetches a bounding box over
 * Delhi / NCR. Adjust the URL and parameters to match the product you use.
 *
 * Configure:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 * - FIRMS_API_KEY (NASA FIRMS VIIRS key)
 * - FIRMS_DAYS (optional, number of past days, default: 3)
 *
 * Example:
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/ingest-fires.mjs
 */

import { createClient } from '@supabase/supabase-js';
import {
  SUPABASE_URL,
  SERVICE_ROLE_KEY,
  FIRMS_API_KEY,
  FIRMS_DAYS,
  assertScriptEnv,
} from './config.mjs';

assertScriptEnv();

if (!FIRMS_API_KEY) {
  // eslint-disable-next-line no-console
  console.error('Missing FIRMS_API_KEY env var for fire ingestion.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

async function fetchFirmsCsv() {
  // VIIRS 375 m NRT product (VNP14IMGTDL_NRT), country=IND, last N days.
  // Docs: see NASA FIRMS API for `country/csv` endpoints.
  const url = `https://firms.modaps.eosdis.nasa.gov/api/country/csv/${FIRMS_API_KEY}/VNP14IMGTDL_NRT/IND/${FIRMS_DAYS}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch FIRMS data: ${res.status} ${res.statusText}`);
  }
  const text = await res.text();
  return text;
}

function parseCsv(text) {
  const lines = text.split('\n').filter((l) => l.trim().length > 0);
  const [headerLine, ...rows] = lines;
  const headers = headerLine.split(',').map((h) => h.trim());

  return rows.map((line) => {
    const cols = line.split(',');
    const record = {};
    headers.forEach((h, i) => {
      record[h] = cols[i];
    });
    return record;
  });
}

async function main() {
  try {
    // eslint-disable-next-line no-console
    console.log('Fetching FIRMS CSV…');
    const csv = await fetchFirmsCsv();
    const records = parseCsv(csv);
    // eslint-disable-next-line no-console
    console.log(`Parsed ${records.length} fire detections.`);

    const rows = records
      .map((r) => {
        const lat = Number(r.latitude ?? r.lat);
        const lon = Number(r.longitude ?? r.lon);
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

        const date = r.acq_date;
        const time = r.acq_time;
        const detectedAt = date && time ? `${date}T${time.padStart(4, '0')}Z` : null;

        return {
          source_id: r.bright_ti4 ? `firms:${r.bright_ti4}:${r.latitude}:${r.longitude}` : null,
          latitude: lat,
          longitude: lon,
          detected_at: detectedAt ?? new Date().toISOString(),
          confidence: r.confidence ?? null,
          frp: r.frp ? Number(r.frp) : null,
        };
      })
      .filter(Boolean);

    if (!rows.length) {
      // eslint-disable-next-line no-console
      console.log('No valid fire rows to insert.');
      return;
    }

    const { error } = await supabase.from('fire_hotspots').insert(rows);
    if (error) throw error;

    // eslint-disable-next-line no-console
    console.log('Inserted fire hotspots into Supabase.');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Fire ingestion failed:', err);
    process.exit(1);
  }
}

main();


