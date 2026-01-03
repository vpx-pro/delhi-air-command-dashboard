import { createClient } from '@supabase/supabase-js';
import { ENV } from '@/config/env';

export const getSupabaseAdminClient = () => {
  if (!ENV.supabaseUrl || !ENV.serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL not set');
  }

  return createClient(ENV.supabaseUrl, ENV.serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  });
};


