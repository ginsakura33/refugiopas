import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Guarda (POST) o quita (DELETE) el permiso de recordatorios de la persona que tiene la sesión abierta.
// Todo pasa por sus propias reglas de seguridad (RLS): nadie puede tocar el permiso de otra persona.
export const runtime = 'nodejs';

const HORA = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'no autorizado' }, { status: 401 });

  let cuerpo: { subscription?: { endpoint?: string; keys?: { p256dh?: string; auth?: string } }; hora?: string; zona?: string };
  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json({ error: 'cuerpo inválido' }, { status: 400 });
  }
  const sub = cuerpo.subscription;
  const hora = cuerpo.hora ?? '20:00';
  const zona = (cuerpo.zona ?? 'America/Bogota').slice(0, 64);
  if (!sub?.endpoint || !sub.keys?.p256dh || !sub.keys?.auth || !HORA.test(hora)) {
    return NextResponse.json({ error: 'datos inválidos' }, { status: 400 });
  }
  if (!sub.endpoint.startsWith('https://')) return NextResponse.json({ error: 'datos inválidos' }, { status: 400 });

  // La misma suscripción se reemplaza (se borra la propia y se vuelve a crear).
  await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
  const { error: errSub } = await supabase
    .from('push_subscriptions')
    .insert({ user_id: user.id, endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth });
  if (errSub) return NextResponse.json({ error: 'este dispositivo ya está asociado a otra cuenta' }, { status: 409 });

  const { error: errPref } = await supabase
    .from('recordatorio_prefs')
    .upsert({ user_id: user.id, activo: true, hora, zona, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
  if (errPref) return NextResponse.json({ error: 'error interno' }, { status: 500 });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'no autorizado' }, { status: 401 });

  let endpoint: string | undefined;
  try {
    endpoint = ((await request.json()) as { endpoint?: string }).endpoint;
  } catch {
    /* sin cuerpo: se desactiva todo */
  }
  if (endpoint) await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint);
  else await supabase.from('push_subscriptions').delete().eq('user_id', user.id);
  await supabase.from('recordatorio_prefs').update({ activo: false, updated_at: new Date().toISOString() }).eq('user_id', user.id);
  return NextResponse.json({ ok: true });
}
