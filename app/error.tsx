'use client';

import Link from 'next/link';
import { LogoMarca } from '@/components/Logo';

// Si algo falla en cualquier pantalla pública, la persona ve esto en lugar de una pantalla técnica.
// Nunca se muestra el texto del error (puede ser técnico o asustar).
export default function ErrorGeneral({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col items-center justify-center gap-6 bg-[var(--bg)] px-6 text-center text-[var(--text-primary)] [font-family:var(--font-body)]">
      <LogoMarca size={96} />
      <div>
        <h1 className="text-[28px] font-bold leading-tight [font-family:var(--font-display)]">Algo no salió como esperábamos</h1>
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
          href="/"
          className="flex min-h-12 items-center justify-center rounded-[var(--radius-button)] text-[14px] font-semibold text-[var(--text-secondary)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
        >
          Ir al inicio
        </Link>
      </div>
    </main>
  );
}
