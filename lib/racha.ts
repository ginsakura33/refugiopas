// Racha REAL de hábitos, calculada con los días guardados en el teléfono (localStorage).
// Un día "cuenta" cuando se completan al menos MINIMO_RACHA hábitos RECOMENDADOS (los propios no suman).
// La racha es la cantidad de días seguidos que cuentan, terminando hoy — o ayer si hoy todavía no llega
// al mínimo (la racha no se rompe hasta que termina el día). Los días se miden en la hora LOCAL de la
// persona, no en UTC.

export const MINIMO_RACHA = 4;
const DIAS_A_REVISAR = 400;

/** Fecha local YYYY-MM-DD (hora de la persona, no UTC). */
export function fechaLocal(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dia}`;
}

export const claveHabitos = (fecha: string) => `refugio-habitos-${fecha}`;
export const claveHitos = (fecha: string) => `refugio-hitos-${fecha}`;

function sumarDias(d: Date, n: number): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  return x;
}

function leerDia(fecha: string): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(claveHabitos(fecha));
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

/** ¿Ese día llegó al mínimo de hábitos recomendados? */
export function diaCuenta(hechos: Record<string, boolean>, idsRecomendados: string[]): boolean {
  return idsRecomendados.filter((id) => hechos[id]).length >= MINIMO_RACHA;
}

export interface ResumenRacha {
  actual: number;
  mejor: number;
  /** Lunes a domingo de la semana actual: true si ese día cuenta. */
  semana: boolean[];
}

/**
 * Calcula la racha. `hechosHoy` permite pasar el estado más reciente de hoy (aún sin guardar).
 */
export function calcularRacha(idsRecomendados: string[], ahora: Date = new Date(), hechosHoy?: Record<string, boolean>): ResumenRacha {
  const hoy = fechaLocal(ahora);
  const cuenta = (fecha: string) => diaCuenta(fecha === hoy && hechosHoy ? hechosHoy : leerDia(fecha), idsRecomendados);

  // Racha actual: hacia atrás desde hoy (o desde ayer si hoy aún no llega al mínimo).
  let actual = 0;
  let cursor = cuenta(hoy) ? ahora : sumarDias(ahora, -1);
  while (actual < DIAS_A_REVISAR && cuenta(fechaLocal(cursor))) {
    actual += 1;
    cursor = sumarDias(cursor, -1);
  }

  // Mejor racha: la corrida más larga en todo el historial guardado.
  let mejor = 0;
  let corrida = 0;
  for (let i = DIAS_A_REVISAR; i >= 0; i--) {
    if (cuenta(fechaLocal(sumarDias(ahora, -i)))) {
      corrida += 1;
      mejor = Math.max(mejor, corrida);
    } else {
      corrida = 0;
    }
  }

  // Semana actual (lunes = 0).
  const indiceHoy = (ahora.getDay() + 6) % 7;
  const semana = Array.from({ length: 7 }, (_, i) => cuenta(fechaLocal(sumarDias(ahora, i - indiceHoy))));

  return { actual, mejor: Math.max(mejor, actual), semana };
}
