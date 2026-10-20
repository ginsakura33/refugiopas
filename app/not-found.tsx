import Link from 'next/link';
import { LogoMarca } from '@/components/Logo';

// Página que no existe: un mensaje cálido en español, sin culpa y con una salida clara.
export default function NoEncontrada() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col items-center justify-center gap-6 bg-[var(--bg)] px-6 text-center text-[var(--text-primary)] [font-family:var(--font-body)]">
      <LogoMarca size={96} />
      <div>
        <h1 className="text-[28px] font-bold leading-tight [font-family:var(--font-display)]">Este rincón no existe</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-[var(--text-secondary)]">
          Puede que el enlace esté roto o que la página haya cambiado de lugar. No pasa nada: tu Refugio sigue donde siempre.
        </p>
      </div>
      <div className="flex w-full max-w-[320px] flex-col gap-2">
        <Link
          href="/app"
          className="flex min-h-12 items-center justify-center rounded-[var(--radius-button)] bg-[var(--accent-cta)] text-[16px] font-semibold text-[var(--bg)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
        >
          Volver a mi Refugio
        </Link>
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
