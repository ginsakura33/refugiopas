import 'server-only';
import { createClient } from '@supabase/supabase-js';

// Cliente con la clave SECRETA (service role): ignora RLS. SOLO para código de servidor
// (webhooks). Nunca importarlo desde un componente de cliente ni usar prefijo NEXT_PUBLIC_.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('FALTA SUPABASE_SERVICE_ROLE_KEY — el servidor no puede operar de forma segura');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}
