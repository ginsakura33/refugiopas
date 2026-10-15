'use client';

// Tarjeta del estado de ánimo (decisión del usuario, 2026-10-14): al elegir un ánimo aparece una
// tarjeta pequeña con el MISMO emoji del selector en grande (unisex), su nombre y una frase
// cariñosa. Se va sola a los pocos segundos (o al tocarla). Con prefers-reduced-motion todo queda quieto.

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Hairline } from '@/components/landing/ui';

const EASE = [0.16, 1, 0.3, 1] as const;
const DURACION_MS = 3800;

export interface EventoAnimo {
  animo: string;
  id: number;
}

const ANIMOS: Record<string, { emoji: string; mensaje: string }> = {
  'Agotado/a': { emoji: '😩', mensaje: 'Tu cuerpo está pidiendo una pausa.' },
  'Tenso/a': { emoji: '😟', mensaje: 'Respira hondo, estás a salvo.' },
  Neutral: { emoji: '😐', mensaje: 'Respira y observa, sin prisa.' },
  'Tranquilo/a': { emoji: '🙂', mensaje: 'Disfruta este momento de calma.' },
  'En calma': { emoji: '😌', mensaje: 'Estás en tu centro. Disfruta tu paz.' },
};

export function AnimoAnimado({ evento }: { evento: EventoAnimo | null }) {
  const reduce = useReducedMotion() ?? false;
  const [visible, setVisible] = useState<EventoAnimo | null>(null);
  const [montado, setMontado] = useState(false);

  useEffect(() => setMontado(true), []);

  useEffect(() => {
    if (!evento || !ANIMOS[evento.animo]) return;
    setVisible(evento);
    const t = setTimeout(() => setVisible((v) => (v?.id === evento.id ? null : v)), DURACION_MS);
    return () => clearTimeout(t);
  }, [evento]);

  if (!montado) return null;
  const datos = visible ? ANIMOS[visible.animo] : null;

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center px-5">
      <AnimatePresence>
        {visible && datos && (
          <motion.button
            key={visible.id}
            type="button"
            onClick={() => setVisible(null)}
            aria-label="Cerrar"
            initial={{ opacity: 0, scale: reduce ? 1 : 0.88, y: reduce ? 0 : 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: reduce ? 1 : 0.94, y: reduce ? 0 : -8 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="pointer-events-auto w-full max-w-[272px] rounded-[var(--radius-card)] text-center outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            <Hairline emphasis surface="surface" className="shadow-[0_24px_60px_-16px_color-mix(in_oklab,var(--accent)_40%,transparent)]">
              <div role="status" aria-live="polite" className="relative flex flex-col items-center overflow-hidden px-5 pb-6 pt-6">
                <div className="relative flex size-[112px] items-center justify-center">
                  <motion.div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-full"
                    style={{
                      background:
                        'radial-gradient(circle, color-mix(in oklab, var(--accent-2) 60%, transparent) 0%, color-mix(in oklab, var(--accent) 10%, transparent) 60%, transparent 74%)',
                    }}
                    animate={reduce ? undefined : { opacity: [0.7, 1, 0.7], scale: [1, 1.12, 1] }}
                    transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <motion.span
                    aria-hidden="true"
                    className="relative text-[64px] leading-none"
                    initial={{ scale: reduce ? 1 : 0.4, opacity: 0 }}
                    animate={reduce ? { scale: 1, opacity: 1 } : { scale: 1, opacity: 1, y: [0, -5, 0] }}
                    transition={{
                      scale: { type: 'spring', stiffness: 260, damping: 14 },
                      opacity: { duration: 0.25 },
                      y: { duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 },
                    }}
                  >
                    {datos.emoji}
                  </motion.span>
                </div>

                <p className="mt-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--accent-ink)]">Hoy te sientes</p>
                <p className="mt-0.5 text-[24px] font-semibold leading-tight text-[var(--text-primary)] [font-family:var(--font-display)]">
                  {visible.animo}
                </p>
                <p className="mt-1.5 text-[15px] italic leading-snug text-[var(--text-secondary)] [font-family:var(--font-display)]">
                  {datos.mensaje}
                </p>

                {!reduce && (
                  <div aria-hidden="true" className="absolute inset-x-6 bottom-2.5 h-[3px] overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--accent)_14%,transparent)]">
                    <motion.div
                      className="h-full origin-left rounded-full bg-gradient-to-r from-[var(--logo-rosa-2)] to-[var(--accent)]"
                      initial={{ scaleX: 1 }}
                      animate={{ scaleX: 0 }}
                      transition={{ duration: DURACION_MS / 1000, ease: 'linear' }}
                    />
                  </div>
                )}
              </div>
            </Hairline>
          </motion.button>
        )}
      </AnimatePresence>
    </div>,
    document.body
  );
}
