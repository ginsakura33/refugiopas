// Recordatorios suaves: mensajes y regla de "a quién le toca ahora". Código puro (sin servidor),
// para poder probarlo. Tono: cálido, breve, sin culpa y sin presión (público altamente sensible).

export const MENSAJES: { titulo: string; cuerpo: string }[] = [
  { titulo: 'Tu Refugio te espera', cuerpo: 'Un respiro de 2 minutos, cuando quieras.' },
  { titulo: 'Un momento para ti', cuerpo: 'Tu cuerpo agradece una pausa pequeña. Aquí estoy.' },
  { titulo: 'Sin prisa', cuerpo: 'Si hoy fue intenso, tu Orbe está listo para acompañarte.' },
  { titulo: 'Hola, ¿cómo vas?', cuerpo: 'Marca cómo te sientes hoy y respira un momento.' },
  { titulo: 'Tu calma cuenta', cuerpo: 'Un hábito pequeño hoy ya es cuidarte.' },
  { titulo: 'Pausa de Refugio', cuerpo: 'Ponte tus audífonos cuando puedas. Sin exigencias.' },
  { titulo: 'Respira', cuerpo: 'Tu Orbe S.O.S. está a un toque, aunque no tengas internet.' },
];

export function mensajeDelDia(fecha: string): { titulo: string; cuerpo: string } {
  const n = Number(fecha.replaceAll('-', '')) || 0;
  return MENSAJES[n % MENSAJES.length];
}

/** Fecha (YYYY-MM-DD) y hora (HH:MM) de `ahora` en la zona horaria de la persona. */
export function ahoraEnZona(ahora: Date, zona: string): { fecha: string; minutos: number } {
  let partes: Intl.DateTimeFormatPart[];
  try {
    partes = new Intl.DateTimeFormat('en-CA', {
      timeZone: zona,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(ahora);
  } catch {
    return ahoraEnZona(ahora, 'UTC'); // zona inválida: se usa UTC en vez de fallar
  }
  const v = (t: string) => partes.find((p) => p.type === t)?.value ?? '00';
  return { fecha: `${v('year')}-${v('month')}-${v('day')}`, minutos: Number(v('hour')) * 60 + Number(v('minute')) };
}

const VENTANA_MIN = 180; // si el temporizador falló, se envía hasta 3 h tarde y no más

/** ¿Toca enviar el recordatorio ahora? Una sola vez por día, desde la hora elegida y dentro de la ventana. */
export function tocaEnviar(
  p: { activo: boolean; hora: string; zona: string; ultimo_envio: string | null },
  ahora: Date
): boolean {
  if (!p.activo) return false;
  const { fecha, minutos } = ahoraEnZona(ahora, p.zona);
  if (p.ultimo_envio === fecha) return false;
  const [h, m] = p.hora.split(':').map(Number);
  const elegida = h * 60 + m;
  return minutos >= elegida && minutos - elegida <= VENTANA_MIN;
}
