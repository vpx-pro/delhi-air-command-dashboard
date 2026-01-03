## Contributing to the Delhi Pollution Crisis Dashboard

Thank you for considering a contribution — this project is intentionally lightweight so new contributors can add value quickly.

### Project goals

- **Make Delhi's air crisis legible** for residents, journalists, and policy folks.
- **Stay reproducible and inspectable**: all data lands in Supabase tables with an explicit schema.
- **Be a good starter project** for people learning Next.js, Supabase, and data-driven UI.

### Stack

- **Frontend**: Next.js App Router (TypeScript, Tailwind), Recharts, React Leaflet.
- **Backend / storage**: Supabase (Postgres + RLS).
- **Ingestion**: Node scripts in `scripts/` using `@supabase/supabase-js`.

### Setup

1. Clone the repo and install dependencies:

   ```bash
   npm install
   ```

2. Create a new Supabase project and apply the schema from `supabase-schema.sql`.

3. Copy `.env.local` and set:

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (only required for local ingestion scripts)

4. Start the dev server:

   ```bash
   npm run dev
   ```

### Data ingestion

Ingestion scripts live in `scripts/`:

- `scripts/ingest-aqi.mjs` – AQI & pollutant snapshots (OpenAQ-style API).
- `scripts/ingest-fires.mjs` – fire hotspots (e.g. NASA FIRMS CSV).
- `scripts/ingest-weather.mjs` – basic weather snapshots (Open-Meteo example).

Run them manually for now (you can wire them into cron, GitHub Actions, or Supabase Edge functions later):

```bash
NEXT_PUBLIC_SUPABASE_URL=... \
SUPABASE_SERVICE_ROLE_KEY=... \
npm run ingest:aqi
```

### How to contribute

- **Good first issues**: start on the Contribute page in the app, or open a new issue if you spot something missing.
- **Small PRs** are preferred. If in doubt, open an issue to discuss the shape of a bigger change.
- **Stay data-aware**: when changing ingestion or schema, document assumptions and failure modes in comments / docs.

### Code style

- TypeScript where possible; explicit types for Supabase query results are appreciated but not strictly required.
- Prefer **small, composable React components**.
- Keep visual defaults accessible (contrast, font sizes).

### Auth & roles

- Public visitors only need anonymous access.
- In future, maintainers may enable Supabase magic-link auth for admin pages (issue triage, schema changes, etc.). If you work on that, keep it opt-in and clearly documented.

### Before opening a PR

1. Run `npm run lint`.
2. Make sure `/`, `/explore`, `/data-sources`, and `/contribute` all render without breaking.
3. Add or update documentation if your change affects ingestion, schema, or public behaviour.


