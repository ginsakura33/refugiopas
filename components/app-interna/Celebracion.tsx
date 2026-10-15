'use client';

// Celebración premium al completar los hábitos del día (24-GAMIFICACION / 56-MOMENTOS-EMOCIONALES:
// celebrar SOLO hitos reales). La composición recrea la imagen de referencia del usuario (3 estrellas,
// líneas que suben, destellos y puntos) en SVG animado con los tokens de la marca — dorado y rosa,
// nunca los colores de la referencia. Respeta prefers-reduced-motion: sin movimiento, solo aparece.

import { useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Hairline } from '@/components/landing/ui';

const EASE = [0.16, 1, 0.3, 1] as const;
const CENTRO = { transformBox: 'fill-box', transformOrigin: 'center' } as const;

function estrella(cx: number, cy: number, R: number): string {
  const r = R * 0.48;
  return Array.from({ length: 10 }, (_, i) => {
    const ang = (Math.PI / 5) * i - Math.PI / 2;
    const rad = i % 2 === 0 ? R : r;
    return `${(cx + rad * Math.cos(ang)).toFixed(1)},${(cy + rad * Math.sin(ang)).toFixed(1)}`;
  }).join(' ');
}

const ESTRELLAS = [
  { cx: 320, cy: 176, R: 104, delay: 0.25, lleno: 'var(--accent)' },
  { cx: 146, cy: 292, R: 70, delay: 0.5, lleno: 'var(--accent-2)' },
  { cx: 494, cy: 292, R: 70, delay: 0.62, lleno: 'var(--accent-2)' },
];

const DESTELLOS = [
  { x: 138, y: 108, delay: 0.9 },
  { x: 502, y: 108, delay: 1.05 },
];

const PUNTOS = [
  { x: 78, y: 366, delay: 1.1 },
  { x: 562, y: 366, delay: 1.2 },
];

// Chispas doradas que suben y se desvanecen una sola vez (sutil, no confeti)
const CHISPAS = [
  { x: 210, y: 420, dx: -14, delay: 0.7, r: 5 },
  { x: 270, y: 470, dx: 8, delay: 0.85, r: 4 },
  { x: 370, y: 450, dx: -8, delay: 0.75, r: 5 },
  { x: 430, y: 410, dx: 14, delay: 0.95, r: 4 },
  { x: 320, y: 500, dx: 0, delay: 1.0, r: 3.5 },
];

