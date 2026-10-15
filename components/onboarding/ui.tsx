'use client';

// KIT DE ONBOARDING — piezas compartidas del recorrido de inicio (spec: 50 sección A/B).
// Barra fina con % real (nunca dots), chips de ancho completo con auto-avance,
// atrás discreto desde la pregunta 2, header de marca siempre visible (50, regla de marca).

import { LogoMarca } from '@/components/Logo';
import { type ReactNode, useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ChevronLeft, Check, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { Hairline } from '@/components/landing/ui';

export function OnboardingHeader({
  progreso,
  onBack,
}: {
  /** 0-1. Se pinta con un mínimo de 6% (endowed progress, 50 → A2). */
  progreso: number;
  onBack?: () => void;
}) {
  const pct = Math.round(Math.max(progreso, 0.06) * 100);
  return (
    <div className="flex h-16 items-center gap-3 px-4">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          aria-label="Atrás"
          className="flex size-11 shrink-0 items-center justify-center rounded-full text-[var(--text-secondary)] outline-none hover:bg-[var(--surface-2)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
        >
          <ChevronLeft size={22} aria-hidden="true" />
        </button>
      ) : (
        <Link
          href="/"
          className="flex size-11 shrink-0 items-center justify-center rounded-full text-[var(--text-secondary)] outline-none hover:bg-[var(--surface-2)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          aria-label="Refugio PAS"
        >
          <LogoMarca size={44} />
        </Link>
      )}
      <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--text-tertiary)_14%,transparent)]">
        <motion.div
          className="h-full rounded-full bg-[var(--accent)]"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      <span className="w-9 shrink-0 text-right text-[12px] tabular-nums text-[var(--text-tertiary)]">{pct}%</span>
    </div>
  );
}

export function OnboardingScreen({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, x: reduce ? 0 : 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: reduce ? 0 : -16 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto flex w-full max-w-[480px] flex-1 flex-col justify-center px-4 pb-8 pt-6"
    >
      {children}
    </motion.div>
  );
}

export function PreguntaTitulo({ children, microcopy }: { children: ReactNode; microcopy?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: reduce ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0.2 : 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="mb-8"
    >
      <h1 className="text-balance text-[28px] font-bold leading-[1.15] text-[var(--text-primary)] [font-family:var(--font-display)]">
        {children}
      </h1>
      {microcopy && <p className="mt-2 text-[14px] leading-snug text-[var(--text-secondary)]">{microcopy}</p>}
    </motion.div>
  );
}

export function OptionChip({
  label,
  seleccionado,
  onClick,
  index = 0,
  icono: Icono,
}: {
  label: string;
  seleccionado: boolean;
  onClick: () => void;
  /** Posición en la lista — anima la entrada en cascada (14, stagger 50-80ms). */
  index?: number;
  /** Ícono SVG en chip a la izquierda (opcional) — para que opciones distintas no se vean idénticas. */
  icono?: LucideIcon;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: reduce ? 0 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0.2 : 0.3, delay: reduce ? 0 : 0.1 + index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`flex min-h-14 w-full items-center justify-between gap-3 rounded-[var(--radius-button)] border px-4 py-3 text-left text-[16px] font-medium outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
        seleccionado
          ? 'border-[color-mix(in_oklab,var(--accent)_55%,transparent)] bg-[var(--chip-bg)] text-[var(--text-primary)]'
          : 'border-[color-mix(in_oklab,var(--text-tertiary)_20%,transparent)] bg-[var(--surface)] text-[var(--text-primary)] hover:bg-[var(--surface-2)]'
      }`}
    >
      {Icono && (
        <span
          aria-hidden="true"
          className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--accent)_22%,transparent)] bg-[var(--chip-bg)]"
        >
          <Icono size={20} strokeWidth={1.8} color="var(--accent-ink)" aria-hidden="true" />
        </span>
      )}
      <span className="flex-1">{label}</span>
      {seleccionado && (
        <motion.span
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]"
        >
          <Check size={13} strokeWidth={2.5} color="var(--bg)" aria-hidden="true" />
        </motion.span>
      )}
    </motion.button>
  );
}

