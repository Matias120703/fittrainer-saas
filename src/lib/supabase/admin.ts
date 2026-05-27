import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database.types'

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('[supabase/admin] Missing SUPABASE_SERVICE_ROLE_KEY env var')
  }

  return createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
