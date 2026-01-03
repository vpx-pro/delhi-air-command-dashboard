-- Supabase schema for Delhi Pollution Crisis Dashboard

-- Locations of monitoring stations in/around Delhi
create table if not exists public.stations (
  id            uuid primary key default gen_random_uuid(),
  external_id   text, -- id from source API
  name          text not null,
  latitude      double precision not null,
  longitude     double precision not null,
  region        text,
  created_at    timestamptz not null default now()
);

-- AQI & pollutant readings per station & timestamp
create table if not exists public.aqi_readings (
  id            uuid primary key default gen_random_uuid(),
  station_id    uuid references public.stations(id) on delete cascade,
  observed_at   timestamptz not null,
  aqi           integer,
  pm25          double precision,
  pm10          double precision,
  no2           double precision,
  so2           double precision,
  o3            double precision,
  co            double precision,
  source        text, -- e.g. 'OpenAQ'
  created_at    timestamptz not null default now()
);

create index if not exists aqi_readings_station_time_idx
  on public.aqi_readings (station_id, observed_at desc);

-- Fire hotspots from e.g. NASA FIRMS
create table if not exists public.fire_hotspots (
  id            uuid primary key default gen_random_uuid(),
  source_id     text,
  latitude      double precision not null,
  longitude     double precision not null,
  detected_at   timestamptz not null,
  confidence    text,
  frp           double precision, -- fire radiative power
  created_at    timestamptz not null default now()
);

create index if not exists fire_hotspots_time_idx
  on public.fire_hotspots (detected_at desc);

-- Basic hourly weather snapshots for Delhi region
create table if not exists public.weather_snapshots (
  id            uuid primary key default gen_random_uuid(),
  latitude      double precision,
  longitude     double precision,
  observed_at   timestamptz not null,
  temperature_c double precision,
  wind_speed_ms double precision,
  wind_dir_deg  double precision,
  humidity_pct  double precision,
  pressure_hpa  double precision,
  source        text,
  created_at    timestamptz not null default now()
);

create index if not exists weather_snapshots_time_idx
  on public.weather_snapshots (observed_at desc);

-- Public email signups for updates
create table if not exists public.signups (
  id            uuid primary key default gen_random_uuid(),
  email         text not null,
  created_at    timestamptz not null default now(),
  meta          jsonb default '{}'::jsonb
);

create unique index if not exists signups_email_key on public.signups (email);

-- Contributor signups for collaboration
create table if not exists public.contributor_signups (
  id            uuid primary key default gen_random_uuid(),
  name          text,
  email         text not null,
  roles         text[], -- ['developer','designer','data-scientist',...]
  message       text,
  created_at    timestamptz not null default now()
);

create index if not exists contributor_signups_email_idx
  on public.contributor_signups (email);

-- (Optional) Table for pre-defined community issues to show on Contribute page
create table if not exists public.good_first_issues (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null,
  title         text not null,
  description   text not null,
  difficulty    text check (difficulty in ('easy','medium','hard')),
  tags          text[],
  created_at    timestamptz not null default now()
);

-- Basic RLS configuration (adjust as needed)
alter table public.signups enable row level security;
alter table public.contributor_signups enable row level security;
alter table public.good_first_issues enable row level security;

-- Allow anonymous inserts into signup tables
create policy "Public can insert signups"
  on public.signups
  for insert
  to anon
  with check (true);

create policy "Public can insert contributor signups"
  on public.contributor_signups
  for insert
  to anon
  with check (true);

-- Allow read access to issues for everyone
create policy "Public can read good first issues"
  on public.good_first_issues
  for select
  to anon
  using (true);


