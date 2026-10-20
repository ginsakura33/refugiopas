'use client';

// Copia en la cuenta de lo que la persona guarda en su celular: ánimo de cada día, entradas del diario,
// nombres de sus hábitos propios y avance de los módulos (los hábitos marcados van en habitos-nube.ts).
// Misma regla en todo: el celular funciona sin internet y MANDA; la cuenta rellena lo que falte (al
// reinstalar o cambiar de celular) y recibe lo que se guardó sin conexión.

import { createClient } from '@/lib/supabase/client';
import { sincronizarHabitos, usuario } from '@/lib/habitos-nube';
import { ANIMOS, type Animo, type EntradaDiario } from '@/lib/app-demo-data';
import type { RegistroAnimo } from '@/lib/animo';

const K_ANIMO = 'refugio-animo-dias';
const K_DIARIO = 'refugio-diario';
const K_PROPIOS = 'refugio-habitos-propios';
const K_MODULOS = 'refugio-modulos-completados';
const MAX_PROPIOS = 3;

function leer<T>(clave: string, vacio: T): T {
  try {
    const raw = localStorage.getItem(clave);
    return raw ? (JSON.parse(raw) as T) : vacio;
  } catch {
    return vacio;
  }
}

function escribir(clave: string, valor: unknown) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
  } catch {
    /* modo privado: no se puede guardar en el celular */
  }
}

const esAnimo = (a: unknown): a is Animo => typeof a === 'string' && (ANIMOS as readonly string[]).includes(a);
const intensidadValida = (n: unknown) => Math.min(10, Math.max(1, Math.round(Number(n) || 5)));

/* ───────────── Ánimo por día ───────────── */

export async function subirAnimoDia(fecha: string, reg: RegistroAnimo): Promise<void> {
  try {
    const uid = await usuario();
    if (!uid) return;
    await createClient()
      .from('animo_dias')
      .upsert({ user_id: uid, fecha, animo: reg.animo, intensidad: intensidadValida(reg.intensidad), updated_at: new Date().toISOString() }, { onConflict: 'user_id,fecha' });
  } catch {
    /* sin conexión: sube en la próxima sincronización */
  }
}

async function sincronizarAnimo(uid: string): Promise<boolean> {
  const { data, error } = await createClient().from('animo_dias').select('fecha, animo, intensidad').order('fecha', { ascending: false }).limit(400);
  if (error || !data) throw error ?? new Error('sin datos');
  const local = leer<Record<string, RegistroAnimo>>(K_ANIMO, {});
  const nube = new Map(data.map((f) => [f.fecha as string, f]));
  let cambio = false;
  const unido = { ...local };
  for (const [fecha, f] of nube) {
    if (!unido[fecha] && esAnimo(f.animo)) {
      unido[fecha] = { animo: f.animo, intensidad: intensidadValida(f.intensidad) };
      cambio = true;
    }
  }
  if (cambio) escribir(K_ANIMO, unido);
  const subir = Object.entries(local)
    .filter(([fecha, r]) => esAnimo(r.animo) && (nube.get(fecha)?.animo !== r.animo || nube.get(fecha)?.intensidad !== intensidadValida(r.intensidad)))
    .map(([fecha, r]) => ({ user_id: uid, fecha, animo: r.animo, intensidad: intensidadValida(r.intensidad) }));
  if (subir.length) {
    const { error: e } = await createClient().from('animo_dias').upsert(subir, { onConflict: 'user_id,fecha' });
    if (e) throw e;
  }
  return cambio;
}

/* ───────────── Entradas del diario ───────────── */

function aFila(uid: string, e: EntradaDiario) {
  return {
    user_id: uid,
    local_id: e.id,
    animo: e.animo,
    intensidad: e.intensidad ? intensidadValida(e.intensidad) : null,
    texto: e.texto.slice(0, 5000),
    created_at: e.fecha,
  };
}

