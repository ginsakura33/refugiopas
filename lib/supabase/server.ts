import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Cliente para el servidor (rutas y Server Components): lee/escribe la sesión en cookies.
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (lista) => {
          try {
            lista.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            /* desde un Server Component no se pueden escribir cookies: el proxy ya refresca la sesión */
          }
        },
      },
    }
  );
}
