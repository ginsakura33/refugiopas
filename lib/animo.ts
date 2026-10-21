// Registro del ánimo POR DÍA (en el teléfono, y copiado a la cuenta). Lo escriben Inicio, el "antes y después" de
// una sesión y el Diario; el gráfico semanal del Diario lo lee. Cada día tiene como máximo un registro (el último).
//
// La intensidad (1 a 10) puede ser ELEGIDA por la persona (`manual`) o puesta por defecto (5) cuando solo toca el
// ánimo en Inicio. Un valor por defecto nunca pisa uno elegido, ni siquiera el que se eligió en otro dispositivo
// (ver fusion-animo.ts). Cada registro lleva la hora del último cambio para saber cuál es más reciente.

import { fechaLocal } from '@/lib/racha';
import type { Animo } from '@/lib/app-demo-data';
import { subirAnimoDia } from '@/lib/datos-nube';

const CLAVE = 'refugio-animo-dias';
const CLAVE_BORRADOR = 'refugio-diario-borrador';
const MAXIMO_DIAS = 90;

export interface RegistroAnimo {
  animo: Animo;
  intensidad: number;
  /** false = la intensidad la puso la app por defecto; ausente o true = la eligió la persona. */
  manual?: boolean;
  /** ISO del último cambio. */
  actualizado?: string;
}

export function leerRegistros(): Record<string, RegistroAnimo> {
  try {
    const raw = localStorage.getItem(CLAVE);
    return raw ? (JSON.parse(raw) as Record<string, RegistroAnimo>) : {};
  } catch {
    return {};
  }
}

/** Reemplaza todos los registros del celular (lo usa la sincronización con la cuenta). */
export function escribirRegistros(registros: Record<string, RegistroAnimo>): void {
  const fechas = Object.keys(registros).sort();
  const conservar = Object.fromEntries(fechas.slice(-MAXIMO_DIAS).map((f) => [f, registros[f]]));
  try {
    localStorage.setItem(CLAVE, JSON.stringify(conservar));
  } catch {
    /* modo privado: queda solo en esta sesión */
  }
}

export function leerAnimoDeHoy(fecha: string = fechaLocal()): RegistroAnimo | null {
  return leerRegistros()[fecha] ?? null;
}

/** Si en el Diario ya movió la escala de HOY sin elegir ánimo, esa intensidad es la suya (no la de por defecto). */
function intensidadDelBorrador(fecha: string): number | null {
  try {
    const raw = localStorage.getItem(CLAVE_BORRADOR);
    if (!raw) return null;
    const b = JSON.parse(raw) as { fecha?: string; intensidad?: number };
    return b.fecha === fecha && typeof b.intensidad === 'number' ? Math.min(10, Math.max(1, Math.round(b.intensidad))) : null;
  } catch {
    return null;
  }
}

/**
 * Guarda el ánimo de un día. Con `intensidad` (la eligió la persona) esa queda como elegida. Sin `intensidad`
 * conserva la que ya tenía ese día; si no había ninguna, usa la del borrador del Diario o, en último caso, 5
 * marcada como "por defecto" para que nunca pise una elegida en otro dispositivo.
 */
export function guardarAnimo(animo: Animo, intensidad?: number, fecha: string = fechaLocal()): RegistroAnimo {
  const registros = leerRegistros();
  const previo = registros[fecha];
  const delBorrador = previo ? null : intensidadDelBorrador(fecha);
  const explicita = intensidad !== undefined;
  const valor = Math.min(10, Math.max(1, Math.round(explicita ? (intensidad as number) : (previo?.intensidad ?? delBorrador ?? 5))));
  const manual = explicita ? true : previo ? previo.manual !== false : delBorrador !== null;
  const nuevo: RegistroAnimo = { animo, intensidad: valor, manual, actualizado: new Date().toISOString() };
  registros[fecha] = nuevo;
  escribirRegistros(registros);
  void subirAnimoDia(fecha, nuevo); // se combina con la cuenta y se copia (si no hay internet, sube después)
  return nuevo;
}