/** Selección única con auto-avance (300ms) — spec 50 → A3. */
export function useAutoAvance(onAvanzar: () => void) {
  const [seleccion, setSeleccion] = useState<string | null>(null);
  const elegir = (valor: string) => {
    if (seleccion) return;
    setSeleccion(valor);
    setTimeout(onAvanzar, 300);
  };
  return { seleccion, elegir };
}

export function CtaFijo({ children, disabled, onClick }: { children: ReactNode; disabled?: boolean; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      whileTap={disabled ? undefined : { scale: 0.97 }}
      disabled={disabled}
      onClick={onClick}
      className={`mt-auto flex h-[52px] w-full items-center justify-center rounded-[var(--radius-button)] text-[17px] font-semibold outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-[var(--accent-ink)] focus-visible:ring-offset-2 ${
        disabled
          ? 'cursor-not-allowed border border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] bg-[var(--surface-2)] text-[var(--text-tertiary)]'
          : 'bg-[var(--accent-cta)] ring-1 ring-inset ring-[var(--accent-ink)] text-[var(--text-primary)] hover:bg-[color-mix(in_oklab,var(--accent-cta)_90%,white)]'
      }`}
    >
      {children}
    </motion.button>
  );
}

export function SliderCompromiso({
  valor,
  min,
  max,
  sufijo,
  feedback,
  onChange,
}: {
  valor: number;
  min: number;
  max: number;
  sufijo: string;
  feedback: string;
  onChange: (v: number) => void;
}) {
  const pct = ((valor - min) / (max - min)) * 100;
  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <div className="text-center">
        <motion.span
          key={valor}
          initial={{ opacity: 0.4, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.15 }}
          className="inline-block text-[44px] font-bold leading-none tabular-nums text-[var(--text-primary)] [font-family:var(--font-display)]"
        >
          {valor}
        </motion.span>
        <p className="mt-1 text-[14px] text-[var(--text-secondary)]">{sufijo}</p>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={valor}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full"
        style={{
          background: `linear-gradient(to right, var(--accent) ${pct}%, color-mix(in oklab, var(--text-tertiary) 15%, transparent) ${pct}%)`,
        }}
        aria-label={`${sufijo}: ${valor}`}
      />
      <p className="text-[14px] font-medium text-[var(--accent-ink)]">{feedback}</p>
    </div>
  );
}

export function ReconocimientoScreen({
  titulo,
  children,
  visual,
  destacado = false,
}: {
  titulo: string;
  children: ReactNode;
  visual?: ReactNode;
  /** El reconocimiento FINAL etiquetado (50 → A5 variante final) — el módulo héroe del
      flujo: lleva hairline degradé + sombra tintada, no solo texto plano. */
  destacado?: boolean;
}) {
  const reduce = useReducedMotion();
  const contenido = (
    <div className={`flex flex-col items-center text-center ${destacado ? 'p-6' : ''}`}>
      {visual && <div className="mb-6">{visual}</div>}
      <h1 className="text-balance text-[26px] font-bold leading-[1.2] text-[var(--text-primary)] [font-family:var(--font-display)]">
        {titulo}
      </h1>
      <div className="mt-4 max-w-[38ch] text-[16px] leading-[1.6] text-[var(--text-secondary)]">{children}</div>
    </div>
  );
  return (
    <motion.div
      initial={{ opacity: 0, y: reduce ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0.2 : 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-1 flex-col items-center justify-center"
    >
      {destacado ? (
        <Hairline emphasis surface="surface" className="shadow-[0_12px_36px_color-mix(in_oklab,var(--accent)_16%,transparent)]">
          {contenido}
        </Hairline>
      ) : (
        contenido
      )}
    </motion.div>
  );
}

export function AnimatedStep({ stepKey, children }: { stepKey: string; children: ReactNode }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div key={stepKey} className="flex flex-1 flex-col">
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export { useEffect };
