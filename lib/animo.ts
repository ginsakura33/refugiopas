// Registro del ánimo POR DÍA (en el teléfono). Lo escriben Inicio, el "antes y después" de una sesión
// y el Diario; el gráfico semanal del Diario lo lee. Cada día tiene como máximo un registro (el último).
// Si todavía no hay intensidad elegida se usa 5 (punto medio) hasta que la persona la mueva.

import { fechaLocal } from '@/lib/racha';
import type { Animo } from '@/lib/app-demo-data';

const CLAVE = 'refugio-animo-dias';
const MAXIMO_DIAS = 90;

export interface RegistroAnimo {
  animo: Animo;
  intensidad: number;
}

export function leerRegistros(): Record<string, RegistroAnimo> {
  try {
    const raw = localStorage.getItem(CLAVE);
    return raw ? (JSON.parse(raw) as Record<string, RegistroAnimo>) : {};
  } catch {
    return {};
  }
}

export function leerAnimoDeHoy(fecha: string = fechaLocal()): RegistroAnimo | null {
  return leerRegistros()[fecha] ?? null;
}

/** Guarda el ánimo de un día. Sin `intensidad` conserva la que ya tenía ese día (o 5). */
export function guardarAnimo(animo: Animo, intensidad?: number, fecha: string = fechaLocal()): RegistroAnimo {
  const registros = leerRegistros();
  const valor = Math.min(10, Math.max(1, Math.round(intensidad ?? registros[fecha]?.intensidad ?? 5)));
  const nuevo = { animo, intensidad: valor };
  registros[fecha] = nuevo;
  const fechas = Object.keys(registros).sort();
  const conservar = Object.fromEntries(fechas.slice(-MAXIMO_DIAS).map((f) => [f, registros[f]]));
  try {
    localStorage.setItem(CLAVE, JSON.stringify(conservar));
  } catch {
    /* modo privado: queda solo en esta sesión */
  }
  return nuevo;
}
