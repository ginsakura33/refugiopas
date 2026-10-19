'use client';

// Novedades — anuncios de clases, talleres y avisos. Al abrir la pantalla se marcan como leídos
// (pero los que eran nuevos conservan su etiqueta "Nuevo" mientras dure la visita).

import { useEffect, useState } from 'react';
import { CalendarDays, ExternalLink, Megaphone } from 'lucide-react';
import { AppShell, Card, EmptyState, ScreenTitle } from '@/components/app-interna/ui';
import { createClient } from '@/lib/supabase/client';
import { fechaEvento, fechaRelativa, type Anuncio } from '@/lib/novedades';

export default function NovedadesPage() {
  const [anuncios, setAnuncios] = useState<Anuncio[] | null>(null);
  const [nuevos, setNuevos] = useState<Set<string>>(new Set());
  const [error, setError] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const supabase = createClient();
        const [{ data, error: e1 }, { data: lecturas }] = await Promise.all([
          supabase.from('anuncios').select('*').order('publicado_at', { ascending: false }).limit(50),
          supabase.from('anuncio_lecturas').select('anuncio_id'),
        ]);
        if (e1) throw e1;
        const lista = (data ?? []) as Anuncio[];
        const leidos = new Set((lecturas ?? []).map((l) => l.anuncio_id));
        const sinLeer = lista.filter((a) => !leidos.has(a.id));
        setAnuncios(lista);
        setNuevos(new Set(sinLeer.map((a) => a.id)));
        if (sinLeer.length > 0) {
          const { data: sesion } = await supabase.auth.getUser();
          if (sesion.user) {
            await supabase
              .from('anuncio_lecturas')
              .upsert(sinLeer.map((a) => ({ user_id: sesion.user!.id, anuncio_id: a.id })), { onConflict: 'user_id,anuncio_id', ignoreDuplicates: true });
          }
        }
      } catch {
        setError(true);
      }
    })();
  }, []);

  return (
    <AppShell>
      <ScreenTitle subtitulo="Clases, talleres y avisos de tu Refugio">Novedades</ScreenTitle>

      {error ? (
        <EmptyState icon={Megaphone} titulo="No pudimos cargar las novedades. Revisa tu conexión e inténtalo de nuevo." />
      ) : anuncios === null ? (
        <div className="flex flex-col gap-3" aria-hidden="true">
          {[0, 1].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-[var(--radius-card)] bg-[color-mix(in_oklab,var(--text-tertiary)_12%,transparent)]" />
          ))}
        </div>
      ) : anuncios.length === 0 ? (
        <EmptyState icon={Megaphone} titulo="Aún no hay novedades. Aquí te contaremos de clases, talleres y audios nuevos." />
      ) : (
        <div className="flex flex-col gap-3">
          {anuncios.map((a) => (
            <Card key={a.id} className="p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[12px] text-[var(--text-tertiary)]">{fechaRelativa(a.publicado_at)}</span>
                {nuevos.has(a.id) && (
                  <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-[12px] font-semibold text-[var(--surface)]">Nuevo</span>
                )}
              </div>
              <h2 className="mt-1 text-[18px] font-semibold leading-snug text-[var(--text-primary)] [font-family:var(--font-display)]">{a.titulo}</h2>
              {a.fecha_evento && (
                <p className="mt-2 flex items-center gap-2 text-[13px] font-medium text-[var(--accent-ink)]">
                  <CalendarDays size={16} strokeWidth={1.8} aria-hidden="true" /> {fechaEvento(a.fecha_evento)}
                </p>
              )}
              <p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed text-[var(--text-primary)]">{a.mensaje}</p>
              {a.enlace && a.boton && (
                <a
                  href={a.enlace}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--accent-cta)] text-[15px] font-semibold text-[var(--text-primary)] ring-1 ring-inset ring-[var(--accent-ink)] outline-none focus-visible:ring-2"
                >
                  {a.boton} <ExternalLink size={16} strokeWidth={1.8} aria-hidden="true" />
                </a>
              )}
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
