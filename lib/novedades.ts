// Novedades: tipos y formato de fechas. Código puro, usado por la campanita, la pantalla de novedades
// y el panel de anuncios.

export interface Anuncio {
  id: string;
  titulo: string;
  mensaje: string;
  enlace: string | null;
  boton: string | null;
  audiencia: 'todos' | 'anual';
  fecha_evento: string | null;
  activo: boolean;
  publicado_at: string;
}

const MS_DIA = 86400000;

/** "Hoy", "Ayer", "Hace 3 días" o "12 oct" según qué tan reciente es. */
export function fechaRelativa(iso: string, ahora: Date = new Date()): string {
  const d = new Date(iso);
  const dias = Math.floor((inicioDelDia(ahora) - inicioDelDia(d)) / MS_DIA);
  if (dias <= 0) return 'Hoy';
  if (dias === 1) return 'Ayer';
  if (dias < 7) return `Hace ${dias} días`;
  return new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short' }).format(d);
}

function inicioDelDia(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/** "sábado 25 de octubre, 6:00 p. m." en la hora de la persona. */
export function fechaEvento(iso: string): string {
  const t = new Intl.DateTimeFormat('es', { weekday: 'long', day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit' }).format(new Date(iso));
  return t.charAt(0).toUpperCase() + t.slice(1);
}
