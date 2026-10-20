// "Para ti, hoy": elige, entre los audios que YA se pueden escuchar (tienen archivo), el que mejor responde al
// dolor principal y al momento que la persona eligió en el recorrido de inicio. Si ningún audio disponible encaja
// (o todavía no hay audios subidos), no se recomienda nada: nunca se sugiere un audio que no existe.

import type { AudioDef } from '@/lib/app-demo-data';
import type { Dolor, Momento } from '@/lib/perfil';

export const FRASE_DOLOR: Record<Dolor, string> = {
  emociones: 'Pensado para cuando absorbes las emociones de otros',
  ruido: 'Pensado para cuando el ruido y el caos te saturan',
  limites: 'Pensado para cuando sientes culpa al poner límites',
  rumiacion: 'Pensado para cuando no puedes dejar de pensar de noche',
  otro: '',
};

export interface Recomendacion {
  audio: AudioDef;
  /** Por qué se lo recomendamos, en una frase completa; vacío si solo coincide el momento. */
  motivo: string;
}

export function recomendarAudio(audios: AudioDef[], dolor: Dolor | null, momento: Momento | null): Recomendacion | null {
  const puntuados = audios
    .filter((a) => !!a.src)
    .map((a) => {
      const porDolor = !!dolor && a.dolores.includes(dolor);
      const porMomento = !!momento && (a.momentos.includes(momento) || momento === 'cualquiera');
      return { a, porDolor, puntos: (porDolor ? 2 : 0) + (porMomento ? 1 : 0) };
    })
    .filter((x) => x.puntos > 0)
    .sort((x, y) => y.puntos - x.puntos);
  const mejor = puntuados[0];
  if (!mejor) return null;
  return { audio: mejor.a, motivo: mejor.porDolor && dolor ? FRASE_DOLOR[dolor] : '' };
}
