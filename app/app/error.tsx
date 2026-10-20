'use client';

import Link from 'next/link';
import { AppShell } from '@/components/app-interna/ui';

// Si algo falla DENTRO de la app, la barra de abajo sigue visible y la persona puede seguir navegando.
export default function ErrorEnLaApp({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <AppShell>
      <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <div>
          <h1 className="text-[24px] font-bold leading-tight text-[var(--text-primary)] [font-family:var(--font-display)]">Algo no salió como esperábamos</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-[var(--text-secondary)]">
            No es tu culpa. Respira un momento e inténtalo de nuevo; lo que habías guardado sigue a salvo.
          </p>
        </div>
        <div className="flex w-full max-w-[320px] flex-col gap-2">
          <button
            type="button"
            onClick={reset}
            className="min-h-12 rounded-[var(--radius-button)] bg-[var(--accent-cta)] text-[16px] font-semibold text-[var(--bg)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            Intentar de nuevo
          </button>
          <Link
            href="/app"
            className="flex min-h-12 items-center justify-center rounded-[var(--radius-button)] text-[14px] font-semibold text-[var(--text-secondary)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            Ir a mi Inicio
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