export async function subirEntradaDiario(e: EntradaDiario): Promise<void> {
  try {
    const uid = await usuario();
    if (!uid) return;
    await createClient().from('journal_entries').upsert(aFila(uid, e), { onConflict: 'user_id,local_id', ignoreDuplicates: true });
  } catch {
    /* sin conexión: sube en la próxima sincronización */
  }
}

async function sincronizarDiario(uid: string): Promise<boolean> {
  const { data, error } = await createClient()
    .from('journal_entries')
    .select('local_id, animo, intensidad, texto, created_at')
    .not('local_id', 'is', null)
    .order('created_at', { ascending: false })
    .limit(500);
  if (error || !data) throw error ?? new Error('sin datos');
  const local = leer<EntradaDiario[]>(K_DIARIO, []);
  const idsLocal = new Set(local.map((e) => e.id));
  const idsNube = new Set(data.map((f) => f.local_id as string));
  const nuevas: EntradaDiario[] = data
    .filter((f) => !idsLocal.has(f.local_id as string) && esAnimo(f.animo))
    .map((f) => ({
      id: f.local_id as string,
      fecha: new Date(f.created_at as string).toISOString(),
      animo: f.animo as Animo,
      intensidad: f.intensidad ?? undefined,
      texto: (f.texto as string | null) ?? '',
    }));
  if (nuevas.length) {
    escribir(K_DIARIO, [...local, ...nuevas].sort((a, b) => b.fecha.localeCompare(a.fecha)));
  }
  const subir = local.filter((e) => !idsNube.has(e.id) && e.id.startsWith('local-')).map((e) => aFila(uid, e));
  for (let i = 0; i < subir.length; i += 100) {
    const { error: e } = await createClient().from('journal_entries').upsert(subir.slice(i, i + 100), { onConflict: 'user_id,local_id', ignoreDuplicates: true });
    if (e) throw e;
  }
  return nuevas.length > 0;
}

/* ───────────── Hábitos propios (los nombres) ───────────── */

interface HabitoPropio {
  id: string;
  nombre: string;
}

/** Deja la cuenta igual que la lista del celular (se llama al agregar o quitar un hábito propio). */
export async function subirHabitosPropios(lista: HabitoPropio[]): Promise<void> {
  try {
    const uid = await usuario();
    if (!uid) return;
    const sb = createClient();
    const { data } = await sb.from('habitos_propios').select('id');
    const sobran = (data ?? []).map((f) => f.id as string).filter((id) => !lista.some((h) => h.id === id));
    if (sobran.length) await sb.from('habitos_propios').delete().in('id', sobran);
    if (lista.length) await sb.from('habitos_propios').upsert(lista.map((h) => ({ user_id: uid, id: h.id, nombre: h.nombre })), { onConflict: 'user_id,id' });
  } catch {
    /* sin conexión: se vuelve a intentar al sincronizar */
  }
}

async function sincronizarPropios(uid: string): Promise<boolean> {
  const { data, error } = await createClient().from('habitos_propios').select('id, nombre').order('created_at', { ascending: true }).limit(MAX_PROPIOS);
  if (error || !data) throw error ?? new Error('sin datos');
  const local = leer<HabitoPropio[]>(K_PROPIOS, []);
  const faltan = data.filter((f) => !local.some((h) => h.id === f.id)).map((f) => ({ id: f.id as string, nombre: f.nombre as string }));
  let cambio = false;
  if (faltan.length && local.length < MAX_PROPIOS) {
    escribir(K_PROPIOS, [...local, ...faltan].slice(0, MAX_PROPIOS));
    cambio = true;
  }
  const subir = local.filter((h) => !data.some((f) => f.id === h.id)).map((h) => ({ user_id: uid, id: h.id, nombre: h.nombre }));
  if (subir.length) {
    const { error: e } = await createClient().from('habitos_propios').upsert(subir, { onConflict: 'user_id,id' });
    if (e) throw e;
  }
  return cambio;
}

/* ───────────── Avance de los módulos ───────────── */

