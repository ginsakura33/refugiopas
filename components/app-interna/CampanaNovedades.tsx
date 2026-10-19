'use client';

// Campanita de Inicio: lleva a Novedades y muestra cuántos anuncios nuevos hay sin leer.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function CampanaNovedades() {
  const [sinLeer, setSinLeer] = useState(0);

  useEffect(() => {
    let vivo = true;
    (async () => {
      try {
        const supabase = createClient();
        const [{ data: anuncios }, { data: lecturas }] = await Promise.all([
          supabase.from('anuncios').select('id').order('publicado_at', { ascending: false }).limit(50),
          supabase.from('anuncio_lecturas').select('anuncio_id'),
        ]);
        const leidos = new Set((lecturas ?? []).map((l) => l.anuncio_id));
        if (vivo) setSinLeer((anuncios ?? []).filter((a) => !leidos.has(a.id)).length);
      } catch {
        /* sin conexión: la campanita queda sin número */
      }
    })();
    return () => {
      vivo = false;
    };
  }, []);

  return (
    <Link
      href="/app/novedades"
      aria-label={sinLeer > 0 ? `Novedades, ${sinLeer} sin leer` : 'Novedades'}
      className="relative flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--surface)] shadow-[var(--shadow-1)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
    >
      <Bell size={20} strokeWidth={1.8} color="var(--accent-ink)" aria-hidden="true" />
      {sinLeer > 0 && (
        <span
          aria-hidden="true"
          className="absolute -right-0.5 -top-0.5 flex min-w-5 items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[12px] font-semibold leading-5 text-[var(--surface)]"
        >
          {sinLeer > 9 ? '9+' : sinLeer}
        </span>
      )}
    </Link>
  );
}
