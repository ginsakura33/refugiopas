'use client';

// KIT DE LA APP POR DENTRO — piezas compartidas (Sesión 5, ver 49-SISTEMA-DE-COMPONENTES.md y
// 53-PANTALLA-CANONICA.md). Solo tokens de components/landing/tokens.css — el kit no inventa color.

import { type ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { animate, motion, useReducedMotion } from 'motion/react';
import { AnimoAnimado, type EventoAnimo } from '@/components/app-interna/AnimoAnimado';
import type { LucideIcon } from 'lucide-react';
import { Home, ListChecks, Headphones, BookOpen, CircleUserRound } from 'lucide-react';

const NAV_ITEMS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/app', label: 'Inicio', icon: Home },
  { href: '/app/habitos', label: 'Hábitos', icon: ListChecks },
  { href: '/app/biblioteca', label: 'Biblioteca', icon: Headphones },
  { href: '/app/diario', label: 'Diario', icon: BookOpen },
  { href: '/app/perfil', label: 'Perfil', icon: CircleUserRound },
];

export function TabBar() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Navegación principal"
      className="sticky bottom-0 z-40 flex items-stretch justify-around border-t border-[color-mix(in_oklab,var(--text-tertiary)_16%,transparent)] bg-[var(--surface)] pb-[max(4px,env(safe-area-inset-bottom))]"
    >
      {NAV_ITEMS.map((it) => {
        const activo = it.href === '/app' ? pathname === '/app' : pathname.startsWith(it.href);
        const Icono = it.icon;
        return (
          <Link
            key={it.href}
            href={it.href}
            aria-current={activo ? 'page' : undefined}
            className="relative flex flex-1 flex-col items-center gap-1 py-2.5 outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            {activo && (
              <motion.span
                layoutId="tab-activa"
                className="absolute top-0 h-[2px] w-8 rounded-full bg-[var(--accent)]"
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              />
            )}
            <Icono
              size={22}
              strokeWidth={activo ? 2.2 : 1.8}
              color={activo ? 'var(--accent)' : 'var(--text-tertiary)'}
              aria-hidden="true"
            />
            <span className={`text-[12px] font-medium ${activo ? 'text-[var(--accent-ink)]' : 'text-[var(--text-tertiary)]'}`}>
              {it.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col px-5 pb-6 pt-6">{children}</div>
  );
}

export function ScreenTitle({ children, subtitulo }: { children: ReactNode; subtitulo?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-[24px] font-bold leading-tight text-[var(--text-primary)] [font-family:var(--font-display)]">
        {children}
      </h1>
      {subtitulo && <p className="mt-1 text-[14px] text-[var(--text-secondary)]">{subtitulo}</p>}
    </div>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-[var(--radius-card)] bg-[var(--surface)] shadow-[var(--shadow-1)] ${className}`}>{children}</div>
  );
}

function CountUp({ valor }: { valor: number }) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? valor : 0);
  useEffect(() => {
    if (reduce) {
      setN(valor);
      return;
    }
    const control = animate(0, valor, { duration: 0.9, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setN(Math.round(v)) });
    return () => control.stop();
  }, [valor, reduce]);
  return <>{n}</>;
}

export function StatChip({
  label,
  valor,
  icon: Icono,
  href,
}: {
  label: string;
  valor: string;
  icon: LucideIcon;
  /** Si se pasa, el chip lleva a esa sección (y se siente tocable de verdad). */
  href?: string;
}) {
  const clase =
    'flex w-full min-w-0 flex-col items-center gap-1.5 rounded-[var(--radius-card)] bg-[var(--surface)] px-2 py-4 text-center shadow-[var(--shadow-1)]';
  const cuerpo = (
    <>
      <Icono size={18} strokeWidth={1.8} color="var(--accent-ink)" aria-hidden="true" />
      <span className={`max-w-full break-words font-bold leading-tight tabular-nums text-[var(--text-primary)] [font-family:var(--font-display)] ${/^\d+$/.test(valor) ? "text-[22px]" : "text-[13px]"}`}>
        {/^\d+$/.test(valor) ? <CountUp valor={Number(valor)} /> : valor}
      </span>
      <span className="text-[12px] text-[var(--text-secondary)]">{label}</span>
    </>
  );
  return (
    <motion.div className="flex min-w-0 flex-1" whileTap={href ? { scale: 0.97 } : undefined}>
      {href ? (
        <Link href={href} className={`${clase} outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]`}>
          {cuerpo}
        </Link>
      ) : (
        <div className={clase}>{cuerpo}</div>
      )}
    </motion.div>
  );
}

export function EmptyState({ icon: Icono, titulo, cta }: { icon: LucideIcon; titulo: string; cta?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[var(--radius-card)] border-2 border-dashed border-[color-mix(in_oklab,var(--text-tertiary)_28%,transparent)] px-6 py-10 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-[var(--chip-bg)]">
        <Icono size={22} strokeWidth={1.8} color="var(--accent)" aria-hidden="true" />
      </span>
      <p className="max-w-[28ch] text-[15px] font-medium text-[var(--text-secondary)]">{titulo}</p>
      {cta}
    </div>
  );
}

const ANIMO_TONOS = [
  'color-mix(in oklab, var(--text-tertiary) 55%, transparent)',
  'color-mix(in oklab, var(--text-tertiary) 30%, var(--accent-2))',
  'color-mix(in oklab, var(--accent-2) 55%, transparent)',
  'color-mix(in oklab, var(--accent-2) 80%, var(--accent))',
  'var(--accent-2)',
];

// Emoji minimalista por estado — excepción explícita a "cero emoji" (pedido directo del
// usuario, 2026-09-19): identifica el ánimo de un vistazo, uno por cada tono de ANIMO_TONOS.
const ANIMO_EMOJI = ['😩', '😟', '😐', '🙂', '😌'];

export function MoodPicker({
  opciones,
  seleccion,
  onSelect,
}: {
  opciones: readonly string[];
  seleccion: string | null;
  onSelect: (v: string) => void;
}) {
  // Cada elección (incluso repetir el mismo ánimo) lanza su ilustración animada.
  const [evento, setEvento] = useState<EventoAnimo | null>(null);
  return (
    <>
    <AnimoAnimado evento={evento} />
    <div className="flex justify-between gap-1.5">
      {opciones.map((op, i) => {
        const activo = seleccion === op;
        return (
          <motion.button
            key={op}
            type="button"
            onClick={() => {
              onSelect(op);
              setEvento({ animo: op, id: Date.now() });
            }}
            aria-pressed={activo}
            whileTap={{ scale: 0.94 }}
            className="flex flex-1 flex-col items-center gap-1.5 outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded-[var(--radius-button)]"
          >
            <span
              aria-hidden="true"
              className="flex size-9 items-center justify-center rounded-full text-[16px] leading-none transition-transform duration-150"
              style={{
                background: ANIMO_TONOS[i],
                transform: activo ? 'scale(1.15)' : 'scale(1)',
                boxShadow: activo ? 'var(--shadow-1)' : 'none',
              }}
            >
              {ANIMO_EMOJI[i]}
            </span>
            <span className={`text-center text-[12px] leading-tight ${activo ? 'font-semibold text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'}`}>
              {op}
            </span>
          </motion.button>
        );
      })}
    </div>
    </>
  );
}