export async function subirModulo(id: string): Promise<void> {
  try {
    const uid = await usuario();
    if (!uid) return;
    await createClient().from('module_progress').upsert({ user_id: uid, modulo_id: id }, { onConflict: 'user_id,modulo_id', ignoreDuplicates: true });
  } catch {
    /* sin conexión: sube en la próxima sincronización */
  }
}

async function sincronizarModulos(uid: string): Promise<boolean> {
  const { data, error } = await createClient().from('module_progress').select('modulo_id');
  if (error || !data) throw error ?? new Error('sin datos');
  const local = leer<Record<string, boolean>>(K_MODULOS, {});
  const nube = new Set(data.map((f) => f.modulo_id as string));
  let cambio = false;
  const unido = { ...local };
  for (const id of nube) {
    if (!unido[id]) {
      unido[id] = true;
      cambio = true;
    }
  }
  if (cambio) escribir(K_MODULOS, unido);
  const subir = Object.keys(local).filter((id) => local[id] && !nube.has(id)).map((id) => ({ user_id: uid, modulo_id: id }));
  if (subir.length) {
    const { error: e } = await createClient().from('module_progress').upsert(subir, { onConflict: 'user_id,modulo_id', ignoreDuplicates: true });
    if (e) throw e;
  }
  return cambio;
}

/* ───────────── Datos de esta cuenta en este celular ───────────── */

const K_DUENO = 'refugio-dueno';

/** Borra del celular todo lo personal (diario, ánimo, hábitos, módulos…). No toca preferencias del aparato. */
export function limpiarDatosLocales(): void {
  try {
    const claves: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('refugio-') && k !== 'refugio-instalar-descartado') claves.push(k);
    }
    claves.forEach((k) => localStorage.removeItem(k));
    ['refugio-onboarding', 'refugio-plan', 'refugio-diario-prompt'].forEach((k) => sessionStorage.removeItem(k));
  } catch {
    /* sin acceso al almacenamiento del navegador: nada que borrar */
  }
}

/** Si lo guardado en este celular era de OTRA cuenta, se borra antes de sincronizar (jamás se sube a la cuenta nueva). */
function asegurarDueno(uid: string): boolean {
  try {
    const dueno = localStorage.getItem(K_DUENO);
    let limpio = false;
    if (dueno && dueno !== uid) {
      limpiarDatosLocales();
      limpio = true;
    }
    localStorage.setItem(K_DUENO, uid);
    return limpio;
  } catch {
    return false;
  }
}

/* ───────────── Todo junto ───────────── */

let enCurso: Promise<{ cambio: boolean; ok: boolean }> | null = null;

function ejecutar(): Promise<{ cambio: boolean; ok: boolean }> {
  if (enCurso) return enCurso;
  enCurso = (async () => {
    try {
      const uid = await usuario();
      if (!uid) return { cambio: false, ok: false };
      const limpio = asegurarDueno(uid);
      let ok = true;
      const sinFallar = (p: Promise<boolean>) =>
        p.catch(() => {
          ok = false;
          return false;
        });
      const partes = await Promise.all([
        sinFallar(sincronizarHabitos()),
        sinFallar(sincronizarAnimo(uid)),
        sinFallar(sincronizarDiario(uid)),
        sinFallar(sincronizarPropios(uid)),
        sinFallar(sincronizarModulos(uid)),
      ]);
      return { cambio: limpio || partes.some(Boolean), ok };
    } catch {
      return { cambio: false, ok: false };
    } finally {
      enCurso = null;
    }
  })();
  return enCurso;
}

/** Sincroniza hábitos, ánimo, diario, hábitos propios y módulos. true = el celular recibió algo nuevo. */
export async function sincronizarTodo(): Promise<boolean> {
  return (await ejecutar()).cambio;
}

/** true solo si TODO lo guardado en el celular quedó también en la cuenta (se usa antes de cerrar sesión). */
export async function subirPendientes(): Promise<boolean> {
  return (await ejecutar()).ok;
}
