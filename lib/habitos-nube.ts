'use client';

// Copia de los hábitos de cada día en la cuenta (tabla habit_logs, con seguridad por usuario), para que la
// racha no se pierda al reinstalar la app ni al cambiar de celular. El celular sigue siendo la fuente
// inmediata (funciona sin internet): lo que está en el celular manda, y la nube rellena lo que falta.

import { createClient } from '@/lib/supabase/client';
import { claveHabitos, fechaLocal } from '@/lib/racha';

const DIAS = 400;
const PREFIJO = 'refugio-habitos-';
let uidEnMemoria: string | null = null;

export async function usuario(): Promise<string | null> {
  if (uidEnMemoria) return uidEnMemoria;
  const { data } = await createClient().auth.getUser();
  uidEnMemoria = data.user?.id ?? null;
  return uidEnMemoria;
}

function esFecha(f: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(f);
}

function leerLocal(fecha: string): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(claveHabitos(fecha));
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

/** Sube a la cuenta los hábitos de un día (se llama al marcar/desmarcar). Si falla, se reintenta al sincronizar. */
export async function guardarDiaEnNube(fecha: string, hechos: Record<string, boolean>): Promise<void> {
  try {
    const uid = await usuario();
    const filas = Object.entries(hechos).map(([habito_id, hecho]) => ({ user_id: uid, fecha, habito_id, hecho: !!hecho }));
    if (!uid || filas.length === 0) return;
    await createClient().from('habit_logs').upsert(filas, { onConflict: 'user_id,fecha,habito_id' });
  } catch {
    /* sin conexión: queda en el celular y sube en la próxima sincronización */
  }
}

/**
 * Sincroniza todo el historial: trae lo que falta en el celular y sube lo que falta en la cuenta.
 * Devuelve true si cambió algo en el celular (para recalcular la racha en pantalla).
 */
export async function sincronizarHabitos(): Promise<boolean> {
  try {
    const uid = await usuario();
    if (!uid) return false;
    const desde = new Date();
    desde.setDate(desde.getDate() - DIAS);
    const { data, error } = await createClient()
      .from('habit_logs')
      .select('fecha, habito_id, hecho')
      .gte('fecha', fechaLocal(desde))
      .limit(10000);
    if (error || !data) return false;

    const nube: Record<string, Record<string, boolean>> = {};
    for (const f of data) (nube[f.fecha] ??= {})[f.habito_id] = f.hecho;

    // 1) La nube rellena lo que el celular no tiene.
    let cambioLocal = false;
    for (const [fecha, hechosNube] of Object.entries(nube)) {
      const local = leerLocal(fecha);
      let mezclado = local;
      for (const [id, hecho] of Object.entries(hechosNube)) {
        if (!(id in local)) {
          mezclado = { ...mezclado, [id]: hecho };
          cambioLocal = true;
        }
      }
      if (mezclado !== local) {
        try {
          localStorage.setItem(claveHabitos(fecha), JSON.stringify(mezclado));
        } catch {
          /* modo privado: no se puede guardar en el celular */
        }
      }
    }

    // 2) El celular sube lo que la nube no tiene o tiene distinto (por ejemplo, marcado sin conexión).
    const subir: { user_id: string; fecha: string; habito_id: string; hecho: boolean }[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const clave = localStorage.key(i);
      if (!clave || !clave.startsWith(PREFIJO)) continue;
      const fecha = clave.slice(PREFIJO.length);
      if (!esFecha(fecha)) continue; // salta 'refugio-habitos-propios'
      for (const [habito_id, hecho] of Object.entries(leerLocal(fecha))) {
        if (nube[fecha]?.[habito_id] !== !!hecho) subir.push({ user_id: uid, fecha, habito_id, hecho: !!hecho });
      }
    }
    for (let i = 0; i < subir.length; i += 500) {
      await createClient().from('habit_logs').upsert(subir.slice(i, i + 500), { onConflict: 'user_id,fecha,habito_id' });
    }
    return cambioLocal;
  } catch {
    return false;
  }
}
