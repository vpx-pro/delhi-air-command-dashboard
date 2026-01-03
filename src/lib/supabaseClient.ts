import { createClient } from '@supabase/supabase-js';
import { ENV, assertBrowserSupabaseConfigured } from '@/config/env';

assertBrowserSupabaseConfigured();

export const supabaseBrowserClient = createClient(
  ENV.supabaseUrl,
  ENV.supabaseAnonKey,
  {
    auth: {
      persistSession: false,
    },
  },
);


