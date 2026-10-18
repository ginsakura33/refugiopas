import 'server-only';
import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { createAdminClient } from '@/lib/supabase/admin';
import { ahoraEnZona, mensajeDelDia, tocaEnviar } from '@/lib/recordatorios';

// Lo llama un temporizador cada ~15 min. Envía el recordatorio suave a quien le toca (una vez al día).
// Autenticación: encabezado Authorization: Bearer <CRON_SECRET>, comparado en tiempo constante.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const MAX_POR_VUELTA = 500;

function autorizado(request: Request): boolean {
  const esperado = process.env.CRON_SECRET;
  const recibido = (request.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (!esperado || !recibido) return false; // sin secreto configurado nada pasa (fail-secure)
  const a = Buffer.from(recibido);
  const b = Buffer.from(esperado);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

async function enviar(request: Request) {
  if (!autorizado(request)) return NextResponse.json({ error: 'no autorizado' }, { status: 401 });

  const publica = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privada = process.env.VAPID_PRIVATE_KEY;
  if (!publica || !privada) return NextResponse.json({ error: 'faltan las claves VAPID' }, { status: 500 });
  webpush.setVapidDetails(process.env.VAPID_SUBJECT ?? 'https://refugiopas.vercel.app', publica, privada);

  const db = createAdminClient();
  const ahora = new Date();

  const { data: prefs } = await db
    .from('recordatorio_prefs')
    .select('user_id, activo, hora, zona, ultimo_envio')
    .eq('activo', true)
    .limit(MAX_POR_VUELTA);
  const toca = (prefs ?? []).filter((p) => tocaEnviar(p, ahora));
  if (toca.length === 0) return NextResponse.json({ ok: true, enviados: 0 });

  // Solo a quien tiene un plan vigente.
  const ids = toca.map((p) => p.user_id);
  const { data: subs } = await db.from('subscriptions').select('user_id, estado, vigente_hasta').in('user_id', ids);
  const conAcceso = new Set(
    (subs ?? [])
      .filter((s) => ['prueba', 'activa', 'cancelada'].includes(s.estado) && (!s.vigente_hasta || new Date(s.vigente_hasta) > ahora))
      .map((s) => s.user_id)
  );
  const destinatarios = toca.filter((p) => conAcceso.has(p.user_id));
  if (destinatarios.length === 0) return NextResponse.json({ ok: true, enviados: 0 });

  const { data: dispositivos } = await db
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth, user_id')
    .in('user_id', destinatarios.map((p) => p.user_id));

  let enviados = 0;
  for (const p of destinatarios) {
    const { fecha } = ahoraEnZona(ahora, p.zona);
    const propios = (dispositivos ?? []).filter((d) => d.user_id === p.user_id);
    const mensaje = mensajeDelDia(fecha);
    const payload = JSON.stringify({ titulo: mensaje.titulo, cuerpo: mensaje.cuerpo, url: '/app' });

    const resultados = await Promise.allSettled(
      propios.map((d) => webpush.sendNotification({ endpoint: d.endpoint, keys: { p256dh: d.p256dh, auth: d.auth } }, payload, { TTL: 3 * 60 * 60 }))
    );
    // Dispositivos que ya no existen (la persona desinstaló o quitó el permiso): se borran.
    const caducados = propios.filter((_, i) => {
      const r = resultados[i];
      return r.status === 'rejected' && [404, 410].includes((r.reason as { statusCode?: number })?.statusCode ?? 0);
    });
    if (caducados.length) await db.from('push_subscriptions').delete().in('endpoint', caducados.map((d) => d.endpoint));

    const ok = resultados.some((r) => r.status === 'fulfilled');
    if (ok) enviados += 1;
    // Se marca como enviado hoy aunque no haya dispositivos vivos, para no reintentar toda la tarde.
    if (ok || propios.length === caducados.length) {
      await db.from('recordatorio_prefs').update({ ultimo_envio: fecha }).eq('user_id', p.user_id);
    }
  }
  return NextResponse.json({ ok: true, enviados });
}

export const GET = enviar;
export const POST = enviar;
