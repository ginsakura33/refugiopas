'use client';

// Datos REALES de la persona (nombre, arquetipo, dolor, momento, plan) leídos de su cuenta, con sus propias
// reglas de seguridad (RLS). Reemplaza los datos de ejemplo que antes veían todas las usuarias.

import { createClient } from '@/lib/supabase/client';
import { ARQUETIPOS, type ArquetipoId } from '@/lib/onboarding-content';

const K_ONBOARDING = 'refugio-onboarding';

export type Dolor = 'emociones' | 'ruido' | 'limites' | 'rumiacion' | 'otro';
export type Momento = 'casa' | 'trabajo' | 'noche' | 'cualquiera';

export interface PerfilReal {
  nombre: string | null;
  arquetipo: ArquetipoId | null;
  dolor: Dolor | null;
  momento: Momento | null;
}

export interface PlanReal {
  plan: 'mensual' | 'anual';
  estado: 'prueba' | 'activa' | 'cancelada' | 'vencida' | 'reembolsada';
  vigenteHasta: string | null;
}

const DOLORES: readonly string[] = ['emociones', 'ruido', 'limites', 'rumiacion'];
const MOMENTOS: readonly string[] = ['casa', 'trabajo', 'noche', 'cualquiera'];

const esArquetipo = (a: unknown): a is ArquetipoId => typeof a === 'string' && a in ARQUETIPOS;
const esMomento = (m: unknown): m is Momento => typeof m === 'string' && MOMENTOS.includes(m);
const esDolorGuardado = (d: unknown): d is Dolor => d === 'otro' || (typeof d === 'string' && DOLORES.includes(d));
/** Del recorrido de inicio llega la categoría elegida, o un texto libre si escribió "otro": del texto libre solo se guarda "otro". */
const dolorDelRecorrido = (d: unknown): Dolor | null => (typeof d === 'string' && d.trim() ? (DOLORES.includes(d) ? (d as Dolor) : 'otro') : null);

/**
 * Si la persona hizo el recorrido de inicio en este celular, se pasan a su cuenta (una sola vez) su
 * arquetipo, su dolor principal y su momento, solo en lo que su cuenta todavía no tiene, y se borra la copia
 * local de sus respuestas. Del texto libre nunca se guarda nada.
 */
async function pasarRecorridoALaCuenta(uid: string, actual: Omit<PerfilReal, 'nombre'>): Promise<Omit<PerfilReal, 'nombre'>> {
  try {
    const raw = localStorage.getItem(K_ONBOARDING);
    if (!raw) return actual;
    const guardado = JSON.parse(raw) as { arquetipo?: unknown; dolor?: unknown; momento?: unknown };
    const nuevo = { ...actual };
    const cambios: Record<string, string> = {};
    if (!actual.arquetipo && esArquetipo(guardado.arquetipo)) cambios.arquetipo = nuevo.arquetipo = guardado.arquetipo;
    const dolor = dolorDelRecorrido(guardado.dolor);
    if (!actual.dolor && dolor) cambios.dolor = nuevo.dolor = dolor;
    if (!actual.momento && esMomento(guardado.momento)) cambios.momento = nuevo.momento = guardado.momento;
    if (Object.keys(cambios).length > 0) {
      const { error } = await createClient().from('profiles').update(cambios).eq('id', uid);
      if (error) return actual; // se reintenta la próxima vez
    }
    localStorage.removeItem(K_ONBOARDING);
    return nuevo;
  } catch {
    /* sin respuestas guardadas: nada que pasar a la cuenta */
  }
  return actual;
}

export async function leerPerfil(): Promise<PerfilReal> {
  const vacio: PerfilReal = { nombre: null, arquetipo: null, dolor: null, momento: null };
  try {
    const sb = createClient();
    const { data: sesion } = await sb.auth.getSession();
    const uid = sesion.session?.user.id;
    if (!uid) return vacio;
    const { data } = await sb.from('profiles').select('nombre, arquetipo, dolor, momento').eq('id', uid).maybeSingle();
    const resto = await pasarRecorridoALaCuenta(uid, {
      arquetipo: esArquetipo(data?.arquetipo) ? data.arquetipo : null,
      dolor: esDolorGuardado(data?.dolor) ? data.dolor : null,
      momento: esMomento(data?.momento) ? data.momento : null,
    });
    return { nombre: (data?.nombre as string | null)?.trim() || null, ...resto };
  } catch {
    return vacio;
  }
}

/** Guarda el nombre y devuelve el nombre ya limpio (o null si lo dejó vacío); `ok:false` si no se pudo guardar. */
export async function guardarNombre(nombre: string): Promise<{ ok: boolean; nombre: string | null }> {
  try {
    const sb = createClient();
    const { data: sesion } = await sb.auth.getSession();
    const uid = sesion.session?.user.id;
    if (!uid) return { ok: false, nombre: null };
    const limpio = nombre.trim().replace(/\s+/g, ' ').slice(0, 40);
    const { error } = await sb.from('profiles').update({ nombre: limpio || null }).eq('id', uid);
    return { ok: !error, nombre: limpio || null };
  } catch {
    return { ok: false, nombre: null };
  }
}

export async function leerPlan(): Promise<PlanReal | null> {
  try {
    const { data } = await createClient().from('subscriptions').select('plan, estado, vigente_hasta').maybeSingle();
    if (!data) return null;
    return { plan: data.plan, estado: data.estado, vigenteHasta: data.vigente_hasta };
  } catch {
    return null;
  }
}

const FECHA = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'long' });

/** Texto del plan para mostrar, sin inventar precios. */
export function describirPlan(p: PlanReal | null): string {
  if (!p) return 'Sin plan activo';
  const nombre = p.plan === 'anual' ? 'Plan anual' : 'Plan mensual';
  const hasta = p.vigenteHasta ? FECHA.format(new Date(p.vigenteHasta)) : null;
  switch (p.estado) {
    case 'prueba':
      return `${nombre} · prueba gratis`;
    case 'activa':
      return `${nombre} · activo`;
    case 'cancelada':
      return hasta ? `${nombre} · cancelado, con acceso hasta el ${hasta}` : `${nombre} · cancelado`;
    default:
      return 'Sin plan activo';
  }
}

export function primerNombre(nombre: string | null): string | null {
  const n = nombre?.trim().split(/\s+/)[0];
  return n || null;
}
