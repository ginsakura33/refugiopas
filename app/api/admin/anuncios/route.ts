import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Panel privado de anuncios. Solo entra quien está en la tabla `admins`. Toda escritura pasa por aquí
// (el servidor valida tipo y largo; la base de datos vuelve a validar con sus propias reglas).
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function esAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase.from('admins').select('user_id').eq('user_id', user.id).maybeSingle();
  return !!data;
}

const no = () => NextResponse.json({ error: 'no autorizado' }, { status: 403 });

export async function GET() {
  if (!(await esAdmin())) return no();
  const db = createAdminClient();
  const { data, error } = await db.from('anuncios').select('*').order('publicado_at', { ascending: false }).limit(100);
  if (error) return NextResponse.json({ error: 'error interno' }, { status: 500 });
  return NextResponse.json({ anuncios: data });
}

interface CuerpoNuevo {
  titulo?: string;
  mensaje?: string;
  enlace?: string;
  boton?: string;
  audiencia?: string;
  fecha_evento?: string;
}

export async function POST(request: Request) {
  if (!(await esAdmin())) return no();
  let c: CuerpoNuevo;
  try {
    c = (await request.json()) as CuerpoNuevo;
  } catch {
    return NextResponse.json({ error: 'cuerpo inválido' }, { status: 400 });
  }
  const titulo = (c.titulo ?? '').trim();
  const mensaje = (c.mensaje ?? '').trim();
  const enlace = (c.enlace ?? '').trim();
  const boton = (c.boton ?? '').trim();
  const audiencia = c.audiencia === 'anual' ? 'anual' : 'todos';

  if (!titulo || titulo.length > 80) return NextResponse.json({ error: 'El título es obligatorio (máximo 80 letras).' }, { status: 400 });
  if (!mensaje || mensaje.length > 600) return NextResponse.json({ error: 'El mensaje es obligatorio (máximo 600 letras).' }, { status: 400 });
  if (enlace) {
    let ok = false;
    try {
      ok = new URL(enlace).protocol === 'https:' && enlace.length <= 500;
    } catch {
      ok = false;
    }
    if (!ok) return NextResponse.json({ error: 'El enlace debe empezar con https://' }, { status: 400 });
    if (!boton) return NextResponse.json({ error: 'Si pones un enlace, escribe el texto del botón.' }, { status: 400 });
  }
  if (boton.length > 30) return NextResponse.json({ error: 'El texto del botón es muy largo (máximo 30 letras).' }, { status: 400 });

  let fecha: string | null = null;
  if (c.fecha_evento) {
    const f = new Date(c.fecha_evento);
    if (Number.isNaN(f.getTime())) return NextResponse.json({ error: 'La fecha del evento no es válida.' }, { status: 400 });
    fecha = f.toISOString();
  }

  const db = createAdminClient();
  const { data, error } = await db
    .from('anuncios')
    .insert({ titulo, mensaje, enlace: enlace || null, boton: enlace ? boton : null, audiencia, fecha_evento: fecha })
    .select()
    .single();
  if (error) return NextResponse.json({ error: 'No se pudo publicar. Inténtalo de nuevo.' }, { status: 500 });
  return NextResponse.json({ anuncio: data });
}

/** Archivar (activo=false) o volver a publicar (activo=true). */
export async function PATCH(request: Request) {
  if (!(await esAdmin())) return no();
  let c: { id?: string; activo?: boolean };
  try {
    c = (await request.json()) as { id?: string; activo?: boolean };
  } catch {
    return NextResponse.json({ error: 'cuerpo inválido' }, { status: 400 });
  }
  if (!c.id || typeof c.activo !== 'boolean') return NextResponse.json({ error: 'datos inválidos' }, { status: 400 });
  const db = createAdminClient();
  const { error } = await db.from('anuncios').update({ activo: c.activo }).eq('id', c.id);
  if (error) return NextResponse.json({ error: 'error interno' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