function Fuegos({ reduce }: { reduce: boolean }) {
  const aparece = (delay: number) => ({
    initial: reduce ? { opacity: 0 } : { scale: 0, rotate: -18, opacity: 0 },
    animate: { scale: 1, rotate: 0, opacity: 1 },
    transition: reduce
      ? { duration: 0.3, delay: delay * 0.3 }
      : { type: 'spring' as const, stiffness: 240, damping: 13, delay },
  });
  return (
    <svg viewBox="0 0 640 640" className="h-auto w-[220px]" aria-hidden="true">
      {/* Líneas que "disparan" hacia las estrellas */}
      <motion.path
        d="M170 344 C 236 410, 244 500, 232 566"
        fill="none"
        stroke="var(--accent)"
        strokeOpacity="0.55"
        strokeWidth="14"
        strokeLinecap="round"
        initial={{ pathLength: reduce ? 1 : 0, opacity: reduce ? 0 : 1 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: reduce ? 0.3 : 0.7, delay: reduce ? 0 : 0.3, ease: EASE }}
      />
      <motion.path
        d="M470 344 C 404 410, 396 500, 408 566"
        fill="none"
        stroke="var(--accent)"
        strokeOpacity="0.55"
        strokeWidth="14"
        strokeLinecap="round"
        initial={{ pathLength: reduce ? 1 : 0, opacity: reduce ? 0 : 1 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: reduce ? 0.3 : 0.7, delay: reduce ? 0 : 0.35, ease: EASE }}
      />
      {[300, 400, 500].map((y, i) => (
        <motion.line
          key={y}
          x1="320"
          x2="320"
          y1={y}
          y2={y + 36}
          stroke="var(--accent)"
          strokeOpacity="0.55"
          strokeWidth="14"
          strokeLinecap="round"
          initial={{ opacity: 0, y: reduce ? 0 : 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: reduce ? 0 : 0.5 - i * 0.12, ease: EASE }}
        />
      ))}

      {/* Anillos inferiores */}
      {[108, 532].map((x, i) => (
        <motion.g key={x} style={CENTRO} {...aparece(0.45 + i * 0.1)}>
          <circle cx={x} cy={468} r={36} fill="var(--surface)" stroke="var(--accent-ink)" strokeWidth="12" />
          <circle cx={x} cy={468} r={14} fill="var(--accent-2)" />
        </motion.g>
      ))}

      {/* Estrellas */}
      {ESTRELLAS.map((e) => (
        <motion.polygon
          key={`${e.cx}-${e.cy}`}
          points={estrella(e.cx, e.cy, e.R)}
          fill={e.lleno}
          stroke="var(--accent-ink)"
          strokeWidth="14"
          strokeLinejoin="round"
          style={CENTRO}
          {...aparece(e.delay)}
        />
      ))}

      {/* Destellos (+) y puntos que titilan suave */}
      {DESTELLOS.map((d) => (
        <motion.g
          key={d.x}
          stroke="var(--accent)"
          strokeWidth="14"
          strokeLinecap="round"
          style={CENTRO}
          initial={{ opacity: 0, scale: reduce ? 1 : 0.4 }}
          animate={reduce ? { opacity: 1, scale: 1 } : { opacity: [0, 1, 0.55, 1], scale: [0.4, 1.15, 0.95, 1] }}
          transition={reduce ? { duration: 0.3 } : { duration: 1.6, delay: d.delay, repeat: Infinity, repeatDelay: 1.4, ease: 'easeInOut' }}
        >
          <line x1={d.x - 30} x2={d.x + 30} y1={d.y} y2={d.y} />
          <line x1={d.x} x2={d.x} y1={d.y - 30} y2={d.y + 30} />
        </motion.g>
      ))}
      {PUNTOS.map((p) => (
        <motion.circle
          key={p.x}
          cx={p.x}
          cy={p.y}
          r={11}
          fill="var(--accent)"
          style={CENTRO}
          initial={{ opacity: 0 }}
          animate={reduce ? { opacity: 1 } : { opacity: [0, 1, 0.5, 1] }}
          transition={reduce ? { duration: 0.3 } : { duration: 1.8, delay: p.delay, repeat: Infinity, repeatDelay: 1.2, ease: 'easeInOut' }}
        />
      ))}

      {/* Chispas que suben una sola vez */}
      {!reduce &&
        CHISPAS.map((c, i) => (
          <motion.circle
            key={i}
            cx={c.x}
            cy={c.y}
            r={c.r}
            fill={i % 2 ? 'var(--accent-2)' : 'var(--accent)'}
            initial={{ opacity: 0, y: 0, x: 0 }}
            animate={{ opacity: [0, 1, 0], y: -130, x: c.dx }}
            transition={{ duration: 1.5, delay: c.delay, ease: 'easeOut' }}
          />
        ))}
    </svg>
  );
}

