'use client';

// Tarjeta de racha de Hábitos (referencia del usuario: racha grande + semana L-D con llamitas).
// Los días de la semana vienen de los hábitos realmente completados; el día de hoy se enciende cuando
// se completan los necesarios. Con prefers-reduced-motion todo queda quieto.

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Flame, Trophy } from 'lucide-react';
import { Hairline } from '@/components/landing/ui';

const DIAS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const NOMBRES = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];

export function RachaCard({ racha, mejor, semana, hoyHecho }: { racha: number; mejor: number; semana: boolean[]; hoyHecho: boolean }) {
  const reduce = useReducedMotion() ?? false;
  // Índice del día de hoy (lunes = 0). Se calcula en el cliente para no desfasar la hidratación.
  const [hoy, setHoy] = useState<number | null>(null);
  useEffect(() => setHoy((new Date().getDay() + 6) % 7), []);

  const estado = (i: number): 'hecho' | 'hoy' | 'hoyHecho' | 'pendiente' => {
    if (hoy === null) return 'pendiente';
    if (i === hoy) return hoyHecho ? 'hoyHecho' : 'hoy';
    if (i < hoy && semana[i]) return 'hecho';
    return 'pendiente';
  };

  const faltan = mejor - racha;
  const mensaje =
    mejor === 0
      ? 'Completa 4 hábitos hoy y empieza tu racha.'
      : racha === 0
        ? `Tu mejor racha fue de ${mejor} ${mejor === 1 ? 'día' : 'días'}. Hoy puedes empezar otra.`
        : faltan <= 0
          ? '¡Esta es tu mejor racha! Sigue cuidándote así.'
          : `Tu mejor racha es de ${mejor} días — te faltan ${faltan} para superarla.`;

  return (
    <Hairline emphasis surface="surface" className="mb-5 shadow-[var(--shadow-2)]">
      <div className="relative overflow-hidden px-5 pb-5 pt-5">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-12 size-[180px] rounded-full"
          style={{ background: 'radial-gradient(circle, color-mix(in oklab, var(--accent-2) 55%, transparent), transparent 70%)' }}
        />

        <div className="relative flex items-start justify-between gap-3">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">Racha actual</p>
            <div className="mt-1 flex items-center gap-2">
              <motion.span
                aria-hidden="true"
                className="flex size-10 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--accent)_14%,transparent)]"
                animate={reduce ? undefined : { scale: [1, 1.08, 1], rotate: [0, -4, 3, 0] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Flame size={24} strokeWidth={1.8} color="var(--accent)" fill="color-mix(in oklab, var(--accent-cta) 45%, transparent)" aria-hidden="true" />
              </motion.span>
              <motion.span
                key={racha}
                initial={{ scale: reduce ? 1 : 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 16 }}
                className="text-[40px] font-semibold leading-none [font-variant-numeric:lining-nums_tabular-nums] text-[var(--text-primary)] [font-family:var(--font-display)]"
              >
                {racha}
              </motion.span>
              <span className="self-end pb-1 text-[15px] text-[var(--text-secondary)]">{racha === 1 ? 'día' : 'días'}</span>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-center gap-0.5 rounded-[var(--radius-card)] bg-[color-mix(in_oklab,var(--accent-2)_40%,transparent)] px-3 py-2">
            <Trophy size={18} strokeWidth={1.8} color="var(--accent-ink)" aria-hidden="true" />
            <span className="text-[16px] font-semibold leading-none [font-variant-numeric:lining-nums_tabular-nums] text-[var(--text-primary)] [font-family:var(--font-display)]">{mejor}</span>
            <span className="text-[12px] leading-none text-[var(--text-secondary)]">mejor</span>
          </div>
        </div>

        <p className="relative mt-3 text-[13px] leading-snug text-[var(--text-secondary)]">{mensaje}</p>

        <ul className="relative mt-4 flex justify-between" aria-label="Tu semana">
          {DIAS.map((d, i) => {
            const e = estado(i);
            const encendido = e === 'hecho' || e === 'hoyHecho';
            return (
              <li key={i} className="flex flex-col items-center gap-1.5" aria-label={`${NOMBRES[i]}: ${encendido ? 'completado' : e === 'hoy' ? 'hoy, pendiente' : 'pendiente'}`}>
                <motion.span
                  className={`flex size-10 items-center justify-center rounded-full ${
                    encendido
                      ? 'bg-gradient-to-b from-[var(--accent-cta)] to-[var(--accent)] shadow-[0_6px_14px_-6px_color-mix(in_oklab,var(--accent)_70%,transparent)]'
                      : e === 'hoy'
                        ? 'border-2 border-[var(--accent)] bg-[color-mix(in_oklab,var(--accent)_8%,transparent)]'
                        : 'bg-[color-mix(in_oklab,var(--text-tertiary)_22%,transparent)]'
                  }`}
                  initial={reduce ? false : { scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 18, delay: reduce ? 0 : 0.08 * i }}
                >
                  {encendido ? (
                    <Flame size={20} strokeWidth={2} color="var(--bg)" fill="color-mix(in oklab, var(--bg) 85%, transparent)" aria-hidden="true" />
                  ) : e === 'hoy' ? (
                    <motion.span
                      aria-hidden="true"
                      className="size-2.5 rounded-full bg-[var(--accent)]"
                      animate={reduce ? undefined : { scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  ) : null}
                </motion.span>
                <span className={`text-[12px] ${e === 'hoy' || e === 'hoyHecho' ? 'font-semibold text-[var(--accent-ink)]' : 'text-[var(--text-tertiary)]'}`}>{d}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </Hairline>
  );
}
