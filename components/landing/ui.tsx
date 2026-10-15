'use client';

// KIT DE LANDING — ui.tsx
// Piezas compartidas de las 10 secciones. La estructura premium vive AQUÍ
// (chips 44px, hairline degradada, checkmarks custom, sticky CTA con safe-area,
// alternancia base/elevado, reveal con reduced-motion): las secciones componen,
// no re-estilan. Consume SOLO los tokens de tokens.css.

import { useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion, type Variants } from 'motion/react';
import { Check } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/* ── <Accent> — la palabra que vende, en el acento del kit ─────────────────── */
export function Accent({ children }: { children: ReactNode }) {
  return <span className="text-[var(--accent)]">{children}</span>;
}

/* ── <Kicker> — caps 12px/600 tracking +0.08em en acento (máx 1 por sección) ── */
export function Kicker({ children }: { children: ReactNode }) {
  return (
    <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--accent-ink)]">
      {children}
    </p>
  );
}

/* ── <IconChip> — ícono SVG 22px dentro de chip 44px (55: jamás emoji) ──────
   tone 'accent' para secciones cálidas · 'muted' para íconos de dolor (§2:
   neutro apagado, nunca checks verdes). La FORMA la decide --radius-button:
   una sola forma de chip por página. */
export function IconChip({ icon: Icono, tone = 'accent' }: { icon: LucideIcon; tone?: 'accent' | 'muted' | 'rosa' }) {
  const estilos = {
    accent: {
      clase: 'border-[color-mix(in_oklab,var(--accent)_22%,transparent)] bg-[var(--chip-bg)]',
      color: 'var(--accent)',
    },
    muted: {
      clase: 'border-[color-mix(in_oklab,var(--text-tertiary)_35%,transparent)] bg-[color-mix(in_oklab,var(--text-tertiary)_12%,transparent)]',
      color: 'var(--text-secondary)',
    },
    rosa: {
      clase: 'border-[color-mix(in_oklab,var(--accent-2)_55%,transparent)] bg-[color-mix(in_oklab,var(--accent-2)_28%,transparent)]',
      color: 'var(--accent-ink)',
    },
  } as const;
  const { clase, color } = estilos[tone];
  return (
    <span
      aria-hidden="true"
      className={`inline-flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-button)] border ${clase}`}
    >
      <Icono size={22} strokeWidth={2} color={color} aria-hidden="true" />
    </span>
  );
}

/* ── <Hairline> — borde degradado dorado→rosa 1-2px, técnica padding-box/
   border-box (49 §13 · FICHA-ARTE: "hairline degradé padding-box/border-box,
   dorado→rosa"). Señal de "esto importa": máx 1-3 usos por página (plan
   recomendado, garantía, chip del mecanismo). emphasis = EL elemento de la
   vista (2px, dorado más fuerte). ── */
export function Hairline({
  emphasis = false,
  surface = 'surface',
  className = '',
  children,
}: {
  emphasis?: boolean;
  surface?: 'surface' | 'surface-2' | 'bg';
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`rounded-[var(--radius-card)] ${className}`}
      style={{
        border: `${emphasis ? 2 : 1}px solid transparent`,
        background:
          `linear-gradient(var(--${surface}), var(--${surface})) padding-box, ` +
          `linear-gradient(135deg, color-mix(in oklab, var(--accent) ${emphasis ? 55 : 40}%, transparent), color-mix(in oklab, var(--accent-2) 62%, transparent) 65%, transparent) border-box`,
      }}
    >
      {children}
    </div>
  );
}

/* ── <CheckCustom> — círculo acento 12% + check SVG (55 repertorio #9).
   Nunca el ✓ del sistema ni emoji. ── */
export function CheckCustom() {
  return (
    <span
      aria-hidden="true"
      className="mt-0.5 inline-flex size-[22px] shrink-0 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--accent)_12%,transparent)]"
    >
      <Check size={13} strokeWidth={2.5} color="var(--accent)" aria-hidden="true" />
    </span>
  );
}

/* ── <SectionShell> — ritmo vertical y alternancia base↔elevado (55 T1).
   64px mobile / 96px desktop; compacta (garantía) 48/64. flush pega las
   secciones que son UN movimiento visual (problema+agitación).
   `tint` pinta un mesh radial MUY sutil (6-9% de opacidad, misma técnica que
   el fondo del Hero) para que el scroll no se sienta como bloques de color
   plano repetidos — dorado y rosa se alternan a propósito entre secciones
   (60-30-10: nunca más de un tinte por sección, nunca a toda página). ── */
