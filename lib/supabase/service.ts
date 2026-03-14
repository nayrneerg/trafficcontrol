// Service role client for server-side operations (cron jobs, admin tasks)
// WARNING: This bypasses RLS \u2014 only use in trusted server contexts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

export function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase service role credentials.');
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
