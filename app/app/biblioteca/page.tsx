'use client';

// Biblioteca — audios de autohipnosis guiada (SOS + biblioteca completa). Sin audio real
// todavía (Sesión 6): "Reproducir" abre el temporizador honesto de SesionTimer, la misma
// experiencia real de respiración guiada, con la duración exacta del audio que vendrá.

import { useState } from 'react';
import { Play, Clock3, Sparkles } from 'lucide-react';
import { AppShell, Card, ScreenTitle } from '@/components/app-interna/ui';
import { SesionTimer } from '@/components/app-interna/SesionTimer';
import { AUDIOS, type CategoriaAudio } from '@/lib/app-demo-data';

const CATEGORIA_LABEL: Record<CategoriaAudio, string> = { sos: 'SOS', biblioteca: 'Biblioteca' };

export default function BibliotecaPage() {
  const [abierto, setAbierto] = useState<string | null>(null);

  return (
    <AppShell>
      <ScreenTitle subtitulo={`${AUDIOS.length} audios en español, guiados por Psic. Ginette Rivas`}>Tu biblioteca</ScreenTitle>

      <div className="flex flex-col gap-3">
        {AUDIOS.map((a) => {
          const expandido = abierto === a.id;
          return (
            <Card key={a.id} className="p-4">
              <button
                type="button"
                onClick={() => setAbierto(expandido ? null : a.id)}
                aria-expanded={expandido}
                className="flex w-full items-center gap-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded-[var(--radius-button)]"
              >
                <span
                  aria-hidden="true"
                  className="flex size-12 shrink-0 items-center justify-center rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--accent)_22%,transparent)] bg-[var(--chip-bg)]"
                >
                  <Play size={18} strokeWidth={1.8} color="var(--accent)" aria-hidden="true" />
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-[color-mix(in_oklab,var(--accent-2)_45%,transparent)] px-2 py-0.5 text-[12px] font-bold uppercase tracking-[0.04em] text-[var(--text-primary)]">
                      {a.etiqueta ?? CATEGORIA_LABEL[a.categoria]}
                    </span>
                    <span className="flex items-center gap-1 text-[12px] text-[var(--text-tertiary)]">
                      <Clock3 size={12} aria-hidden="true" /> {a.duracionMin} min
                    </span>
                  </div>
                  <p className="mt-1 text-[15px] font-semibold text-[var(--text-primary)]">{a.titulo}</p>
                  <p className="mt-0.5 text-[13px] leading-snug text-[var(--text-secondary)]">{a.descripcion}</p>
                </div>
              </button>

              {expandido && (
                <div className="mt-5 flex justify-center border-t border-[color-mix(in_oklab,var(--text-tertiary)_14%,transparent)] pt-5">
                  <SesionTimer duracionMin={a.duracionMin} />
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <Card className="mt-3 flex items-center gap-4 p-4">
        <span
          aria-hidden="true"
          className="flex size-12 shrink-0 items-center justify-center rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--accent)_22%,transparent)] bg-[var(--chip-bg)]"
        >
          <Sparkles size={18} strokeWidth={1.8} color="var(--accent)" aria-hidden="true" />
        </span>
        <div className="flex-1">
          <p className="text-[15px] font-semibold text-[var(--text-primary)]">Cada mes, un audio nuevo</p>
          <p className="mt-0.5 text-[13px] leading-snug text-[var(--text-secondary)]">
            Tu biblioteca y tu Refugio siguen creciendo contigo con nuevas actualizaciones.
          </p>
        </div>
      </Card>
    </AppShell>
  );
}
