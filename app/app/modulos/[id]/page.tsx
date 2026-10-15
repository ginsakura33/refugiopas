'use client';

// Detalle de un módulo — lecciones reales del capítulo correspondiente del ebook + reflexión de
// cierre (preguntas reales del "Ejercicio de Aprendizaje" del capítulo) conectada al Diario.
// Sesión 5: progreso en localStorage, sin backend todavía (Sesión 6).

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookHeart, Check, PenLine } from 'lucide-react';
import { AppShell, Card } from '@/components/app-interna/ui';
import { MODULOS } from '@/lib/app-demo-data';

const CLAVE = 'refugio-modulos-completados';

export default function ModuloDetallePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const modulo = MODULOS.find((m) => m.id === params.id);
  const indice = modulo ? MODULOS.findIndex((m) => m.id === modulo.id) : -1;

  const [completados, setCompletados] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CLAVE);
      if (raw) setCompletados(JSON.parse(raw));
    } catch {
      /* sin progreso guardado: arranca en cero */
    }
  }, []);

  useEffect(() => {
    if (!modulo) return;
    const bloqueado = indice > 0 && !completados[MODULOS[indice - 1].id] && !completados[modulo.id];
    if (bloqueado && Object.keys(completados).length > 0) router.replace('/app/modulos');
  }, [modulo, indice, completados, router]);

  if (!modulo) {
    return (
      <AppShell>
        <p className="text-[14px] text-[var(--text-secondary)]">Este módulo no existe.</p>
        <Link href="/app/modulos" className="mt-3 inline-block text-[13px] font-semibold text-[var(--accent-ink)]">
          Volver a tu proceso PAS
        </Link>
      </AppShell>
    );
  }

  const hecho = !!completados[modulo.id];

  const marcarCompletado = () => {
    const next = { ...completados, [modulo.id]: true };
    setCompletados(next);
    try {
      localStorage.setItem(CLAVE, JSON.stringify(next));
    } catch {
      /* localStorage puede fallar en modo privado — no bloquea la interacción */
    }
  };

  const irADiarioConPrompt = (prompt: string) => {
    try {
      sessionStorage.setItem('refugio-diario-prompt', prompt);
    } catch {
      /* sin sessionStorage: el diario abre igual, solo sin el texto precargado */
    }
    router.push('/app/diario');
  };

  return (
    <AppShell>
      <Link
        href="/app/modulos"
        className="mb-4 flex w-fit items-center gap-1.5 text-[13px] font-medium text-[var(--text-tertiary)] outline-none hover:text-[var(--text-secondary)] focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded-[var(--radius-button)]"
      >
        <ArrowLeft size={15} aria-hidden="true" /> Tu proceso PAS
      </Link>

      <div className="mb-6">
        <p className="text-[12px] font-semibold uppercase tracking-[0.04em] text-[var(--accent-ink)]">
          Módulo {modulo.numero} de {MODULOS.length}
        </p>
        <h1 className="mt-1 text-[24px] font-bold leading-tight text-[var(--text-primary)] [font-family:var(--font-display)]">
          {modulo.titulo}
        </h1>
        <p className="mt-1 text-[14px] text-[var(--text-secondary)]">{modulo.subtitulo}</p>
      </div>

      <Card className="p-5">
        <p className="text-[14px] italic leading-relaxed text-[var(--text-secondary)]">&quot;{modulo.frase}&quot;</p>
      </Card>

      <div className="mt-5 flex flex-col gap-3">
        {modulo.lecciones.map((leccion, i) => (
          <Card key={leccion.titulo} className="p-5">
            <p className="text-[12px] font-semibold text-[var(--text-tertiary)]">Lección {i + 1}</p>
            <p className="mt-0.5 text-[16px] font-semibold text-[var(--text-primary)] [font-family:var(--font-display)]">
              {leccion.titulo}
            </p>
            <p className="mt-3 whitespace-pre-line text-[14px] leading-relaxed text-[var(--text-secondary)]">
              {leccion.texto}
            </p>
          </Card>
        ))}
      </div>

      <Card className="mt-5 p-5">
        <div className="flex items-center gap-2.5">
          <BookHeart size={18} strokeWidth={1.8} color="var(--accent)" aria-hidden="true" />
          <p className="text-[15px] font-semibold text-[var(--text-primary)]">Para reflexionar en tu diario</p>
        </div>
        <div className="mt-4 flex flex-col gap-2.5">
          {modulo.reflexion.map((pregunta) => (
            <button
              key={pregunta}
              type="button"
              onClick={() => irADiarioConPrompt(pregunta)}
              className="flex items-center justify-between gap-3 rounded-[var(--radius-button)] bg-[var(--chip-bg)] p-3.5 text-left outline-none transition-colors duration-150 hover:bg-[color-mix(in_oklab,var(--chip-bg)_70%,var(--accent))] focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              <span className="text-[13px] text-[var(--text-primary)]">{pregunta}</span>
              <PenLine size={14} strokeWidth={1.8} color="var(--accent)" aria-hidden="true" className="shrink-0" />
            </button>
          ))}
        </div>
      </Card>

      <button
        type="button"
        onClick={marcarCompletado}
        disabled={hecho}
        className={`mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-button)] text-[14px] font-semibold outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-[var(--accent-ink)] ${
          hecho
            ? 'cursor-default border border-[color-mix(in_oklab,var(--accent)_25%,transparent)] bg-[var(--chip-bg)] text-[var(--accent-ink)]'
            : 'bg-[var(--accent-cta)] ring-1 ring-inset ring-[var(--accent-ink)] text-[var(--text-primary)] hover:bg-[color-mix(in_oklab,var(--accent-cta)_90%,white)]'
        }`}
      >
        {hecho ? (
          <>
            <Check size={16} strokeWidth={2.5} aria-hidden="true" /> Módulo completado
          </>
        ) : (
          'Marcar módulo como completado'
        )}
      </button>
    </AppShell>
  );
}
