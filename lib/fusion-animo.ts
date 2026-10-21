// Cómo se combinan dos versiones del ánimo de UN mismo día (la del celular y la de la cuenta, o la de dos
// dispositivos). Reglas, en este orden:
//  1) Gana la versión MÁS RECIENTE para el ánimo elegido.
//  2) Pero un valor de intensidad puesto POR DEFECTO (manual === false) nunca pisa uno ELEGIDO por la persona:
//     si la versión ganadora tiene la intensidad por defecto y la otra tiene una elegida, se conserva la elegida.
//  3) Una versión sin fecha (de antes de este arreglo) cuenta como la más antigua.
// Es una función pura (sin navegador ni red) para poder probarla sola.

export interface RegistroAnimoBase {
  animo: string;
  intensidad: number;
  /** false = la intensidad la puso la app por defecto; ausente o true = la eligió la persona. */
  manual?: boolean;
  /** ISO de la última vez que se tocó. */
  actualizado?: string;
}

const eligida = (r: RegistroAnimoBase) => r.manual !== false;
const tiempo = (r: RegistroAnimoBase) => Date.parse(r.actualizado ?? '') || 0;

export function fusionarAnimo<T extends RegistroAnimoBase>(local: T | undefined, nube: T | undefined): T | undefined {
  if (!local) return nube;
  if (!nube) return local;
  const gana = tiempo(local) > tiempo(nube) ? local : nube;
  const pierde = gana === local ? nube : local;
  const resultado: T = { ...gana };
  if (!eligida(gana) && eligida(pierde)) {
    resultado.intensidad = pierde.intensidad;
    resultado.manual = true;
  }
  const t = Math.max(tiempo(local), tiempo(nube));
  resultado.actualizado = t ? new Date(t).toISOString() : new Date().toISOString();
  return resultado;
}

export function mismoRegistro(a: RegistroAnimoBase | undefined, b: RegistroAnimoBase | undefined): boolean {
  if (!a || !b) return a === b;
  return a.animo === b.animo && a.intensidad === b.intensidad && eligida(a) === eligida(b);
}