export function SectionShell({
  id,
  elevacion = 'base',
  compacta = false,
  flush = 'none',
  tint = 'none',
  ariaLabel,
  className = '',
  children,
}: {
  id?: string;
  elevacion?: 'base' | 'elevada';
  compacta?: boolean;
  flush?: 'none' | 'top' | 'bottom';
  tint?: 'none' | 'dorado' | 'rosa';
  ariaLabel?: string;
  className?: string;
  children: ReactNode;
}) {
  const pt = flush === 'top' ? 'pt-0' : compacta ? 'pt-12 md:pt-16' : 'pt-16 md:pt-24';
  const pb = flush === 'bottom' ? 'pb-8 md:pb-10' : compacta ? 'pb-12 md:pb-16' : 'pb-16 md:pb-24';
  const tintVar = tint === 'rosa' ? '--accent-2' : '--accent';
  return (
    <section
      id={id}
      aria-label={ariaLabel}
      className={`relative isolate overflow-hidden ${elevacion === 'elevada' ? 'bg-[var(--surface)]' : ''} ${pt} ${pb} ${className}`}
    >
      {tint !== 'none' && (
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 -z-10 ${flush === 'bottom' ? '[mask-image:linear-gradient(to_bottom,black_60%,transparent)]' : ''}`}
          style={{
            background: `radial-gradient(680px 380px at 10% 0%, color-mix(in oklab, var(${tintVar}) ${tint === 'rosa' ? 38 : 9}%, transparent) 0%, transparent 65%), radial-gradient(600px 360px at 100% 100%, color-mix(in oklab, var(${tintVar}) ${tint === 'rosa' ? 30 : 7}%, transparent) 0%, transparent 60%)`,
          }}
        />
      )}
      <div className="mx-auto w-full max-w-[1140px] px-5">{children}</div>
    </section>
  );
}

/* ── useReveal — variants de entrada whileInView con stagger, UNA sola vez,
   reduced-motion respetado (movimiento fuera, fade dentro — 55 T4). ── */
export function useReveal(stagger = 0.07): { contenedor: Variants; item: Variants } {
  const reduce = useReducedMotion();
  return {
    contenedor: {
      hidden: {},
      visible: { transition: { staggerChildren: reduce ? 0 : stagger } },
    },
    item: {
      hidden: { opacity: 0, y: reduce ? 0 : 20 },
      visible: { opacity: 1, y: 0, transition: { duration: reduce ? 0.2 : 0.45, ease: [0.16, 1, 0.3, 1] } },
    },
  };
}

/* Props estándar para el contenedor con reveal — evita repetir en cada sección. */
export const VIEWPORT_ONCE = { once: true, amount: 0.2 } as const;

/* ── <CtaButton> — el CTA vivo del kit: ≥52px, whileTap 0.97, sombra tintada.
   El texto sobre acento usa --bg: si tu FICHA-ARTE rompe el contraste AA ahí,
   ajusta los tokens, no el componente. ── */
export function CtaButton({
  href,
  children,
  alto = 52,
  fullMobile = true,
}: {
  href: string;
  children: ReactNode;
  alto?: 52 | 56;
  fullMobile?: boolean;
}) {
  return (
    <motion.a
      whileTap={{ scale: 0.97 }}
      href={href}
      className={`inline-flex items-center justify-center text-center rounded-[var(--radius-button)] bg-[var(--accent-cta)] ring-1 ring-inset ring-[var(--accent-ink)] px-8 text-[17px] font-semibold text-[var(--text-primary)] shadow-[0_8px_30px_color-mix(in_oklab,var(--accent)_35%,transparent)] outline-none transition-colors duration-150 hover:bg-[color-mix(in_oklab,var(--accent-cta)_90%,white)] focus-visible:ring-2 focus-visible:ring-[var(--accent-ink)] focus-visible:ring-offset-2 [touch-action:manipulation] ${
        alto === 56 ? 'h-14' : 'h-[52px]'
      } ${fullMobile ? 'w-full sm:w-auto' : ''}`}
    >
      {children}
    </motion.a>
  );
}

/* ── <StickyCtaMobile> — barra fija inferior SOLO mobile (55 T2).
   Aparece cuando el hero sale del viewport; se oculta frente a la oferta y al
   CTA final; safe-area respetada. DOS estados (T2): antes de ver la oferta el
   botón hace scroll a #oferta ("ver precios"); después de verla, cambia al CTA
   comercial — nunca saltar una oferta que la persona todavía no vio. */
export function StickyCtaMobile({
  labelComercial,
  href,
  labelPre = 'Ver plan y precios',
  heroId = 'hero',
  ofertaId = 'oferta',
  ctaFinalId = 'cta-final',
}: {
  labelComercial: string;
  href: string;
  labelPre?: string;
  heroId?: string;
  ofertaId?: string;
  ctaFinalId?: string;
}) {
  const reduce = useReducedMotion();
  const [heroVisible, setHeroVisible] = useState(true);
  const [ofertaVisible, setOfertaVisible] = useState(false);
  const [ofertaVista, setOfertaVista] = useState(false);
  const [finalVisible, setFinalVisible] = useState(false);

  useEffect(() => {
    const observar = (id: string, onChange: (visible: boolean) => void): IntersectionObserver | null => {
      const el = document.getElementById(id);
      if (!el) return null;
      const io = new IntersectionObserver(
        (entries) => {
          const e = entries[0];
          if (e) onChange(e.isIntersecting);
        },
        { threshold: 0.1 }
      );
      io.observe(el);
      return io;
    };
    const a = observar(heroId, setHeroVisible);
    const b = observar(ofertaId, (v) => {
      setOfertaVisible(v);
      if (v) setOfertaVista(true);
    });
    const c = observar(ctaFinalId, setFinalVisible);
    return () => {
      a?.disconnect();
      b?.disconnect();
      c?.disconnect();
    };
  }, [heroId, ofertaId, ctaFinalId]);

  const visible = !heroVisible && !ofertaVisible && !finalVisible;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: reduce ? 0 : 88, opacity: reduce ? 0 : 1 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: reduce ? 0 : 88, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] bg-[var(--surface)] px-4 pt-2 pb-[max(12px,env(safe-area-inset-bottom))] md:hidden"
        >
          <motion.a
            whileTap={{ scale: 0.97 }}
            href={ofertaVista ? href : `#${ofertaId}`}
            className="flex h-12 w-full items-center justify-center text-center rounded-[var(--radius-button)] bg-[var(--accent-cta)] ring-1 ring-inset ring-[var(--accent-ink)] text-[16px] font-semibold text-[var(--text-primary)] outline-none [touch-action:manipulation] focus-visible:ring-2 focus-visible:ring-[var(--accent-ink)] focus-visible:ring-offset-2"
          >
            {ofertaVista ? labelComercial : labelPre}
          </motion.a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
