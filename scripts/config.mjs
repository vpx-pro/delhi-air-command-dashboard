import dotenv from 'dotenv';

// Load env vars for scripts from .env.local (Next.js style) or fallback to .env
dotenv.config({ path: '.env.local' });
dotenv.config(); // fallback if some keys live in plain .env

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const FIRMS_API_KEY = process.env.FIRMS_API_KEY;
export const FIRMS_DAYS = process.env.FIRMS_DAYS ?? '3';

// AQI.in (or other AQI provider) API details – you configure these in .env.local
export const AQIIN_API_URL = process.env.AQIIN_API_URL;
export const AQIIN_API_KEY = process.env.AQIIN_API_KEY;

export function assertScriptEnv() {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    // eslint-disable-next-line no-console
    console.error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY for scripts. Set them in .env.local (or .env) before running ingestion.',
    );
    process.exit(1);
  }
}


