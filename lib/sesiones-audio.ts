'use client';

// Registro de cómo se siente la persona ANTES y DESPUÉS de cada audio (escala de calma de 1 a 10), para que
// vea con el tiempo cómo cambia su estado. Se guarda en el celular (funciona sin internet) y se copia a su
// cuenta (tabla sesiones_audio) para que no se pierda al reinstalar. Regla de siempre: el celular manda.

import { createClient } from '@/lib/supabase/client';
import { usuario } from '@/lib/habitos-nube';

export const K_SESIONES = 'refugio-sesiones-audio';
const MAXIMO = 500;

export interface SesionAudio {
  id: string;
  audioId: string;
  antes: number;
  /** null = la persona decidió omitir la segunda respuesta. */
  despues: number | null;
  /** ISO */
  fecha: string;
}

const entre1y10 = (n: unknown) => Math.min(10, Math.max(1, Math.round(Number(n) || 5)));

export function leerSesiones(): SesionAudio[] {
  try {
    const raw = localStorage.getItem(K_SESIONES);
    const lista = raw ? (JSON.parse(raw) as SesionAudio[]) : [];
    return lista.sort((a, b) => b.fecha.localeCompare(a.fecha));
  } catch {
    return [];
  }
}

function fila(uid: string, s: SesionAudio) {
  return { user_id: uid, id: s.id, audio_id: s.audioId, antes: entre1y10(s.antes), despues: s.despues === null ? null : entre1y10(s.despues), created_at: s.fecha };
}

/** Guarda una sesión terminada: primero en el celular y luego en la cuenta (si no hay internet, sube después). */
export function guardarSesion(audioId: string, antes: number, despues: number | null): SesionAudio {
  const nueva: SesionAudio = { id: `ses-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`, audioId, antes: entre1y10(antes), despues: despues === null ? null : entre1y10(despues), fecha: new Date().toISOString() };
  try {
    localStorage.setItem(K_SESIONES, JSON.stringify([nueva, ...leerSesiones()].slice(0, MAXIMO)));
  } catch {
    /* modo privado: queda solo en esta sesión */
  }
  void (async () => {
    try {
      const uid = await usuario();
      if (uid) await createClient().from('sesiones_audio').upsert(fila(uid, nueva), { onConflict: 'user_id,id', ignoreDuplicates: true });
    } catch {
      /* sin conexión: sube en la próxima sincronización */
    }
  })();
  return nueva;
}

/** Trae de la cuenta lo que falte en el celular y sube lo que la cuenta no tenga. true = el celular recibió algo nuevo. */
export async function sincronizarSesiones(uid: string): Promise<boolean> {
  const sb = createClient();
  const { data, error } = await sb.from('sesiones_audio').select('id, audio_id, antes, despues, created_at').order('created_at', { ascending: false }).limit(MAXIMO);
  if (error || !data) throw error ?? new Error('sin datos');
  const local = leerSesiones();
  const idsLocal = new Set(local.map((s) => s.id));
  const idsNube = new Set(data.map((f) => f.id as string));
  const nuevas: SesionAudio[] = data
    .filter((f) => !idsLocal.has(f.id as string))
    .map((f) => ({ id: f.id as string, audioId: f.audio_id as string, antes: f.antes as number, despues: (f.despues as number | null) ?? null, fecha: new Date(f.created_at as string).toISOString() }));
  if (nuevas.length) {
    try {
      localStorage.setItem(K_SESIONES, JSON.stringify([...local, ...nuevas].sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, MAXIMO)));
    } catch {
      /* modo privado */
    }
  }
  const subir = local.filter((s) => !idsNube.has(s.id)).map((s) => fila(uid, s));
  for (let i = 0; i < subir.length; i += 100) {
    const { error: e } = await sb.from('sesiones_audio').upsert(subir.slice(i, i + 100), { onConflict: 'user_id,id', ignoreDuplicates: true });
    if (e) throw e;
  }
  return nuevas.length > 0;
}

export interface ResumenSesiones {
  veces: number;
  /** Veces con las dos respuestas. */
  conAmbas: number;
  /** Cuánto sube la calma en promedio (puede ser 0 o negativo); null si aún no hay sesiones completas. */
  mejoraPromedio: number | null;
  ultima: SesionAudio | null;
}

export function resumirSesiones(sesiones: SesionAudio[], audioId?: string): ResumenSesiones {
  const lista = audioId ? sesiones.filter((s) => s.audioId === audioId) : sesiones;
  const completas = lista.filter((s) => s.despues !== null);
  const mejora = completas.length ? completas.reduce((t, s) => t + ((s.despues as number) - s.antes), 0) / completas.length : null;
  return { veces: lista.length, conAmbas: completas.length, mejoraPromedio: mejora === null ? null : Math.round(mejora * 10) / 10, ultima: lista[0] ?? null };
}
