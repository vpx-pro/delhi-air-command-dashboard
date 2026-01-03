## Delhi Pollution Crisis Dashboard

Next.js + Supabase dashboard focused on Delhi / NCR air quality, fire hotspots, and basic weather context.

### Main pages

- **Dashboard** (`/`) – current AQI summary, 7‑day AQI timeline, station map with AQI colours, toggle for fire hotspots, and general email signup.
- **Explore** (`/explore`) – filters (date range, pollutant placeholder, lag slider) and a correlation chart: daily fire counts vs daily PM2.5 with adjustable lag (0–5 days).
- **Data Sources** (`/data-sources`) – human-readable catalog of data sources and how they map onto Supabase tables.
- **Contribute** (`/contribute`) – good first issues and a contributor signup form (name, email, roles, message).

### Supabase schema

The full schema is in `supabase-schema.sql`. Key tables:

- `stations` – monitoring locations in/around Delhi.
- `aqi_readings` – AQI & pollutant snapshots per station and timestamp.
- `fire_hotspots` – satellite-detected fires.
- `weather_snapshots` – basic hourly weather.
- `signups` – general email signups from the dashboard.
- `contributor_signups` – contributor interest form submissions.
- `good_first_issues` – curated issues surfaced on the Contribute page.

### Environment variables

Create a `.env.local` file in the project root with:

- `NEXT_PUBLIC_SUPABASE_URL` – Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` – Supabase anon key (browser-safe, used in the app).
- `SUPABASE_SERVICE_ROLE_KEY` – **server-only** key used by ingestion scripts (do not expose to the browser or commit it).
- `FIRMS_API_KEY` – NASA FIRMS API key for VIIRS fire hotspots (used by `ingest-fires`).
- `FIRMS_DAYS` – optional, how many past days of VIIRS data to pull (default `3`).
 - `AQIIN_API_URL` – endpoint for your AQI provider (e.g. AQI.in) that returns station-level data for Delhi.
 - `AQIIN_API_KEY` – API key / bearer token for that AQI provider, if required.
- `NEXT_PUBLIC_MAP_DEFAULT_LAT` – optional, defaults to `28.6139` (Delhi).
- `NEXT_PUBLIC_MAP_DEFAULT_LNG` – optional, defaults to `77.2090`.

### Running locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a Supabase project and apply the schema:

   ```bash
   # In Supabase SQL editor
   -- paste the contents of supabase-schema.sql and run
   ```

3. Set environment variables in `.env.local` as above.

4. Start the dev server:

   ```bash
   npm run dev
   ```

5. Visit:

   - `http://localhost:3000/` – main dashboard.
   - `http://localhost:3000/explore` – fire vs PM2.5 correlation explorer.
   - `http://localhost:3000/data-sources` – data catalog.
   - `http://localhost:3000/contribute` – contribution guide and signups.

### Data ingestion

Manual ingestion scripts live under `scripts/`:

- `scripts/ingest-aqi.mjs` – pulls Delhi measurements from an OpenAQ-like API and populates `stations` + `aqi_readings`.
- `scripts/ingest-fires.mjs` – example parser for NASA FIRMS CSV → `fire_hotspots`.
- `scripts/ingest-weather.mjs` – fetches basic weather (Open-Meteo example) → `weather_snapshots`.

Run them with your Supabase URL + service role key:

```bash
NEXT_PUBLIC_SUPABASE_URL=... \
SUPABASE_SERVICE_ROLE_KEY=... \
npm run ingest:aqi
```

Similar commands exist for `ingest:fires` and `ingest:weather`.

You can later wire these scripts into cron, GitHub Actions, or Supabase Edge functions to keep the dashboard fresh.

### Contributing

See `CONTRIBUTING.md` for guidelines, and check the **Contribute** page in the app for good first issues. PRs that improve data quality, explainability, or accessibility are especially welcome.

