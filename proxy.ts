import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Proxy (antes "middleware"): refresca la sesión de Supabase en cada visita y protege /app.
// Sin sesión válida → /entrar. Se valida con getUser() (consulta a Supabase), nunca con getSession().
export async function proxy(request: NextRequest) {
  let respuesta = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (lista) => {
          lista.forEach(({ name, value }) => request.cookies.set(name, value));
          respuesta = NextResponse.next({ request });
          lista.forEach(({ name, value, options }) => respuesta.cookies.set(name, value, options));
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && request.nextUrl.pathname.startsWith('/app')) {
    const destino = request.nextUrl.clone();
    destino.pathname = '/entrar';
    destino.search = '';
    return NextResponse.redirect(destino);
  }

  return respuesta;
}

export const config = {
  matcher: ['/app/:path*', '/entrar', '/auth/:path*'],
};
