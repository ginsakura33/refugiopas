'use client';

// Módulos — los 4 módulos didácticos progresivos del MVP (ver ESTADO.md), contenido REAL de los
// 4 capítulos del ebook de Ginette Rivas. No vive en la barra de navegación (ya tiene 5
// secciones, el máximo recomendado) — se llega aquí desde una tarjeta en Inicio.
// Cada módulo desarrollado (lecciones + reflexión) vive en /app/modulos/[id].
// Progreso persistido en localStorage (sin backend todavía, Sesión 6).

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, Lock } from 'lucide-react';
import { AppShell, Card } from '@/components/app-interna/ui';
import { MODULOS } from '@/lib/app-demo-data';

const CLAVE = 'refugio-modulos-completados';

export default function ModulosPage() {
  const [completados, setCompletados] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CLAVE);
      if (raw) setCompletados(JSON.parse(raw));
    } catch {
      /* sin progreso guardado: arranca en cero */
    }
  }, []);

  return (
    <AppShell>
      <Link
        href="/app"
        className="mb-4 flex w-fit items-center gap-1.5 text-[13px] font-medium text-[var(--text-tertiary)] outline-none hover:text-[var(--text-secondary)] focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded-[var(--radius-button)]"
      >
        <ArrowLeft size={15} aria-hidden="true" /> Inicio
      </Link>

      <div className="mb-6">
        <h1 className="text-[24px] font-bold leading-tight text-[var(--text-primary)] [font-family:var(--font-display)]">
          Tu proceso PAS
        </h1>
        <p className="mt-1 text-[14px] text-[var(--text-secondary)]">
          El refugio de tu sensibilidad se sostiene cuando te conoces.
        </p>
        <p className="mt-1 text-[13px] text-[var(--text-tertiary)]">
          4 módulos de breves lecciones para conocerte
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {MODULOS.map((m, i) => {
          const hecho = !!completados[m.id];
          const bloqueado = i > 0 && !completados[MODULOS[i - 1].id] && !hecho;
          const contenido = (
            <div className="flex w-full items-center gap-4 p-4 text-left">
              <span
                aria-hidden="true"
                className={`flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-button)] border text-[15px] font-bold [font-family:var(--font-display)] ${
                  hecho
                    ? 'border-[color-mix(in_oklab,var(--accent)_25%,transparent)] bg-[var(--chip-bg)] text-[var(--accent-ink)]'
                    : 'border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] bg-[color-mix(in_oklab,var(--text-tertiary)_10%,transparent)] text-[var(--text-secondary)]'
                }`}
              >
                {hecho ? <Check size={18} strokeWidth={2.5} aria-hidden="true" /> : bloqueado ? <Lock size={16} aria-hidden="true" /> : m.numero}
              </span>
              <div className="flex-1">
                <p className="text-[15px] font-semibold text-[var(--text-primary)]">
                  Módulo {m.numero}: {m.titulo}
                </p>
                <p className="text-[13px] text-[var(--text-secondary)]">{m.subtitulo}</p>
                <p className="mt-1 text-[12px] text-[var(--text-tertiary)]">{m.lecciones.length} lecciones</p>
              </div>
              {!bloqueado && <ArrowRight size={16} color="var(--text-tertiary)" aria-hidden="true" />}
            </div>
          );

          if (bloqueado) {
            return (
              <Card key={m.id} className="overflow-hidden opacity-50">
                {contenido}
              </Card>
            );
          }

          return (
            <Link
              key={m.id}
              href={`/app/modulos/${m.id}`}
              className="block outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded-[var(--radius-card)]"
            >
              <Card className="overflow-hidden">{contenido}</Card>
            </Link>
          );
        })}
      </div>
    </AppShell>
  );
}