export function Celebracion({
  abierta,
  onCerrar,
  etiqueta = 'Felicitaciones',
  titulo = '¡Completaste tus hábitos de hoy!',
  mensaje = 'Hoy elegiste cuidarte. Tu constancia es tu fuerza.',
}: {
  abierta: boolean;
  onCerrar: () => void;
  etiqueta?: string;
  titulo?: string;
  mensaje?: string;
}) {
  const reduce = useReducedMotion() ?? false;
  const botonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!abierta) return;
    try {
      navigator.vibrate?.(30);
    } catch {
      /* sin vibración: la celebración funciona igual */
    }
    const t = setTimeout(() => botonRef.current?.focus(), 350);
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar();
    };
    window.addEventListener('keydown', alTeclear);
    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', alTeclear);
    };
  }, [abierta, onCerrar]);

  return (
    <AnimatePresence>
      {abierta && (
        <motion.div
          key="celebracion"
          className="fixed inset-0 z-50 flex items-center justify-center px-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <button
            type="button"
            aria-label="Cerrar celebración"
            tabIndex={-1}
            onClick={onCerrar}
            className="absolute inset-0 bg-[color-mix(in_oklab,var(--text-primary)_38%,transparent)] backdrop-blur-[2px]"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="celebracion-titulo"
            initial={{ opacity: 0, scale: reduce ? 1 : 0.9, y: reduce ? 0 : 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: reduce ? 1 : 0.96, y: reduce ? 0 : 12 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="relative w-full max-w-[360px]"
          >
            <Hairline emphasis surface="surface" className="shadow-[0_24px_64px_-16px_color-mix(in_oklab,var(--accent)_45%,transparent)]">
              <div className="relative flex flex-col items-center overflow-hidden px-6 pb-6 pt-8 text-center">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 h-56"
                  style={{
                    background:
                      'radial-gradient(220px 160px at 50% 38%, color-mix(in oklab, var(--accent) 22%, transparent), transparent 70%)',
                  }}
                />
                <motion.div
                  className="relative"
                  animate={reduce ? undefined : { y: [0, -5, 0] }}
                  transition={{ duration: 4, delay: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Fuegos reduce={reduce} />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, letterSpacing: reduce ? '0.34em' : '0.6em' }}
                  animate={{ opacity: 1, letterSpacing: '0.34em' }}
                  transition={{ duration: reduce ? 0.3 : 1.1, delay: reduce ? 0 : 0.8, ease: EASE }}
                  className="relative mt-3 flex w-full items-center justify-center gap-3"
                >
                  <span
                    aria-hidden="true"
                    className="h-px w-8 bg-gradient-to-r from-transparent to-[color-mix(in_oklab,var(--accent)_70%,transparent)]"
                  />
                  <span className="pl-[0.34em] text-[14px] font-light uppercase text-[var(--accent-ink)] [font-family:var(--font-display)]">
                    {etiqueta}
                  </span>
                  <span
                    aria-hidden="true"
                    className="h-px w-8 bg-gradient-to-l from-transparent to-[color-mix(in_oklab,var(--accent)_70%,transparent)]"
                  />
                </motion.div>
                <motion.h2
                  id="celebracion-titulo"
                  initial={{ opacity: 0, y: reduce ? 0 : 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: reduce ? 0 : 0.95, ease: EASE }}
                  className="relative mt-3 text-balance text-[24px] font-bold leading-tight text-[var(--text-primary)] [font-family:var(--font-display)]"
                >
                  {titulo}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: reduce ? 0 : 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: reduce ? 0 : 1.1, ease: EASE }}
                  className="relative mt-2 text-[15px] leading-snug text-[var(--text-secondary)]"
                >
                  {mensaje}
                </motion.p>
                <motion.button
                  ref={botonRef}
                  type="button"
                  onClick={onCerrar}
                  initial={{ opacity: 0, y: reduce ? 0 : 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.45, delay: reduce ? 0 : 1.25, ease: EASE }}
                  className="relative mt-6 flex h-[52px] w-full items-center justify-center rounded-[var(--radius-button)] bg-[var(--accent-cta)] ring-1 ring-inset ring-[var(--accent-ink)] text-[17px] font-semibold text-[var(--text-primary)] outline-none hover:bg-[color-mix(in_oklab,var(--accent-cta)_90%,white)] focus-visible:ring-2 focus-visible:ring-[var(--accent-ink)] focus-visible:ring-offset-2"
                >
                  Seguir
                </motion.button>
              </div>
            </Hairline>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
