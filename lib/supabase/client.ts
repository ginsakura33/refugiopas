import { createBrowserClient } from '@supabase/ssr';

// Cliente para el navegador: solo usa la clave PÚBLICA (publishable/anon). La seguridad real
// la dan las reglas RLS de la base de datos, no esconder esta clave.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
