export const ENV = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  mapDefaultLat: Number(process.env.NEXT_PUBLIC_MAP_DEFAULT_LAT ?? 28.6139),
  mapDefaultLng: Number(process.env.NEXT_PUBLIC_MAP_DEFAULT_LNG ?? 77.209),
  firmsApiKey: process.env.FIRMS_API_KEY ?? '',
  firmsDays: process.env.FIRMS_DAYS ?? '3',
} as const;

export function assertBrowserSupabaseConfigured() {
  if (!ENV.supabaseUrl || !ENV.supabaseAnonKey) {
    // eslint-disable-next-line no-console
    console.warn(
      'Supabase client is not fully configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.',
    );
  }
}


