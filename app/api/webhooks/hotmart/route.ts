import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { EVENTO_A_ESTADO, hottokValido, planDelPayload, type PayloadHotmart } from '@/lib/hotmart';

// Webhook de Hotmart: avisa de compras, reembolsos, cancelaciones y pagos atrasados.
// Orden (no negociable): autenticidad → parseo → evento conocido → idempotencia → cuenta → suscripción.
export const runtime = 'nodejs';

const GRACIA_MS = 3 * 24 * 60 * 60 * 1000; // 3 días de margen tras la fecha del próximo cobro

export async function POST(request: Request) {
  // 1. AUTENTICIDAD: sin hottok válido no se toca nada.
  const hottok = request.headers.get('x-hotmart-hottok');
  if (!hottokValido(hottok)) return NextResponse.json({ error: 'no autorizado' }, { status: 401 });

  let payload: PayloadHotmart;
  try {
    payload = (await request.json()) as PayloadHotmart;
  } catch {
    return NextResponse.json({ error: 'cuerpo inválido' }, { status: 400 });
  }

  const evento = payload.event ?? '';
  const estado = EVENTO_A_ESTADO[evento];
  const email = payload.data?.buyer?.email?.trim().toLowerCase();
  const transaccion = payload.data?.purchase?.transaction;
  if (!estado) return NextResponse.json({ ok: true, ignorado: evento }); // evento que no usamos
  if (!email || !transaccion) return NextResponse.json({ error: 'faltan datos' }, { status: 400 });

  const db = createAdminClient();

  // 2. IDEMPOTENCIA: Hotmart reenvía eventos; cada uno se procesa una sola vez.
  const idEvento = payload.id ?? `${evento}:${transaccion}`;
  const { error: dup } = await db.from('webhook_events').insert({ id: idEvento, evento });
  if (dup) {
    if (dup.code === '23505') return NextResponse.json({ ok: true, repetido: true });
    return NextResponse.json({ error: 'error interno' }, { status: 500 });
  }

  // 3. CUENTA: se busca por correo; si no existe, se crea SIN contraseña (entra con enlace al correo).
  let userId: string | null = null;
  const existente = await db.from('subscriptions').select('user_id').eq('email', email).limit(1).maybeSingle();
  userId = existente.data?.user_id ?? null;
  if (!userId) {
    const creada = await db.auth.admin.createUser({ email, email_confirm: true });
    if (creada.data.user) userId = creada.data.user.id;
    else {
      // Ya existía en Auth (p. ej. entró antes): se localiza por correo.
      const lista = await db.auth.admin.listUsers({ page: 1, perPage: 1000 });
      userId = lista.data.users.find((u) => u.email?.toLowerCase() === email)?.id ?? null;
    }
  }
  if (!userId) {
    await db.from('webhook_events').delete().eq('id', idEvento); // para que Hotmart reintente
    return NextResponse.json({ error: 'no se pudo crear la cuenta' }, { status: 500 });
  }

  // 4. SUSCRIPCIÓN
  const valor = payload.data?.purchase?.price?.value;
  const proximoCobro = payload.data?.purchase?.date_next_charge;
  const esPrueba = estado === 'activa' && valor === 0;
  const { error } = await db.from('subscriptions').upsert(
    {
      user_id: userId,
      email,
      plan: planDelPayload(payload),
      estado: esPrueba ? 'prueba' : estado,
      origen: 'hotmart',
      transaccion,
      vigente_hasta: proximoCobro ? new Date(proximoCobro + GRACIA_MS).toISOString() : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );
  if (error) {
    await db.from('webhook_events').delete().eq('id', idEvento);
    return NextResponse.json({ error: 'error interno' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
