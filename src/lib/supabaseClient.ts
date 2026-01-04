import { createClient } from '@supabase/supabase-js';
import { ENV, assertBrowserSupabaseConfigured } from '@/config/env';

assertBrowserSupabaseConfigured();

const isSupabaseConfigured = Boolean(ENV.supabaseUrl && ENV.supabaseAnonKey);

type SupabaseQueryResult<T = any> = {
  data: T | null;
  error: { message: string } | null;
};

function createSupabaseStubClient() {
  const errorResult: SupabaseQueryResult = {
    data: null,
    error: {
      message:
        'Supabase is not configured in this environment. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.',
    },
  };

  return {
    from() {
      const query: any = {
        select() {
          return query;
        },
        gte() {
          return query;
        },
        lte() {
          return query;
        },
        order() {
          return query;
        },
        async limit() {
          return errorResult;
        },
        async insert() {
          return errorResult;
        },
      };
      return query;
    },
  } as any;
}

export const supabaseBrowserClient: any = isSupabaseConfigured
  ? createClient(ENV.supabaseUrl, ENV.supabaseAnonKey, {
      auth: {
        persistSession: false,
      },
    })
  : createSupabaseStubClient();



