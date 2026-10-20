'use client';

// Datos REALES de la persona (nombre, arquetipo, plan) leídos de su cuenta, con sus propias reglas de
// seguridad (RLS). Reemplaza los datos de ejemplo que antes veían todas las usuarias.

import { createClient } from '@/lib/supabase/client';
import { ARQUETIPOS, type ArquetipoId } from '@/lib/onboarding-content';

const K_ONBOARDING = 'refugio-onboarding';

export interface PerfilReal {
  nombre: string | null;
  arquetipo: ArquetipoId | null;
}

export interface PlanReal {
  plan: 'mensual' | 'anual';
  estado: 'prueba' | 'activa' | 'cancelada' | 'vencida' | 'reembolsada';
  vigenteHasta: string | null;
}

const esArquetipo = (a: unknown): a is ArquetipoId => typeof a === 'string' && a in ARQUETIPOS;

/**
 * Si la persona hizo el recorrido de inicio en este celular y su cuenta todavía no tiene arquetipo,
 * se lo guarda (una sola vez) y borra la copia local de sus respuestas.
 */
async function guardarArquetipoPendiente(uid: string, actual: ArquetipoId | null): Promise<ArquetipoId | null> {
  try {
    const raw = localStorage.getItem(K_ONBOARDING);
    if (!raw) return actual;
    const guardado = (JSON.parse(raw) as { arquetipo?: unknown }).arquetipo;
    if (!actual && esArquetipo(guardado)) {
      const { error } = await createClient().from('profiles').update({ arquetipo: guardado }).eq('id', uid);
      if (error) return actual; // se reintenta la próxima vez
      localStorage.removeItem(K_ONBOARDING);
      return guardado;
    }
    if (actual) localStorage.removeItem(K_ONBOARDING);
  } catch {
    /* sin respuestas guardadas: nada que pasar a la cuenta */
  }
  return actual;
}

export async function leerPerfil(): Promise<PerfilReal> {
  try {
    const sb = createClient();
    const { data: sesion } = await sb.auth.getSession();
    const uid = sesion.session?.user.id;
    if (!uid) return { nombre: null, arquetipo: null };
    const { data } = await sb.from('profiles').select('nombre, arquetipo').eq('id', uid).maybeSingle();
    const arquetipo = await guardarArquetipoPendiente(uid, esArquetipo(data?.arquetipo) ? data.arquetipo : null);
    return { nombre: (data?.nombre as string | null)?.trim() || null, arquetipo };
  } catch {
    return { nombre: null, arquetipo: null };
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
